# KNOT: Production MVP Specification (mvp-spec.md)

> **Document Status:** Master Architecture & Engineering Specification  
> **Target Event:** App Builders Hackathon  
> **Source Documents:** `00-context.md`, `01-scope.md`, `02-hypotheses.md`, `03-loop.md`, `04-pwa.md`  
> **Implementation Philosophy:** Zero conversational filler; strictly deterministic, copy-paste ready technical contracts.

---

## 1. Executive Summary & Architecture Overview

### 1.1 Product Thesis
**KNOT** is a social accountability Progressive Web App (PWA) replacing brittle binary streaks with an integrity-decay ledger. Commitments ("Knots") are tied directly between peer duos, squads, or solo milestones. 
- **Streak Death Prevention:** Missed deadlines fray the knot by **25%** instead of wiping progress to zero, triggering a **24-hour Rescue Window** to recover lost equity.
- **Verification Friction:** Eliminates performative photo-logging via direct `MediaDevices.getUserMedia()` live capture (no file picker DOM elements) and a **2-hour Silent Pass** with peer **Bluff Calls ("Larp Flags")**.
- **Anti-Doomscroll Architecture:** Zero algorithmic discovery, zero explore feeds. Users connect exclusively via signed invite links, exact username searches, or direct QR codes.
- **On-Device Local AI Ledger:** WebGPU/WASM vision pre-audit (<200ms) flags blank ceilings/walls before peer review; `all-MiniLM-L6-v2` embeddings power private offline journal + Blueprint search. $0 marginal cost, zero raw bytes leave silicon, fully functional offline with queued cryptographic attestations.

### 1.2 Platform & Hosting Target
- **Frontend / Client Framework:** Next.js (App Router, React 19 / Server Components + Client Islands).
- **Styling & Components:** Tailwind CSS + Radix UI primitives.
- **Backend / Database:** Supabase managed PostgreSQL 15+ with Row Level Security (RLS).
- **Authentication:** Supabase Auth (Email magic link / Google OAuth).
- **Storage:** Supabase Storage (Private S3 bucket `proof-snapshots` with authenticated signed URLs).
- **Scheduled Tasks:** PostgreSQL `pg_cron` extension paired with lazy-evaluation read queries.
- **Deployment Platform:** Vercel (Production hosting + Preview deployments).
- **Local AI Engine (On-Device, Tier 1):** `@huggingface/transformers` running via WebGPU with ONNX Runtime Web (automatic WASM fallback) inside a dedicated Web Worker. Vision pre-audit (<200ms) + `all-MiniLM-L6-v2` embeddings (<100ms) execute fully offline at $0 marginal cost; weights cached by PWA after first fetch. Cloud is eventual-consistency sync only, never a runtime inference dependency.

### 1.3 Core Architectural Principles
1. **Timestamp-Driven Lazy State:** Never depend on background cron jobs to calculate current application state. Deadlines (`auto_approve_at`, `rescue_expires_at`, `cutoff_at`) are saved as timestamps, and status is computed *just-in-time on read*. Scheduled jobs serve strictly as notification dispatchers and ledger reconcilers.
2. **Strict RLS Isolation:** Privacy tiers (Public / Knot-Members / Private) are enforced at the database kernel level via Postgres RLS, not client UI checks.
3. **Hardware Sensor Respect:** Pure in-browser webcam capture via HTML5 canvas rasterization to intrinsically strip EXIF tracking data while blocking pre-recorded file uploads.
4. **Local-First AI, Cloud-Eventual:** All inference (vision verdicts, text embeddings) executes on-device via WebGPU/WASM in a Web Worker. Raw pixels and raw journals never leave silicon; only device-signed attestations (`proof_hash + verdict + confidence + client_timestamp`) sync to Supabase. Offline is a first-class operating mode, not an error state — Philippine dead zones, prepaid caps, and brownouts must not fray a knot.

---

## 2. Scope & Tiering Registry

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: LOOP ZERO (Core Hackathon MVP)                                 │
│ 1. Tied Knot (1-on-1 direct pair accountability)                       │
│ 2. Knot Integrity Ledger, 25% Fray Decay & 24h Rescue Window           │
│ 3. Action Snapshots (in-app live camera only, zero gallery upload)     │
│ 4. Silent Pass (2h auto-approval) & Duo Bluff Calls ("Call Larp")     │
│ 5. Synthetic Demo Partner (@knot-demo auto-responder)                  │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: HACKATHON EXTENSIONS (Priority Build Sequence)                 │
│ 2.1 Anchor Knot (Solo track tethered to global benchmarks)             │
│ 2.2 Deadweight Clause ("Sever & Save" 72h ghosted knot conversion)     │
│ 2.3 Commitment Heatmap (365-day SVG/CSS activity grid)                 │
│ 2.4 In-App Focus Lockout (Screen Wake Lock + Fullscreen fallback)      │
│ 2.5 lockedIn Blueprints (Forkable protocol templates via presets)      │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 3: POST-HACKATHON / STRETCH (Deferred)                            │
│ - Squad Knots (3–5 members, conjunctive voting & quorum)               │
│ - Live Pomodoro (Synchronous WebSocket/Realtime presence & co-working) │
│ - Time Capsule (Emergency video upload vault & transcoding pipeline)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Complete Database Schema (PostgreSQL DDL)

