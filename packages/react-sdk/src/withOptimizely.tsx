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
import { UserWrappedOptimizelySDK } from './createUserWrapper';

export interface WithOptimizelyProps {
  optimizely: UserWrappedOptimizelySDK | null
  optimizelyReadyTimeout: number | undefined
}

export function withOptimizely<P extends WithOptimizelyProps>(
  Component: React.ComponentType<P>,
) {
  return class WithOptimizely extends React.Component<Subtract<P, WithOptimizelyProps>> {
    render() {
      return (
        <OptimizelyContextConsumer>
          {(value: {
            optimizely: UserWrappedOptimizelySDK
            timeout: number | undefined
          }) => (
            <Component
              {...this.props}
              optimizely={value.optimizely}
              optimizelyReadyTimeout={value.timeout}
            />
          )}
        </OptimizelyContextConsumer>
      )
    }
  }
}
