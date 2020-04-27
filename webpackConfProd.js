const baseConfig = require('./webpackConfBase');
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
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            automaticNameDelimiter: '.',
        }
    },
};
