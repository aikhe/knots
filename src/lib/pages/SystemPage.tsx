import type { ReactNode } from "react";
import { RopeMeter } from "../components/Knots/RopeMeter";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="border-b border-neutral-800 pb-1 text-sm text-neutral-500">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function ColorRow({
  name,
  value,
  usage,
  color,
}: {
  name: string;
  value: string;
  usage: string;
  color: string;
}) {
  return (
    <li className="flex items-center gap-3 py-2">
      <span
        aria-hidden
        className="h-7 w-7 shrink-0 rounded-md border border-neutral-800"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{name}</p>
        <p className="text-xs text-neutral-500">{usage}</p>
      </div>
      <span className="shrink-0 font-mono text-xs text-neutral-600">
        {value}
      </span>
    </li>
  );
}

function TypeRow({
  textClass,
  size,
  usage,
  sample,
}: {
  textClass: string;
  size: string;
  usage: string;
  sample: string;
}) {
  return (
    <li className="flex items-end justify-between gap-3 border-b border-neutral-800 py-2 last:border-0">
      <div className="min-w-0">
        <p className={`truncate text-white ${textClass}`}>{sample}</p>
        <p className="text-xs text-neutral-500">{usage}</p>
      </div>
      <span className="shrink-0 font-mono text-xs text-neutral-600">{size}</span>
    </li>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-neutral-800 pb-1">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="font-mono text-xs text-white">{value}</dd>
    </div>
  );
}

function SpecRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-neutral-800 py-2 last:border-0">
      <div className="min-w-0 flex-1">{children}</div>
      <span className="w-20 shrink-0 text-right text-xs text-neutral-600">
        {label}
      </span>
    </div>
  );
}

function MotionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-neutral-800 py-2 last:border-0">
      <dt className="text-sm text-white">{label}</dt>
      <dd className="font-mono text-xs text-neutral-600">{value}</dd>
    </div>
  );
}

