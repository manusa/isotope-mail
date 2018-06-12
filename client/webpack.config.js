const Webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const DIST_DIR = __dirname + '/dist';

module.exports = {
    entry: [
        __dirname + '/src/index.jsx',
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
                    loader: 'html-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    plugins: [
        new Webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        })
    ],
    devServer: {
        contentBase: DIST_DIR,
        hot: true,
        port: 9000
    }
};