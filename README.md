<h3 align="center">
  Optimizely FullStack Labs
</h3>

<p align="center">
  A home for exciting up and coming Optimizely FullStack projects.
</p>

## Packages

This repository is a monorepo that we manage using [Lerna](https://github.com/lerna/lerna).

| Package | Status | Version | Description |
| --- | --- | --- | --- |
| [`js-web-sdk`](./packages/js-web-sdk) | beta | `3.0.0-beta3` | Browser wrapper for Optimizely's Javascript SDK. |
| [`react-sdk`](./packages/react-sdk) | beta |  `0.2.0-beta3` |Use Optimizely Feature Flags and AB Tests easily in React with a library of pre-built components.|
| [`example-react-16`](./packages/example-react-16) | example | `--` | A simple example using `js-web-sdk` and `react-sdk` in React 16 |
| [`example-react-typescript`](./packages/example-react-typescript) | example | `--` | A simple example using `js-web-sdk` and `react-sdk` in React + TypeScript |
| [`example-react-15`](./packages/example-react-15) | example | `--` | A simple example using `js-web-sdk` and `react-sdk` in React 15 |

#### Package Status Types
`experimental` - These APIs are still in the development stage.  Usage of this in production is not recommended

`beta` - These packages are undergoing their final testing before a `stable` release.  APIs will be generally stable, however they may change slightly before reaching `stable`.

`stable` - These packages have been vetted and used in production.  APIs for this will be stable and semantic versioning followed for any API breaking changes.

`example` - These are packages that are small examples showing how to use the packages in this respository.




## Development


#### Bootstrapping all packages

```
yarn
lerna bootstrap
```

#### Running an Example with local symlinks

1. Ensure the `package.json` files are pointing the correct `version` as the local packages.

2. `lerna run build`

3. `lerna link`

4. `cd packages/example-react-typescript && yarn start`
