import Config from 'webpack-config';

export default new Config().extend('conf/webpack.common.config.js').merge({
  output: {
    filename: 'index.js'
  },
  mode: 'development',
});
