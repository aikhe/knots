/**
 * KNOT Local AI Engine — public facade.
 *
 * Import from here (`@/lib/ai`) everywhere outside this directory.
 */
export {
  EMBED_DIMS,
  EMBED_MODEL_ID,
  MODEL_CACHE_VERSION,
  STARTER_BLUEPRINTS,
  VISION_MODEL_ID,
  cosineSimilarity,
  computeFrameStats,
  djb2Hash,
  fuseVerdict,
  rankBySimilarity,
  resolveDevice,
} from './models';
export type {
  AIDevice,
  BlueprintDoc,
  ClassifyResult,
  EmbeddedBlueprintDoc,
  RankedBlueprint,
  VisionVerdict,
  WorkerInMessage,
  WorkerOutMessage,
} from './models';

export {
  clearSynced,
  getAllAttestations,
  getUnsyncedAttestations,
  markSynced,
  queueOfflineAttestation,
} from './attest';
export type { AttestationRecord, QueueAttestationInput } from './attest';

export { useLocalAI } from './useLocalAI';
export type { UseLocalAI } from './useLocalAI';
