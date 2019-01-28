# JS Web SDK

## What is it

- A backwards compatible wrapper around the JavascriptSDK for usage in web browsers
- Provides extendible datafile loading and caching strategies
- Provides mechanisms for only parts of the page to block rendering until Optimizely is loaded (supplying a maximum timeout)
- All new features are opt-in, can be used exactly the same way as JavascriptSDK if desired
- Enqueue `track` calls that happen before the datafile is downloaded

## Getting Started

### Prerequisites
- Like the JavaScript SDK, this wrapper requires an [ES5-compatible](https://caniuse.com/#feat=es5) environment.
- This wrapper also requires a native ES6 Promise implementation. If your environment does not support Promises, you must set up a [Promise polyfill](https://github.com/stefanpenner/es6-promise).

### Installation
```
npm install @optimizely/js-web-sdk
```

### Usage
```js
// ES Modules
import * as optimizelySDK from '@optimizely/js-web-sdk'

// CommonJS
const optimizelySDK = require('@optimizely/js-web-sdk')
```

```html
<!-- UMD script, assigns to window.jsWebSdk -->
<script src="https://unpkg.com/@optimizely/js-web-sdk/dist/js-web-sdk.browser.umd.min.js"></script>
```

## Datafile loading / management

### Load datafile already on the page

This is the ideal case and prevents a lot of timing issues and complexity, however we realize not all customers will have the ability to this.

```js
import * as optimizelySDK from '@optimizely/js-web-sdk'
const optimizely = optimizelySDK.createInstance({
  datafile: window.datafile,
})
// all calls can happen immediately after (sync)
optimizely.activate('my-exp', 'user1')
```

### Load datafile by SDK Key

By providing the `sdkKey` option to `createInstance` the SDK will automatically fetch the datafile.  If a cached datafile exists it will use the cached version.  Decisions made after the fresh datafile has loaded will use the new datafile.

_Asnyc load and wait until datafile is loaded_

```js
import * as optimizelySDK from '@optimizely/js-web-sdk'
const optimizely = optimizelySDK.createInstance({
  SDKKey: 'GaXr9RoDhRcqXJm3ruskRa',
})

// At this point optimizely can be used, on first page load the datafile will not be fetched and methods will no-op
// On second page load it will use the cached datafile immediately
//
initApp()
```

#### `optimizely.onReady()` to block rendering

By using `await optimizely.onReady()` you can gaurantee code wont be run until the datafile is downloaded

```js
import * as optimizelySDK from '@optimizely/js-web-sdk'
const optimizely = optimizelySDK.createInstance({
  SDKKey: 'GaXr9RoDhRcqXJm3ruskRa',
})

await optimizely.onReady()
// at this point datafile is gauranteed to be loaded
initApp()
```

However, the above example isn't great because Optimizely could time out due to network connectivity issues.  By passing a `timeout` to `optimizely.onReady()` we can gaurantee that Optimizely won't block the page for more than X milliseconds.

```js
import * as optimizelySDK from '@optimizely/js-web-sdk'
const optimizely = optimizelySDK.createInstance({
  SDKKey: 'GaXr9RoDhRcqXJm3ruskRa',
})

// Dont wait more than 200ms, if there is a cached datafile this will immediately resolve
await optimizely.onReady({ timeout: 200 })


// you can also use the Promise API
optimizely.onReady({ timeout: 200 }).then(() => {
  initApp()
})
```

It's worth noting that `optimizely.onReady` can be called as many times, once the datafile has downloaded this will always return a resolved promise.  This is a powerful mechanism to build UI components, as a UI component can be configured to block up to X milliseconds waiting for Optimizely to load, while other parts of the UI are unaffected.


### Second page load

By default loading the datafile by URL will store the contents of the datafile in `localStorage`, on second page load we are guaranteed to have synchronous access to the datafile.

The underlying DatafileManager will also make a background request to get an updated datafile, however that will not be registered until the next instantiation of Optimizely via `optimizely.createInstance` which is usually the next page load.

_When using optimizely async the user will only have to pay the loading cost once on first page load, subsequent page loads are always synchronous_

## Using React

This SDK can be used stand alone to bolster the current javascript-sdk with things like automatic datafile loading and caching.  It can also be used with the [ReactSDK](../react-sdk) to simplify Feature Flagging and AB Testing in React.

## Credits

First-party code (under lib/ and dist/) is copyright Optimizely, Inc. and contributors, licensed under Apache 2.0.

## Additional Code
Prod dependencies are as follows:

```json
{
  "json-schema@0.2.3": {
    "licenses": [
      "AFLv2.1",
      "BSD"
    ],
    "publisher": "Kris Zyp",
    "repository": "https://github.com/kriszyp/json-schema"
  },
  "lodash@4.17.11": {
    "licenses": "MIT",
    "publisher": "John-David Dalton",
    "repository": "https://github.com/lodash/lodash"
  },
  "murmurhash@0.0.2": {
    "licenses": "MIT*",
    "repository": "https://github.com/perezd/node-murmurhash"
  },
  "sprintf-js@1.1.1": {
    "licenses": "BSD-3-Clause",
    "publisher": "Alexandru Mărășteanu",
    "repository": "https://github.com/alexei/sprintf.js"
  },
  "uuid@3.3.2": {
    "licenses": "MIT",
    "repository": "https://github.com/kelektiv/node-uuid"
  }
}
```

To regenerate this, run the following command:

```sh
npx license-checker --production --json | jq 'map_values({ licenses, publisher, repository }) | del(.[][] | nulls)'
```

## Contributing

Please see [CONTRIBUTING](../../CONTRIBUTING.md)

