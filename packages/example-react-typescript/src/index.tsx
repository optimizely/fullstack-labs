import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import * as optimizelyReactSDK from '@optimizely/react-sdk'
;(async function() {
  const optimizely = optimizelyReactSDK.createInstance({
    sdkKey: 'BsSyVRsUbE3ExgGCJ9w1to',
  })
  await optimizely.onReady()

  optimizely.notificationCenter.addNotificationListener(
    optimizelyReactSDK.enums.NOTIFICATION_TYPES.ACTIVATE,
    (data: any) => {
      console.log('jordan', data)
    },
  )

  ReactDOM.render(<App optimizely={optimizely} />, document.getElementById(
    'root',
  ) as HTMLElement)
})()
