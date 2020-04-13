const baseConfig = require('./webpack.config.base');

module.exports = {
    ...baseConfig,
    devtool: 'inline-source-map',
};
