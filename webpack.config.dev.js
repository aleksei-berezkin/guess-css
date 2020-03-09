const baseConfig = require('./webpack.config.base');
const DefinePlugin = require('webpack').DefinePlugin;
const { API_DEV_PORT } = require('./src/server/ports.config');

module.exports = {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        new DefinePlugin({
            'global.API_BASE_URL': JSON.stringify(`http://127.0.0.1:${ API_DEV_PORT }`),
        }),
    ],
    devtool: 'inline-source-map',
};
