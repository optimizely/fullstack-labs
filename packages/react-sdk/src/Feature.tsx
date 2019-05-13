/**
 * Copyright 2018-2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from 'react'
import * as PropTypes from 'prop-types'
import { withOptimizely, WithOptimizelyProps } from './withOptimizely'
import { VariableValuesObject } from './createUserWrapper'

export interface FeatureProps extends WithOptimizelyProps {
  // TODO add support for overrideUserId
  feature: string
  children: (isEnabled: boolean, variables: VariableValuesObject) => React.ReactNode
}

export interface FeatureState {
  canRender: boolean
  isEnabled: boolean
  variables: VariableValuesObject
}

class FeatureComponent extends React.Component<FeatureProps, FeatureState> {
  constructor(props: FeatureProps) {
    super(props)

    const { isServerSide, optimizely, feature } = props
    if (isServerSide) {
      if (optimizely === null) {
        throw new Error('optimizely prop must be supplied')
      }
      const isEnabled = optimizely.isFeatureEnabled(feature)
      const variables = optimizely.getFeatureVariables(feature)
      this.state = {
        canRender: true,
        isEnabled,
        variables,
      }
    } else {
      this.state = {
        canRender: false,
        isEnabled: false,
        variables: {},
      }
    }
  }

  componentDidMount() {
    const { feature, optimizely, optimizelyReadyTimeout } = this.props
    if (optimizely === null) {
      throw new Error('optimizely prop must be supplied')
    }

    optimizely.onReady({ timeout: optimizelyReadyTimeout }).then(() => {
      const isEnabled = optimizely.isFeatureEnabled(feature)
      const variables = optimizely.getFeatureVariables(feature)
      this.setState({
        canRender: true,
        isEnabled,
        variables,
      })
    })
  }

  render() {
    const { children } = this.props
    const { isEnabled, variables, canRender } = this.state

    if (!canRender) {
      return null
    }

    return children(isEnabled, variables)
  }
}

export const OptimizelyFeature = withOptimizely(FeatureComponent)
