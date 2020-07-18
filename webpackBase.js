if (!['development', 'production'].includes(process.env.NODE_ENV)) {
    throw Error('Unknown NODE_ENV=' + process.env.NODE_ENV);
}

const HtmlWebpackPlugin = require('html-webpack-plugin');
const templateConst = require('./templateConst');

module.exports = {
    mode: process.env.NODE_ENV,
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
    entry: [
        './src/client/index.tsx',
    ],
    plugins: [
        new HtmlWebpackPlugin({
            template: './template.ejs',
            ...templateConst,
        }),
    ],
    output: {
        publicPath: '',
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                resolve: {
                    extensions: ['.ts', '.tsx', '.js', '.json']
                },
                use: 'ts-loader',
            },
        ],
    },
    optimization: process.env.NODE_ENV === 'development' ? {} : {
        splitChunks: {
            chunks: 'all',
            automaticNameDelimiter: '.',
        }
    },
};
