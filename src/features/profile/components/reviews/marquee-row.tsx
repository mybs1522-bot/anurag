"use client";

import React from "react";

import { cn } from "@/lib/cn";

import { Review } from "../../types/reviews";
import { ReviewCard } from "./review-card";

/**
 * A marquee row that continuously scrolls its children in the given direction.
 * Uses pure CSS animation for performance.
 */
function MarqueeRow({
  reviews,
  direction = "left",
  duration = 40,
  className,
}: {
  reviews: Review[];
  direction?: "left" | "right";
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("group relative flex overflow-hidden", className)}
      style={
        {
          "--marquee-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      {/* Two copies for seamless loop */}
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className={cn(
            "flex shrink-0 gap-4",
            direction === "left"
              ? "animate-marquee-left"
              : "animate-marquee-right",
            "group-hover:[animation-play-state:paused]"
          )}
          aria-hidden={copy === 1}
        >
          {reviews.map((review) => (
            <ReviewCard key={`${copy}-${review.id}`} review={review} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * A static row that centers its children without animation.
 */
function StaticRow({
  reviews,
  className,
}: {
  reviews: Review[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-center gap-4 overflow-hidden px-4",
        className
      )}
    >
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

export { MarqueeRow, StaticRow };
