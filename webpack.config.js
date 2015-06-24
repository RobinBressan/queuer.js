module.exports = {
    entry: {
        queuer: './src/queuer.js',
    },
    resolve:{
        modulesDirectories: [
            'node_modules',
            'src'
        ]
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },
    output: {
        path: './dist',
        filename: '[name].js',
        library: 'queuer',
        libraryTarget: 'umd'
    }
}
