# Migration
Guides for migration to new versions will be kept in this file.
## 0.3.0
#### Dependency changes
This version brings an internal refactor to use the @optimizely/optimizely-sdk package instead of @optimizely/js-web-sdk.
**@optimizely/js-web-sdk is no longer a peer dependency.** To use the React SDK, you need only install @optimizely/react-sdk. In your package.json, make changes like this:
```diff
{
  "dependencies": {
-    "@optimizely/js-web-sdk": "3.0.0-beta1"
-    "@optimizely/react-sdk": "0.2.0-beta1"
+    "@optimizely/react-sdk": "0.3.0-beta1"
  }
}
```
#### Instantiation
The @optimizely/react-sdk package now provides a `createInstance` method, which is used just like the method of the same name from @optimizely/js-web-sdk. `createInstance` accepts a config object as its argument. The format of this object is documented in our [developer documentation for Instantiate](https://docs.developers.optimizely.com/full-stack/docs/instantiate).

***Note:*** Under the hood, @optimizely/react-sdk uses @optimizely/optimizely-sdk version 3.2.0. Instantiation options discussed in [Update datafiles automatically](https://docs.developers.optimizely.com/full-stack/docs/update-datafiles-automatically) are supported by `createInstance`. For example:
```js
import { createInstance } from '@optimizely/react-sdk'

const optimizely = createInstance({
  datafile: window.datafile,
  datafileOptions: {
    updateInterval: 30000,
    autoUpdate: true,
  },
  sdkKey: 'your-optimizely-sdk-key',
})
```
For more information, see the [Usage section in the README](./README.md#usage).

#### Providing a user
As in prior versions, you can still pass `userId` and `userAttributes` props to `OptimizelyProvider`. Now, alternatively, you can pass a single `user` prop, which should be an object with `id` and `attributes` properties. For example:
```jsx
import { createInstance, OptimizelyProvider } from '@optimizely/react-sdk'
import React from 'react'
import ReactDOM from 'react-dom'

const optimizely = createInstance({ sdkKey: 'your-optimizely-sdk-key' })

class App extends React.Component {
  render() {
    return (
      <OptimizelyProvider
        optimizely={optimizely}
        user={{ id: 'myuser123', attributes: { planType: 'bronze' }}}>
        Hello, React SDK
        {/* ... your components here, using OptimizelyExperiment OptimizelyFeature, or withOptimizely... */}
      </OptimizelyProvider>
    )
  }
}
React.DOM.render(<App />, document.getElementById('root'))
```
#### Updating a user
You can call `setUser` on your `optimizelyInstance` to update user id or attributes. If you also pass `true` as the `autoUpdate` boolean prop to `OptimizelyFeature` or `OptimizelyExperiment`, these components will rerender their children when the user changes.
```jsx
import { createInstance, OptimizelyProvider, OptimizelyFeature } from '@optimizely/react-sdk'
import React from 'react'
import ReactDOM from 'react-dom'

const optimizely = createInstance({ sdkKey: 'your-optimizely-sdk-key' })

class App extends React.Component {
  render() {
    return (
      <OptimizelyProvider
        optimizely={optimizely}
        user={{ id: 'myuser123', attributes: { planType: 'bronze' }}}>
        {/* Note: autoUpdate prop on OptimizelyFeature enables rerendering upon user change */}
        <OptimizelyFeature feature="my_feature" autoUpdate>
          {(isEnabled, variables) => (
            <>
              <div>Is feature enabled: { String(isEnabled)}</div>
              <pre>{JSON.stringify(variables, null, 2)}</pre>
            </>
          )}
        </OptimizelyFeature>
      </OptimizelyProvider>
    )
  }
}

// Update the user later - feature enabled status and variables will be reevaluated, and children will be rerendered
setTimeout(() => {
  optimizely.setUser({
    id: 'myuser456',
    attributes: { planType: 'silver' }
  })
}, 3000)

ReactDOM.render(<App />, document.getElementById('root'))
```
#### Updating the datafile
If you create your instance with automatic updates enabled, and you also pass `true` as the `autoUpdate` boolean prop to `OptimizelyFeature` or `OptimizelyExperiment`, these components will rerender their children when the datafile changes.
```jsx
import { createInstance, OptimizelyProvider, OptimizelyFeature } from '@optimizely/react-sdk'
import React from 'react'
import ReactDOM from 'react-dom'

const optimizely = createInstance({
  sdkKey: '9LCprAQyd1bs1BBXZ3nVji',
  datafileOptions: {
    // Poll every 5 seconds for datafile updates. When new datafiles are received, children will be rerendered
    updateInterval: 5000,
    autoUpdate: true,
  },
})

class App extends React.Component {
  render() {
    return (
      <OptimizelyProvider
        optimizely={optimizely}
        user={{ id: 'myuser123', attributes: { planType: 'bronze' }}}>
        {/* Note: autoUpdate prop on OptimizelyFeature enables rerendering upon datafile update */}
        <OptimizelyFeature feature="my_feature" autoUpdate>
          {(isEnabled, variables) => (
            <>
              <div>Is feature enabled: { String(isEnabled)}</div>
              <pre>{JSON.stringify(variables, null, 2)}</pre>
            </>
          )}
        </OptimizelyFeature>
      </OptimizelyProvider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
```
#### Logging support
You can now configure a logger and log level directly via the React SDK:
```js
import * as optimizelySDK from '@optimizely/react-sdk'
// Set the log level to debug
optimizelySDK.setLogLevel('debug');
// Set a console-based default logger
optimizelySDK.setLogger(optimizelySDK.logging.createLogger());
// Disable logging
optimizelySDK.setLogger(null);
```
#### Functionality changes
With the switch from @optimizely/js-web-sdk to @optimizely/optimizely-sdk, be aware of the following changes in functionality:
- `localStorage`-based datafile caching was removed
- `track` calls that happen before the datafile is downloaded are no longer enqueued
