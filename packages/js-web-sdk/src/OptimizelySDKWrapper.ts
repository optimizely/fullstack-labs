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
import * as optimizely from '@optimizely/optimizely-sdk'
import {
  OptimizelyDatafile,
  VariableValue,
  VariableValuesObject,
  VariableDef,
} from './Datafile'
import { find } from './utils'
import { ProvidedDatafileLoader, FetchUrlDatafileLoader } from './DatafileLoaders'
import { ResourceLoader, Resource } from './ResourceManager'
import { NoopNotificationCenter } from './notificationCenter';

// export types
export { OptimizelyDatafile }
export { VariableValuesObject, VariableValue }

type Partial<T> = { [P in keyof T]?: T[P] }

// TODO use optimizely.UserAttributes when this is fixed in
// https://github.com/optimizely/javascript-sdk/issues/211
type UserAttributes = {
  [attribute: string]: any
}

export interface OptimizelySDKWrapperConfig extends Partial<optimizely.Config> {
  datafile?: OptimizelyDatafile
  datafileUrl?: string
  sdkKey?: string
}

type TrackEventCallArgs = [
  string,
  string,
  UserAttributes | undefined,
  optimizely.EventTags | undefined
]

export interface OptimizelyClientWrapper extends optimizely.Client {
  onReady(config: { timeout?: number }): Promise<boolean>

  getFeatureVariables(
    feature: string,
    userId: string,
    attributes?: UserAttributes,
  ): VariableValuesObject
}

/**
 * @export
 * @class OptimizelySDKWrapper
 * @implements {IOptimizelySDKWrapper}
 */
export class OptimizelySDKWrapper implements OptimizelyClientWrapper {
  public instance: optimizely.Client
  public isInitialized: boolean
  public notificationCenter: optimizely.NotificationCenter;

  private datafileResource: Resource<OptimizelyDatafile>
  public datafile: OptimizelyDatafile | null

  private initialConfig: OptimizelySDKWrapperConfig

  private trackEventQueue: Array<TrackEventCallArgs>
  // promise keeping track of async requests for initializing client instance
  // This will be `datafile` and `attributes`
  private initializingPromise: Promise<any>

  /**
   * Creates an instance of OptimizelySDKWrapper.
   * @param {OptimizelySDKWrapperConfig} [config={}]
   * @memberof OptimizelySDKWrapper
   */
  constructor(config: OptimizelySDKWrapperConfig = {}) {
    this.notificationCenter = new NoopNotificationCenter()

    this.initialConfig = config
    this.isInitialized = false
    this.datafile = null
    this.trackEventQueue = []

    this.datafileResource = this.setupDatafileResource(config)

    if (this.datafileResource.hasLoaded) {
      this.onInitialized()
      this.initializingPromise = Promise.resolve()
    } else {
      this.initializingPromise = this.datafileResource.promise.then(() => {
        this.onInitialized()
      })
    }
  }

  /**
   * onReady happens when the datafile and attributes are fully loaded
   * Returns a promise where the resolved value is a boolean indicating whether
   * the optimizely instance has been initialized.  This only is false when
   * you supply a timeout

   * @param {{ timeout?: number }} [config={}]
   * @returns {Promise<boolean>}
   * @memberof OptimizelySDKWrapper
   */
  public onReady(config: { timeout?: number } = {}): Promise<boolean> {
    let timeoutId: number | undefined

    if (config.timeout == null) {
      return this.initializingPromise.then(() => true, reason => false)
    } else {
      // handle the case where its not initialized and timeout is set

      return Promise.race([
        this.initializingPromise,
        new Promise(resolve => {
          timeoutId = setTimeout(() => resolve(), config.timeout)
        }),
      ]).then(() => {
        if (this.isInitialized && timeoutId) {
          clearTimeout(timeoutId)
        }
        return this.isInitialized
      })
    }
  }

  /**
   * @param {string} experimentKey
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {(string | null)}
   * @memberof OptimizelySDKWrapper
   */
  public activate(
    experimentKey: string,
    userId: string,
    attributes?: UserAttributes,
  ): string | null {
    if (!this.isInitialized) {
      return null
    }
    return this.instance.activate(experimentKey, userId, attributes)
  }

  /**
   *
   *
   * @param {string} experimentKey
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {(string | null)}
   * @memberof OptimizelySDKWrapper
   */
  public getVariation(
    experimentKey: string,
    userId: string,
    attributes?: UserAttributes,
  ): string | null {
    if (!this.isInitialized) {
      return null
    }
    return this.instance.getVariation(experimentKey, userId, attributes)
  }

  /**
   * @param {string} eventKey
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @param {optimizely.EventTags} [eventTags]
   * @memberof OptimizelySDKWrapper
   */
  public track(
    eventKey: string,
    userId: string,
    attributes?: UserAttributes,
    eventTags?: optimizely.EventTags,
  ): void {
    if (!this.isInitialized) {
      this.trackEventQueue.push([eventKey, userId, attributes, eventTags])
      return
    }
    this.instance.track(eventKey, userId, attributes, eventTags)
  }

  /**
   * Note: in the case where the feature isnt in the datafile or the datafile hasnt been
   * loaded, this will return `false`
   *
   * @param {string} feature
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {boolean}
   * @memberof OptimizelySDKWrapper
   */
  public isFeatureEnabled(
    feature: string,
    userId: string,
    attributes?: UserAttributes,
  ): boolean {
    if (!this.isInitialized) {
      return false
    }
    return this.instance.isFeatureEnabled(feature, userId, attributes)
  }

