// const webpackConfig = require('./webpack.config');

module.exports = function override(config) {
  // Agregar los externals de nuestro webpack.config.js
  // config.externals = {
  //   ...config.externals,
  //   ...webpackConfig.externals
  // };

  return config;
};
