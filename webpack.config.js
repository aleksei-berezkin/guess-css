if (!['development', 'production'].includes(process.env.NODE_ENV)) {
    throw Error('Unknown NODE_ENV=' + process.env.NODE_ENV);
}

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
    entry: [
        './src/index.tsx',
    ],
    plugins: [
        new HtmlWebpackPlugin({
            template: './template.ejs',
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
    optimization: {
        splitChunks: {
            cacheGroups: {
                async: {
                    chunks: 'async',
                    filename: 'async-[name]-[contenthash].js',
                    priority: 0,
                    minSize: 1000,
                },
                vendors: {
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    filename: '[name]-[contenthash].js',
                    priority: -1,
                },
                default: {
                    chunks: 'all',
                    name: 'main',
                    filename: '[name]-[contenthash].js',
                    priority: -2,
                },
            },
        },
    },
};
