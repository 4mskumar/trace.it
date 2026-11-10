import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // For GitHub OAuth avatars
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google OAuth avatars
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // For Discord OAuth avatars (if you use it)
      },
      {
        protocol: 'https',
        hostname: 'github.com', // For Discord OAuth avatars (if you use it)
      },
    ],
  },
}

export default nextConfig;
