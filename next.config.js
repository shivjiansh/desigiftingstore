/** @type {import('next').NextConfig} */
import { withAxiom } from "next-axiom";
import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // optional PWA disable in dev
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "firebasestorage.googleapis.com",
      "images.unsplash.com",
      "via.placeholder.com",
    ],
    minimumCacheTTL: 2592000,
    unoptimized: false,
  },
  env: {
    CUSTOM_KEY: "desigifting-production",
  },
  async redirects() {
    return [
      { source: "/login", destination: "/buyer/auth/login", permanent: true },
      {
        source: "/register",
        destination: "/buyer/auth/register",
        permanent: true,
      },
      { source: "/", destination: "/products", permanent: true },
    ];
  },
  compiler: { removeConsole: false },
  experimental: { optimizeCss: true },
  eslint: { ignoreDuringBuilds: true },
};

let configWithPWA = withPWA(nextConfig);
let finalConfig = configWithPWA;

if (process.env.NODE_ENV === "production") {
  finalConfig = withAxiom(configWithPWA);
}

export default finalConfig;
