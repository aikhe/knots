import { QueryClient } from "@tanstack/react-query";

// For non-Convex async data. Convex queries stay on useQuery from convex/react.
export const queryClient = new QueryClient();
