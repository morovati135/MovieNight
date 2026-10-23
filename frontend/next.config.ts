import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    // TMDB artwork paths never change their content, and a first fetch costs up to several seconds, so
    // optimised copies are kept for 30 days (the default is 4 hours) instead of being fetched again.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/backend/watchlist",
        destination: `${apiBaseUrl}/api/watchlist`,
      },
      {
        source: "/backend/watchlist/:movieId",
        destination: `${apiBaseUrl}/api/watchlist/:movieId`,
      },
    ];
  },
};

export default nextConfig;
