/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // The listing form accepts images up to 8 MB plus multipart overhead.
      bodySizeLimit: "9mb",
    },
  },
};

export default nextConfig;
