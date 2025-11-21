/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    // Ignore React Native-only modules required by the MetaMask SDK
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "@react-native-async-storage/async-storage": false,
        "react-native": false,
      };

      // Ensure RelayerSDK can access a global object in the browser
      config.plugins.push(
        new webpack.DefinePlugin({
          global: "globalThis",
        })
      );
    }

    // Silence noisy warnings from known dependencies
    config.ignoreWarnings = [
      { module: /@metamask\/sdk/ },
      { module: /@zama-fhe\/relayer-sdk/ },
    ];

    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

