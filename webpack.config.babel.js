import BabiliPlugin from 'babili-webpack-plugin';
import path from 'path';

module.exports = {
  entry: {
    inject: './src/inject.js',
    index: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/,
        ],
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new BabiliPlugin(),
  ],
  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: ['.js', '.json'],
  },
  devtool: (process.env.NODE_ENV === 'production') ? false : 'source-map',
};
