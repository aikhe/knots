/**
 * KNOT Local AI Engine ΓÇö Background Web Worker
 *
 * Runs Transformers.js pipelines off the main thread so the UI never
 * drops frames. Handles INIT / CLASSIFY_FRAME / EMBED_TEXT /
 * SIMILARITY_SEARCH. Advisory-only: vision verdicts nudge, never reject.
 */

import { pipeline } from '@huggingface/transformers';
import {
  EMBED_MODEL_ID,
  VISION_MODEL_ID,
  computeFrameStats,
  fuseVerdict,
  rankBySimilarity,
} from './models';
import type {
  AIDevice,
  ClassifyResult,
  EmbeddedBlueprintDoc,
  WorkerInMessage,
  WorkerOutMessage,
} from './models';

/* Minimal worker-scope shim (keeps this file free of DOM lib coupling). */
interface AIWorkerScope {
  postMessage(message: unknown): void;
  onmessage: ((event: MessageEvent<WorkerInMessage>) => void) | null;
}
const scope = self as unknown as AIWorkerScope;

function post(message: WorkerOutMessage): void {
  scope.postMessage(message);
}

function postProgress(progress: number, stage: string): void {
  post({ type: 'PROGRESS', progress: Math.max(0, Math.min(100, Math.round(progress))), stage });
}

/* Loose structural types for pipelines (forward-compatible across v3/v4). */
type ImageClassifier = (
  image: unknown,
  options?: { top_k?: number },
) => Promise<Array<{ label: string; score: number }>>;
type TextEmbedder = (
  text: string,
  options?: { pooling?: string; normalize?: boolean },
) => Promise<{ data: ArrayLike<number> }>;

let classifier: ImageClassifier | null = null;
let embedder: TextEmbedder | null = null;
let activeDevice: AIDevice = 'wasm';
let ready = false;
let initPromise: Promise<void> | null = null;

function progressTap(phaseBase: number, phaseSpan: number, stage: string) {
  return (info: unknown): void => {
    if (typeof info === 'object' && info !== null && 'progress' in info) {
      const p = (info as { progress?: unknown }).progress;
      if (typeof p === 'number' && Number.isFinite(p)) {
        postProgress(phaseBase + (p / 100) * phaseSpan, stage);
      }
    }
  };
}

/** Load a pipeline preferring WebGPU, falling back to WASM on failure. */
async function loadWithFallback<T>(kind: 'vision' | 'embed'): Promise<{ fn: T; device: AIDevice }> {
  const model = kind === 'vision' ? VISION_MODEL_ID : EMBED_MODEL_ID;
  const task = kind === 'vision' ? 'image-classification' : 'feature-extraction';
  const phase = kind === 'vision' ? 0 : 50;
  const stage = kind === 'vision' ? 'vision' : 'embeddings';
  const attempt = async (device: AIDevice): Promise<T> => {
    const fn = await pipeline(task, model, {
      device,
      progress_callback: progressTap(phase, 50, stage),
    });
    return fn as unknown as T;
  };
  try {
    return { fn: await attempt('webgpu'), device: 'webgpu' };
  } catch {
    return { fn: await attempt('wasm'), device: 'wasm' };
  }
}

async function ensurePipelines(): Promise<void> {
  if (ready) return;
  if (initPromise) {
    await initPromise;
    return;
  }
  initPromise = (async (): Promise<void> => {
    postProgress(0, 'vision');
    if (!classifier) {
      const loaded = await loadWithFallback<ImageClassifier>('vision');
      classifier = loaded.fn;
      activeDevice = loaded.device;
    }
    postProgress(50, 'embeddings');
    if (!embedder) {
      const loaded = await loadWithFallback<TextEmbedder>('embed');
      embedder = loaded.fn;
      if (!classifier) activeDevice = loaded.device;
    }
    ready = true;
    postProgress(100, 'ready');
  })();
  try {
    await initPromise;
  } finally {
    initPromise = null;
  }
}

