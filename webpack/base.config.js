const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');
const writeStats = require('./utils/write-stats');
const webpackISOTools = require('./webpack-isotools-config');

const webpack_isomorphic_tools_plugin = new Webpack_isomorphic_tools_plugin(
    webpackISOTools
).development();
const postcss_loader = {
    loader: 'postcss-loader',
    options: {
        postcssOptions: {
            plugins: ['postcss-preset-env']
        }
    }
};

const css_loaders = [
    MiniCssExtractPlugin.loader,
    {
        loader: 'css-loader',
        options: {
            importLoaders: 1
        }
    },
    postcss_loader
];

const scss_loaders = [
    MiniCssExtractPlugin.loader,
    {
        loader: 'css-loader',
        options: {
            importLoaders: 1
        }
    },
    postcss_loader,
    {
        loader: 'sass-loader'
    }
];

module.exports = {
    entry: {
        app: ['core-js/stable', './src/app/Main.js'],
        vendor: [
            // 'react',
            'react-dom',
            'react-router',
            '@blurtfoundation/blurtjs',
            'bytebuffer',
            'immutable',
            'autolinker',
            'pako',
            'remarkable',
            'picturefill'
        ]
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
        publicPath: '/assets/'
    },
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|woff|woff2|eot|ttf)/,
                use: 'url-loader?limit=4096'
            },
            {
                test: /\.js$|\.jsx$/,
                exclude: [/node_modules/, /\*\/app\/assets\/static\/\*\.js/],
                use: 'babel-loader'
            },
            { test: /\.svg$/, use: 'svg-inline-loader' },
            {
                test: require.resolve('blueimp-file-upload'),
                use: 'imports?define=>false'
            },
            {
                test: /\.css$/,
                use: css_loaders
            },
            {
                test: /\.scss$/,
                use: scss_loaders
            },
            {
                test: /\.md/,
                use: [
                    {
                        loader: 'raw-loader',
                        options: {
                            esModule: false
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'disabled',
            generateStatsFile: true,
            statsOptions: { source: false }
        }),
        function () {
            this.plugin('done', writeStats);
        },
        webpack_isomorphic_tools_plugin,
        new MiniCssExtractPlugin(),
        new webpack.ProvidePlugin({
            react: 'React'
        })
    ],
    resolve: {
        alias: {
            react: path.join(__dirname, '../node_modules', 'react'),
            assets: path.join(__dirname, '../src/app/assets')
        },
        extensions: ['.js', '.json', '.jsx'],
        modules: [path.resolve(__dirname, '../src'), 'node_modules']
    },
    externals: {}
};
