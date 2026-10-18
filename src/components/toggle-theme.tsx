"use client";

import { MoonStarIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import { META_THEME_COLORS } from "@/config/site";
import { useMetaColor } from "@/hooks/use-meta-color";

import { Button } from "./ui/button";

export function ToggleTheme({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { setMetaColor } = useMetaColor();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    const isDark = resolvedTheme === "dark";
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    setMetaColor(
      isDark
        ? META_THEME_COLORS.light
        : META_THEME_COLORS.dark
    );
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`h-8 px-2.5 text-xs text-muted-foreground ${className || ""}`}
        aria-label="Toggle Theme"
      >
        <SunIcon className="size-3.5 text-muted-foreground" />
        <span className="hidden sm:inline">Theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={`h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer rounded-lg border-border/80 transition-all ${className || ""}`}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <>
          <SunIcon className="size-3.5 text-amber-400" />
          <span className="hidden sm:inline text-foreground">Light</span>
        </>
      ) : (
        <>
          <MoonStarIcon className="size-3.5 text-blue-500" />
          <span className="hidden sm:inline text-foreground">Dark</span>
        </>
      )}
    </Button>
  );
}
