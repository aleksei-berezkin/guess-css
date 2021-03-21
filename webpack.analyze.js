const prodConfig = require('./webpack.config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    ...prodConfig,
    plugins: [
        ...prodConfig.plugins,
        new BundleAnalyzerPlugin({
            defaultSizes: 'parsed',
        }),
    ],
};
