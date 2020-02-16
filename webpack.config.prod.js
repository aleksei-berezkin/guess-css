const baseConfig = require('./webpack.config.base');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        new CleanWebpackPlugin(),
        new DefinePlugin({
            'global.API_BASE_URL': JSON.stringify(''),
        }),
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
