const baseConfig = require('./webpackBase');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        new CleanWebpackPlugin(),
    ],
    output: {
        ...baseConfig.output,
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
    },
};
