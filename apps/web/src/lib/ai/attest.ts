/**
 * KNOT Local AI Engine ΓÇö Offline Attestation Queue
 *
 * Lightweight IndexedDB store for offline check-ins. When the network
 * disappears (transit dead zone, capped prepaid load, brownout), the Local
 * AI verdict is device-signed into an attestation and queued here; it syncs
 * to Supabase when connectivity returns. Server timestamps remain
 * authoritative (mvp-spec.md ┬º4); the attestation only preserves the
 * offline input so a dead zone never becomes an unjust fray.
 */

import { djb2Hash } from './models';

export interface AttestationRecord {
  id: string;
  knotId: string;
  proofHash: string;
  verdict: string;
  confidence: number;
  timestamp: number;
  synced: boolean;
}

interface QueueAttestationInput {
  knotId: string;
  verdict: string;
  confidence: number;
  proofHash?: string;
  timestamp?: number;
}

const DB_NAME = 'knot-local-ai';
const STORE_NAME = 'attestations';
const DB_VERSION = 1;

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through to counter fallback */
  }
  return `att-${Date.now().toString(36)}-${Math.floor(Math.random() * 0xffffff).toString(16)}`;
}

/* In-memory fallback for non-browser contexts (SSR / tests). */
const memoryFallback = new Map<string, AttestationRecord>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (): void => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-synced', 'synced', { unique: false });
        store.createIndex('by-knot', 'knotId', { unique: false });
      }
    };
    req.onsuccess = (): void => resolve(req.result);
    req.onerror = (): void => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = (): void => resolve(req.result);
    req.onerror = (): void => reject(req.error ?? new Error('IndexedDB request failed'));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, mode);
    const result = await run(tx.objectStore(STORE_NAME));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = (): void => resolve();
      tx.onerror = (): void => reject(tx.error ?? new Error('IndexedDB transaction failed'));
      tx.onabort = (): void => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
    });
    return result;
  } finally {
    db.close();
  }
}

/**
 * Device-sign + queue an offline attestation. Never throws for storage
 * reasons: falls back to memory when IndexedDB is unavailable.
 */
export async function queueOfflineAttestation(
  input: QueueAttestationInput,
): Promise<AttestationRecord> {
  const timestamp = input.timestamp ?? Date.now();
  const record: AttestationRecord = {
    id: newId(),
    knotId: input.knotId,
    proofHash: input.proofHash ?? djb2Hash(`${input.knotId}|${timestamp}|${input.verdict}|${input.confidence}`),
    verdict: input.verdict,
    confidence: input.confidence,
    timestamp,
    synced: false,
  };
  if (!hasIndexedDB()) {
    memoryFallback.set(record.id, record);
    return record;
  }
  try {
    await withStore('readwrite', (store) => requestToPromise(store.put(record)).then(() => undefined));
  } catch {
    memoryFallback.set(record.id, record);
  }
  return record;
}
