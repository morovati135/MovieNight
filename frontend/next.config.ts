import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
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
