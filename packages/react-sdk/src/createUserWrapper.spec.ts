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
/// <reference types="jest" />

// import { OptimizelyClientWrapper } from '@optimizely/js-web-sdk'
import * as optimizely from '@optimizely/optimizely-sdk'
import { createUserWrapper } from './createUserWrapper'

describe('createUserWrapper', () => {
  let MockedOptimizelySDKWrapper: jest.Mock<optimizely.Client>
  let mockedDatafileManager: any

  beforeEach(() => {
    const configObj: any = {
      featureKeyMap: {
        featureKey: {
          variables: [
            {
              key: 'variableKeyBoolean',
              id: 'variableKeyBoolean',
              defaultValue: false,
              type: 'boolean',
            },
            {
              key: 'variableKeyString',
              id: 'variableKeyString',
              defaultValue: 'default',
              type: 'string',
            },
            {
              key: 'variableKeyDouble',
              id: 'variableKeyDouble',
              defaultValue: 0,
              type: 'double',
            },
            {
              key: 'variableKeyInteger',
              id: 'variableKeyInteger',
              defaultValue: 0,
              type: 'integer',
            },
          ],
        },
      },
    }

    mockedDatafileManager = {
      getConfig: jest.fn().mockReturnValue(configObj),
    }

    MockedOptimizelySDKWrapper = jest.fn(() => {
      return ({
        projectConfigManager: mockedDatafileManager,
        activate: jest.fn().mockReturnValue('var1'),
        getVariation: jest.fn().mockReturnValue('var1'),
        isFeatureEnabled: jest.fn().mockReturnValue(true),
        getFeatureVariableInteger: jest.fn().mockReturnValue(42),
        getFeatureVariableString: jest.fn().mockReturnValue('result'),
        getFeatureVariableBoolean: jest.fn().mockReturnValue(true),
        getFeatureVariableDouble: jest.fn().mockReturnValue(69),
        track: jest.fn(),
      } as unknown) as optimizely.Client
    })
  })

  describe('activate', () => {
    it('should proxy without UserAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      const result = wrapper.activate('exp')
      expect(result).toBe('var1')
      expect(instance.activate).toHaveBeenCalledWith('exp', userId, {})
    })

    it('should proxy with UserAttributes', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.activate('exp')
      expect(result).toBe('var1')
      expect(instance.activate).toHaveBeenCalledWith('exp', userId, userAttributes)
    })
  })

  describe('getVariation', () => {
    it('should proxy without UserAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      const result = wrapper.getVariation('exp')
      expect(result).toBe('var1')
      expect(instance.getVariation).toHaveBeenCalledWith('exp', userId, {})
    })

    it('should proxy with UserAttributes', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.getVariation('exp')
      expect(result).toBe('var1')
      expect(instance.getVariation).toHaveBeenCalledWith('exp', userId, userAttributes)
    })
  })

  describe('isFeatureEnabled', () => {
    it('should proxy without UserAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      const result = wrapper.isFeatureEnabled('feature1')
      expect(result).toBe(true)
      expect(instance.isFeatureEnabled).toHaveBeenCalledWith('feature1', userId, {})
    })

    it('should proxy with UserAttributes', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.isFeatureEnabled('feature1')
      expect(result).toBe(true)
      expect(instance.isFeatureEnabled).toHaveBeenCalledWith(
        'feature1',
        userId,
        userAttributes,
      )
    })
  })

  describe('getFeatureVariables', () => {
    it('should proxy without UserAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      const result = wrapper.getFeatureVariables('featureKey')
      expect(result).toEqual({
        variableKeyBoolean: true,
        variableKeyDouble: 69,
        variableKeyInteger: 42,
        variableKeyString: 'result',
      })
      expect(instance.getFeatureVariableBoolean).toHaveBeenCalledWith(
        'featureKey',
        'variableKeyBoolean',
        userId,
        {},
      )
      expect(instance.getFeatureVariableInteger).toHaveBeenCalledWith(
        'featureKey',
        'variableKeyInteger',
        userId,
        {},
      )
      expect(instance.getFeatureVariableDouble).toHaveBeenCalledWith(
        'featureKey',
        'variableKeyDouble',
        userId,
        {},
      )
      expect(instance.getFeatureVariableString).toHaveBeenCalledWith(
        'featureKey',
        'variableKeyString',
        userId,
        {},
      )
    })

    it('should proxy with UserAttributes', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.getFeatureVariables('featureKey')
      expect(result).toEqual({
        variableKeyBoolean: true,
        variableKeyDouble: 69,
        variableKeyInteger: 42,
        variableKeyString: 'result',
      })
      expect(instance.getFeatureVariableBoolean).toHaveBeenCalledWith(
        'featureKey',
        'variableKeyBoolean',
        userId,
        userAttributes,
      )
      expect(instance.getFeatureVariableInteger).toHaveBeenCalledWith(
        'featureKey',
        'variableKeyInteger',
        userId,
        userAttributes,
      )
      expect(instance.getFeatureVariableDouble).toHaveBeenCalledWith(
        'featureKey',
        'variableKeyDouble',
        userId,
        userAttributes,
      )
      expect(instance.getFeatureVariableString).toHaveBeenCalledWith(
        'featureKey',
        'variableKeyString',
        userId,
        userAttributes,
      )
    })

    it('should return an empty object when the feature isnt defined', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.getFeatureVariables('whackFeatureKey')
      expect(result).toEqual({})
    })
  })

  describe('getFeatureVariableString', () => {
    it('should proxy without UserAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      const result = wrapper.getFeatureVariableString('featureKey', 'variableKey')
      expect(result).toBe('result')
      expect(instance.getFeatureVariableString).toHaveBeenCalledWith(
        'featureKey',
        'variableKey',
        userId,
        {},
      )
    })

    it('should proxy with UserAttributes', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.getFeatureVariableString('featureKey', 'variableKey')
      expect(result).toBe('result')
      expect(instance.getFeatureVariableString).toHaveBeenCalledWith(
        'featureKey',
        'variableKey',
        userId,
        userAttributes,
      )
    })
  })

  describe('getFeatureVariableBoolean', () => {
    it('should proxy without UserAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      const result = wrapper.getFeatureVariableBoolean('featureKey', 'variableKey')
      expect(result).toBe(true)
      expect(instance.getFeatureVariableBoolean).toHaveBeenCalledWith(
        'featureKey',
        'variableKey',
        userId,
        {},
      )
    })

    it('should proxy with UserAttributes', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.getFeatureVariableBoolean('featureKey', 'variableKey')
      expect(result).toBe(true)
      expect(instance.getFeatureVariableBoolean).toHaveBeenCalledWith(
        'featureKey',
        'variableKey',
        userId,
        userAttributes,
      )
    })
  })

  describe('getFeatureVariableDouble', () => {
    it('should proxy without UserAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      const result = wrapper.getFeatureVariableDouble('featureKey', 'variableKey')
      expect(result).toBe(69)
      expect(instance.getFeatureVariableDouble).toHaveBeenCalledWith(
        'featureKey',
        'variableKey',
        userId,
        {},
      )
    })

    it('should proxy with UserAttributes', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.getFeatureVariableDouble('featureKey', 'variableKey')
      expect(result).toBe(69)
      expect(instance.getFeatureVariableDouble).toHaveBeenCalledWith(
        'featureKey',
        'variableKey',
        userId,
        userAttributes,
      )
    })
  })

  describe('getFeatureVariableInteger', () => {
    it('should proxy without UserAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      const result = wrapper.getFeatureVariableInteger('featureKey', 'variableKey')
      expect(result).toBe(42)
      expect(instance.getFeatureVariableInteger).toHaveBeenCalledWith(
        'featureKey',
        'variableKey',
        userId,
        {},
      )
    })

    it('should proxy with UserAttributes', () => {
      const userId = 'james'
      const userAttributes = {
        plan: 'bronze',
      }
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      const result = wrapper.getFeatureVariableInteger('featureKey', 'variableKey')
      expect(result).toBe(42)
      expect(instance.getFeatureVariableInteger).toHaveBeenCalledWith(
        'featureKey',
        'variableKey',
        userId,
        userAttributes,
      )
    })
  })

  describe('track', () => {
    it('should proxy without userAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      wrapper.track('eventKey')
      expect(instance.track).toHaveBeenCalledWith('eventKey', userId, {}, undefined)
    })

    it('should proxy with userAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const userAttributes = { plan: 'bronze' }
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      wrapper.track('eventKey')
      expect(instance.track).toHaveBeenCalledWith(
        'eventKey',
        userId,
        userAttributes,
        undefined,
      )
    })

    it('should proxy with userAttributes and eventTags', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const userAttributes = { plan: 'bronze' }
      const eventTags = { value: 123 }
      const wrapper = createUserWrapper({
        instance,
        userId,
        userAttributes,
      })

      wrapper.track('eventKey', undefined, undefined, eventTags)
      expect(instance.track).toHaveBeenCalledWith(
        'eventKey',
        userId,
        userAttributes,
        eventTags,
      )
    })

    it('should proxy with overrided userId and userAttributes', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const eventTags = { value: 123 }
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      wrapper.track('eventKey', 'otheruser', { foo: 'bar' })
      expect(instance.track).toHaveBeenCalledWith(
        'eventKey',
        'otheruser',
        { foo: 'bar' },
        undefined,
      )
    })

    it('should proxy with just eventTags in the 2nd argument', () => {
      const userId = 'james'
      const instance = new MockedOptimizelySDKWrapper()
      const eventTags = { value: 123 }
      const wrapper = createUserWrapper({
        instance,
        userId,
      })

      wrapper.track('eventKey', eventTags)
      expect(instance.track).toHaveBeenCalledWith('eventKey', userId, {}, eventTags)
    })
  })
})