function SwitchSample({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-6 w-11 items-center rounded-full px-0.5 ${
        on ? "justify-end bg-white" : "justify-start bg-neutral-800"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full ${on ? "bg-black" : "bg-neutral-500"}`}
      />
    </span>
  );
}

function IconCell({
  src,
  name,
  invert,
}: {
  src: string;
  name: string;
  invert?: boolean;
}) {
  return (
    <li className="flex flex-col items-center gap-1 rounded-xl bg-neutral-900 py-2">
      <img src={src} alt="" className={`h-6 w-auto ${invert ? "invert" : ""}`} />
      <span className="text-[11px] text-neutral-500">{name}</span>
    </li>
  );
}

export function SystemPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 pb-10">
      <div className="flex items-end justify-between">
        <h1 className="text-xl text-white">System</h1>
        <span className="text-xs text-neutral-600">draft</span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Monochrome. Geist. One primary action.
      </p>
      <ul className="mt-3 space-y-1 border-y border-neutral-800 py-2 text-sm text-neutral-300">
        <li>White is the only accent.</li>
        <li>Cards are neutral-900, controls neutral-800, panels surface.</li>
        <li>Gutter 12, row 12, control gap 8.</li>
        <li>Radius: full for controls, 16 for content, 24 for sheets.</li>
      </ul>

      <Section title="Color">
        <h3 className="text-xs text-neutral-600">Surfaces</h3>
        <ul className="mt-1 divide-y divide-neutral-800">
          <ColorRow
            name="Ink"
            value="#000000"
            usage="App background"
            color="#000000"
          />
          <ColorRow
            name="Surface"
            value="#101010"
            usage="Frame, bars, sheets"
            color="#101010"
          />
          <ColorRow
            name="Card"
            value="neutral-900"
            usage="Cards, menus, fields"
            color="#171717"
          />
          <ColorRow
            name="Raised"
            value="neutral-800"
            usage="Secondary controls, avatars, hairlines"
            color="#262626"
          />
        </ul>
        <h3 className="mt-3 text-xs text-neutral-600">Text</h3>
        <ul className="mt-1 divide-y divide-neutral-800">
          <ColorRow
            name="Primary"
            value="white"
            usage="Body, active"
            color="#ffffff"
          />
          <ColorRow
            name="Secondary"
            value="neutral-400"
            usage="Secondary copy"
            color="#a3a3a3"
          />
          <ColorRow
            name="Muted"
            value="neutral-500"
            usage="Meta, inactive"
            color="#737373"
          />
          <ColorRow
            name="Quiet"
            value="neutral-600"
            usage="Tertiary actions"
            color="#525252"
          />
        </ul>
      </Section>

      <Section title="Type">
        <p className="text-sm text-white">Geist 400, 500</p>
        <p className="mt-1 text-xs text-neutral-500">
          Letter spacing 0.34%. Geist Mono for tokens and figures.
        </p>
        <ul className="mt-2">
          <TypeRow
            textClass="text-2xl"
            size="24"
            usage="Onboarding headline"
            sample="Tie your knot"
          />
          <TypeRow
            textClass="text-xl"
            size="20"
            usage="Page title"
            sample="Bub's insight"
          />
          <TypeRow
            textClass="text-base"
            size="16"
            usage="Body, primary buttons"
            sample="Three kilometres before the rain."
          />
          <TypeRow
            textClass="text-sm"
            size="14"
            usage="Controls, secondary copy"
            sample="Edit profile"
          />
          <TypeRow
            textClass="text-xs"
            size="12"
            usage="Counts, meta"
            sample="3 check-ins · 2 active today"
          />
          <TypeRow
            textClass="text-[11px]"
            size="11"
            usage="Chat timestamps"
            sample="2h"
          />
        </ul>
      </Section>

      <Section title="Shape">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Metric label="Gutter" value="12px" />
          <Metric label="Row" value="12px" />
          <Metric label="Gap" value="8px" />
          <Metric label="Control" value="full" />
          <Metric label="Card" value="16px" />
          <Metric label="Sheet" value="24px" />
        </dl>
      </Section>

      <Section title="Actions">
        <SpecRow label="primary">
          <button
            type="button"
            className="w-full rounded-full bg-white px-3 py-1.5 text-base text-black"
          >
            Save
          </button>
        </SpecRow>
        <SpecRow label="secondary">
          <button
            type="button"
            className="w-full rounded-full bg-neutral-800 px-4 py-1.5 text-base text-white"
          >
            Edit profile
          </button>
        </SpecRow>
        <SpecRow label="small">
          <button
            type="button"
            className="rounded-full bg-white px-4 py-1.5 text-sm text-black"
          >
            Accept
          </button>
        </SpecRow>
        <SpecRow label="disabled">
          <button
            type="button"
            disabled
            className="w-full rounded-full bg-white px-3 py-1.5 text-base text-black disabled:opacity-40"
          >
            Save
          </button>
        </SpecRow>
        <SpecRow label="tertiary">
          <button type="button" className="text-sm text-neutral-500">
            Delete knot
          </button>
        </SpecRow>
        <SpecRow label="icon">
          <button
            type="button"
            aria-label="Send"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
          >
            <img
              src="/MajesticonsPaperAirplaneLine.svg"
              alt=""
              className="h-5 w-5"
            />
          </button>
        </SpecRow>
      </Section>

      <Section title="Fields">
        <SpecRow label="inline">
          <input
            placeholder="Knot title"
            className="w-full bg-transparent text-base text-white outline-none"
          />
        </SpecRow>
        <SpecRow label="search">
          <input
            placeholder="Search"
            className="w-full rounded-full bg-neutral-900 px-4 py-2 text-sm text-white outline-none"
          />
        </SpecRow>
        <SpecRow label="select">
          <span className="flex w-full items-center justify-between gap-2 rounded-full bg-neutral-800 py-2 pl-4 pr-4 text-base text-white">
            <span className="truncate">Tied, 1-on-1</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
              className="shrink-0 text-neutral-500"
            >
              <path
                d="M6 9l6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </SpecRow>
        <SpecRow label="menu">
          <span className="block rounded-2xl bg-neutral-900 p-1">
            <span className="block rounded-xl bg-neutral-800 px-3 py-2 text-sm text-white">
              Squad, up to 5
            </span>
            <span className="block px-3 py-2 text-sm text-neutral-400">
              Solo, just you
            </span>
          </span>
        </SpecRow>
        <SpecRow label="switch">
          <span className="flex items-center justify-between gap-3">
            <span className="text-sm text-neutral-400">Nudges</span>
            <span className="flex items-center gap-2">
              <SwitchSample on={false} />
              <SwitchSample on />
            </span>
          </span>
        </SpecRow>
        <SpecRow label="composer">
          <span className="flex items-center gap-1 rounded-full bg-neutral-900 py-1.5 pl-3 pr-1.5">
            <input
              placeholder="Message"
              className="w-full bg-transparent text-sm text-white outline-none"
            />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
              <img
                src="/MajesticonsPaperAirplaneLine.svg"
                alt=""
                className="h-5 w-5"
              />
            </span>
          </span>
        </SpecRow>
      </Section>

      <Section title="Tabs and pills">
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white">
            Mine
          </span>
          <span className="rounded-full px-4 py-1.5 text-sm text-neutral-500">
            Joinable
          </span>
          <span className="rounded-full px-4 py-1.5 text-sm text-neutral-500">
            Smart
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
            walk 20 minutes
          </span>
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
            sketch daily
          </span>
        </div>
      </Section>

      <Section title="Rows">
        <div className="-mx-3 flex items-center gap-3 px-3 py-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-base text-white">
            M
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base text-white">Morning run</p>
            <p className="truncate text-sm text-neutral-500">
              Maya: 3k before the rain
            </p>
          </div>
          <p className="shrink-0 text-xs text-neutral-600">2h</p>
        </div>
        <div className="-mx-3 border-t border-neutral-800 px-3 py-3">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm text-white">
              M
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base leading-tight text-white">
                Maya <span className="text-neutral-500">2h</span>
              </p>
              <p className="text-sm text-neutral-500">
                in <span className="text-neutral-300">Morning run</span>
              </p>
              <p className="mt-1 text-base leading-snug text-white">
                Three kilometres before the rain.
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-5 pl-12 text-neutral-500">
            <span className="flex items-center gap-1.5">
              <img
                src="/MynauiHeart.svg"
                alt=""
                className="h-5 w-5 invert opacity-40"
              />
              <span className="text-xs">3</span>
            </span>
            <span className="flex items-center gap-1.5">
              <img
                src="/MynauiChat.svg"
                alt=""
                className="h-5 w-5 invert opacity-40"
              />
              <span className="text-xs">2</span>
            </span>
            <img
              src="/MynauiPaperclipSolid.svg"
              alt=""
              className="h-5 w-5 invert opacity-40"
            />
          </div>
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800 text-2xl text-white">
              M
            </span>
            <span className="font-mono text-[11px] text-neutral-600">80</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 text-base text-white">
              M
            </span>
            <span className="font-mono text-[11px] text-neutral-600">56</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm text-white">
              M
            </span>
            <span className="font-mono text-[11px] text-neutral-600">36</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-xs text-white">
              M
            </span>
            <span className="font-mono text-[11px] text-neutral-600">28</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-[11px] text-white">
              M
            </span>
            <span className="font-mono text-[11px] text-neutral-600">24</span>
          </div>
        </div>
      </Section>

      <Section title="Chat">
        <div className="space-y-3">
          <div className="flex flex-col items-end gap-1">
            <div className="max-w-[80%] rounded-2xl bg-white px-3 py-1.5 text-black">
              <p className="text-sm">Done for today.</p>
            </div>
            <p className="text-[11px] text-neutral-500">2h</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="pl-8 text-xs text-neutral-400">Maya</p>
            <div className="flex items-end gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[11px] text-white">
                M
              </div>
              <div className="max-w-[80%] rounded-2xl bg-neutral-800 px-3 py-1.5 text-white">
                <p className="text-sm">Nice. Same tomorrow?</p>
              </div>
            </div>
            <p className="pl-8 text-[11px] text-neutral-500">2h</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {(["tight", "firm", "slack"] as const).map((rope) => (
            <div key={rope} className="flex items-center gap-3">
              <div className="flex-1">
                <RopeMeter rope={rope} />
              </div>
              <span className="w-10 shrink-0 text-xs text-neutral-500">
                {rope}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Surfaces">
        <div className="rounded-2xl bg-neutral-900 p-3">
          <p className="text-base text-white">New here?</p>
          <p className="mt-1 text-sm text-neutral-500">
            Tie your first knot in under a minute.
          </p>
        </div>
        <div className="mt-2 rounded-t-3xl border border-b-0 border-neutral-800 bg-surface px-3 pb-4 pt-2">
          <div className="mx-auto h-1 w-10 rounded-full bg-neutral-700" />
        </div>
        <div className="mt-2 flex justify-center">
          <span className="rounded-full bg-neutral-800 px-4 py-1.5 text-sm text-white">
            Copied
          </span>
        </div>
      </Section>

      <Section title="Icons">
        <ul className="grid grid-cols-4 gap-2">
          <IconCell src="/MajesticonsMenuAlt.svg" name="menu" invert />
          <IconCell src="/MajesticonsSearchLine.svg" name="search" invert />
          <IconCell src="/MajesticonsCogLine.svg" name="cog" invert />
          <IconCell src="/MajesticonsFireLine.svg" name="fire" invert />
          <IconCell src="/MajesticonsUser.svg" name="user" invert />
          <IconCell
            src="/MajesticonsApplications.svg"
            name="applications"
            invert
          />
          <IconCell src="/home.svg" name="home" invert />
          <IconCell src="/knot.svg" name="knot" />
          <IconCell src="/MynauiHeart.svg" name="heart" invert />
          <IconCell src="/MynauiChat.svg" name="chat" invert />
          <IconCell src="/MynauiPaperclipSolid.svg" name="paperclip" invert />
          <IconCell
            src="/MajesticonsPaperAirplaneLine.svg"
            name="send"
            invert
          />
        </ul>
        <p className="mt-2 text-xs text-neutral-500">
          Most SVGs draw black, so invert them on dark. The plus and knot
          assets are already white.
        </p>
      </Section>

      <Section title="Motion">
        <dl>
          <MotionRow label="Press" value="100ms · scale .96" />
          <MotionRow label="Drawer" value="250ms · tween" />
          <MotionRow label="Sheet" value="spring · 380/42" />
          <MotionRow label="Backdrop" value="200ms · fade" />
        </dl>
        <p className="mt-2 text-xs text-neutral-500">
          Ease-out only. No looping animation.
        </p>
      </Section>

      <Section title="Open">
        <ul className="space-y-2 text-sm text-neutral-400">
          <li>Button padding splits between py-1.5 and py-2 for the same role.</li>
          <li>Secondary copy uses neutral-400, -500, and -600 without a rule.</li>
          <li>Chat timestamps are 11px; other meta is 12px.</li>
          <li>Onboarding titles are text-2xl; app page titles are text-xl.</li>
          <li>Icon sources mix black and white, so invert is applied per use.</li>
        </ul>
      </Section>
    </main>
  );
}
