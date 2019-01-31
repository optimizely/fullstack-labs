import { OptimizelySDKWrapperConfig, OptimizelySDKWrapper } from '../src/OptimizelySDKWrapper'
import testPublishedSDKWrapper from './testPublishedSdkWrapper'

// The UMD script should have created optimizelySdk as a global variable
declare namespace optimizelySdk {
  function createInstance(config: OptimizelySDKWrapperConfig): OptimizelySDKWrapper
}

describe('UMD build', testPublishedSDKWrapper(optimizelySdk))
