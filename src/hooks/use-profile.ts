"use client";

import { useEffect, useState } from "react";
import { USER } from "@/data/user";
import { supabase } from "@/lib/supabase";

export interface ProfileData {
  displayName: string;
  jobTitle: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  coverPosition?: string;
  flipSentences?: string[];
  about: string;
  email: string;
  phone: string;
  website: string;
  googleCalendarId?: string;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop";

const DEFAULT_PROFILE: ProfileData = {
  displayName: USER.displayName,
  jobTitle: USER.jobTitle,
  bio: USER.bio,
  avatar: USER.avatar,
  coverImage: DEFAULT_COVER,
  coverPosition: "50%",
  flipSentences: USER.flipSentences,
  about: USER.about,
  email: "contact@studiomehta.com",
  phone: "+91 98201 12233",
  website: USER.website,
  googleCalendarId: "",
};

function safeSetLocalStorage(key: string, data: any) {
  if (typeof window === "undefined") return;
  try {
    const copy = { ...data };
    // Never store large base64 strings in localStorage to avoid QuotaExceededError
    if (copy.avatar && copy.avatar.startsWith("data:")) {
      copy.avatar = "/images/avatar.jpg";
    }
    if (copy.coverImage && copy.coverImage.startsWith("data:")) {
      copy.coverImage = DEFAULT_COVER;
    }
    window.localStorage.setItem(key, JSON.stringify(copy));
  } catch {
    // Gracefully ignore quota errors
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      // 1. Check local storage first for instant feedback
      if (typeof window !== "undefined") {
        try {
          const cached = window.localStorage.getItem("architect_demo_profile");
          if (cached) {
            setProfile(JSON.parse(cached));
          }
        } catch {
          // ignore
        }
      }

      // 2. Fetch from /api/admin/profile API
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const json = await res.json();
        if (json.profile) {
          const merged: ProfileData = {
            displayName: json.profile.displayName || DEFAULT_PROFILE.displayName,
            jobTitle: json.profile.jobTitle || DEFAULT_PROFILE.jobTitle,
            bio: json.profile.bio || DEFAULT_PROFILE.bio,
            avatar: json.profile.avatar || DEFAULT_PROFILE.avatar,
            coverImage: json.profile.coverImage || DEFAULT_PROFILE.coverImage,
            coverPosition: json.profile.coverPosition || DEFAULT_PROFILE.coverPosition,
            flipSentences: json.profile.flipSentences || DEFAULT_PROFILE.flipSentences,
            about: json.profile.about || DEFAULT_PROFILE.about,
            email: json.profile.email || DEFAULT_PROFILE.email,
            phone: json.profile.phone || DEFAULT_PROFILE.phone,
            website: json.profile.website || DEFAULT_PROFILE.website,
            googleCalendarId: json.profile.googleCalendarId || "",
          };
          setProfile(merged);
          safeSetLocalStorage("architect_demo_profile", merged);
          return;
        }
      }

      // 3. Fallback direct supabase query
      const { data } = await supabase.from("profile").select("*").limit(1).single();
      if (data) {
        const merged: ProfileData = {
          displayName: data.display_name || data.displayName || DEFAULT_PROFILE.displayName,
          jobTitle: data.job_title || data.jobTitle || DEFAULT_PROFILE.jobTitle,
          bio: data.bio || DEFAULT_PROFILE.bio,
          avatar: data.avatar || DEFAULT_PROFILE.avatar,
          coverImage: data.cover_image || DEFAULT_PROFILE.coverImage,
          coverPosition: data.cover_position || DEFAULT_PROFILE.coverPosition,
          flipSentences: data.flip_sentences || DEFAULT_PROFILE.flipSentences,
          about: data.about || DEFAULT_PROFILE.about,
          email: data.email || DEFAULT_PROFILE.email,
          phone: data.phone || DEFAULT_PROFILE.phone,
          website: data.website || DEFAULT_PROFILE.website,
          googleCalendarId: data.google_calendar_id || data.googleCalendarId || "",
        };
        setProfile(merged);
        safeSetLocalStorage("architect_demo_profile", merged);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener("profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile_updated", handleProfileUpdate);
    };
  }, []);

  const updateProfile = async (newProfile: Partial<ProfileData>) => {
    const updated = { ...profile, ...newProfile };
    setProfile(updated);

    safeSetLocalStorage("architect_demo_profile", updated);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile_updated"));
    }

    // Call server API route
    const res = await fetch("/api/admin/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProfile),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to update profile");
    }

    const finalUpdated = {
      ...updated,
      avatar: data.avatar || updated.avatar,
      coverImage: data.coverImage || updated.coverImage,
    };
    setProfile(finalUpdated);
    safeSetLocalStorage("architect_demo_profile", finalUpdated);

    return data;
  };

  return { profile, loading, updateProfile, refreshProfile: loadProfile };
}
