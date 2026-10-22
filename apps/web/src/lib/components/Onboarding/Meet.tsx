import { Link } from "react-router";

export function Meet() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <img src="/knots-onboard.svg" alt="Knots" className="h-36 w-auto" />
        <p className="mt-4 text-base text-white">
          Stop sending TikToks. Start doing things.
        </p>
      </div>
      <Link
        to="/signin"
        className="mt-auto block w-full rounded-full bg-white px-3 py-2 text-center text-base text-black"
      >
        Get started
      </Link>
    </div>
  );
}
