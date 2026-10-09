import type { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

export function Backend({ children }: { children: ReactNode }) {
  if (convexUrl && clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ConvexProviderWithClerk
          client={new ConvexReactClient(convexUrl)}
          useAuth={useAuth}
        >
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    );
  }
  if (convexUrl) {
    return (
      <ConvexProvider client={new ConvexReactClient(convexUrl)}>
        {children}
      </ConvexProvider>
    );
  }
  return <>{children}</>;
}
