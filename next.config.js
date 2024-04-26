/** @type {import('next').NextConfig} */
// const withWorkbox = require("next-with-workbox");
const nextConfig = {
  output: "export",
  // experimental: {
  // },
  // compiler: {
  //   styledComponents: true,
  // },
  images: {
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "**",
    //   },
    // ],
    unoptimized: true,
  },
  webpack: (config) => {
    // this will override the experiments
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.externals.push({
      sharp: "commonjs sharp",
      canvas: "commonjs canvas",
      re2: "commonjs re2",
    });
    // config.plugins.push(
    //   new webpack.ProvidePlugin({
    //     Buffer: ['buffer', 'Buffer'],
    //     process: 'process/browser',
    //   })
    // )
    // this will just update topLevelAwait property of config.experiments
    // config.experiments.topLevelAwait = true
    return config;
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Sec-Fetch-Site", value: "cross-site" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
      // {
      //   source: "/:path",
      //   headers: [
      //     { key: "Access-Control-Allow-Credentials", value: "true" },
      //     { key: "Access-Control-Allow-Origin", value: "*" },
      //     { key: "Sec-Fetch-Site", value: "cross-site" },
      //     {
      //       key: "Access-Control-Allow-Methods",
      //       value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      //     },
      //     {
      //       key: "Access-Control-Allow-Headers",
      //       value:
      //         "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
      //     },
      //   ],
      // },
    ];
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/watch?id=:id*", // Match /watch with any query parameter named "id" and capture its value
  //       destination: "/", // Rewrite to the root path
  //     },
  //   ];
  // },
};

// module.exports = withWorkbox({
//   ...nextConfig,
//   workbox: {
//     swSrc: 'public/service-worker.js',
//    // .
//    // ..
//    // ... any workbox-webpack-plugin.GenerateSW option
//   },
//   // .
//   // ..
//   // ... other Next.js config values
// });

module.exports = nextConfig;
