import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Required when using query strings on local `next/image` src (e.g. ?v= cache bust).
    // Omit `search` so paths with or without `?v=` are allowed.
    localPatterns: [
      {
        pathname: "/images/zodiac/**",
      },
    ],
  },
};

export default nextConfig;
