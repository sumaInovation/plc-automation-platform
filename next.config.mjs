/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true, // ✅ React compiler enable
  allowedDevOrigins: ['172.20.10.2'],

  // ===== IMAGES CONFIGURATION - Add this =====
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all HTTPS images
      },
      {
        protocol: 'http',
        hostname: '**', // Allows all HTTP images
      },
    ],
    // OR specify exact domains:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'your-domain.com',
    //   },
    //   {
    //     protocol: 'https',
    //     hostname: 'cdn.example.com',
    //   },
    // ],
  },
};

export default nextConfig;