// src/main.jsx  ← SIRF YAHAN QueryClient add karo, baaki same rahega
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";
import "./index.css"; // ya jo bhi tumhara global CSS hai

// ── QueryClient — global config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           1000 * 60 * 5, // 5 min fresh
      retry:               1,              // fail pe 1 baar retry
      refetchOnWindowFocus: false,         // window focus pe auto-refetch off
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>

      {/* ─── Tumhari poori app yahan jaati hai ─── */}
      <App />

      {/* ─── DevTools: sirf dev build mein dikhega, prod mein nahi ─── */}
      <ReactQueryDevtools initialIsOpen={false} />

    </QueryClientProvider>
  </StrictMode>
);