const config = require('./webpack.config')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
    ...config,
    plugins: [
        ...config.plugins,
        new BundleAnalyzerPlugin({
            defaultSizes: 'parsed',
        }),
    ],
}