async function ensureEmbedder(): Promise<TextEmbedder> {
  if (embedder) return embedder;
  const loaded = await loadWithFallback<TextEmbedder>('embed');
  embedder = loaded.fn;
  return embedder;
}

function canvasFromPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  targetSize: number,
): OffscreenCanvas {
  const src = new OffscreenCanvas(width, height);
  const srcCtx = src.getContext('2d');
  if (!srcCtx) throw new Error('2d context unavailable in worker');
  srcCtx.putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0);
  const dst = new OffscreenCanvas(targetSize, targetSize);
  const dstCtx = dst.getContext('2d');
  if (!dstCtx) throw new Error('2d context unavailable in worker');
  dstCtx.drawImage(src, 0, 0, targetSize, targetSize);
  return dst;
}

async function handleClassify(
  id: string,
  width: number,
  height: number,
  pixels: Uint8ClampedArray,
): Promise<void> {
  const t0 = performance.now();
  const stats = computeFrameStats(pixels);
  let topLabel = 'heuristic:stats-only';
  let topScore = 0;
  let modelBacked = false;

  if (classifier) {
    try {
      const input = canvasFromPixels(pixels, width, height, 224);
      const out = await classifier(input, { top_k: 5 });
      if (out.length > 0) {
        const best = out[0];
        if (best) {
          topLabel = best.label;
          topScore = best.score;
          modelBacked = true;
        }
      }
    } catch {
      modelBacked = false; // stats-only fallback below
    }
  }

  const fused = fuseVerdict(topLabel, topScore, stats, modelBacked);
  const result: ClassifyResult = {
    verdict: fused.verdict,
    confidence: fused.confidence,
    topLabel,
    latencyMs: performance.now() - t0,
    modelBacked,
  };
  post({ id, type: 'RESULT', kind: 'CLASSIFY_FRAME', result });
}

async function handleEmbed(id: string, text: string): Promise<void> {
  const fn = await ensureEmbedder();
  const tensor = await fn(text, { pooling: 'mean', normalize: true });
  post({ id, type: 'RESULT', kind: 'EMBED_TEXT', vector: Array.from(tensor.data) });
}

async function handleSimilaritySearch(
  id: string,
  queryText: string,
  documents: EmbeddedBlueprintDoc[],
): Promise<void> {
  const fn = await ensureEmbedder();
  const queryTensor = await fn(queryText, { pooling: 'mean', normalize: true });
  const queryVector = Array.from(queryTensor.data);
  const embedded: EmbeddedBlueprintDoc[] = [];
  for (const doc of documents) {
    if (doc.vector.length > 0) {
      embedded.push(doc);
    } else {
      const t = await fn(doc.text, { pooling: 'mean', normalize: true });
      embedded.push({ ...doc, vector: Array.from(t.data) });
    }
  }
  post({ id, type: 'RESULT', kind: 'SIMILARITY_SEARCH', results: rankBySimilarity(queryVector, embedded) });
}

scope.onmessage = (event: MessageEvent<WorkerInMessage>): void => {
  const msg = event.data;
  void (async (): Promise<void> => {
    try {
      switch (msg.type) {
        case 'INIT': {
          await ensurePipelines();
          post({ id: msg.id, type: 'READY', device: activeDevice });
          break;
        }
        case 'CLASSIFY_FRAME': {
          await handleClassify(msg.id, msg.width, msg.height, msg.pixels);
          break;
        }
        case 'EMBED_TEXT': {
          await handleEmbed(msg.id, msg.text);
          break;
        }
        case 'SIMILARITY_SEARCH': {
          await handleSimilaritySearch(msg.id, msg.queryText, msg.documents);
          break;
        }
      }
    } catch (err) {
      post({
        id: msg.id,
        type: 'ERROR',
        message: err instanceof Error ? err.message : 'Unknown worker error',
      });
    }
  })();
};

