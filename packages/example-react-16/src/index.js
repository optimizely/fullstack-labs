import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

import * as optimizelyReactSDK from '@optimizely/react-sdk'

optimizelyReactSDK.setLogLevel('debug')
optimizelyReactSDK.setLogger(optimizelyReactSDK.logging.createLogger())
const optimizely = optimizelyReactSDK.createInstance({
  sdkKey: 'BsSyVRsUbE3ExgGCJ9w1to',
})

// optimizely.onReady().then(() => {
//   optimizely.notificationCenter.addNotificationListener(
//     optimizelyReactSDK.enums.NOTIFICATION_TYPES.ACTIVATE,
//     data => {
//       console.log('I activated', data.experiment.key)
//     },
//   )
// })

async function main() {
  ReactDOM.render(<App optimizely={optimizely} />, document.getElementById('root'))

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: http://bit.ly/CRA-PWA
  serviceWorker.unregister()
}

main()
