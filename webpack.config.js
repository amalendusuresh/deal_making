const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  entry: './src/app.jsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  externals: [nodeExternals()],
  plugins: [
    // Ignore the child_process module in the frontend environment
    new webpack.IgnorePlugin({
      resourceRegExp: /^child_process$/,
      contextRegExp: /\/src\//,
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
    global: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/')
    }
  }
};
