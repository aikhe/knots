// Horizontal snap carousel. Bleeds past the right padding so the
// next image peeks in.
export function PostImages({ urls }: { urls?: string[] | null }) {
  const list = urls ?? [];
  if (list.length === 0) return null;
  return (
    <div className="-mx-3 mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-[60px] px-[60px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {list.map((url) => (
        <img
          key={url}
          src={url}
          alt=""
          className="h-56 w-auto max-w-[92%] shrink-0 snap-start rounded-2xl object-cover"
        />
      ))}
    </div>
  );
}
