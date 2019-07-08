'use strict';
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './script/main.ts',
    watch: true,
    output: {
        filename: 'releaseAssets.js',
        path: path.normalize(
            'D:\\zsytssk\\job\\legend\\legend_demo\\script\\releaseAssets',
        ),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },

    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.(.js|ts)?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
                exclude: path.resolve(__dirname, 'node_modules'),
            },
        ],
    },
    target: 'node',
    node: {
        __dirname: true,
    },
};
