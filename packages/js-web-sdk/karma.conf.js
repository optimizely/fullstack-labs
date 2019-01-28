const baseConfig = require('./karma.base.conf')

module.exports = (config) => {
  config.set({
    ...baseConfig,

    files: [
      { pattern: 'test/OptimizelySDKWrapper.spec.ts', watched: false },
    ],
  })
}
