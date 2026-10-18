import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["next-mdx-remote"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Prevents MIME type sniffing, reducing the risk of malicious file uploads
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Protects against clickjacking attacks by preventing your site from being embedded in iframes.
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Controls how much referrer information is included with requests, balancing security and functionality.
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "iiclvqdzanvphoykyicj.supabase.co",
      },
      {
        protocol: "https",
        hostname: "vgejrwpluijlhfvlmrhs.supabase.co",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
