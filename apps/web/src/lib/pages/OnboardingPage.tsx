import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Flow } from "../components/Onboarding/Flow";
import { SignedOutWelcome } from "../components/Onboarding/SignedOutWelcome";
import { clerkConfigured } from "../utils/env";

export function OnboardingPage() {
  if (!clerkConfigured) return <SignedOutWelcome />;

  return (
    <>
      <SignedOut>
        <SignedOutWelcome />
      </SignedOut>
      <SignedIn>
        <Flow />
      </SignedIn>
    </>
  );
}
