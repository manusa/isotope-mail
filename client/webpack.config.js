const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const getLocalIdent = require('css-loader/lib/getLocalIdent');
const path = require('path');

const devMode = process.env.NODE_ENV !== 'production';
const SRC_DIR = __dirname + '/src';
const DIST_DIR = __dirname + '/dist';
const GLOBAL_STYLES = 'styles/main.scss';

module.exports = {
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    SRC_DIR + '/index.jsx',
    'react-hot-loader/patch'
  ],
  output: {
    path: DIST_DIR,
    publicPath: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-object-rest-spread']
          }
        }
      },
      {
        test: /\.(scss|sass|css)$/,
        exclude: /node_modules\/(?!@material\/).*/,
        loaders: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[local]___[hash:base64:5]',
              /**
               * Custom function to replace the CSS class name only if it's not part of
               * the global application styles
               *
               * @param loaderContext
               * @param localIdentName
               * @param exportName
               * @param options
               * @returns {*}
               */
              getLocalIdent: (loaderContext, localIdentName, exportName, options) => {
                const resourcePath = path.relative(SRC_DIR, loaderContext.resourcePath).replace(/\\/g, '/');
                return resourcePath === GLOBAL_STYLES ?
                  exportName :
                  getLocalIdent(loaderContext, localIdentName, exportName, options);
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./node_modules']
            }
          }
        ]
      },
      {
        test: /\.(html)$/,
        exclude: /node_modules/,
        use: {
          loader: 'html-loader',
          options: {minimize: true}
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: SRC_DIR + '/index.html',
      filename: './index.html'
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    })
  ],
  devServer: {
    contentBase: DIST_DIR,
    historyApiFallback: true,
    hot: true,
    port: 9000
  }
};
