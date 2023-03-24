const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: {
        client: './public/js/client.js',
    },
    output: {
        path: path.resolve(__dirname, 'public/bundles/'),
        filename: '[name]_bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};