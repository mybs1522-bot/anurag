"use client";

import { AppProgressProvider } from "@bprogress/next";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";

import { PostHogProvider } from "./posthog-provider";

// Suppress React 19 false-positive warning for third-party inline script tags (next-themes etc.)
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        enableSystem
        disableTransitionOnChange
        enableColorScheme
        storageKey="chanhdai.theme"
        defaultTheme="light"
        attribute="class"
      >
        <AppProgressProvider
          color="#2563eb"
          height="2px"
          delay={500}
          options={{ showSpinner: false }}
        >
          <PostHogProvider>{children}</PostHogProvider>
        </AppProgressProvider>

        <Toaster />
      </ThemeProvider>
    </JotaiProvider>
  );
}
