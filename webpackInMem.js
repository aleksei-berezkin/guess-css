const baseConfig = require('./webpackBase');
const { HotModuleReplacementPlugin } = require('webpack');

module.exports = {
    ...baseConfig,
    entry: [
        ...baseConfig.entry,
        'webpack-hot-middleware/client?reload=true',
    ],
    plugins: [
        ...baseConfig.plugins,
        new HotModuleReplacementPlugin(),
    ],
};