Copy-paste ready SQL migration. Run directly in Supabase SQL Editor.

```sql
-- ============================================================================
-- 00_EXTENSIONS & CLEANUP
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Drop existing tables for clean reproduction if needed
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.integrity_events CASCADE;
DROP TABLE IF EXISTS public.proofs CASCADE;
DROP TABLE IF EXISTS public.knot_members CASCADE;
DROP TABLE IF EXISTS public.knots CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- 01_PROFILES TABLE (Syncs with Supabase auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (username ~* '^[a-zA-Z0-9_-]{3,24}$'),
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- 02_KNOTS TABLE
-- ============================================================================
CREATE TABLE public.knots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(120) NOT NULL,
    knot_type TEXT NOT NULL CHECK (knot_type IN ('tied', 'squad', 'anchor')),
    status TEXT NOT NULL DEFAULT 'pending_invite' CHECK (status IN ('pending_invite', 'active', 'archived')),
    submission_cutoff_time TIME NOT NULL DEFAULT '23:59:59',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    rescue_expires_at TIMESTAMPTZ,
    blueprint_slug TEXT, -- Nullable preset reference
    invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    motivation_note VARCHAR(280), -- Tier 1 fallback for Time Capsule
    archive_reason TEXT CHECK (archive_reason IN ('untied', 'severed', 'snapped', 'expired', NULL)),
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- 03_KNOT_MEMBERS TABLE (Join Table - Prevents Schema Breakage for Squads)
-- ============================================================================
CREATE TABLE public.knot_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knot_id UUID NOT NULL REFERENCES public.knots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'partner', 'member')),
    joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    last_active_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE (knot_id, user_id)
);

-- ============================================================================
-- 04_PROOFS TABLE
-- ============================================================================
CREATE TABLE public.proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knot_id UUID NOT NULL REFERENCES public.knots(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption VARCHAR(200),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disputed', 'rejected')),
    auto_approve_at TIMESTAMPTZ NOT NULL,
    is_rescue BOOLEAN NOT NULL DEFAULT FALSE,
    is_canary BOOLEAN NOT NULL DEFAULT FALSE,
    disputed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    dispute_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- 05_INTEGRITY_EVENTS (Append-Only Accounting Ledger)
-- ============================================================================
CREATE TABLE public.integrity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knot_id UUID NOT NULL REFERENCES public.knots(id) ON DELETE CASCADE,
    delta NUMERIC(5, 2) NOT NULL, -- e.g., -25.00, +20.00, +5.00
    reason TEXT NOT NULL CHECK (reason IN ('initial', 'fray_miss', 'rescue_recovery', 'daily_tighten', 'manual_adjustment')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- 06_ANALYTICS & VALIDATION EVENTS (Hypothesis Instrumentation)
-- ============================================================================
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    knot_id UUID REFERENCES public.knots(id) ON DELETE CASCADE,
    proof_id UUID REFERENCES public.proofs(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- 07_PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_knot_members_user ON public.knot_members(user_id);
CREATE INDEX idx_knot_members_knot ON public.knot_members(knot_id);
CREATE INDEX idx_proofs_knot_created ON public.proofs(knot_id, created_at DESC);
CREATE INDEX idx_proofs_status_auto_approve ON public.proofs(status, auto_approve_at) WHERE status = 'pending';
CREATE INDEX idx_integrity_events_knot ON public.integrity_events(knot_id, created_at ASC);
CREATE INDEX idx_events_type_created ON public.events(type, created_at DESC);

-- ============================================================================
-- 08_SECURITY DEFINER MEMBERSHIP HELPER (BREAKS RLS RECURSION)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_knot_member(target_knot_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.knot_members
    WHERE knot_id = target_knot_id AND user_id = target_user_id
  );
$$;

-- ============================================================================
-- 09_ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knot_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self update
CREATE POLICY "Profiles readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Knots: Strict member isolation (prevents pending_invite public enumeration)
CREATE POLICY "Knots viewable by verified members"
ON public.knots FOR SELECT TO authenticated
USING (public.is_knot_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create knots"
ON public.knots FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Members can update their knots"
ON public.knots FOR UPDATE TO authenticated
USING (public.is_knot_member(id, auth.uid()));

-- Knot Members: Evaluates cleanly without recursion
CREATE POLICY "Knot members viewable by fellow members"
ON public.knot_members FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR public.is_knot_member(knot_id, auth.uid())
);

CREATE POLICY "Users can join knots via invite"
ON public.knot_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Proofs: Authors can update captions; Partners can ONLY dispute pending proofs
CREATE POLICY "Proofs viewable by knot members"
ON public.proofs FOR SELECT TO authenticated
USING (public.is_knot_member(knot_id, auth.uid()));

CREATE POLICY "Members can insert proofs for their knots"
ON public.proofs FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = user_id AND
    public.is_knot_member(knot_id, auth.uid())
);

CREATE POLICY "Authors can update own pending proof captions"
ON public.proofs FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Partners can dispute pending proofs"
ON public.proofs FOR UPDATE TO authenticated
USING (
  auth.uid() != user_id 
  AND public.is_knot_member(knot_id, auth.uid())
  AND status = 'pending'
)
WITH CHECK (
  status = 'disputed' 
  AND disputed_by = auth.uid()
);

-- Integrity Events: Members can view and insert
CREATE POLICY "Integrity events viewable by knot members"
ON public.integrity_events FOR SELECT TO authenticated
USING (public.is_knot_member(knot_id, auth.uid()));

CREATE POLICY "Integrity events insertable by knot members"
ON public.integrity_events FOR INSERT TO authenticated
WITH CHECK (public.is_knot_member(knot_id, auth.uid()));

-- Events (Instrumentation): Insertable by current user
CREATE POLICY "Users can insert telemetry events"
ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Telemetry viewable by authenticated users"
ON public.events FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 10_SECURE RPC FOR INVITE ACCEPTANCE (NO DATA LEAKS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_knot_by_invite(token_input TEXT)
RETURNS SETOF public.knots
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT * FROM public.knots
  WHERE invite_token = token_input AND status = 'pending_invite';
$$;
```

