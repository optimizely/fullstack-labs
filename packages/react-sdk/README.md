# Optimizely React SDK

This repository houses the React SDK for use with Optimizely Full Stack and Optimizely Rollouts.

Optimizely Full Stack is A/B testing and feature flag management for product development teams. Experiment in any application. Make every feature on your roadmap an opportunity to learn. Learn more at https://www.optimizely.com/platform/full-stack/, or see the [documentation](https://docs.developers.optimizely.com/full-stack/docs).

Optimizely Rollouts is free feature flags for development teams. Easily roll out and roll back features in any application without code deploys. Mitigate risk for every feature on your roadmap. Learn more at https://www.optimizely.com/rollouts/, or see the [documentation](https://docs.developers.optimizely.com/rollouts/docs).

### Features

- Automatic datafile downloading and caching (through LocalStorage)
- User ID + attributes memoization
- Render blocking until datafile is ready via a React API
- Optimizely timeout (only block rendering up to the number of milliseconds you specify)
- Event queuing for `track`, which allows `track` calls to happen before datafile is downloaded
- Library of React components to use with [feature flags](https://docs.developers.optimizely.com/full-stack/docs/use-feature-flags) and [A/B tests](https://docs.developers.optimizely.com/full-stack/docs/run-a-b-tests)

### Compatibility

`React 15.x +`

### Example

```jsx
import {
  OptimizelyProvider,
  OptimizelyExperiment,
  OptimizelyVariation,
  OptimizelyFeature,
} from '@optimizely/react-sdk'
import * as optimizelySDK from '@optimizely/js-web-sdk'

const optimizely = optimizelySDK.createInstance({
  sdkKey: 'your-optimizely-sdk-key',
})

class App extends React.Component {
  render() {
    <OptimizelyProvider
      optimizely={optimizely}
      timeout={500}
      userId={window.userId}
      userAttributes={{ plan_type: 'bronze' }}
    >
      <OptimizelyExperiment experiment="ab-test">
        {(variation) => (
          <p>got variation {variation}</p>
        )}
      </OptimizelyExperiment>

      <OptimizelyExperiment experiment="button-color">
        <OptimizelyVariation variation="blue">
          <BlueButton />
        </OptimizelyVariation>

        <OptimizelyVariation variation="green">
          <GreenButton />
        </OptimizelyVariation>

        <OptimizelyVariation default>
          <DefaultButton />
        </OptimizelyVariation>
      </OptimizelyExperiment>

      <OptimizelyFeature feature="sort-algorithm">
        {(isEnabled, variables) => (
          <SearchComponent algorithm={variables.algorithm} />
        )}
      </OptimizelyFeature>
    </OptimizelyProvider>
  }
}

```

Note: `variables` is a [feature of Optimizely FullStack](https://docs.developers.optimizely.com/full-stack/docs/define-feature-variables) and is not available in Optimizely Rollouts.

# Installation

To use the `ReactSDK` components, you must use the [`@optimizely/js-web-sdk`](../js-web-sdk/), which is an API-compatible SDK wrapper built on top of the existing `@optimizely/javascript-sdk`. `@optimizely/js-web-sdk` adds API methods to enable better functionality (asynchronous loading and render blocking) with the ReactSDK.

```
npm install @optimizely/js-web-sdk @optimizely/react-sdk
```

# Usage

## `<OptimizelyProvider>`

Required at the root level. Leverages React’s `Context` API to allow access to the OptimizelySDKWrapper to components like `<OptimizelyFeature>` and `<OptimizelyExperiment>`.

*props*
* `optimizely : OptimizelySDK` Instance of the OptimizelySDK from `@optimizely/js-web-sdk`
* `userId : String` userId to be passed to the SDK for every feature flag, A/B test, or `track` call
* `userAttributes : Object` (optional) userAttributes passed for every feature flag, A/B test, or `track` call
* `timeout : Number` (optional) The amount of time for OptimizelyExperiment and OptimizelyFeature components to render `null` before resolving

### Load the datafile synchronously

Synchronous loading is the preferred method to ensure that Optimizely is always ready and doesn't add any delay or asynchronous complexity to your application.

```jsx
import { OptimizelyProvider } from '@optimizely/react-sdk'
import * as optimizelySDK from '@optimizely/js-web-sdk'

const optimizely = optimizelySDK.createInstance({
  datafile: window.datafile,
})

class AppWrapper extends React.Component {
  render() {
    return (
      <OptimizelyProvider optimizely={optimizely} userId={window.userId}>
        <App />
      </OptimizelyProvider>
    )
  }
}
```

### Load the datafile asynchronously

If you don't have the datafile downloaded, the `js-web-sdk` can fetch the datafile for you. However, instead of waiting for the datafile to fetch before you render your app, you can immediately render your app and provide a `timeout` option to `<OptimizelyProvider optimizely={optimizely} timeout={200}>`. This will block rendering of `<OptimizelyExperiment>` and `<OptimizelyFeature>` components until the datafile loads or the timeout is up (in this case, `variation` is `null` and `isFeatureEnabled` is `false`).

```jsx
import { OptimizelyProvider } from '@optimizely/react-sdk'
import * as optimizelySDK from '@optimizely/js-web-sdk'

const optimizely = optimizelySDK.createInstance({
  sdkKey: 'your-optimizely-sdk-key', // Optimizely environment key
})

class App extends React.Component {
  render() {
    return (
      <OptimizelyProvider
        optimizely={optimizely}
        timeout={500}
        userId={window.userId}
        userAttributes={{ plan_type: 'bronze' }}
      >
        <HomePage />
      </OptimizelyProvider>
    )
  }
}
```

# Use cases

## Experiment

### Render different components based on variation

You can use OptimizelyExperiment via a child render function. If the component contains a function as a child, `<OptimizelyExperiment>` will call that function, with the result of `optimizely.activate(experimentKey)`.

```jsx
<OptimizelyExperiment experiment="exp1">
  {(variation) => (
    variation === 'simple'
      ? <SimpleComponent />
      : <DetailedComponent />
  )}
</OptimizelyExperiment>
```

You can also use the `<OptimizelyVariation>` component.

**Note: If you are loading the datafile asynchrounously, be sure to include an `<OptimizelyVariation default>` component as the render path if the datafile fails to load.**

```jsx
import { OptimizelyExperiment, OptimizelyVariation } from '@optimizely/react-sdk'
<OptimizelyExperiment experiment="exp1">
  <OptimizelyVariation variation="simple">
    <SimpleComponent />
  </OptimizelyVariation>

  <OptimizelyVariation variation="detailed">
    <ComplexComponent />
  </OptimizelyVariation>

  <OptimizelyVariation default>
    <SimpleComponent />
  </OptimizelyVariation>
</OptimizelyExperiment>
```

## Feature

### Render something if feature is enabled

```jsx
<OptimizelyFeature feature="new-login-page">
  {(isEnabled, variables) => (
    <a href={isEnabled ? "/login" : "/login2"}>
      Login
    </a>
  )}
</OptimizelyFeature>
```

### Render feature variables

```jsx
<OptimizelyFeature feature="new-login-page">
  {(isEnabled, variables) => (
    <a href={isEnabled ? "/login" : "/login2"}>
      {variables.loginText}
    </a>
  )}
</OptimizelyFeature>
```

### Programmatic access inside component

Any component under the `<OptimizelyProvider>` can access the Optimizely `js-web-sdk` via the higher-order component (HoC) `withOptimizely`.

```jsx
import { withOptimizely } from '@optimizely/react-sdk'

class MyComp extends React.Component {
  constructor(props) {
    super(props)
    const { optimizely } = this.props
    const isFeat1Enabled = optimizely.isFeatureEnabled('feat1')
    const feat1Variables = optimizely.getFeatureVariables('feat1')

    this.state = {
      isFeat1Enabled,
      feat1Variables,
    }
  }

  render() {
  }
}

const WrappedMyComponent = withOptimizely(MyComp)
```

## Tracking

Use the `withOptimizely` HoC for tracking.

```jsx
import { withOptimizely } from '@optimizely/react-sdk'

class SignupButton extends React.Component {
  onClick = () => {
    const { optimizely } = this.props
    optimizely.track('signup-clicked')
    // rest of click handler
  }

  render() {
    <button onClick={this.onClick}>
      Signup
    </button>
  }
}

const WrappedSignupButton = withOptimizely(SignupButton)
```


## Server Side Rendering
Right now server side rendering is possible with the `js-web-sdk` and `react-sdk` with a few caveats.

**Caveats**

1. You must download the datafile manually and pass in via the `datafile` option.  Can not use `sdkKey` to automatically download.

2. Rendering of components must be completely synchronous (this is true for all server side rendering)

### Setting up `<OptimizelyProvider>`

Similar to browser side rendering you will need to wrap your app (or portion of the app using Optimizely) in the `<OptimizelyProvider>` component.  A new prop
`isServerSide` must be equal to true.

```jsx
<OptimizelyProvider optimizely={optimizely} userId="user1" isServerSide={true}>
  <App />
</OptimizelyProvider>
```

All other Optimizely components, such as `<OptimizelyFeature>` and `<OptimizelyExperiment>` can remain the same.

### Full example

```jsx
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

import * as optimizelySDK from '@optimizely/js-web-sdk'
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
```

## Credits

First-party code (under lib/ and dist/) is copyright Optimizely, Inc. and contributors, licensed under Apache 2.0.

## Additional code

Prod dependencies are as follows:

```json
{
  "js-tokens@4.0.0": {
    "licenses": "MIT",
    "publisher": "Simon Lydell",
    "repository": "https://github.com/lydell/js-tokens"
  },
  "loose-envify@1.4.0": {
    "licenses": "MIT",
    "publisher": "Andres Suarez",
    "repository": "https://github.com/zertosh/loose-envify"
  },
  "object-assign@4.1.1": {
    "licenses": "MIT",
    "publisher": "Sindre Sorhus",
    "repository": "https://github.com/sindresorhus/object-assign"
  },
  "prop-types@15.6.2": {
    "licenses": "MIT",
    "repository": "https://github.com/facebook/prop-types"
  },
  "react-broadcast@0.7.1": {
    "licenses": "MIT",
    "publisher": "Michael Jackson",
    "repository": "https://github.com/ReactTraining/react-broadcast"
  },
  "react@16.7.0": {
    "licenses": "MIT",
    "repository": "https://github.com/facebook/react"
  },
  "scheduler@0.12.0": {
    "licenses": "MIT",
    "repository": "https://github.com/facebook/react"
  },
  "utility-types@2.1.0": {
    "licenses": "MIT",
    "publisher": "Piotr Witek",
    "repository": "https://github.com/piotrwitek/utility-types"
  },
  "warning@3.0.0": {
    "licenses": "BSD-3-Clause",
    "publisher": "Berkeley Martinez",
    "repository": "https://github.com/BerkeleyTrue/warning"
  }
}

```

To regenerate the dependencies, run the following command:

```sh
npx license-checker --production --json | jq 'map_values({ licenses, publisher, repository }) | del(.[][] | nulls)'
```

## Contribute to this repo

Please see [CONTRIBUTING](../../CONTRIBUTING.md) for more information.

