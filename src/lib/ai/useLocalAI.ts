/**
 * KNOT Local AI Engine — Typed React Hook
 *
 * Spawns and manages the background Web Worker (Vite module syntax) so
 * model loading and inference never block the UI thread.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { djb2Hash } from './models';
import { queueOfflineAttestation } from './attest';
import type { AttestationRecord } from './attest';
import type {
  AIDevice,
  BlueprintDoc,
  ClassifyResult,
  EmbeddedBlueprintDoc,
  RankedBlueprint,
  WorkerInMessage,
  WorkerOutMessage,
} from './models';

export interface UseLocalAI {
  isReady: boolean;
  isModelLoading: boolean;
  /** 0..100 model warm-up progress. */
  loadingProgress: number;
  /** True when the browser reports no network. */
  isOffline: boolean;
  device: AIDevice | null;
  error: string | null;
  verifyCanvasFrame: (canvas: HTMLCanvasElement) => Promise<ClassifyResult>;
  searchBlueprints: (
    query: string,
    blueprints: BlueprintDoc[],
  ) => Promise<RankedBlueprint[]>;
  attestOfflineProof: (
    knotId: string,
    verdict: string,
    confidence: number,
  ) => Promise<AttestationRecord>;
}

interface PendingRequest {
  resolve: (msg: WorkerOutMessage) => void;
  reject: (err: Error) => void;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type OutboundMessage = DistributiveOmit<WorkerInMessage, 'id'>;

const INIT_TIMEOUT_MS = 180_000;
const INFER_TIMEOUT_MS = 60_000;
const FRAME_TARGET_PX = 224;

export function useLocalAI(): UseLocalAI {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Map<string, PendingRequest>());
  const reqCounter = useRef(0);
  const embedCache = useRef(new Map<string, number[]>());