---

## 4. Game Mechanics & State Machine Engine

### 4.1 Parameter Dictionary

| Parameter Constant | Code / DB Key | Real-Time Production | `DEMO_MODE=true` | Architectural Purpose |
| :--- | :--- | :---: | :---: | :--- |
| **Fray Penalty** | `FRAY_PENALTY_PERCENT` | **25.0%** | **25.0%** | Scaled via `(100% / members) * 0.5`. 4 days to total snap. |
| **Rescue Recovery Ratio** | `RESCUE_RECOVERY_RATIO` | **0.80** (80%) | **1.00** (100%) | Leaves 5% permanent scar in real life; clean 75% -> 100% in demo. |
| **Tightening Bonus** | `TIGHTEN_BONUS_PERCENT` | **+5.0%** | **+5.0%** | Rewards consecutive perfect days; recovers historical scars. |
| **Silent Pass Timeout** | `SILENT_PASS_TIMEOUT_SEC` | **7200s** (2 Hours) | **60s** (1 Minute) | Review window for partner before proof automatically marks approved. |
| **Rescue Window Duration**| `RESCUE_WINDOW_SEC` | **86400s** (24 Hours) | **720s** (12 Minutes) | Duration after missed daily cutoff to submit rescue proof. |
| **Deadweight Ghost Trigger**| `DEADWEIGHT_SECONDS` | **259200s** (72 Hours) | **90s** | Consecutive inactivity window unlocking "Sever & Save". |

---

### 4.2 Lazy-Evaluation SQL Views & Helper Functions

State is computed dynamically on read to ensure instant UI responsiveness:

