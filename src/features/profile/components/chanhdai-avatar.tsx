"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";

import ImgAvatar from "@/../public/images/avatar.jpg";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/cn";

export function ChanhDaiAvatar({
  className,
  size,
  priority = true,
  initialAvatar,
  displayName,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  initialAvatar?: string;
  displayName?: string;
}) {
  const { profile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("admin_auth") === "true");
    }
  }, []);

  const activeAvatar =
    profile.avatar && profile.avatar !== "/images/avatar.jpg"
      ? profile.avatar
      : initialAvatar || profile.avatar || "/images/avatar.jpg";

  const isCustomUrl =
    activeAvatar &&
    (activeAvatar.startsWith("data:") ||
      activeAvatar.startsWith("http") ||
      activeAvatar !== "/images/avatar.jpg");

  const name = profile.displayName || displayName || "Architect";

  return (
    <div className="relative group inline-block">
      {isCustomUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={cn("object-cover aspect-square rounded-full", className)}
          alt={`${name}'s avatar`}
          src={activeAvatar}
          width={size}
          height={size}
        />
      ) : (
        <Image
          className={cn("object-cover aspect-square rounded-full", className)}
          alt={`${name}'s avatar`}
          src={ImgAvatar}
          width={size}
          height={size}
          placeholder="blur"
          quality={100}
          priority={priority}
        />
      )}

      {/* Admin quick edit shortcut when authenticated */}
      {isAdmin && (
        <Link
          href="/admin"
          className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
          title="Edit Profile Picture in Admin Panel"
        >
          <Camera className="size-6 text-white" />
          <span className="text-[10px] font-semibold text-white mt-1">Change</span>
        </Link>
      )}
    </div>
  );
}
