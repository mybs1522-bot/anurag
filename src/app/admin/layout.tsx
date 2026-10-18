import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ToggleTheme } from "@/components/toggle-theme";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full max-w-[98%] xl:max-w-[1700px] mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ToggleTheme />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to site</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="w-full max-w-[98%] xl:max-w-[1700px] mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
