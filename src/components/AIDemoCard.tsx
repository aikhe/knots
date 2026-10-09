/**
 * KNOT Local AI Engine — Standalone Sandbox Card
 *
 * Self-contained test UI with zero teammate dependencies (no Convex, no
 * Clerk, no App state). Mount anywhere, e.g. `<AIDemoCard />` on a demo
 * route, to exercise the on-device engine in isolation.
 *
 * Section 1: live getUserMedia stream + on-device frame verdict (<200ms).
 * Section 2: offline semantic search over the 4 starter Blueprints.
 * Section 3: simulated-offline toggle + IndexedDB attestation outbox.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { STARTER_BLUEPRINTS } from '../lib/ai/models';
import { useLocalAI } from '../lib/ai/useLocalAI';
import { getUnsyncedAttestations, markSynced } from '../lib/ai/attest';
import type { AttestationRecord } from '../lib/ai/attest';
import type { ClassifyResult, RankedBlueprint } from '../lib/ai/models';

const DEMO_KNOT_ID = 'demo-knot';

function verdictChipClass(verdict: ClassifyResult['verdict']): string {
  switch (verdict) {
    case 'authentic':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    case 'suspect-blank':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    case 'suspect-screen':
      return 'bg-orange-500/15 text-orange-300 border-orange-500/40';
    case 'low-signal':
      return 'bg-zinc-500/15 text-zinc-300 border-zinc-500/40';
  }
}

export function AIDemoCard(): React.JSX.Element {
  const {
    isReady,
    isModelLoading,
    loadingProgress,
    isOffline,
    device,
    error,
    verifyCanvasFrame,
    searchBlueprints,
    attestOfflineProof,
  } = useLocalAI();

  /* ---- Section 1: camera ---- */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [lastVerdict, setLastVerdict] = useState<ClassifyResult | null>(null);
  const [verdictError, setVerdictError] = useState<string | null>(null);

  const stopCamera = useCallback((): void => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const startCamera = useCallback(async (): Promise<void> => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API unavailable in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('muted', 'true');
      await video.play();
      setCameraOn(true);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Camera start failed');
    }
  }, []);

  const onTestFrame = useCallback(async (): Promise<void> => {
    setVerdictError(null);
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setVerdictError('Camera is not streaming yet.');
      return;
    }
    setTesting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2d canvas context unavailable');
      ctx.drawImage(video, 0, 0);
      setLastVerdict(await verifyCanvasFrame(canvas));
    } catch (err) {
      setVerdictError(err instanceof Error ? err.message : 'Classification failed');
    } finally {
      setTesting(false);
    }
  }, [verifyCanvasFrame]);

  /* ---- Section 2: semantic search ---- */
  const [query, setQuery] = useState('gym workout routine');
  const [results, setResults] = useState<RankedBlueprint[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const onSearch = useCallback(async (): Promise<void> => {
    setSearchError(null);
    setSearching(true);
    try {
      setResults(await searchBlueprints(query, [...STARTER_BLUEPRINTS]));
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [query, searchBlueprints]);

  /* ---- Section 3: offline attestation outbox ---- */
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [queue, setQueue] = useState<AttestationRecord[]>([]);
  const [queueBusy, setQueueBusy] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const effectiveOffline = isOffline || simulateOffline;

  const refreshQueue = useCallback(async (): Promise<void> => {
    setQueueBusy(true);
    try {
      setQueue(await getUnsyncedAttestations());
    } catch {
      /* keep stale list on storage errors */
    } finally {
      setQueueBusy(false);
    }
  }, []);

  useEffect(() => {
    void refreshQueue();
  }, [refreshQueue]);

  const onQueueAttestation = useCallback(async (): Promise<void> => {
    setQueueError(null);
    if (!lastVerdict) {
      setQueueError('Classify a frame first to produce a verdict.');
      return;
    }
    try {
      await attestOfflineProof(DEMO_KNOT_ID, lastVerdict.verdict, lastVerdict.confidence);
      await refreshQueue();
    } catch (err) {
      setQueueError(err instanceof Error ? err.message : 'Queue failed');
    }
  }, [attestOfflineProof, lastVerdict, refreshQueue]);

  const onMarkSynced = useCallback(
    async (id: string): Promise<void> => {
      await markSynced(id);
      await refreshQueue();
    },
    [refreshQueue],
  );

  return (
    <section
      aria-label="Local AI Engine sandbox"
      className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-200"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-white">Local AI Engine — On-Device Sandbox</h2>
        {isReady && device ? (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs text-emerald-300">
            ready · {device} · $0
          </span>
        ) : (
          <span className="rounded-full border border-neutral-700 px-2 py-0.5 font-mono text-xs text-neutral-400">
            {isModelLoading ? `loading models… ${loadingProgress}%` : 'worker starting…'}
          </span>
        )}
        {effectiveOffline && (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-xs text-amber-300">
            offline mode
          </span>
        )}
      </div>
      {isModelLoading && (
        <div
          className="mt-3 h-1.5 overflow-hidden rounded bg-neutral-800"
          role="progressbar"
          aria-valuenow={loadingProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-emerald-400 transition-all" style={{ width: `${loadingProgress}%` }} />
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {/* Section 1: live vision */}
      <div className="mt-4 rounded-lg border border-neutral-800 p-3">
        <h3 className="font-medium text-white">1 · Live Vision Anti-Cheat</h3>
        <p className="mt-1 text-xs text-neutral-400">
          Live sensor capture only — no gallery upload path exists in this flow.
        </p>
        <div className="mt-2 overflow-hidden rounded-lg bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted autoPlay />
        </div>
        {cameraError && <p className="mt-2 text-xs text-red-400">{cameraError}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {!cameraOn ? (
            <button
              type="button"
              onClick={() => void startCamera()}
              className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-black"
            >
              Start Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300"
            >
              Stop Camera
            </button>
          )}
          <button
            type="button"
            onClick={() => void onTestFrame()}
            disabled={!cameraOn || testing || !isReady}
            className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
          >
            {testing ? 'Classifying…' : 'Test Local AI'}
          </button>
        </div>
        {!isReady && <p className="mt-2 text-xs text-neutral-500">Models are warming up — verdicts unlock at 100%.</p>}
        {verdictError && <p className="mt-2 text-xs text-red-400">{verdictError}</p>}
        {lastVerdict && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full border px-2 py-0.5 font-mono ${verdictChipClass(lastVerdict.verdict)}`}>
              {lastVerdict.verdict} · {Math.round(lastVerdict.confidence * 100)}%
            </span>
            <span className="font-mono text-neutral-400">
              {lastVerdict.latencyMs.toFixed(0)}ms · {lastVerdict.topLabel} ·{' '}
              {lastVerdict.modelBacked ? 'model' : 'heuristic'}
            </span>
          </div>
        )}
      </div>

      {/* Section 2: semantic search */}
      <div className="mt-3 rounded-lg border border-neutral-800 p-3">
        <h3 className="font-medium text-white">2 · Offline Blueprint Search</h3>
        <p className="mt-1 text-xs text-neutral-400">
          all-MiniLM-L6-v2 embeddings, 384-d, computed on-device. Try “workout”, “code focus”, or
          “book pages”.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blueprints…"
            maxLength={200}
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-white"
          />
          <button
            type="button"
            onClick={() => void onSearch()}
            disabled={searching || !isReady || query.trim().length === 0}
            className="shrink-0 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        {searchError && <p className="mt-2 text-xs text-red-400">{searchError}</p>}
        {results.length > 0 && (
          <ol className="mt-2 space-y-1">
            {results.map((r, i) => (
              <li
                key={r.id}
                className="flex items-center gap-2 rounded border border-neutral-800 px-2 py-1 text-xs"
              >
                <span className="font-mono text-neutral-500">#{i + 1}</span>
                <span className="text-neutral-100">{r.title}</span>
                <span className="ml-auto font-mono text-emerald-300">{r.score.toFixed(3)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Section 3: offline outbox */}
      <div className="mt-3 rounded-lg border border-neutral-800 p-3">
        <h3 className="font-medium text-white">3 · Offline Attestation Outbox</h3>
        <p className="mt-1 text-xs text-neutral-400">
          Toggle airplane mode (or use the simulator), classify a frame, then queue the verdict. It
          persists in IndexedDB until sync returns.
        </p>
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-neutral-300">
          <input
            type="checkbox"
            checked={simulateOffline}
            onChange={(e) => setSimulateOffline(e.target.checked)}
          />
          Simulate offline mode {isOffline && <span className="text-neutral-500">(browser is offline)</span>}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onQueueAttestation()}
            disabled={!lastVerdict}
            className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
          >
            Queue attestation for last verdict
          </button>
          <button
            type="button"
            onClick={() => void refreshQueue()}
            disabled={queueBusy}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 disabled:opacity-40"
          >
            {queueBusy ? 'Refreshing…' : `Refresh outbox (${queue.length})`}
          </button>
        </div>
        {queueError && <p className="mt-2 text-xs text-red-400">{queueError}</p>}
        {queue.length === 0 ? (
          <p className="mt-2 text-xs text-neutral-500">Outbox empty — nothing awaiting sync.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {queue.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded border border-neutral-800 px-2 py-1 font-mono text-xs"
              >
                <span className="text-amber-300">{a.verdict}</span>
                <span className="text-neutral-500">{a.proofHash}</span>
                <span className="text-neutral-500">{new Date(a.timestamp).toLocaleTimeString()}</span>
                <button
                  type="button"
                  onClick={() => void onMarkSynced(a.id)}
                  className="ml-auto text-emerald-300 hover:text-emerald-200"
                >
                  mark synced
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
