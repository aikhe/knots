const width: Record<string, string> = {
  tight: "w-[90%]",
  firm: "w-[55%]",
  slack: "w-[20%]",
};

const fill: Record<string, string> = {
  tight: "bg-neutral-100",
  firm: "bg-neutral-500",
  slack: "bg-neutral-700",
};

export function RopeMeter({ rope }: { rope: "tight" | "firm" | "slack" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 flex-1 rounded-full bg-neutral-800">
        <div className={`h-2.5 rounded-full ${fill[rope]} ${width[rope]}`} />
      </div>
    </div>
  );
}
