const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const getLocalIdent = require('css-loader/lib/getLocalIdent');
const path = require('path');

const devMode = process.env.NODE_ENV !== 'production';
const SRC_DIR = __dirname + '/src';
const DIST_DIR = __dirname + '/dist';
const ASSETS_DIR = __dirname + '/assets';
const GLOBAL_STYLES = 'styles/main.scss';

/**
 * Return true if the CSS resource identified by this path should be component styled
 * (add hash to class names of resource)
 *
 * @param resourcePath path to the css resource
 * @returns {boolean} true if a hash should be appended to the class names of this resource
 */
function isComponentCss(resourcePath) {
  // All external libraries should have class names untouched
  if(resourcePath.indexOf('../node_modules/') === 0) {
    return false;
  }
  // Our main.scss file should remain untouched
  return resourcePath !== GLOBAL_STYLES;
}

module.exports = {
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    'abortcontroller-polyfill',
    SRC_DIR + '/polyfills/eventsource.js',
    SRC_DIR + '/polyfills/IDBIndex.js',
    SRC_DIR + '/index.jsx',
    'react-hot-loader/patch'
  ],
  output: {
    path: DIST_DIR,
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: { test: /[\\/]node_modules[\\/]/, name: "vendor", chunks: "all" }
      }
    }
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
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }
      },
      {
        test: /\.(scss|sass|css)$/,
        exclude: [
          /node_modules\/(?!@material\/).*/
        ],
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
                return !isComponentCss(resourcePath) ? exportName :
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
    }),
    new CopyWebpackPlugin([{
      from: ASSETS_DIR, fromArgs: {cache: false}, to: `assets`, force: true
    }], {
      copyUnmodified: true
    })
  ],
  devServer: {
    contentBase: DIST_DIR,
    historyApiFallback: true,
    hot: true,
    host: '0.0.0.0',
    port: 9000,
    proxy: {
      '/api': {
        target: 'http://localhost:9010',
        pathRewrite: {'^/api' : ''},
        xfwd: true,
        headers: {
          'X-Forwarded-Prefix': '/api'
        }
      }
    }
  }
};