```sql
-- Compute current integrity score (clamped between 0% and 100%)
CREATE OR REPLACE FUNCTION public.get_knot_integrity(target_knot_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    current_val NUMERIC;
BEGIN
    SELECT COALESCE(SUM(delta), 100.0)
    INTO current_val
    FROM public.integrity_events
    WHERE knot_id = target_knot_id;

    IF current_val > 100.0 THEN
        RETURN 100.0;
    ELSIF current_val < 0.0 THEN
        RETURN 0.0;
    ELSE
        RETURN current_val;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Dynamic Proof Resolution View (Calculates Silent Pass on read)
CREATE OR REPLACE VIEW public.v_resolved_proofs AS
SELECT 
    p.id,
    p.knot_id,
    p.user_id,
    p.storage_path,
    p.caption,
    p.auto_approve_at,
    p.is_rescue,
    p.created_at,
    p.disputed_by,
    CASE 
        WHEN p.status = 'pending' AND NOW() >= p.auto_approve_at THEN 'approved'
        ELSE p.status
    END AS effective_status
FROM public.proofs p;

-- Composite Dashboard Knot View (Eliminates N+1 query waterfalls)
CREATE OR REPLACE VIEW public.v_dashboard_knots 
WITH (security_invoker = true) AS
SELECT 
    k.id AS knot_id,
    k.title,
    k.knot_type,
    k.status AS base_status,
    k.rescue_expires_at,
    k.submission_cutoff_time,
    k.timezone,
    -- Deterministic Clamped Integrity Score
    COALESCE(
        GREATEST(0.0, LEAST(100.0, (
            SELECT SUM(ie.delta) 
            FROM public.integrity_events ie 
            WHERE ie.knot_id = k.id
        ))), 
        100.0
    ) AS current_integrity,
    -- Dynamic State: ACTIVE vs FRAYED vs SNAPPED
    CASE 
        WHEN k.status = 'archived' THEN 'archived'
        WHEN k.rescue_expires_at IS NOT NULL AND NOW() < k.rescue_expires_at THEN 'frayed'
        ELSE 'active'
    END AS effective_knot_state,
    -- Open Rescue Flag
    (k.rescue_expires_at IS NOT NULL AND NOW() < k.rescue_expires_at) AS is_in_rescue_window
FROM public.knots k;
```

---

### 4.3 Scheduled Cron Reconciler (`pg_cron`)

```sql
-- Reconcile pending proofs that crossed auto_approve_at and grant daily tightening
CREATE OR REPLACE FUNCTION public.cron_reconcile_knot_state()
RETURNS VOID AS $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Materialize passed proofs
    UPDATE public.proofs
    SET status = 'approved'
    WHERE status = 'pending' AND NOW() >= auto_approve_at;

    -- 2. Snap exhausted knots (integrity == 0 and no open rescue windows)
    UPDATE public.knots k
    SET status = 'archived',
        archive_reason = 'snapped',
        archived_at = NOW()
    WHERE k.status = 'active'
      AND public.get_knot_integrity(k.id) <= 0.0
      AND NOT EXISTS (
          SELECT 1 FROM public.proofs p
          WHERE p.knot_id = k.id AND p.is_rescue = TRUE AND p.status = 'pending'
      );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- Schedule reconciliation sweep every minute
SELECT cron.schedule('knot-state-sweep', '* * * * *', 'SELECT public.cron_reconcile_knot_state();');
```

---

## 5. Client Architecture & Component Hierarchy

### 5.1 Next.js App Router Directory Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout with PWA meta, Tailwind, Supabase Auth provider
│   ├── page.tsx                  # Public Landing / Pitch page with direct QR scanner
│   ├── manifest.webmanifest/     # Route returning JSON PWA manifest
│   ├── auth/
│   │   ├── login/page.tsx        # Magic link & OAuth entry
│   │   └── callback/route.ts     # Supabase OAuth token exchange route
│   ├── dashboard/
│   │   └── page.tsx              # Main knot list, fray alerts, pending reviews, active cards
│   ├── knot/
│   │   ├── new/page.tsx          # Knot creation wizard (Preset selector + Invite link generator)
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Detail knot view: integrity bar, partner status, stream
│   │   │   └── checkin/page.tsx  # In-browser live camera capture modal
│   │   └── join/[token]/page.tsx # Invite acceptance landing screen
│   ├── profile/
│   │   └── [username]/page.tsx   # Verified proofs counter, user heatmap (Tier 2.3)
│   ├── demo/
│   │   └── page.tsx              # Live judging control board with fast-forward clock triggers
│   └── api/
│       ├── demo/
│       │   └── seed/route.ts     # Database staging endpoint for presentation setup
│       └── proofs/
│           └── upload-url/route.ts # Pre-signed S3 upload URL generator
├── components/
│   ├── camera/
│   │   └── CameraCapture.tsx     # Viewfinder using getUserMedia + Canvas compression
│   ├── focus/
│   │   └── FocusLockoutModal.tsx # Fullscreen wake-lock co-working timer
│   ├── knots/
│   │   ├── IntegrityMeter.tsx    # Animated 0-100% tension bar with fiber fray styling
│   │   └── ProofCard.tsx         # Displays snapshot, countdown timer, and "Call Larp" trigger
│   └── notifications/
│       └── InAppBanner.tsx       # Sticky top drawer for rescue and review notifications
└── lib/
    ├── ai/
    │   ├── models.ts               # Model registry: vision classifier + all-MiniLM-L6-v2, quantized ONNX ids, cache version
    │   ├── ai.worker.ts            # Dedicated Web Worker: non-blocking WebGPU/WASM inference off main thread
    │   ├── vision.ts               # Local vision verification: frame -> authentic|suspect-blank|suspect-screen|low-signal (<200ms)
    │   ├── embeddings.ts           # Local embeddings: journal/Blueprint text -> 384-d vectors via all-MiniLM-L6-v2 (<100ms)
    │   ├── attest.ts               # Local cryptographic attestation: proof_hash+verdict+confidence signing + IndexedDB outbox queue
    │   └── index.ts                # Typed facade: verifyProofLocal(), embedJournalLocal(), syncAttestations()
    ├── camera/
    │   └── processSnapshot.ts    # 1280px downscale + JPEG 0.7 + EXIF stripping
    ├── supabase/
    │   ├── client.ts             # Browser Supabase client
    │   └── server.ts             # Server component authenticated client
    └── constants.ts              # System configuration and DEMO_MODE thresholds
