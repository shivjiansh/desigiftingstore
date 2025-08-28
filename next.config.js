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
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
