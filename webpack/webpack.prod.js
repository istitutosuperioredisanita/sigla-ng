const webpack = require('webpack');
const writeFilePlugin = require('write-file-webpack-plugin');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const sass = require('sass');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'development';

module.exports = (options) => webpackMerge(commonConfig({ env: ENV }), {
    entry: {
        polyfills: './src/main/webapp/app/polyfills',
        global: './src/main/webapp/content/scss/vendor.scss',
        main: './src/main/webapp/app/app.main'
    },
    output: {
        path: utils.root('target/www'),
        filename: 'app/[name].bundle.js',
        chunkFilename: 'app/[id].chunk.js'
    },
    module: {
        rules: [{
            test: /\.ts$/,
            enforce: 'pre',
            loader: 'tslint-loader',
            exclude: ['/node_modules', new RegExp('reflect-metadata\\' + path.sep + 'Reflect\\.ts')]
        },
        {
            test: /\.ts$/,
            use: [
                'angular2-template-loader',
                {
                    loader: 'cache-loader',
                    options: {
                      cacheDirectory: path.resolve('target/cache-loader')
                    }
                },
                {
                    loader: 'thread-loader',
                    options: {
                        // there should be 1 cpu for the fork-ts-checker-webpack-plugin
                        workers: require('os').cpus().length - 1
                    }
                },
                {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        happyPackMode: true
                    }
                },
                'angular-router-loader'
            ],
            exclude: ['/node_modules']
        },
        {
            test: /\.scss$/,
            use: ['to-string-loader', 'css-loader', {
                loader: 'sass-loader',
                options: { implementation: sass }
            }],
            exclude: /(vendor\.scss|global\.scss)/
        },
        {
            test: /(vendor\.scss|global\.scss)/,
            use: ['style-loader', 'css-loader', 'postcss-loader', {
                loader: 'sass-loader',
                options: { implementation: sass }
            }]
        },
        {
            test: /\.css$/,
            use: ['to-string-loader', 'css-loader'],
            exclude: /(vendor\.css|global\.css)/
        },
        {
            test: /(vendor\.css|global\.css)/,
            use: ['style-loader', 'css-loader']
        }]
    },
    optimization: {
        runtimeChunk: false,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                parallel: true,
                cache: true,
                terserOptions: {
                    ie8: false,
                    // sourceMap: true, // Enable source maps. Please note that this will slow down the build
                    compress: {
                        dead_code: true,
                        warnings: false,
                        properties: true,
                        drop_debugger: true,
                        conditionals: true,
                        booleans: true,
                        loops: true,
                        unused: true,
                        toplevel: true,
                        if_return: true,
                        inline: true,
                        join_vars: true
                    },
                    output: {
                        comments: false,
                        beautify: false,
                        indent_level: 2
                    }
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    stats: process.env.JHI_DISABLE_WEBPACK_LOGS ? 'none' : options.stats,
    plugins: [
        process.env.JHI_DISABLE_WEBPACK_LOGS
            ? null
            : new SimpleProgressWebpackPlugin({
                format: options.stats === 'minimal' ? 'compact' : 'expanded'
              }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].css'
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new WorkboxPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
        }),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)/,
            path.resolve(__dirname, './src/main/webapp')
        ),
        //new writeFilePlugin(),
        new webpack.WatchIgnorePlugin({paths:[
            utils.root('src/test'),
        ]}),
        new WebpackNotifierPlugin({
            title: 'JHipster',
            contentImage: path.join(__dirname, 'logo-jhipster.png')
        })
    ].filter(Boolean),
    mode: 'production'
});