```

---

### 5.2 Camera Capture Pipeline (`CameraCapture.tsx`)

Pure in-DOM client-side capture pipeline executing downscaling, rasterization, and direct signed upload:

```tsx
// components/camera/CameraCapture.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { processSnapshot } from '@/lib/camera/processSnapshot';

interface CameraCaptureProps {
  knotId: string;
  isRescue?: boolean;
  onSuccess: (proofId: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ knotId, isRescue = false, onSuccess, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [caption, setCaption] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (!isMounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('muted', 'true');
          await videoRef.current.play();
        }
      } catch (err: any) {
        if (isMounted) setError('Camera permission denied or camera unavailable.');
      }
    }

    initCamera();

    // Hardware Release: Guaranteed cleanup using ref
    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleSnapAndSubmit = async () => {
    if (!videoRef.current || capturing) return;
    setCapturing(true);
    setError(null);

    try {
      const { blob } = await processSnapshot(videoRef.current);
      const formData = new FormData();
      formData.append('file', blob, 'proof.jpg');
      formData.append('knotId', knotId);
      formData.append('caption', caption);
      formData.append('isRescue', String(isRescue));

      // Atomic Single-Step Upload Endpoint
      const res = await fetch('/api/proofs/submit', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload submission failed.');
      const { proofId } = await res.json();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      onSuccess(proofId);
    } catch (err: any) {
      setError(err.message || 'Failed to submit snapshot.');
      setCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-xs tracking-wider text-zinc-400">
          {isRescue ? 'RESCUE SNAPSHOT' : 'ACTION SNAPSHOT'}
        </span>
        <button onClick={onCancel} className="text-zinc-400 text-sm hover:text-white">✕ Cancel</button>
      </div>

      <div className="relative flex-1 bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="p-4 text-center text-red-400 text-sm">{error}</div>
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Short caption (optional)..."
          maxLength={200}
          className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
        />
        <button
          onClick={handleSnapAndSubmit}
          disabled={capturing || !!error}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg disabled:opacity-50"
        >
          {capturing ? 'Processing Proof...' : 'Capture & Submit Proof'}
        </button>
      </div>
    </div>
  );
}
```

---

### 5.3 Focus Lockout Component (Tier 2.4 with iOS Fallback)

```tsx
// components/focus/FocusLockoutModal.tsx
'use client';

import React, { useEffect, useState } from 'react';

interface FocusLockoutProps {
  durationMinutes: number;
  onComplete: () => void;
  onExit: () => void;
}

export function FocusLockoutModal({ durationMinutes, onComplete, onExit }: FocusLockoutProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    let wakeLock: any = null;

    async function activateLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (e) {
          console.warn('WakeLock unavailable.');
        }
      }
    }
    activateLock();

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (wakeLock) wakeLock.release();
    };
  }, [durationMinutes, onComplete]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-[999999] bg-black text-white flex flex-col items-center justify-center p-6 select-none">
      <div className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-4">Focus Lockout Active</div>
      <div className="text-7xl font-mono font-bold tracking-tighter mb-8">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <p className="text-zinc-400 text-sm max-w-xs text-center mb-8">
        Device screen lock disabled. Stay tethered to your commitment.
      </p>
      <button onClick={onExit} className="text-zinc-600 hover:text-zinc-400 text-xs tracking-widest font-mono uppercase">
        Emergency Exit
      </button>
    </div>
  );
}
```

### 5.4 Local AI Module (`src/lib/ai/` — Web Worker for Non-Blocking Inference)

On-device inference runs exclusively in `ai.worker.ts` via `@huggingface/transformers` + ONNX Runtime Web (WebGPU, WASM fallback). Main thread posts frames/text and receives verdicts/vectors without jank. `vision.ts` performs local vision verification; `embeddings.ts` performs local RAG embeddings; `attest.ts` signs and queues offline attestations; `models.ts` pins quantized model ids and cache versions.

```typescript
// lib/ai/vision.ts — Local Vision Verification (WebGPU, <200ms, $0, offline)
import { pipeline } from '@huggingface/transformers';

