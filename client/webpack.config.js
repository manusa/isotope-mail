const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const SRC_DIR = __dirname + '/src';
const DIST_DIR = __dirname + '/dist';

module.exports = {
    entry: [
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
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: { minimize: true }
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
            template: SRC_DIR + "/index.html",
            filename: "./index.html"
        })
    ],
    devServer: {
        contentBase: DIST_DIR,
        hot: true,
        port: 9000
    }
};