/**
 * Copyright 2019, Optimizely
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
import * as optimizely from '@optimizely/optimizely-sdk'

import {
  createInstance,
  OnReadyResult,
  ReactSDKClient,
  VariableSpecifier,
} from './client'

describe('ReactSDKClient', () => {
  const config: optimizely.Config = {
    datafile: {},
  }

  let mockInnerClient: optimizely.Client
  let createInstanceSpy: jest.Mock<optimizely.Client, [optimizely.Config]>

  beforeEach(() => {
    mockInnerClient = {
      activate: jest.fn(() => null),
      track: jest.fn(),
      isFeatureEnabled: jest.fn(() => false),
      getEnabledFeatures: jest.fn(() => []),
      getVariation: jest.fn(() => null),
      setForcedVariation: jest.fn(() => false),
      getForcedVariation: jest.fn(() => null),
      getFeatureVariableBoolean: jest.fn(() => null),
      getFeatureVariableDouble: jest.fn(() => null),
      getFeatureVariableInteger: jest.fn(() => null),
      getFeatureVariableString: jest.fn(() => null),
      onReady: jest.fn(() => Promise.resolve({ success: false })),
      close: jest.fn(),
      notificationCenter: {
        addNotificationListener: jest.fn(() => 0),
        removeNotificationListener: jest.fn(() => false),
        clearNotificationListeners: jest.fn(),
        clearAllNotificationListeners: jest.fn(),
      },
    }
    createInstanceSpy = jest
      .spyOn(optimizely, 'createInstance')
      .mockReturnValueOnce(mockInnerClient)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('provides the initial config object via the initialConfig property', () => {
    const instance = createInstance(config)
    expect(instance.initialConfig).toEqual(config)
  })

  it('provides a default user object', () => {
    const instance = createInstance(config)
    expect(instance.user).toEqual({
      id: null,
      attributes: {},
    })
  })

  it('provides access to the underlying client', () => {
    const instance = createInstance(config)
    expect(createInstanceSpy).toBeCalledTimes(1)
    expect(createInstanceSpy).toBeCalledWith(config)
    expect(createInstanceSpy.mock.results[0].isThrow).toBe(false)
    expect(createInstanceSpy.mock.results[0].value).toBe(instance.client)
  })

  it('provides access to the underlying client notificationCenter', () => {
    const instance = createInstance(config)
    expect(instance.notificationCenter).toBe(instance.client.notificationCenter)
  })

  describe('onReady', () => {
    it('fulfills the returned promise with success: false when the timeout expires, and no user is set', async () => {
      const instance = createInstance(config)
      const result = await instance.onReady({ timeout: 1 })
      expect(result.success).toBe(false)
    })

    it('fulfills the returned promise with success: true when a user is set', async () => {
      const instance = createInstance(config)
      instance.setUser({
        id: 'user12345',
      })
      const result = await instance.onReady()
      expect(result.success).toBe(true)
    })

    it('waits for the inner client onReady to fulfill before fulfilling the returned promise', async () => {
      const mockInnerClientOnReady = jest.spyOn(mockInnerClient, 'onReady')
      let resolveInnerClientOnReady: (result: OnReadyResult) => void
      const mockReadyPromise: Promise<OnReadyResult> = new Promise(res => {
        resolveInnerClientOnReady = res
      })
      mockInnerClientOnReady.mockReturnValueOnce(mockReadyPromise)
      const instance = createInstance(config)
      instance.setUser({
        id: 'user999',
      })
      resolveInnerClientOnReady!({ success: true })
      const result = await instance.onReady()
      expect(result.success).toBe(true)
    })
  })

  describe('setUser', () => {
    it('updates the user object with id and attributes', () => {
      const instance = createInstance(config)
      instance.setUser({
        id: 'xxfueaojfe8&86',
        attributes: {
          foo: 'bar',
        },
      })
      expect(instance.user).toEqual({
        id: 'xxfueaojfe8&86',
        attributes: {
          foo: 'bar',
        },
      })
    })

    it('adds and removes update handlers', () => {
      const instance = createInstance(config)
      const onUserUpdateListener = jest.fn()
      const dispose = instance.onUserUpdate(onUserUpdateListener)
      instance.setUser({
        id: 'newUser',
      })
      expect(onUserUpdateListener).toBeCalledTimes(1)
      expect(onUserUpdateListener).toBeCalledWith({
        id: 'newUser',
        attributes: {},
      })
      dispose()
      instance.setUser({
        id: 'newUser2',
      })
      expect(onUserUpdateListener).toBeCalledTimes(1)
    })

    describe('pre-set user and user overrides', () => {
      let instance: ReactSDKClient
      beforeEach(() => {
        instance = createInstance(config)
        instance.setUser({
          id: 'user1',
          attributes: {
            foo: 'bar',
          },
        })
        ;(mockInnerClient.getEnabledFeatures as jest.Mock).mockReturnValue([
          'feat1',
          'feat2',
        ])
      })

      it('can use pre-set and override user for activate', () => {
        ;(mockInnerClient.activate as jest.Mock).mockReturnValue('var1')
        let result = instance.activate('exp1')
        expect(result).toBe('var1')
        expect(mockInnerClient.activate).toBeCalledTimes(1)
        expect(mockInnerClient.activate).toBeCalledWith('exp1', 'user1', { foo: 'bar' })
        ;(mockInnerClient.activate as jest.Mock).mockReset()
        ;(mockInnerClient.activate as jest.Mock).mockReturnValue('var2')
        result = instance.activate('exp1', 'user2', { bar: 'baz' })
        expect(result).toBe('var2')
        expect(mockInnerClient.activate).toBeCalledTimes(1)
        expect(mockInnerClient.activate).toBeCalledWith('exp1', 'user2', { bar: 'baz' })
      })

      it('can use pre-set and override user for track', () => {
        instance.track('evt1')
        expect(mockInnerClient.track).toBeCalledTimes(1)
        expect(mockInnerClient.track).toBeCalledWith(
          'evt1',
          'user1',
          { foo: 'bar' },
          undefined,
        )
        ;(mockInnerClient.track as jest.Mock).mockReset()

        instance.track('evt1', 'user2', { bar: 'baz' })
        expect(mockInnerClient.track).toBeCalledTimes(1)
        expect(mockInnerClient.track).toBeCalledWith(
          'evt1',
          'user2',
          { bar: 'baz' },
          undefined,
        )
        ;(mockInnerClient.track as jest.Mock).mockReset()

        // Use pre-set user with event tags
        instance.track('evt1', { tagKey: 'tagVal' })
        expect(mockInnerClient.track).toBeCalledTimes(1)
        expect(mockInnerClient.track).toBeCalledWith(
          'evt1',
          'user1',
          { foo: 'bar' },
          { tagKey: 'tagVal' },
        )
        ;(mockInnerClient.track as jest.Mock).mockReset()

        // Use overrides with event tags
        instance.track('evt1', 'user3', { bla: 'bla' }, { tagKey: 'tagVal' })
        expect(mockInnerClient.track).toBeCalledTimes(1)
        expect(mockInnerClient.track).toBeCalledWith(
          'evt1',
          'user3',
          { bla: 'bla' },
          { tagKey: 'tagVal' },
        )
      })

      it('can use pre-set and override user for isFeatureEnabled', () => {
        ;(mockInnerClient.isFeatureEnabled as jest.Mock).mockReturnValue(true)
        let result = instance.isFeatureEnabled('feat1')
        expect(result).toBe(true)
        expect(mockInnerClient.isFeatureEnabled).toBeCalledTimes(1)
        expect(mockInnerClient.isFeatureEnabled).toBeCalledWith('feat1', 'user1', {
          foo: 'bar',
        })
        ;(mockInnerClient.isFeatureEnabled as jest.Mock).mockReset()
        ;(mockInnerClient.isFeatureEnabled as jest.Mock).mockReturnValue(false)
        result = instance.isFeatureEnabled('feat1', 'user2', { bar: 'baz' })
        expect(result).toBe(false)
        expect(mockInnerClient.isFeatureEnabled).toBeCalledTimes(1)
        expect(mockInnerClient.isFeatureEnabled).toBeCalledWith('feat1', 'user2', {
          bar: 'baz',
        })
      })

      it('can use pre-set and override user for getEnabledFeatures', () => {
        ;(mockInnerClient.getEnabledFeatures as jest.Mock).mockReturnValue(['feat1'])
        let result = instance.getEnabledFeatures()
        expect(result).toEqual(['feat1'])
        expect(mockInnerClient.getEnabledFeatures).toBeCalledTimes(1)
        expect(mockInnerClient.getEnabledFeatures).toBeCalledWith('user1', {
          foo: 'bar',
        })
        ;(mockInnerClient.getEnabledFeatures as jest.Mock).mockReset()
        ;(mockInnerClient.getEnabledFeatures as jest.Mock).mockReturnValue([
          'feat1',
          'feat2',
        ])
        result = instance.getEnabledFeatures('user2', { bar: 'baz' })
        expect(result).toEqual(['feat1', 'feat2'])
        expect(mockInnerClient.getEnabledFeatures).toBeCalledTimes(1)
        expect(mockInnerClient.getEnabledFeatures).toBeCalledWith('user2', {
          bar: 'baz',
        })
      })

      it('can use pre-set and override user for getVariation', () => {
        ;(mockInnerClient.getVariation as jest.Mock).mockReturnValue('var1')
        let result = instance.getVariation('exp1')
        expect(result).toEqual('var1')
        expect(mockInnerClient.getVariation).toBeCalledTimes(1)
        expect(mockInnerClient.getVariation).toBeCalledWith('exp1', 'user1', {
          foo: 'bar',
        })
        ;(mockInnerClient.getVariation as jest.Mock).mockReset()
        ;(mockInnerClient.getVariation as jest.Mock).mockReturnValue('var2')
        result = instance.getVariation('exp1', 'user2', { bar: 'baz' })
        expect(result).toEqual('var2')
        expect(mockInnerClient.getVariation).toBeCalledTimes(1)
        expect(mockInnerClient.getVariation).toBeCalledWith('exp1', 'user2', {
          bar: 'baz',
        })
      })

      it('can use pre-set and override user for getFeatureVariableBoolean', () => {
        ;(mockInnerClient.getFeatureVariableBoolean as jest.Mock).mockReturnValue(false)
        let result = instance.getFeatureVariableBoolean('feat1', 'bvar1')
        expect(result).toBe(false)
        expect(mockInnerClient.getFeatureVariableBoolean).toBeCalledTimes(1)
        expect(mockInnerClient.getFeatureVariableBoolean).toBeCalledWith(
          'feat1',
          'bvar1',
          'user1',
          { foo: 'bar' },
        )
        ;(mockInnerClient.getFeatureVariableBoolean as jest.Mock).mockReset()
        ;(mockInnerClient.getFeatureVariableBoolean as jest.Mock).mockReturnValue(true)
        result = instance.getFeatureVariableBoolean('feat1', 'bvar1', 'user2', {
          bar: 'baz',
        })
        expect(result).toBe(true)
        expect(mockInnerClient.getFeatureVariableBoolean).toBeCalledTimes(1)
        expect(mockInnerClient.getFeatureVariableBoolean).toBeCalledWith(
          'feat1',
          'bvar1',
          'user2',
          { bar: 'baz' },
        )
      })

      it('can use pre-set and override user for getFeatureVariableString', () => {
        ;(mockInnerClient.getFeatureVariableString as jest.Mock).mockReturnValue(
          'varval1',
        )
        let result = instance.getFeatureVariableString('feat1', 'svar1')
        expect(result).toBe('varval1')
        expect(mockInnerClient.getFeatureVariableString).toBeCalledTimes(1)
        expect(mockInnerClient.getFeatureVariableString).toBeCalledWith(
          'feat1',
          'svar1',
          'user1',
          { foo: 'bar' },
        )
        ;(mockInnerClient.getFeatureVariableString as jest.Mock).mockReset()
        ;(mockInnerClient.getFeatureVariableString as jest.Mock).mockReturnValue(
          'varval2',
        )
        result = instance.getFeatureVariableString('feat1', 'svar1', 'user2', {
          bar: 'baz',
        })
        expect(result).toBe('varval2')
        expect(mockInnerClient.getFeatureVariableString).toBeCalledTimes(1)
        expect(mockInnerClient.getFeatureVariableString).toBeCalledWith(
          'feat1',
          'svar1',
          'user2',
          { bar: 'baz' },
        )
      })

      it('can use pre-set and override user for getFeatureVariableInteger', () => {
        ;(mockInnerClient.getFeatureVariableInteger as jest.Mock).mockReturnValue(15)
        let result = instance.getFeatureVariableInteger('feat1', 'ivar1')
        expect(result).toBe(15)
        expect(mockInnerClient.getFeatureVariableInteger).toBeCalledTimes(1)
        expect(mockInnerClient.getFeatureVariableInteger).toBeCalledWith(
          'feat1',
          'ivar1',
          'user1',
          { foo: 'bar' },
        )
        ;(mockInnerClient.getFeatureVariableInteger as jest.Mock).mockReset()
        ;(mockInnerClient.getFeatureVariableInteger as jest.Mock).mockReturnValue(-20)
        result = instance.getFeatureVariableInteger('feat1', 'ivar1', 'user2', {
          bar: 'baz',
        })
        expect(result).toBe(-20)
        expect(mockInnerClient.getFeatureVariableInteger).toBeCalledTimes(1)
        expect(mockInnerClient.getFeatureVariableInteger).toBeCalledWith(
          'feat1',
          'ivar1',
          'user2',
          { bar: 'baz' },
        )
      })

      it('can use pre-set and override user for getFeatureVariableDouble', () => {
        ;(mockInnerClient.getFeatureVariableDouble as jest.Mock).mockReturnValue(15.5)
        let result = instance.getFeatureVariableDouble('feat1', 'dvar1')
        expect(result).toBe(15.5)
        expect(mockInnerClient.getFeatureVariableDouble).toBeCalledTimes(1)
        expect(mockInnerClient.getFeatureVariableDouble).toBeCalledWith(
          'feat1',
          'dvar1',
          'user1',
          { foo: 'bar' },
        )
        ;(mockInnerClient.getFeatureVariableDouble as jest.Mock).mockReset()
        ;(mockInnerClient.getFeatureVariableDouble as jest.Mock).mockReturnValue(-20.2)
        result = instance.getFeatureVariableDouble('feat1', 'dvar1', 'user2', {
          bar: 'baz',
        })
        expect(result).toBe(-20.2)
        expect(mockInnerClient.getFeatureVariableDouble).toBeCalledTimes(1)
        expect(mockInnerClient.getFeatureVariableDouble).toBeCalledWith(
          'feat1',
          'dvar1',
          'user2',
          { bar: 'baz' },
        )
      })
    })

    describe('getFeatureVariables', () => {
      // TODO: write tests for getFeatureVariables
      const variableSpecifiers: VariableSpecifier[] = [
        {
          type: 'boolean',
          key: 'bvar',
        },
        {
          type: 'string',
          key: 'svar',
        },
        {
          type: 'integer',
          key: 'ivar',
        },
        {
          type: 'double',
          key: 'dvar',
        },
      ]
      it('returns an empty object when the inner SDK returns no variables', () => {
        ;(mockInnerClient.getFeatureVariableBoolean as jest.Mock).mockReturnValue(null)
        ;(mockInnerClient.getFeatureVariableString as jest.Mock).mockReturnValue(null)
        ;(mockInnerClient.getFeatureVariableInteger as jest.Mock).mockReturnValue(null)
        ;(mockInnerClient.getFeatureVariableDouble as jest.Mock).mockReturnValue(null)
        const instance = createInstance(config)
        const result = instance.getFeatureVariables('feat1', variableSpecifiers)
        expect(result).toEqual({})
      })

      it('returns an object with variables of all types returned from the inner sdk ', () => {
        ;(mockInnerClient.getFeatureVariableBoolean as jest.Mock).mockReturnValue(true)
        ;(mockInnerClient.getFeatureVariableString as jest.Mock).mockReturnValue(
          'whatsup',
        )
        ;(mockInnerClient.getFeatureVariableInteger as jest.Mock).mockReturnValue(10)
        ;(mockInnerClient.getFeatureVariableDouble as jest.Mock).mockReturnValue(-10.5)
        const instance = createInstance(config)
        instance.setUser({
          id: 'user1123',
        })
        let result = instance.getFeatureVariables('feat1', variableSpecifiers)
        expect(result).toEqual({
          bvar: true,
          svar: 'whatsup',
          ivar: 10,
          dvar: -10.5,
        })

        ;(mockInnerClient.getFeatureVariableBoolean as jest.Mock).mockReturnValue(null)
        ;(mockInnerClient.getFeatureVariableString as jest.Mock).mockReturnValue(null)
        ;(mockInnerClient.getFeatureVariableInteger as jest.Mock).mockReturnValue(null)
        ;(mockInnerClient.getFeatureVariableDouble as jest.Mock).mockReturnValue(null)
        result = instance.getFeatureVariables('feat1', variableSpecifiers)
        expect(result).toEqual({
          bvar: null,
          svar: null,
          ivar: null,
          dvar: null,
        })
      })
    })
  })
})
