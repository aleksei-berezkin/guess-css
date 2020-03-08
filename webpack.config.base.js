if (!['development', 'production'].includes(process.env.NODE_ENV)) {
    throw Error('Unknown NODE_ENV=' + process.env.NODE_ENV);
}

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ROOT_EL_ID, ROOT_EL_TEXT } = require('./src/shared/template');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: './src/client/index.tsx',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'CSS Puzzler',
            inject: false,
            template: require('html-webpack-template'),
            appMountId: ROOT_EL_ID,
            appMountHtmlSnippet: ROOT_EL_TEXT,
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],
    output: {
        filename: '[name].[contenthash].js',
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
};
