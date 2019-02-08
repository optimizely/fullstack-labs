import { assert } from 'chai'
import { OptimizelySDKWrapperConfig, OptimizelySDKWrapper } from '../src/OptimizelySDKWrapper'
import { datafile } from './testData'
import * as sinon from 'sinon'
import { DatafileRequestStubs, setupDatafileRequestStubs } from './DatafileRequestStubs'

interface SDKWrapperIndex {
  createInstance: (config: OptimizelySDKWrapperConfig) => OptimizelySDKWrapper
}

export default function testPublishedSDKWrapper(wrapperIndex: SDKWrapperIndex): (this: Mocha.Suite) => void {
  return function() {
    let instance: OptimizelySDKWrapper
    let dispatchEvent: sinon.SinonSpy
    let log: sinon.SinonSpy

    function assertOneEventDispatched(): void {
      sinon.assert.calledOnce(dispatchEvent)
      const args = dispatchEvent.getCall(0).args[0];
      assert.isString(args.url)
      assert.isString(args.httpVerb)
      assert.include(args.params,
        {
          account_id: '804231466',
          project_id: '12122640456',
        }
      )
    }

    this.beforeEach(() => {
      dispatchEvent = sinon.spy()
      log = sinon.spy()
    })

    describe('when constructed with datafile', function() {
      this.beforeEach(() => {
        instance = wrapperIndex.createInstance({
          datafile,
          eventDispatcher: { dispatchEvent },
          logger: { log },
        })
      })

      it('should support activate', () => {
        const variation = instance.activate('abtest1', 'user1')
        assert.oneOf(variation, ['var1', 'var2'])
        assertOneEventDispatched()
      })

      it('should support track', () => {
        instance.track('event2', 'user1')
        assertOneEventDispatched()
      })

      it('should support isFeatureEnabled', () => {
        const isEnabled = instance.isFeatureEnabled('feature1', 'user1')
        assert.isBoolean(isEnabled)
        assertOneEventDispatched()
      })

      it('should support getFeatureVariables', () => {
        const variables = instance.getFeatureVariables(
          'variable_test_feature',
          'user1'
        )
        assert.deepEqual(variables, {
          booleanVar: true,
          stringVar: 'value',
          integerVar: 10,
          doubleVar: 20,
        })
      })
    })

    describe('when constructed with sdkKey', function() {
      let datafileStubs: DatafileRequestStubs

      this.beforeEach(() => {
        datafileStubs = setupDatafileRequestStubs()
        datafileStubs.setup()
        instance = wrapperIndex.createInstance({
          sdkKey: 'test',
          eventDispatcher: { dispatchEvent },
          logger: { log },
        })
      })

      this.afterEach(() => {
        datafileStubs.restore()
      })

      it('should support onReady', async () => {
        assert.isFalse(instance.isInitialized)
        datafileStubs.requests[0].respond(200, {}, JSON.stringify(datafile));
        await instance.onReady()
        assert.isTrue(instance.isInitialized)
      })
    })

    describe('when constructed with datafileUrl', function() {
      let datafileStubs: DatafileRequestStubs

      this.beforeEach(() => {
        datafileStubs = setupDatafileRequestStubs()
        datafileStubs.setup()
        instance = wrapperIndex.createInstance({
          datafileUrl: 'http://www.test.com/datafile.json',
          eventDispatcher: { dispatchEvent },
          logger: { log },
        })
      })

      this.afterEach(() => {
        datafileStubs.restore()
      })

      it('should support onReady', async () => {
        assert.isFalse(instance.isInitialized)
        assert.equal(datafileStubs.requests[0].url, 'http://www.test.com/datafile.json')
        datafileStubs.requests[0].respond(200, {}, JSON.stringify(datafile));
        await instance.onReady()
        assert.isTrue(instance.isInitialized)
      })
    })
  }
}