  /**
   * Get all variables for a feature, regardless of the feature being enabled/disabled
   *
   * @param {string} feature
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {VariableValuesObject}
   * @memberof OptimizelySDKWrapper
   */
  public getFeatureVariables(
    feature: string,
    userId: string,
    attributes?: UserAttributes,
  ): VariableValuesObject {
    if (!this.isInitialized) {
      return {}
    }
    const variableDefs = this.getVariableDefsForFeature(feature)
    if (!variableDefs) {
      // TODO: error
      return {}
    }

    const variableObj: VariableValuesObject = {}
    variableDefs.forEach(({ key, type }) => {
      switch (type) {
        case 'string':
          variableObj[key] = this.instance.getFeatureVariableString(
            feature,
            key,
            userId,
            attributes,
          )
          break

        case 'boolean':
          variableObj[key] = this.instance.getFeatureVariableBoolean(
            feature,
            key,
            userId,
            attributes,
          )
          break

        case 'integer':
          variableObj[key] = this.instance.getFeatureVariableInteger(
            feature,
            key,
            userId,
            attributes,
          )
          break

        case 'double':
          variableObj[key] = this.instance.getFeatureVariableDouble(
            feature,
            key,
            userId,
            attributes,
          )
          break
      }
    })

    return variableObj
  }

  /**
   * @param {string} feature
   * @param {string} variable
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {(string | null)}
   * @memberof OptimizelySDKWrapper
   */
  public getFeatureVariableString(
    feature: string,
    variable: string,
    userId: string,
    attributes?: UserAttributes,
  ): string | null {
    if (!this.isInitialized) {
      return null
    }

    return this.instance.getFeatureVariableString(feature, variable, userId, attributes)
  }

  /**
   * @param {string} feature
   * @param {string} variable
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {(boolean | null)}
   * @memberof OptimizelySDKWrapper
   */
  public getFeatureVariableBoolean(
    feature: string,
    variable: string,
    userId: string,
    attributes?: UserAttributes,
  ): boolean | null {
    if (!this.isInitialized) {
      return null
    }

    return this.instance.getFeatureVariableBoolean(feature, variable, userId, attributes)
  }

  /**
   * @param {string} feature
   * @param {string} variable
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {(number | null)}
   * @memberof OptimizelySDKWrapper
   */
  public getFeatureVariableInteger(
    feature: string,
    variable: string,
    userId: string,
    attributes?: UserAttributes,
  ): number | null {
    if (!this.isInitialized) {
      return null
    }

    return this.instance.getFeatureVariableInteger(feature, variable, userId, attributes)
  }

  /**
   * @param {string} feature
   * @param {string} variable
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {(number | null)}
   * @memberof OptimizelySDKWrapper
   */
  public getFeatureVariableDouble(
    feature: string,
    variable: string,
    userId: string,
    attributes?: UserAttributes,
  ): number | null {
    if (!this.isInitialized) {
      return null
    }
    return this.instance.getFeatureVariableDouble(feature, variable, userId, attributes)
  }

  /**
   * Get an array of all enabled features
   *
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {Array<string>}
   * @memberof OptimizelySDKWrapper
   */
  public getEnabledFeatures(userId: string, attributes?: UserAttributes): Array<string> {
    if (!this.isInitialized) {
      return []
    }
    return this.instance.getEnabledFeatures(userId, attributes)
  }

  /**
   * @param {string} experiment
   * @param {string} userId
   * @returns {(string | null)}
   * @memberof OptimizelySDKWrapper
   */
  public getForcedVariation(experiment: string, userId: string): string | null {
    return this.instance.getForcedVariation(experiment, userId)
  }

  /**
   * @param {string} experiment
   * @param {string} userId
   * @param {string} variationKey
   * @returns {boolean}
   * @memberof OptimizelySDKWrapper
   */
  public setForcedVariation(
    experiment: string,
    userId: string,
    variationKey: string,
  ): boolean {
    return this.instance.setForcedVariation(experiment, userId, variationKey)
  }

  protected getVariableDefsForFeature(feature: string): VariableDef[] | null {
    if (!this.datafile) {
      return null
    }

    const featureDef = find(this.datafile.featureFlags, entry => entry.key === feature)
    if (!featureDef) {
      return null
    }

    return featureDef.variables
  }

  private flushTrackEventQueue(): void {
    while (this.trackEventQueue.length) {
      const args = this.trackEventQueue.shift()
      this.track.apply(this, args)
    }
  }

  private setupDatafileResource(
    config: OptimizelySDKWrapperConfig,
  ): Resource<OptimizelyDatafile> {
    let datafileLoader: ResourceLoader<OptimizelyDatafile>

    if (config.datafile) {
      datafileLoader = new ProvidedDatafileLoader({
        datafile: config.datafile,
      })
    } else if (config.datafileUrl) {
      datafileLoader = new FetchUrlDatafileLoader({
        datafileUrl: config.datafileUrl,
      })
    } else if (config.sdkKey) {
      datafileLoader = new FetchUrlDatafileLoader({
        sdkKey: config.sdkKey,
      })
    } else {
      throw new Error('Must supply either "datafile", "datafileUrl", "sdkKey"')
    }

    return new Resource(datafileLoader)
  }

  private onInitialized() {
    const datafile = this.datafileResource.value
    if (datafile) {
      this.datafile = datafile
    }

    // can initialize check
    if (!this.datafile) {
      return
    }

    this.isInitialized = true
    this.instance = optimizely.createInstance({
      ...this.initialConfig,
      datafile: this.datafile,
    })

    this.notificationCenter = this.instance.notificationCenter
    // TODO: make sure this is flushed after notification listeners can be added
    this.flushTrackEventQueue()
  }
}
