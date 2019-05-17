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
import { Subtract } from 'utility-types'

import { OptimizelyContextConsumer } from './Context'
import { ReactSDKClient } from './client';

export interface WithOptimizelyProps {
  optimizely: ReactSDKClient | null
  optimizelyReadyTimeout: number | undefined
  isServerSide: boolean
}

export function withOptimizely<P extends WithOptimizelyProps>(
  Component: React.ComponentType<P>,
): React.ComponentType<Subtract<P, WithOptimizelyProps>> {
  return class WithOptimizely extends React.Component<Subtract<P, WithOptimizelyProps>> {
    render() {
      return (
        <OptimizelyContextConsumer>
          {(value: {
            optimizely: ReactSDKClient
            isServerSide: boolean
            timeout: number | undefined
          }) => (
            // @ts-ignore
            <Component
              {...this.props}
              optimizely={value.optimizely}
              optimizelyReadyTimeout={value.timeout}
              isServerSide={value.isServerSide}
            />
          )}
        </OptimizelyContextConsumer>
      )
    }
  }
}
