if (!['development', 'production'].includes(process.env.NODE_ENV)) {
    throw Error('Unknown NODE_ENV=' + process.env.NODE_ENV);
}

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    entry: './srcClient/index.ts',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'CSS Puzzler',
            inject: false,
            template: require('html-webpack-template'),
            appMountId: 'app-root-div',
            appMountHtmlSnippet: 'Initializing...',
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
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            },
        ],
    },
};
