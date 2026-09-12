import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isHttpsDeployment = isProduction && process.env.NEXT_PUBLIC_SITE_URL?.trim().startsWith("https://");
const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/photo-1588168333986-5078d3ae3976",
    search: "?q=80&w=2070",
  },
];

try {
  const supabaseUrl = new URL(process.env.SUPABASE_URL ?? "");
  if (supabaseUrl.protocol === "https:" && supabaseUrl.hostname.endsWith(".supabase.co")) {
    remotePatterns.push({
      protocol: "https",
      hostname: supabaseUrl.hostname,
      pathname: "/storage/v1/object/public/**",
    });
  }
} catch {
  // A missing or invalid URL is handled by the server-side environment validation.
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self' data:",
  `style-src 'self' 'unsafe-inline'`,
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isHttpsDeployment ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 80],
    remotePatterns,
  },
  async headers() {
    const headers = [
      { key: "Content-Security-Policy", value: contentSecurityPolicy },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];
    if (isHttpsDeployment) headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
