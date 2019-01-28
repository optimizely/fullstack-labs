import { OptimizelySDKWrapperConfig, OptimizelySDKWrapper } from '../src/OptimizelySDKWrapper'
import testPublishedSDKWrapper from './testPublishedSdkWrapper'

// The UMD script should have created jsWebSdk as a global variable
declare namespace jsWebSdk {
  function createInstance(config: OptimizelySDKWrapperConfig): OptimizelySDKWrapper
}

describe('UMD build', testPublishedSDKWrapper(jsWebSdk))
