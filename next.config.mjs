const nextConfig = {
  experimental: {
    forceSwcTransforms: true
  },
  swcMinify: true,
  compiler: {
    // This will use SWC for compilation
    styledComponents: true
  },
  // This ensures Babel is still used for certain operations
  webpack: (config, { isServer, dev }) => {
    // Your custom webpack config here, if needed
    return config
  }
}

export default nextConfig
