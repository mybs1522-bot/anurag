import { USER } from "@/data/user";

export const SITE_INFO = {
  name: USER.displayName,
  url: process.env.APP_URL || "http://localhost:3000",
  ogImage: USER.ogImage,
  description: USER.bio,
  keywords: USER.keywords,
};

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export const SOURCE_CODE_GITHUB_URL = "";

export const VIETNAM_HOLIDAYS = [
  "2026-01-26", // Republic Day
  "2026-08-15", // Independence Day
  "2026-10-02", // Gandhi Jayanti
  "2026-11-08", // Diwali
];
