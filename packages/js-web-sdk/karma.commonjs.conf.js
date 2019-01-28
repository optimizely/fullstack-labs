const baseConfig = require('./karma.base.conf')

module.exports = config => {
  config.set({
    ...baseConfig,

    preprocessors: {
      'dist/*.js': ['webpack'],
      'test/*.spec.js': ['webpack'],
    },

    files: [
      { pattern: 'test/commonjs.spec.js', watched: false },
    ],
  })
}
