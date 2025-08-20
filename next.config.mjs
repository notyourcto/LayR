/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'images.unsplash.com',
            },
            
          ],
    },

    experimental: {
      // allow server RSC to load native packages
      serverComponentsExternalPackages: [
        'onnxruntime-node',
        '@imgly/background-removal-node',
      ],
    },

    webpack: (config, { isServer }) => {
      if (!isServer) {
        // don't try to bundle native node binaries into the client
        config.externals = config.externals || []
        config.externals.push('onnxruntime-node', '@imgly/background-removal-node')
      }
      return config
    },

    async headers() {
      return [
        {
          source: "/app/:path*", 
          headers: [
            { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
            { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          ],
        },
      ];
    },
};

export default nextConfig;
