/**
 * KNOT Local AI Engine — Model Registry & Shared Protocol
 *
 * Tier 1 transverse infrastructure (see mvp-spec.md §1.2 / §5.4).
 * All inference runs on-device via WebGPU with automatic WASM fallback.
 * Raw pixels and raw journals never leave silicon; only derived
 * verdicts / vectors / attestations are eligible for cloud sync.
 *
 * Game-loop math is owned by mvp-spec.md §4.1 and is NOT redefined here:
 * 25% fray, 80% rescue (100% demo), +5% tighten, 2h silent pass.
 */

/** Quantized on-device vision classifier (~15MB). Pre-screens live frames. */
export const VISION_MODEL_ID =
  "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k" as const;

/** Quantized on-device text embedding model (~23MB, 384-d vectors). */
export const EMBED_MODEL_ID = "Xenova/all-MiniLM-L6-v2" as const;

/** Embedding dimensionality of all-MiniLM-L6-v2. */
export const EMBED_DIMS = 384 as const;

/** PWA model-cache version. Bump to force re-fetch of weights. */
export const MODEL_CACHE_VERSION = "knot-ai-v1" as const;

/** Preferred inference device. WebGPU first, WASM fallback (e.g. iOS Safari). */
export type AIDevice = "webgpu" | "wasm";

/**
 * Resolve the best available device at runtime.
 * Never throws; returns 'wasm' when WebGPU is unavailable.
 */
export function resolveDevice(): AIDevice {
  try {
    if (typeof navigator !== "undefined" && "gpu" in navigator) return "webgpu";
  } catch {
    /* fall through to wasm */
  }
  return "wasm";
}

/** Advisory-only vision verdict. Never auto-rejects; the peer decides. */
export type VisionVerdict =
  "authentic" | "suspect-blank" | "suspect-screen" | "low-signal";

export interface ClassifyResult {
  verdict: VisionVerdict;
  /** 0..1 fused confidence. */
  confidence: number;
  /** Top ImageNet label from the model, or a heuristic:* pseudo-label. */
  topLabel: string;
  /** End-to-end inference latency in ms (worker-measured). */
  latencyMs: number;
  /** True when the model pipeline produced the label (false = stats-only fallback). */
  modelBacked: boolean;
}

export interface BlueprintDoc {
  id: string;
  title: string;
  text: string;
}

export interface EmbeddedBlueprintDoc extends BlueprintDoc {
  vector: number[];
}

export interface RankedBlueprint {
  id: string;
  title: string;
  /** Cosine similarity 0..1 against the query vector. */
  score: number;
}

