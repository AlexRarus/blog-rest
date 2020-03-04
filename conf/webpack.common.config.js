import Config from 'webpack-config';
import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import fs from 'fs';

import pathApp from './pathApp';

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(x => (['.bin'].indexOf(x) === -1))
  .forEach((mod) => { nodeModules[mod] = `commonjs ${mod}`; });


export default new Config().merge({
  entry: 'src/index.js',
  output: {
    path: path.resolve(process.cwd(), 'public'),
    publicPath: '/'
  },

  resolve: {
    extensions: ['.js', '.json'],
    modules: ['node_modules', 'src'].map(p => path.resolve(p)),
    alias: pathApp.alias
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      }
    ]
  },

  target: 'node',
  node: {
    __filename: true,
    __dirname: true
  },
  externals: nodeModules,

  plugins: [
    new CleanWebpackPlugin()
  ]
});