export type VisionVerdict = 'authentic' | 'suspect-blank' | 'suspect-screen' | 'low-signal';

let classifier: any = null;

export async function verifyProofLocal(canvas: HTMLCanvasElement): Promise<{ verdict: VisionVerdict; confidence: number }> {
  // Lazily load quantized classifier inside Web Worker; weights cached by PWA after first fetch.
  // Never uploads pixels. Flags blank ceilings/walls, screen-photo moire/bezel, black/blur frames.
  if (!classifier) classifier = await pipeline('image-classification', 'onnx-community/mobilenetv4-conv-small-e2400_r224-in1k', { device: 'webgpu' } as any);
  const out = await classifier(canvas);
  return mapToVerdict(out); // thresholded mapping, private nudge only — never auto-rejects
}
```

```typescript
// lib/ai/embeddings.ts — Local RAG & Embeddings (all-MiniLM-L6-v2, <100ms, offline)
import { pipeline } from '@huggingface/transformers';

let embedder: any = null;

export async function embedJournalLocal(text: string): Promise<number[]> {
  // 384-d local embedding for private habit journals + offline Blueprint semantic search.
  // Vectors persist in IndexedDB; raw prose never leaves silicon.
  if (!embedder) embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { device: 'webgpu' } as any);
  const out = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data as Float32Array);
}
```

```typescript
// lib/ai/ai.worker.ts — Non-blocking inference + offline attestation outbox
// Main thread: postMessage({ type: 'VERIFY', frame }) -> Worker responds { verdict, confidence } in <200ms.
// On success: attest.ts signs { proof_hash, verdict, confidence, client_timestamp, knot_id } and queues
// to IndexedDB outbox when navigator.onLine === false; syncAttestations() flushes on reconnect.
// Game-loop math unchanged: 25% fray, 80% rescue (100% demo), +5% tighten — Local AI only gates inputs.
```

**Contract guarantees.** (a) Zero `<input type="file">` remains; Local AI consumes only live `getUserMedia()` frames. (b) Inference never blocks capture UI — Web Worker only. (c) WASM fallback auto-engages where WebGPU unavailable (iOS Safari). (d) Server stays authoritative for `auto_approve_at` / `rescue_expires_at` / RLS peer audit; local verdict is advisory pre-filter.

---

## 6. 3-Minute Hackathon Demo Script & Seed Specification

### 6.1 Demo Fast-Forward Mechanics (`DEMO_MODE=true`)
When `NEXT_PUBLIC_DEMO_MODE=true`, the client and server swap time constants:
- **Silent Pass Countdown:** 60 Seconds (instead of 2 Hours).
- **Rescue Recovery Ratio:** Restores **100%** of fray penalty (75% -> 100% animation).
- **Top Banner:** Displays `"⚡ DEMO CLOCK ACTIVE: 1 Minute = 2 Hours"`.

---

### 6.2 Step-by-Step 3-Minute Presenter Script

| Timestamp | Act | Presenter & Window Action | Visible Judge Screen Output | Mechanical Claim Proven |
| :---: | :---: | :--- | :--- | :--- |
| **0:00 - 0:20** | **1. The Problem** | **Window A (@maya):** Show Dashboard. Point to the frayed **75% "Morning Gym"** knot. | Red fray indicator with active countdown: *"Rescue Window closes in 11m"*. | *Failure is recoverable, not binary.* |
| **0:20 - 0:50** | **2. Tie a Knot** | **Window A:** Tap **New Knot**, select **"2-Hour Deep Work Block"** preset. Copy invite link.<br>**Window B (@jon):** Paste link, tap **Accept Knot**. | Both browsers update instantly. New knot appears in both windows at **100% tension**. | *Zero onboarding setup friction; anti-doomscroll invite model.* |
| **0:50 - 1:20** | **3. Live Proof + Local Vision** | **Window A:** Click **Check In**. In-app camera activates (highlight no gallery + on-device verdict badge "<200ms $0"). Snap laptop screen. Submit.<br>**Window B:** Watch "Pending Reviews". Take no action. | Proof displays timer: *"Silent Pass in 60s"* + chip *"Local AI: authentic 0.94"*. At 0s, status flips to **Approved**. | *Frictionless + private validation; no cloud AI call.* |
| **1:20 - 1:50** | **4. Offline Check-In (Zero-Cloud)** | **Window A:** DevTools Network → **Offline** (simulates MRT dead zone / brownout). Snap second proof. Local AI verifies on-device, signs attestation to IndexedDB outbox. Re-enable network. | Badge: *"Offline — Local AI verified + attestation queued"*. On reconnect, attestation syncs, proof appears as Pending. No cloud inference observed in Network tab. | *LOCAL AI theme beat: useful when cloud disappears.* |
| **1:50 - 2:15** | **5. Bluff Call ("Larp")** | **Window A:** Submit low-effort proof (pointed at floor; local pre-flagged suspect-blank).<br>**Window B:** Click **"Call Larp"**. | Proof immediately badges **Disputed**. Integrity credit is denied. Maya receives "Retake required" badge. | *Anti-cheat: local filter + social peer audit.* |
| **2:15 - 2:45** | **6. The Rescue** | **Window A:** Navigate back to frayed **"Morning Gym"** knot. Click **Rescue Check-In**. Snap dumbbell photo. | Proof passes. Integrity meter smoothly animates **75% ➔ 100%**. Rescue window closes. | *Graceful degradation eliminates streak death spirals.* |
| **2:45 - 3:00** | **7. Vision & Close** | Show completed dashboard with both knots healthy. Highlight roadmap cards: Squad Knots, Live Pomodoro + offline journal search. | Dashboard clean. Pitch: *"Tie knots that don't fray — even when the cloud disappears."* | *On-Device Local AI ledger vision.* |

---

### 6.3 Database Seed Script (`seed.sql` / `/api/demo/seed`)

Copy-paste SQL script to initialize `@maya`, `@jon`, and `@knot-demo`:

```sql
-- Clean previous demo instances
DELETE FROM public.profiles WHERE username IN ('maya', 'jon', 'knot-demo');
DELETE FROM auth.users WHERE id IN (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '00000000-0000-4000-8000-000000000000'
);

