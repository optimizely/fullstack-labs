import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

import * as optimizelySDK from '@optimizely/react-sdk'
import {
  OptimizelyProvider,
  OptimizelyFeature,
  OptimizelyExperiment,
  OptimizelyVariation,
} from '@optimizely/react-sdk'

const fetch = require('node-fetch')

async function main() {
  const resp = await fetch(
    'https://cdn.optimizely.com/datafiles/BsSyVRsUbE3ExgGCJ9w1to.json',
  )
  const datafile = await resp.json()
  const optimizely = optimizelySDK.createInstance({
    datafile,
  })

  const output = ReactDOMServer.renderToString(
    <OptimizelyProvider optimizely={optimizely} userId="user1" isServerSide={true}>
      <OptimizelyFeature feature="feature1">
        {featureEnabled => (featureEnabled ? <p>enabled</p> : <p>disabled</p>)}
      </OptimizelyFeature>

      <OptimizelyExperiment experiment="abtest1">
        <OptimizelyVariation variation="var1">
          <p>variation 1</p>
        </OptimizelyVariation>
        <OptimizelyVariation default>
          <p>default variation</p>
        </OptimizelyVariation>
      </OptimizelyExperiment>
    </OptimizelyProvider>,
  )
  console.log('output', output)
}
main()
