import React from 'react'

import { OptimizelyFeature, withOptimizely } from '@optimizely/react-sdk'


export default class Homepage extends React.Component {
  render() {
    return (
      <div>
        <h1>Homepage</h1>
        <OptimizelyFeature feature="feature1" autoUpdate={true}>
          {enabled => enabled ? 'is enabled': "not enabled"}
        </OptimizelyFeature>
      </div>
    )
  }
}