-- 1. Ensure mock identities exist in Supabase auth.users (Satisfies Foreign Key)
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('11111111-1111-4111-8111-111111111111', 'maya@knot.local', '{"display_name": "Maya Lin"}'::jsonb, NOW(), NOW()),
  ('22222222-2222-4222-8222-222222222222', 'jon@knot.local', '{"display_name": "Jon Snow"}'::jsonb, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000000', 'bot@knot.local', '{"display_name": "Knot Bot"}'::jsonb, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Create Profiles
INSERT INTO public.profiles (id, username, display_name)
VALUES 
  ('11111111-1111-4111-8111-111111111111', 'maya', 'Maya Lin'),
  ('22222222-2222-4222-8222-222222222222', 'jon', 'Jon Snow'),
  ('00000000-0000-4000-8000-000000000000', 'knot-demo', 'Knot Bot')
ON CONFLICT (id) DO UPDATE 
SET username = EXCLUDED.username, display_name = EXCLUDED.display_name;

-- 3. Create Pre-Staged Frayed Knot ("Morning Gym Protocol")
INSERT INTO public.knots (id, title, knot_type, status, rescue_expires_at, blueprint_slug, created_at)
VALUES (
  '33333333-3333-4333-8333-333333333333',
  'Morning Gym Protocol',
  'tied',
  'active',
  NOW() + INTERVAL '22 hours', -- Open Rescue Window
  'morning-gym',
  NOW() - INTERVAL '3 days'
);

INSERT INTO public.knot_members (knot_id, user_id, role, last_active_at)
VALUES 
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'creator', NOW()),
  ('33333333-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', 'partner', NOW() - INTERVAL '1 day');

-- 4. Set integrity ledger: 100% initial - 25% fray = 75% current
INSERT INTO public.integrity_events (knot_id, delta, reason, created_at)
VALUES 
  ('33333333-3333-4333-8333-333333333333', 100.0, 'initial', NOW() - INTERVAL '3 days'),
  ('33333333-3333-4333-8333-333333333333', -25.0, 'fray_miss', NOW() - INTERVAL '2 hours');
