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
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  const { profile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(localStorage.getItem("admin_auth") === "true");
    }
  }, []);

  const isCustomUrl =
    profile.avatar &&
    (profile.avatar.startsWith("data:") ||
      profile.avatar.startsWith("http") ||
      profile.avatar !== "/images/avatar.jpg");

  return (
    <div className="relative group inline-block">
      {isCustomUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={cn("object-cover aspect-square rounded-full", className)}
          alt={`${profile.displayName}'s avatar`}
          src={profile.avatar}
          width={size}
          height={size}
        />
      ) : (
        <Image
          className={cn("object-cover aspect-square rounded-full", className)}
          alt={`${profile.displayName}'s avatar`}
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
