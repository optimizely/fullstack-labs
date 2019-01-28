import { OptimizelySDKWrapperConfig, OptimizelySDKWrapper } from '../src/OptimizelySDKWrapper'
import testPublishedSDKWrapper from './testPublishedSdkWrapper'
import * as sdkWrapperIndex from '../dist/js-web-sdk'

describe('UMD build', testPublishedSDKWrapper(sdkWrapperIndex))
