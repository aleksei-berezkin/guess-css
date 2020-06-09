if (!['development', 'production'].includes(process.env.NODE_ENV)) {
    throw Error('Unknown NODE_ENV=' + process.env.NODE_ENV);
}

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ROOT_EL_ID, ROOT_EL_TEXT } = require('./src/shared/appWideConst');

module.exports = {
    mode: process.env.NODE_ENV,
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
    entry: [
        './src/client/index.tsx',
    ],
    plugins: [
        new HtmlWebpackPlugin({
            title: 'CSS Puzzler',
            template: './template.ejs',
            rootElementId: ROOT_EL_ID,
            initText: ROOT_EL_TEXT,
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
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
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                ],
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
