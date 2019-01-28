const baseConfig = require('./karma.base.conf')

module.exports = config => {
  config.set({
    ...baseConfig,

    files: [
      { pattern: 'dist/js-web-sdk.browser.umd.min.js', watched: false },
      { pattern: 'test/umd.spec.ts', watched: false },
    ],
  })
}