```

---

## 7. Validation Framework & Telemetry Instrumentation

### 7.1 Tier 1 Feature Validation Metrics (14-Day Beta, Real Clock)

All Tier 1 core mechanics are bound to quantitative validation targets and decision thresholds:

| Tier 1 Feature | Metric Key | Target Threshold | Falsification / Kill Boundary | Hypothesis Tested |
| :--- | :--- | :---: | :---: | :---: |
| **1. Tied Knot** | `invite_acceptance_rate` | $\ge 70\%$ within 48h | $< 40\%$ | Onboarding / Cold Start |
| **1. Tied Knot** | `knot_survival_d7` | $\ge 60\%$ active at D7 | $< 40\%$ | Loop Zero Retention |
| **1. Tied Knot** | `knot_survival_d14` | $\ge 40\%$ active at D14 | $< 25\%$ | Loop Zero Retention |
| **1. Tied Knot** | `member_checkin_rate` | $\ge 70\%$ active days | $< 50\%$ | Daily Habit Loop |
| **2. Decay Ledger** | `rescue_completion_rate` | $\ge 50\%$ rescued | $< 25\%$ | **H3 (Decay Resilience)** |
| **2. Decay Ledger** | `post_fray_survival` | $\ge 60\%$ alive 7d post-fray | $< 40\%$ | **H3 (Decay Resilience)** |
| **2. Decay Ledger** | `post_fray_abandonment` | $\le 30\%$ 72h silence | $> 50\%$ | **H3 (What-the-hell spiral)** |
| **3. Action Snapshots** | `capture_completion_rate` | $\ge 80\%$ (open $\to$ submit)| $< 65\%$ | **H2 (Capture Friction)** |
| **3. Action Snapshots** | `median_capture_time_sec` | $\le 30\text{s}$ | $> 60\text{s}$ | **H2 (Speed)** |
| **3. Action Snapshots** | `camera_permission_denial`| $\le 10\%$ users | $> 15\%$ | **H2 (Device Feasibility)** |
| **3. Action Snapshots** | `gallery_upload_paths` | Exactly **0** in DOM | $> 0$ | Anti-Cheat Architectural Truth |
| **4. Silent Pass / Larp**| `partner_review_rate` | $\ge 60\%$ viewed pre-pass | $< 40\%$ | **H1 (Social Verification)**|
| **4. Silent Pass / Larp**| `canary_detection_rate` | $\ge 50\%$ flagged | $< 30\%$ | **H1 (Auditing Rigor)** |
| **4. Silent Pass / Larp**| `proof_outcome_mix` | $\ge 50\%$ att. / $\le 40\%$ blind / $2\text{--}10\%$ disp. | Blind $> 70\%$ or Disp $> 20\%$ | **H1 (Review Distribution)** |
| **4. Silent Pass / Larp**| `post_dispute_resubmit` | $\ge 50\%$ resubmitted | $< 25\%$ | **H1 (Constructive Dispute)**|
| **5. Synthetic Partner** | `demo_onboarding_speed` | $\le 90\text{s}$ to proof | $> 180\text{s}$ | Frictionless Solo Entry |
| **5. Synthetic Partner** | `demo_knot_ratio` | $\le 30\%$ beta cohort | $> 50\%$ (Red Flag F12)| Natural Peer Adoption |

---

### 7.2 Telemetry Event Contract (`public.events`)

The client logs telemetry directly into the `events` table via standard Supabase client calls:

```typescript
// lib/telemetry/logEvent.ts
import { supabase } from '@/lib/supabase/client';

export type EventType =
  | 'invite_sent'
  | 'invite_accepted'
  | 'camera_opened'
  | 'camera_permission_denied'
  | 'proof_submitted'
  | 'proof_viewed_by_partner'
  | 'proof_auto_approved'
  | 'proof_flagged'
  | 'proof_resubmitted'
  | 'fray_applied'
  | 'rescue_banner_viewed'
  | 'rescue_completed'
  | 'knot_untied'
  | 'canary_submitted';

export async function logTelemetry(type: EventType, metadata: Record<string, any> = {}, knotId?: string, proofId?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('events').insert({
      user_id: user?.id,
      knot_id: knotId,
      proof_id: proofId,
      type,
      metadata,
    });
  } catch (err) {
    console.error('Telemetry logging error:', err);
  }
}
```

---

### 7.3 Tester Canary Proof Mechanism

To validate **Hypothesis H1** (measuring partner vigilance against real cheating without guessing):
- During beta Days 8–14, a hidden toggle appears in the developer drawer for registered testers: `"Mark as Canary Test"`.
- Submitting a canary proof sets `proofs.is_canary = TRUE`.
- The partner UI treats this proof **identically** to normal proofs.
- If the partner clicks **"Call Larp"**, the database records a successful detection. If it auto-approves via Silent Pass, it records an undetected canary.
- Target metric: **$\ge 50\%$ of canary proofs flagged** confirms partners are actively auditing.
