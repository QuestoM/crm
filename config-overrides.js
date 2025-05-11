const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "fs": false,
    "os": false,
    "crypto": false,
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "util": require.resolve("util/"),
    "assert": require.resolve("assert/"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "url": require.resolve("url/"),
    "zlib": require.resolve("browserify-zlib"),
    "querystring": require.resolve("querystring-es3"),
    "net": false,
    "tls": false,
    "child_process": false
  };

  // Add buffer polyfill
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  // Return the modified config
  return config;
}; 