const baseConfig = require('./webpackConfBase');

module.exports = {
    ...baseConfig,
    devtool: 'inline-source-map',
};
