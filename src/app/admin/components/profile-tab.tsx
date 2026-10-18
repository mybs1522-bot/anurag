"use client";

import {
  Camera,
  Check,
  Eye,
  ImageIcon,
  Mail,
  MoveVertical,
  Phone,
  RefreshCw,
  Sliders,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/use-profile";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop";

export function ProfileTab() {
  const { profile, updateProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const [coverUrl, setCoverUrl] = useState(profile.coverImage || DEFAULT_COVER);
  const [coverPosition, setCoverPosition] = useState(profile.coverPosition || "50%");
  const [flipSentencesText, setFlipSentencesText] = useState(
    (profile.flipSentences || [
      "Luxury Residential Architect",
      "Turnkey Interior Designer",
      "Sustainable Space Planner",
      "ArchBIZ & BOQ Consultant",
    ]).join("\n")
  );
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [about, setAbout] = useState(profile.about);
  const [googleCalendarId, setGoogleCalendarId] = useState(profile.googleCalendarId || "");

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Sync state if profile changes
  React.useEffect(() => {
    setDisplayName(profile.displayName);
    setJobTitle(profile.jobTitle);
    setBio(profile.bio);
    setAvatarUrl(profile.avatar);
    setCoverUrl(profile.coverImage || DEFAULT_COVER);
    setCoverPosition(profile.coverPosition || "50%");
    if (profile.flipSentences && profile.flipSentences.length > 0) {
      setFlipSentencesText(profile.flipSentences.join("\n"));
    }
    setEmail(profile.email);
    setPhone(profile.phone);
    setAbout(profile.about);
    setGoogleCalendarId(profile.googleCalendarId || "");
  }, [profile]);

  // Upload Profile Avatar
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploadingPhoto(true);
    const toastId = toast.loading("Uploading photo to cloud storage...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      setAvatarUrl(data.url);
      toast.success("Photo uploaded to cloud! Click 'Save Profile' to apply changes.", { id: toastId });
    } catch (err: any) {
      console.error("Direct upload error:", err);
      toast.error(err.message || "Failed to upload photo", { id: toastId });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResetAvatar = () => {
    setAvatarUrl("/images/avatar.jpg");
    toast.info("Reset to default profile photo. Click 'Save Profile' to apply.");
  };

  // Upload Cover Banner
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be under 15MB");
      return;
    }

    setUploadingCover(true);
    const toastId = toast.loading("Uploading cover banner to cloud...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      setCoverUrl(data.url);
      toast.success("Cover banner uploaded! Adjust framing below and click 'Save Profile'.", { id: toastId });
    } catch (err: any) {
      console.error("Cover upload error:", err);
      toast.error(err.message || "Failed to upload cover banner", { id: toastId });
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = "";
      }
    }
  };

  const handleResetCover = () => {
    setCoverUrl(DEFAULT_COVER);
    setCoverPosition("50%");
    toast.info("Reset to default architectural cover banner. Click 'Save Profile' to apply.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const parsedSentences = flipSentencesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await updateProfile({
        displayName,
        jobTitle,
        bio,
        avatar: avatarUrl,
        coverImage: coverUrl,
        coverPosition,
        flipSentences: parsedSentences,
        email,
        phone,
        about,
        googleCalendarId,
      });

      if (res?.avatar) {
        setAvatarUrl(res.avatar);
      }
      if (res?.coverImage) {
        setCoverUrl(res.coverImage);
      }

      toast.success("Profile & images updated successfully! Live website refreshed.");
    } catch (err: any) {
      console.error("Save profile error:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Architect Profile &amp; Branding</h2>
        <p className="text-sm text-muted-foreground">
          Manage your website cover banner, profile picture, display name, public bio, and details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* =================================================================== */}
        {/* 1. Website Header Cover Banner Card */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                Website Header Cover Banner
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                The wide horizontal banner displayed across the very top of your official website.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/60 self-start sm:self-auto">
              Aspect Ratio ~4:1
            </span>
          </div>

          {/* Recommended Dimensions Banner */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-foreground">📐 Recommended Size:</span>{" "}
              <span className="font-semibold text-primary">1920 × 500 px</span>{" "}
              <span className="text-muted-foreground">(or 1200 × 320 px)</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Aspect ratio ~4:1 • Formats: PNG, JPG, or WEBP (max 15MB).
              </p>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground bg-background/80 px-2.5 py-1 rounded border border-border/60 shrink-0">
              High Resolution
            </span>
          </div>

          {/* Interactive Live Banner Frame Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5 text-primary" />
                Live Banner Frame Preview
              </span>
              <span className="text-[11px] text-muted-foreground">
                Matches exact website display ratio (23.13%)
              </span>
            </div>

            <div className="relative w-full rounded-xl overflow-hidden border-2 border-border shadow-sm bg-muted/60 group">
              <div style={{ position: "relative", paddingTop: "23.13%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt="Cover Banner Preview"
                  className="absolute inset-0 size-full object-cover transition-all duration-200"
                  style={{
                    objectPosition: coverPosition.includes("%") ? `center ${coverPosition}` : coverPosition,
                  }}
                />
              </div>

              <div className="absolute top-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow">
                <Eye className="size-3 text-primary" />
                Live Frame Preview
              </div>
            </div>
          </div>

          {/* Framing Adjustment Tool (If user uploads bigger or taller image) */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="cover-position-slider" className="text-xs font-semibold flex items-center gap-1.5">
                <MoveVertical className="size-3.5 text-primary" />
                Adjust Image in Frame (Vertical Position)
              </Label>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {coverPosition}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-semibold shrink-0">Top (0%)</span>
              <input
                id="cover-position-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={parseInt(coverPosition) || 50}
                onChange={(e) => setCoverPosition(`${e.target.value}%`)}
                className="w-full accent-primary cursor-pointer h-2 bg-background rounded-lg border border-border"
              />
              <span className="text-[11px] text-muted-foreground font-semibold shrink-0">Bottom (100%)</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground">
                💡 <span className="font-semibold text-foreground">Uploaded a larger or taller image?</span> Drag the slider to choose which portion shows in the banner.
              </p>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverPosition("0%")}
                  className={`h-6 text-[10px] px-2.5 ${coverPosition === "0%" ? "border-primary text-primary" : ""}`}
                >
                  Top
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverPosition("50%")}
                  className={`h-6 text-[10px] px-2.5 ${coverPosition === "50%" ? "border-primary text-primary" : ""}`}
                >
                  Center
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverPosition("100%")}
                  className={`h-6 text-[10px] px-2.5 ${coverPosition === "100%" ? "border-primary text-primary" : ""}`}
                >
                  Bottom
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Banner Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingCover}
                onClick={() => coverFileInputRef.current?.click()}
                className="gap-2 cursor-pointer shadow-xs"
              >
                {uploadingCover ? (
                  <RefreshCw className="size-4 animate-spin text-primary" />
                ) : (
                  <Upload className="size-4 text-primary" />
                )}
                {uploadingCover ? "Uploading Cover..." : "Upload Cover Image"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetCover}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="size-3.5" />
                Reset Default Banner
              </Button>
            </div>

            <div className="flex-1 max-w-sm space-y-1">
              <Input
                type="url"
                placeholder="Or paste banner image URL..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="text-xs h-8 font-mono"
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. Profile Picture Card */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Camera className="size-4 text-primary" />
            Profile Picture
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative group size-32 sm:size-36 rounded-full overflow-hidden border-2 border-border shadow-md bg-muted shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl || "/images/avatar.jpg"}
                alt="Profile Avatar Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
              >
                <Upload className="size-5 mb-1" />
                <span className="text-xs font-medium">Upload</span>
              </button>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <p className="text-sm font-medium">Upload a new photo</p>
                <p className="text-xs text-muted-foreground">
                  Recommended size: square 400x400px (JPG, PNG or WEBP, max 10MB).
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 cursor-pointer"
                >
                  {uploadingPhoto ? (
                    <RefreshCw className="size-4 animate-spin text-primary" />
                  ) : (
                    <Upload className="size-4 text-primary" />
                  )}
                  {uploadingPhoto ? "Uploading..." : "Upload from Device"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAvatar}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="size-3.5" />
                  Reset Default
                </Button>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="avatar-url" className="text-xs">
                  Or enter Image URL directly:
                </Label>
                <Input
                  id="avatar-url"
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. General Information Card */}
        {/* =================================================================== */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <User className="size-4 text-primary" />
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Ar. Aryan Mehta"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title / Designation</Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Founder & Principal Architect"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Tagline / Specialization</Label>
            <Input
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Luxury Residential Architect & Turnkey Interior Designer"
              required
            />
          </div>

          {/* Rotating Animated Titles (Flip Sentences) */}
          <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <Label htmlFor="flip-sentences" className="flex items-center gap-1.5 font-semibold text-foreground">
                <Sparkles className="size-4 text-amber-500 animate-pulse" />
                Rotating Header Titles (Animated Text)
              </Label>
              <span className="text-[11px] text-muted-foreground font-medium">
                Enter each title on a new line
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              These titles flip and rotate continuously under your name in the website header. Put each designation or specialization on a separate line.
            </p>

            <Textarea
              id="flip-sentences"
              rows={4}
              value={flipSentencesText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFlipSentencesText(e.target.value)}
              placeholder={`Luxury Residential Architect\nTurnkey Interior Designer\nSustainable Space Planner\nArchBIZ & BOQ Consultant`}
              className="font-mono text-xs sm:text-sm bg-background leading-relaxed"
            />

            {/* Live Preview Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="size-3 text-primary" />
                Live Preview of Rotating Titles ({flipSentencesText.split("\n").filter((s) => s.trim()).length}):
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {flipSentencesText
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((sentence, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-xs"
                    >
                      <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      {sentence}
                    </span>
                  ))}
                {flipSentencesText.split("\n").filter((s) => s.trim()).length === 0 && (
                  <span className="text-xs italic text-muted-foreground">
                    No rotating titles added. Type at least one title above.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                Contact Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. contact@studiomehta.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground" />
                Contact Phone
              </Label>
              <Input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98201 12233"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">About / Studio Introduction</Label>
            <Textarea
              id="about"
              rows={4}
              value={about}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAbout(e.target.value)}
              placeholder="Write a brief overview of your design philosophy, achievements, and services..."
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Supports markdown formatting (*bold*, lists, etc.)
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving || uploadingPhoto || uploadingCover} className="gap-2 px-8 shadow-md">
            {saving ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Save Profile &amp; Photo
          </Button>
        </div>
      </form>
    </div>
  );
}
