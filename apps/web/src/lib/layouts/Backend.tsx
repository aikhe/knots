import type { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { EnsureUser } from "./EnsureUser";
import { DevDock } from "../components/Dev/DevDock";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Module singleton: creating this in render would drop the socket on
// every re-render.
const convexClient = convexUrl
  ? new ConvexReactClient(convexUrl)
  : null;

export function Backend({ children }: { children: ReactNode }) {
  if (convexClient && clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
          <EnsureUser />
          {children}
          {import.meta.env.DEV && <DevDock />}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }
  if (convexClient) {
    return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
  }
  return <>{children}</>;
}
