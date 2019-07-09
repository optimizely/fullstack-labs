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

export function withOptimizely<P extends WithOptimizelyProps, R>(
  Component: React.ComponentType<P>,
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<Subtract<P, WithOptimizelyProps>> & React.RefAttributes<R>
> {
  const WithOptimizely: React.RefForwardingComponent<
    R,
    Subtract<P, WithOptimizelyProps>
  > = (props, ref) => {
    return (
      // Note: Casting props to P is necessary because of this TypeScript issue:
      // https://github.com/microsoft/TypeScript/issues/28884
      <OptimizelyContextConsumer>
        {(value: {
          optimizely: ReactSDKClient
          isServerSide: boolean
          timeout: number | undefined
        }) => (
          <Component
            {...props as P}
            optimizely={value.optimizely}
            optimizelyReadyTimeout={value.timeout}
            isServerSide={value.isServerSide}
            ref={ref}
          />
        )}
      </OptimizelyContextConsumer>
    )
  }
  return React.forwardRef(WithOptimizely)
}
