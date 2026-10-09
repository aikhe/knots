import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router";

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

export function SignInPage() {
  return (
    <main className="mx-auto max-w-2xl px-3 py-10">
      <Link to="/home" className="text-xl font-medium text-white">
        knots
      </Link>
      {!clerkConfigured ? (
        <p className="mt-6 text-sm text-neutral-500">
          Auth off. Add VITE_CLERK_PUBLISHABLE_KEY to sign in.
        </p>
      ) : (
        <SignedOut>
          <div className="mt-6 flex justify-center">
            <SignIn
              routing="path"
              path="/signin"
              fallbackRedirectUrl="/home"
              appearance={{
                variables: {
                  colorBackground: "#000",
                  colorText: "#fff",
                  colorTextSecondary: "#a3a3a3",
                  colorInputBackground: "#0a0a0a",
                  colorInputText: "#fff",
                  colorPrimary: "#fff",
                  borderRadius: "0.5rem",
                },
                elements: {
                  card: "border border-neutral-800 bg-black shadow-none",
                  headerTitle: "text-white",
                  headerSubtitle: "text-neutral-400",
                  socialButtonsBlockButton:
                    "rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white [&_*]:text-white",
                  formFieldLabel: "text-neutral-300",
                  formFieldInput:
                    "border-neutral-800 bg-neutral-950 text-white",
                  formButtonPrimary: "bg-white text-black [&_*]:text-black",
                  footer: "border-t border-neutral-800",
                  footerActionText: "text-neutral-500",
                  footerActionLink: "text-white",
                },
              }}
            />
          </div>
        </SignedOut>
      )}
      <SignedIn>
        <p className="mt-6 text-sm text-neutral-400">
          Already signed in.{" "}
          <Link to="/home" className="text-white underline">
            Back to home
          </Link>
        </p>
      </SignedIn>
    </main>
  );
}
