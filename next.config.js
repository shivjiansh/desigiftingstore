/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "res.cloudinary.com",
      "firebasestorage.googleapis.com",
      "images.unsplash.com",
      "via.placeholder.com",
    ],
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
    ];
  },
  images: {
    domains: [
      "lh3.googleusercontent.com", // for Google profile images
      "res.cloudinary.com", // for your Cloudinary uploads
    ],
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
