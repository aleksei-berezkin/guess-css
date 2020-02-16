const baseConfig = require('./webpack.config.base');
const DefinePlugin = require('webpack').DefinePlugin;

module.exports = {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        new DefinePlugin({
            'global.API_BASE_URL': JSON.stringify('http://127.0.0.1:3001'),
        }),
    ],
    devtool: 'inline-source-map',
    devServer: {
        compress: false,
        port: 3000
    }
};
