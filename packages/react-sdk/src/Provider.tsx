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

import { OptimizelyContextProvider } from './Context'
import * as optimizely from '@optimizely/optimizely-sdk'
import {
  UserAttributes,
  createUserWrapper,
  UserWrappedOptimizelySDK,
} from './createUserWrapper'

interface OptimizelyProviderProps {
  optimizely: optimizely.Client
  userId: string
  timeout?: number
  userAttributes?: UserAttributes
  isServerSide?: boolean
}

interface OptimizelyProviderState {
  userId: string
  attributes: { [key: string]: string } | undefined
}

export class OptimizelyProvider extends React.Component<
  OptimizelyProviderProps,
  OptimizelyProviderState
> {
  sdkWrapper: UserWrappedOptimizelySDK

  constructor(props: OptimizelyProviderProps) {
    super(props)

    const { optimizely, userId, userAttributes } = props
    this.sdkWrapper = createUserWrapper({
      instance: optimizely,
      userId,
      userAttributes,
    })
  }

  render() {
    const { children, timeout } = this.props
    const isServerSide = !!this.props.isServerSide
    const value = {
      optimizely: this.sdkWrapper,
      isServerSide,
      timeout,
    }

    return (
      <OptimizelyContextProvider value={value}>{children}</OptimizelyContextProvider>
    )
  }
}
