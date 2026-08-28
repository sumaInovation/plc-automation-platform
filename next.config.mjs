/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  allowedDevOrigins: ['172.20.10.2'],
};

export default nextConfig;