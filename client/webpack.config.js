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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Shared Functions
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Shared Loaders
const CSS_LOADER = {
  loader: 'css-loader',
  options: {
    modules: true,
    sourceMap: devMode,
    camelCase: true,
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
};

const SASS_LOADER = {
  loader: 'sass-loader',
  options: {
    includePaths: ['./node_modules']
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Module definition
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
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    globalObject: `(typeof self !== 'undefined' ? self : this)` // Fix for worker-loader + HotModuleReplacement
  },
  // Split vendor dependencies into specific file (except dynamic imports, chunk name specified at import annotation)
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: chunk => chunk.name === 'main' // Unless specified in annotation, import will be named 'main'
        }
      }
    }
  },
  module: {
    rules: [
      // Support for NON-inlined web-workers (NOT necessary now)
      // {
      //   test: /\.worker\.js$/,
      //   exclude: /node_modules/,
      //   use: [
      //     { loader: 'worker-loader' },
      //     { loader: 'babel-loader' }
      //   ]
      // },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {loader: 'babel-loader'},
          {loader: 'eslint-loader'}
        ]
      },
      {
        test: /\.(scss|sass|css)$/,
        oneOf: [
          {
            // CSS Style processing for project files
            exclude: /node_modules/,
            loaders: [MiniCssExtractPlugin.loader, CSS_LOADER, SASS_LOADER]
          },
          {
            // CSS Style processing for external files
            // Don't Minify node_module dependencies
            // Using style-loader to embed within js, The main reason is that draft-js css has some syntax errors
            // and both MiniCssExtractPlugin and extract-loader have trouble parsing the file
            test: /node_modules/,
            loaders: ['style-loader', CSS_LOADER]
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
    new CopyWebpackPlugin([
      {from: ASSETS_DIR, fromArgs: {cache: false}, to: `assets`, force: true},
      {from: `${SRC_DIR}/favicon.ico`, to: '', force: true}
    ], {
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
