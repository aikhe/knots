import { Navigate } from "react-router";
import { FirstCheckin } from "./FirstCheckin";
import { NotifySample } from "./NotifySample";
import { Pick } from "./Pick";
import { PickBub } from "./PickBub";
import { Share } from "./Share";
import { Tie } from "./Tie";
import { useOnboardingFlow } from "./useOnboarding";

export function Flow() {
  const {
    gate,
    destination,
    step,
    setStep,
    pick,
    setPick,
    custom,
    setCustom,
    knotId,
    setKnotId,
    withFriend,
    setWithFriend,
    title,
    order,
    position,
    finish,
  } = useOnboardingFlow();

  if (gate === "loading") return null;
  if (gate === "done") return <Navigate to={destination} replace />;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-3 pb-6 pt-6 sm:min-h-0 sm:h-full">
      <div className="flex items-center gap-1">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            aria-label="Back"
            className="text-neutral-500 hover:text-white"
          >
            <img
              src="/MajesticonsChevronLeft.svg"
              alt=""
              className="h-6 w-6 invert"
            />
          </button>
        )}
        <div className="flex flex-1 gap-1 px-2">
          {order.map((i, index) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${index <= position ? "bg-white" : "bg-neutral-800"}`}
            />
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        {step === 1 && (
          <Pick
            pick={pick}
            setPick={setPick}
            custom={custom}
            setCustom={setCustom}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Tie
            title={title}
            onDone={(id, friend) => {
              setKnotId(id);
              setWithFriend(friend);
              setStep(3);
            }}
          />
        )}
        {step === 3 &&
          (knotId && withFriend ? (
            <Share knotId={knotId} title={title} onNext={() => setStep(4)} />
          ) : (
            <FirstCheckin knotId={knotId ?? ""} onNext={() => setStep(5)} />
          ))}
        {step === 4 && (
          <FirstCheckin knotId={knotId ?? ""} onNext={() => setStep(5)} />
        )}
        {step === 5 && <NotifySample onDone={() => setStep(6)} />}
        {step === 6 && <PickBub onDone={finish} />}
      </div>
    </main>
  );
}