  const [isReady, setIsReady] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );
  const [device, setDevice] = useState<AIDevice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    (message: OutboundMessage, timeoutMs: number): Promise<WorkerOutMessage> => {
      const worker = workerRef.current;
      if (!worker) return Promise.reject(new Error('Local AI worker is not initialized'));
      const id = `req-${reqCounter.current++}-${Date.now().toString(36)}`;
      return new Promise<WorkerOutMessage>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          pendingRef.current.delete(id);
          reject(new Error('Local AI request timed out'));
        }, timeoutMs);
        pendingRef.current.set(id, {
          resolve: (msg: WorkerOutMessage): void => {
            window.clearTimeout(timer);
            resolve(msg);
          },
          reject: (err: Error): void => {
            window.clearTimeout(timer);
            reject(err);
          },
        });
        worker.postMessage({ ...message, id });
      });
    },
    [],
  );

  /* Spawn worker + pre-warm pipelines once on mount. */
  useEffect(() => {
    const worker = new Worker(new URL('./ai.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;
    setIsModelLoading(true);
    setLoadingProgress(0);

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>): void => {
      const msg = event.data;
      if (msg.type === 'PROGRESS') {
        setLoadingProgress(msg.progress);
        return;
      }
      const pending = pendingRef.current.get(msg.id);
      if (!pending) return;
      pendingRef.current.delete(msg.id);
      if (msg.type === 'ERROR') pending.reject(new Error(msg.message));
      else pending.resolve(msg);
    };
    worker.onerror = (): void => {
      setError('Local AI worker crashed. Reload to retry.');
      setIsModelLoading(false);
      for (const [, pending] of pendingRef.current) {
        pending.reject(new Error('Local AI worker crashed'));
      }
      pendingRef.current.clear();
    };

    void (async (): Promise<void> => {
      try {
        const reply = await ((): Promise<WorkerOutMessage> => {
          const w = workerRef.current;
          if (!w) throw new Error('Local AI worker is not initialized');
          const id = `init-${Date.now().toString(36)}`;
          return new Promise<WorkerOutMessage>((resolve, reject) => {
            const timer = window.setTimeout(() => {
              pendingRef.current.delete(id);
              reject(new Error('Model warm-up timed out'));
            }, INIT_TIMEOUT_MS);
            pendingRef.current.set(id, {
              resolve: (msg: WorkerOutMessage): void => {
                window.clearTimeout(timer);
                resolve(msg);
              },
              reject: (err: Error): void => {
                window.clearTimeout(timer);
                reject(err);
              },
            });
            w.postMessage({ id, type: 'INIT' });
          });
        })();
        if (reply.type === 'READY') {
          setDevice(reply.device);
          setIsReady(true);
          setError(null);
        } else if (reply.type === 'ERROR') {
          setError(reply.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Model warm-up failed');
      } finally {
        setIsModelLoading(false);
      }
    })();

    const onOnline = (): void => setIsOffline(false);
    const onOffline = (): void => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      for (const [, pending] of pendingRef.current) {
        pending.reject(new Error('Local AI worker disposed'));
      }
      pendingRef.current.clear();
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const verifyCanvasFrame = useCallback(
    async (canvas: HTMLCanvasElement): Promise<ClassifyResult> => {
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has no pixels to verify');
      }
      const srcW = canvas.width;
      const srcH = canvas.height;
      const scale = Math.min(1, FRAME_TARGET_PX / Math.max(srcW, srcH));
      const w = Math.max(1, Math.round(srcW * scale));
      const h = Math.max(1, Math.round(srcH * scale));
      const small = document.createElement('canvas');
      small.width = w;
      small.height = h;
      const ctx = small.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('2d canvas context unavailable');
      ctx.drawImage(canvas, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      const reply = await send(
        { type: 'CLASSIFY_FRAME', width: w, height: h, pixels: frame.data },
        INFER_TIMEOUT_MS,
      );
      if (reply.type === 'RESULT' && reply.kind === 'CLASSIFY_FRAME') return reply.result;
      if (reply.type === 'ERROR') throw new Error(reply.message);
      throw new Error('Unexpected worker response');
    },
    [send],
  );

  const embedOne = useCallback(
    async (doc: BlueprintDoc): Promise<EmbeddedBlueprintDoc> => {
      const key = `${doc.id}:${djb2Hash(doc.text)}`;
      const cached = embedCache.current.get(key);
      if (cached) return { ...doc, vector: cached };
      const reply = await send({ type: 'EMBED_TEXT', text: doc.text }, INFER_TIMEOUT_MS);
      if (reply.type === 'RESULT' && reply.kind === 'EMBED_TEXT') {
        embedCache.current.set(key, reply.vector);
        return { ...doc, vector: reply.vector };
      }
      if (reply.type === 'ERROR') throw new Error(reply.message);
      throw new Error('Unexpected worker response');
    },
    [send],
  );

  const searchBlueprints = useCallback(
    async (query: string, blueprints: BlueprintDoc[]): Promise<RankedBlueprint[]> => {
      const q = query.trim();
      if (!q) return [];
      if (blueprints.length === 0) return [];
      const embedded = await Promise.all(blueprints.map((d) => embedOne(d)));
      const reply = await send(
        { type: 'SIMILARITY_SEARCH', queryText: q, documents: embedded },
        INFER_TIMEOUT_MS,
      );
      if (reply.type === 'RESULT' && reply.kind === 'SIMILARITY_SEARCH') return reply.results;
      if (reply.type === 'ERROR') throw new Error(reply.message);
      throw new Error('Unexpected worker response');
    },
    [embedOne, send],
  );

  const attestOfflineProof = useCallback(
    async (knotId: string, verdict: string, confidence: number): Promise<AttestationRecord> => {
      return queueOfflineAttestation({ knotId, verdict, confidence });
    },
    [],
  );

  return {
    isReady,
    isModelLoading,
    loadingProgress,
    isOffline,
    device,
    error,
    verifyCanvasFrame,
    searchBlueprints,
    attestOfflineProof,
  };
}
