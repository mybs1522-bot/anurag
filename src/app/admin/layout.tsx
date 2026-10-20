import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col justify-between">
      <div>
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

      <footer className="border-t border-border/60 py-4 px-6 flex items-center justify-center gap-1.5 font-sans text-xs text-muted-foreground/75">
        <span className="text-[11px] font-medium tracking-tight">Built by</span>
        <span className="inline-flex items-center">
          <Image
            src="/images/connect-logo-light.png"
            alt="Connect"
            width={70}
            height={23}
            className="h-[14px] w-auto dark:hidden object-contain"
          />
          <Image
            src="/images/connect-logo-dark.png"
            alt="Connect"
            width={70}
            height={23}
            className="h-[14px] w-auto hidden dark:inline-block object-contain"
          />
        </span>
      </footer>
    </div>
  );
}
