const path = require('path');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'simple-json-viewer.min.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['stage-2']
        }
      }
    ]
  },
  plugins: [
    new MinifyPlugin()
  ],
  stats: {
    colors: true
  }
};
