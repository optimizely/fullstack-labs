import * as optimizely from '@optimizely/optimizely-sdk'
import * as logging from '@optimizely/js-sdk-logging'

const logger = logging.getLogger('ReactSDK')
export type VariableValuesObject = {
  [key: string]: boolean | number | string | null
}

export type UserAttributes = { [attribute: string]: any }

type EventTags = { [tagKey: string]: boolean | number | string }

type TrackEventCallArgs = [
  string,
  string,
  UserAttributes | undefined,
  optimizely.EventTags | undefined
]

type DisposeFn = () => void

type OnUserUpdateHandler = (userInfo: UserInfo) => void

export interface ReactSDKClient extends optimizely.Client {
  user: UserInfo

  onReady(opts?: { timeout?: number }): Promise<any>
  setUser(userInfo: { id: string; userAttributes?: { [key: string]: any } }): void
  onUserUpdate(handler: OnUserUpdateHandler): DisposeFn

  activate(
    experimentKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): string | null

  getVariation(
    experimentKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): string | null

  getFeatureVariables(
    featureKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): VariableValuesObject

  getFeatureVariableString(
    featureKey: string,
    variableKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): string | null

  getFeatureVariableInteger(
    featureKey: string,
    variableKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): number | null

  getFeatureVariableBoolean(
    featureKey: string,
    variableKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): boolean | null

  getFeatureVariableDouble(
    featureKey: string,
    variableKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): number | null

  isFeatureEnabled(
    featureKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): boolean

  track(
    eventKey: string,
    overrideUserId?: string | EventTags,
    overrideAttributes?: UserAttributes,
    eventTags?: EventTags,
  ): void
}

type UserInfo = {
  id: string | null
  attributes: UserAttributes
}

const DEFAULT_ON_READY_TIMEOUT = 5000

class OptimizelyReactSDKClient implements ReactSDKClient {
  public initialConfig: optimizely.Config
  public user: UserInfo = {
    id: null,
    attributes: {},
  }
  public notificationCenter: optimizely.NotificationCenter

  private userPromiseResovler: (user: UserInfo) => void
  private userPromise: Promise<any>
  private isUserPromiseResolved: boolean = false
  private onUserUpdateHandlers: OnUserUpdateHandler[] = []

  protected client: optimizely.Client

  // promise keeping track of async requests for initializing client instance
  private dataReadyPromise: Promise<any>

  /**
   * Creates an instance of OptimizelySDKWrapper.
   * @param {OptimizelySDKWrapperConfig} [config={}]
   * @memberof OptimizelySDKWrapper
   */
  constructor(config: optimizely.Config) {
    this.initialConfig = config

    this.userPromiseResovler = () => {}
    this.client = optimizely.createInstance(config)
    this.notificationCenter = this.client.notificationCenter

    this.userPromise = new Promise(resolve => {
      this.userPromiseResovler = resolve
    })

    this.dataReadyPromise = Promise.all([
      this.userPromise,
      // TODO fix when index.d.ts is updated
      // @ts-ignore
      this.client.onReady(),
    ]).then(() => {
      logger.info('datafile promise fulfilled')
    })
  }

  onReady(config: { timeout?: number } = {}): Promise<any> {
    let timeoutId: number | undefined
    let timeout: number = DEFAULT_ON_READY_TIMEOUT
    if (config && config.timeout !== undefined) {
      timeout = config.timeout
    }

    const timeoutPromise = new Promise(resolve => {
      timeoutId = setTimeout(() => resolve(), timeout) as any
    })

    timeoutPromise.then(() => {
      logger.info(
        'failed to initialize onReady before timeout, either the datafile or user info was not set before the set timeout',
      )
    })

    return Promise.race([this.dataReadyPromise, timeoutPromise]).then(() => {
      clearTimeout(timeoutId)
    })
  }

  setUser(userInfo: { id?: string; attributes?: { [key: string]: any } }): void {
    // TODO add check for valid user
    if (userInfo.id) {
      this.user.id = userInfo.id
    }
    if (userInfo.attributes) {
      this.user.attributes = userInfo.attributes
    }
    if (this.isUserPromiseResolved) {
      this.onUserUpdateHandlers.forEach(handler => handler(this.user))
      // emit notify event
    } else {
      this.userPromiseResovler(this.user)
      this.isUserPromiseResolved = true
    }
  }

