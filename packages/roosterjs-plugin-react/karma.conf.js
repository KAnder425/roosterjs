const path = require('path');
module.exports = function(config) {
    config.set({
        basePath: '.',
        plugins: [
            'karma-webpack',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-sourcemap-loader',
        ],
        browsers: ['Chrome'],
        files: ['karma.tests.js'],
        frameworks: ['jasmine'],
        preprocessors: {
            'karma.tests.js': ['webpack', 'sourcemap'],
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,

        // to avoid DISCONNECTED messages
        browserDisconnectTimeout: 10000, // default 2000
        browserDisconnectTolerance: 1, // default 0
        browserNoActivityTimeout: 60000, //default 10000

        singleRun: true,
        captureTimeout: 60000,

        webpack: {
            devtool: 'inline-source-map',
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /tsx?$/,
                        loader: 'ts-loader',
                        options: {
                            allowTsInNodeModules: true,
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.js', '.tsx', '.ts'],
                // prefer local implementations over from node_modules
                modules: [path.join(__dirname, '..'), 'node_modules'],
            },
        },

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
    });
};