/** The 4 Tier 1 Blueprint presets (mirrors mvp-spec.md PRESETS). */
export const STARTER_BLUEPRINTS: readonly BlueprintDoc[] = [
  {
    id: "morning-gym",
    title: "Morning Gym Protocol",
    text: "Morning gym workout 06:00-08:30. Strength training, dumbbells, workout station photo proof. Fitness exercise muscle consistency.",
  },
  {
    id: "deep-work",
    title: "2-Hour Deep Work Block",
    text: "Deep work study block 09:00-12:00. Distraction-free desk, laptop code screen, notebook notes. Focus programming reading coding session.",
  },
  {
    id: "daily-reading",
    title: "Daily Reading",
    text: "Daily reading habit 20:00-23:00. Physical book pages, annotation notes, chapter summary. Reading literature learning pages.",
  },
  {
    id: "side-hustle",
    title: "Side-Hustle Outreach",
    text: "Side hustle outreach 18:00-21:00. Sent emails, sales pipeline messages, client follow-ups. Business revenue networking calls.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Worker message protocol (main thread <-> ai.worker.ts)              */
/* ------------------------------------------------------------------ */

export type WorkerInMessage =
  | { id: string; type: "INIT" }
  | {
      id: string;
      type: "CLASSIFY_FRAME";
      width: number;
      height: number;
      /** Raw RGBA pixels, structured-cloned from the capture canvas. */
      pixels: Uint8ClampedArray;
    }
  | { id: string; type: "EMBED_TEXT"; text: string }
  | {
      id: string;
      type: "SIMILARITY_SEARCH";
      queryText: string;
      documents: EmbeddedBlueprintDoc[];
    };

export type WorkerOutMessage =
  | { id: string; type: "READY"; device: AIDevice }
  | {
      id: string;
      type: "RESULT";
      kind: "CLASSIFY_FRAME";
      result: ClassifyResult;
    }
  | { id: string; type: "RESULT"; kind: "EMBED_TEXT"; vector: number[] }
  | {
      id: string;
      type: "RESULT";
      kind: "SIMILARITY_SEARCH";
      results: RankedBlueprint[];
    }
  | { type: "PROGRESS"; progress: number; stage: string }
  | { id: string; type: "ERROR"; message: string };

/* ------------------------------------------------------------------ */
/* Pure helpers (shared by worker + main-thread fallback)              */
/* ------------------------------------------------------------------ */

/** Cosine similarity for L2-normalized or raw vectors. Returns 0..1-ish. */
export function cosineSimilarity(
  a: readonly number[],
  b: readonly number[],
): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Rank documents by cosine similarity to the query vector (desc). */
export function rankBySimilarity(
  queryVector: readonly number[],
  documents: readonly EmbeddedBlueprintDoc[],
): RankedBlueprint[] {
  return documents
    .map((d) => ({
      id: d.id,
      title: d.title,
      score: cosineSimilarity(queryVector, d.vector),
    }))
    .sort((x, y) => y.score - x.score);
}

export interface FrameStats {
  /** Mean luma 0..255. */
  mean: number;
  /** Luma variance. Near-zero means a blank wall/ceiling. */
  variance: number;
  /** Fraction of near-black pixels 0..1. */
  darkRatio: number;
}

/** Fast pixel statistics over RGBA data (strided sampling for speed). */
export function computeFrameStats(pixels: Uint8ClampedArray): FrameStats {
  const step = 16; // sample every 4th pixel (RGBA stride 4 x 4)
  let sum = 0;
  let sumSq = 0;
  let dark = 0;
  let count = 0;
  for (let i = 0; i + 3 < pixels.length; i += step) {
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    sum += luma;
    sumSq += luma * luma;
    if (luma < 12) dark++;
    count++;
  }
  if (count === 0) return { mean: 0, variance: 0, darkRatio: 1 };
  const mean = sum / count;
  return {
    mean,
    variance: sumSq / count - mean * mean,
    darkRatio: dark / count,
  };
}

const SCREEN_LABEL_PATTERN =
  /screen|monitor|television|tv |laptop|notebook|computer|cellular|telephone|phone|projector|display/i;

/**
 * Fuse model output + pixel stats into an advisory verdict.
 * Conservative by design: ambiguous frames resolve to 'authentic'
 * so Local AI can only nudge, never punish (peer audit is authoritative).
 */
export function fuseVerdict(
  topLabel: string,
  topScore: number,
  stats: FrameStats,
  modelBacked: boolean,
): { verdict: VisionVerdict; confidence: number } {
  if (stats.darkRatio > 0.92 || stats.mean < 8) {
    return { verdict: "low-signal", confidence: 0.9 };
  }
  if (stats.variance < 90) {
    // Flat field: blank ceiling / wall / floor / black frame.
    return { verdict: "suspect-blank", confidence: modelBacked ? 0.82 : 0.7 };
  }
  if (modelBacked && SCREEN_LABEL_PATTERN.test(topLabel) && topScore > 0.2) {
    return { verdict: "suspect-screen", confidence: Math.min(0.95, topScore) };
  }
  if (modelBacked && topScore < 0.12 && stats.variance < 400) {
    return { verdict: "suspect-blank", confidence: 0.6 };
  }
  return {
    verdict: "authentic",
    confidence: modelBacked ? Math.min(0.99, 0.5 + topScore) : 0.55,
  };
}

/** Synchronous djb2 hex hash for local attestation dedupe (not a security hash). */
export function djb2Hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
