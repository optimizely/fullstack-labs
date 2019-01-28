import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import * as optimizelySdk from '@optimizely/js-web-sdk'
;(async function() {
  const optimizely = optimizelySdk.createInstance({
    sdkKey: 'BsSyVRsUbE3ExgGCJ9w1to',
  })
  await optimizely.onReady()

  optimizely.notificationCenter.addNotificationListener(
    optimizelySdk.enums.NOTIFICATION_TYPES.ACTIVATE,
    (data: any) => {
      console.log('jordan', data)
    },
  )

  ReactDOM.render(<App optimizely={optimizely} />, document.getElementById(
    'root',
  ) as HTMLElement)
})()
