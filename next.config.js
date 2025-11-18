/** @type {import('next').NextConfig} */
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
      {
        source: "/login",
        destination: "/buyer/auth/login",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/buyer/auth/register",
        permanent: true,
      },
      {
        source: "/",
        destination: "/products", // your new home page path
        permanent: true,
      },
      {
        source: "/register",
        destination: "/buyer/auth/register",
        permanent: true,
      },
    ];
  },
  compiler: {
    removeConsole: false,
  },
  experimental: {
    optimizeCss: true,
  },
  eslint: {
    // Allow builds to succeed even if ESLint errors exist
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
