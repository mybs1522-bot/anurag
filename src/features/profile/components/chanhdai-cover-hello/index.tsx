"use client";

import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/cn";

export function ChanhDaiCoverHello() {
  const { profile } = useProfile();

  const coverUrl =
    profile.coverImage ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop";

  const position = profile.coverPosition || "50%";
  const objectPosition = position.includes("%") ? `center ${position}` : position;

  return (
    <div
      className={cn(
        "relative border-x border-grid select-none overflow-hidden bg-muted",
        "screen-line-before screen-line-after before:-top-px after:-bottom-px"
      )}
    >
      {/* Aspect ratio: 2992x692 = ~23.13% height ratio */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: "23.13%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={`${profile.displayName}'s architectural banner`}
          className="absolute inset-0 size-full object-cover transition-all duration-300 pointer-events-none"
          style={{
            objectPosition,
          }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
