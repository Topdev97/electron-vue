'use strict'

const path = require('path')
const merge = require('webpack-merge')
const webpack = require('webpack')

const baseConfig = require('../../webpack.config')
const projectRoot = path.resolve(__dirname, '../../app')

let webpackConfig = merge(baseConfig, {
  devtool: '#inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"testing"'
    })
  ]
})

// don't treat dependencies as externals
delete webpackConfig.entry
delete webpackConfig.externals
delete webpackConfig.output.libraryTarget

// make sure isparta loader is applied before eslint
webpackConfig.module.rules.unshift({
  test: /\.js$/,
  loader: 'isparta-loader',
  enforce: 'pre',
  include: path.resolve(projectRoot, 'src')
})

// only apply babel for test files when using isparta
webpackConfig.module.rules.some(loader => {
  if (loader.loader === 'babel-loader') {
    loader.include = path.resolve(projectRoot, '../test/unit')
    return true
  }
})

// apply vue option to apply isparta-loader on js
webpackConfig.module.rules
  .find(({ loader }) => loader === 'vue-loader').options.loaders.js = 'isparta-loader'

module.exports = config => {
  config.set({
    browsers: ['visibleElectron'],
    client: {
      useIframe: false
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    },
    customLaunchers: {
      'visibleElectron': {
        base: 'Electron',
        flags: ['--show']
      }
    },
    frameworks: ['mocha', 'chai'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    reporters: ['spec', 'coverage'],
    singleRun: true,
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  })
}
