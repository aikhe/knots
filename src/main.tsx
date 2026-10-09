import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import { RouterProvider } from "react-router";
import { router } from "./router";
import { Backend } from "./lib/layouts/Backend.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/utils/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Backend>
        <RouterProvider router={router} />
      </Backend>
    </QueryClientProvider>
  </StrictMode>,
);
