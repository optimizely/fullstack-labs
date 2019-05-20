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
import { withOptimizely, WithOptimizelyProps } from './withOptimizely'
import { VariableValuesObject } from './client'

export interface FeatureProps extends WithOptimizelyProps {
  // TODO add support for overrideUserId
  feature: string
  timeout?: number
  autoUpdate?: boolean
  children: (isEnabled: boolean, variables: VariableValuesObject) => React.ReactNode
}

export interface FeatureState {
  canRender: boolean
  isEnabled: boolean
  variables: VariableValuesObject
}

class FeatureComponent extends React.Component<FeatureProps, FeatureState> {
  private optimizelyNotificationId?: number
  private unregisterUserListener: () => void
  private autoUpdate: boolean = false

  constructor(props: FeatureProps) {
    super(props)

    this.unregisterUserListener = () => {}

    const { autoUpdate, isServerSide, optimizely, feature } = props
    this.autoUpdate = !!autoUpdate
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
    const {
      feature,
      optimizely,
      optimizelyReadyTimeout,
      isServerSide,
      timeout,
    } = this.props
    if (optimizely === null) {
      throw new Error('optimizely prop must be supplied')
    }

    if (isServerSide) {
      return
    }

    // allow overriding of the ready timeout via the `timeout` prop passed to <Experiment />
    let finalReadyTimeout: number | undefined =
      timeout !== undefined ? timeout : optimizelyReadyTimeout

    optimizely.onReady({ timeout: finalReadyTimeout }).then(() => {
      const isEnabled = optimizely.isFeatureEnabled(feature)
      const variables = optimizely.getFeatureVariables(feature)
      this.setState({
        canRender: true,
        isEnabled,
        variables,
      })
    })

    if (!this.autoUpdate) {
      return
    }

    this.optimizelyNotificationId = optimizely.notificationCenter.addNotificationListener(
      'OPTIMIZELY_CONFIG_UPDATE',
      () => {
        const isEnabled = optimizely.isFeatureEnabled(feature)
        const variables = optimizely.getFeatureVariables(feature)
        this.setState({
          isEnabled,
          variables,
        })
      },
    )

    this.unregisterUserListener = optimizely.onUserUpdate(() => {
      const isEnabled = optimizely.isFeatureEnabled(feature)
      const variables = optimizely.getFeatureVariables(feature)
      this.setState({
        isEnabled,
        variables,
      })
    })
  }

  componentWillUnmount() {
    const { optimizely, isServerSide } = this.props
    if (isServerSide || !this.autoUpdate) {
      return
    }
    if (optimizely && this.optimizelyNotificationId) {
      optimizely.notificationCenter.removeNotificationListener(
        this.optimizelyNotificationId,
      )
    }
    this.unregisterUserListener()
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