  onUserUpdate(handler: OnUserUpdateHandler): DisposeFn {
    this.onUserUpdateHandlers.push(handler)

    return () => {
      const ind = this.onUserUpdateHandlers.indexOf(handler)
      if (ind > -1) {
        this.onUserUpdateHandlers.splice(ind, 1)
      }
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
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): string | null {
    const [userId, userAttributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      logger.info(
        'Not activating experiment "%s" because userId is not set',
        experimentKey,
      )
      return null
    }
    return this.client.activate(experimentKey, userId, userAttributes)
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
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): string | null {
    const [userId, userAttributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      logger.info(
        'getVariation returned null for experiment "%s" because userId is not set',
        experimentKey,
      )
      return null
    }
    return this.client.getVariation(experimentKey, userId, userAttributes)
  }

  track(
    eventKey: string,
    overrideUserId?: string | EventTags,
    overrideAttributes?: UserAttributes,
    eventTags?: EventTags,
  ) {
    if (typeof overrideUserId !== 'undefined' && typeof overrideUserId !== 'string') {
      eventTags = overrideUserId
      overrideUserId = undefined
      overrideAttributes = undefined
    }
    const [userId, attributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )

    if (userId === null) {
      logger.info(
        'track for event "%s" not being sent because userId is not set',
        eventKey,
      )
      // TODO log
      return
    }

    return this.client.track(eventKey, userId, attributes, eventTags)
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
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): boolean {
    const [userId, userAttributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      logger.info(
        'isFeatureEnabled returning false for feature "%s" because userId is not set',
        feature,
      )
      return false
    }
    return this.client.isFeatureEnabled(feature, userId, userAttributes)
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
    featureKey: string,
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): VariableValuesObject {
    const [userId, userAttributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      logger.info(
        'getFeatureVariables returning `{}` for feature "%s" because userId is not set',
        featureKey,
      )
      return {}
    }
    let variableObj: { [key: string]: any } = {}
    try {
      const config = (this.client as any).projectConfigManager.getConfig()
      const feature = config.featureKeyMap[featureKey]
      if (!feature) {
        return {}
      }
      let variables: object[] = feature.variables
      variables.forEach((variableDef: any) => {
        let type: any = variableDef.type
        let key: any = variableDef.key

        switch (type) {
          case 'string':
            variableObj[key] = this.client.getFeatureVariableString(
              featureKey,
              key,
              userId,
              userAttributes,
            )
            break

          case 'boolean':
            variableObj[key] = this.client.getFeatureVariableBoolean(
              featureKey,
              key,
              userId,
              userAttributes,
            )
            break

          case 'integer':
            variableObj[key] = this.client.getFeatureVariableInteger(
              featureKey,
              key,
              userId,
              userAttributes,
            )
            break

          case 'double':
            variableObj[key] = this.client.getFeatureVariableDouble(
              featureKey,
              key,
              userId,
              userAttributes,
            )
            break
        }
      })
    } catch (e) {}

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
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): string | null {
    const [userId, attributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      return null
    }
    return this.client.getFeatureVariableString(feature, variable, userId, attributes)
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
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): boolean | null {
    const [userId, attributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      return null
    }
    return this.client.getFeatureVariableBoolean(feature, variable, userId, attributes)
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
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): number | null {
    const [userId, attributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      return null
    }
    return this.client.getFeatureVariableInteger(feature, variable, userId, attributes)
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
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): number | null {
    const [userId, attributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      return null
    }
    return this.client.getFeatureVariableDouble(feature, variable, userId, attributes)
  }

  /**
   * Get an array of all enabled features
   *
   * @param {string} userId
   * @param {UserAttributes} [attributes]
   * @returns {Array<string>}
   * @memberof OptimizelySDKWrapper
   */
  public getEnabledFeatures(
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): Array<string> {
    const [userId, attributes] = this.getUserIdAndAttributes(
      overrideUserId,
      overrideAttributes,
    )
    if (userId === null) {
      return []
    }
    return this.client.getEnabledFeatures(userId, attributes)
  }

  /**
   * @param {string} experiment
   * @param {string} userId
   * @returns {(string | null)}
   * @memberof OptimizelySDKWrapper
   */
  public getForcedVariation(experiment: string, overrideUserId?: string): string | null {
    const [userId, _] = this.getUserIdAndAttributes(overrideUserId)
    if (userId === null) {
      return null
    }
    return this.client.getForcedVariation(experiment, userId)
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
    overrideUserIdOrVariationKey: string,
    variationKey?: string | null,
  ): boolean {
    let finalUserId: string | null = null
    let finalVariationKey: string | null = null
    if (arguments.length === 2) {
      finalVariationKey = overrideUserIdOrVariationKey
    } else if (arguments.length === 3) {
      const res = this.getUserIdAndAttributes(overrideUserIdOrVariationKey)
      finalUserId = res[0]
      if (variationKey === undefined) {
        // can't have undefined if supplying all 3 arguments
        return false
      }
      finalVariationKey = variationKey
    }

    if (finalUserId === null) {
      return false
    }
    return this.client.setForcedVariation(experiment, finalUserId, finalVariationKey)
  }

  public close() {
    // @ts-ignore
    return this.client.close()
  }

  protected getUserIdAndAttributes(
    overrideUserId?: string,
    overrideAttributes?: UserAttributes,
  ): [string | null, UserAttributes] {
    let finalUserId: string | null =
      overrideUserId === undefined ? this.user.id : overrideUserId
    let finalUserAttributes: UserAttributes =
      overrideAttributes === undefined ? this.user.attributes : overrideAttributes

    return [finalUserId, finalUserAttributes]
  }
}

export function createInstance(config: optimizely.Config): OptimizelyReactSDKClient {
  return new OptimizelyReactSDKClient(config)
}
