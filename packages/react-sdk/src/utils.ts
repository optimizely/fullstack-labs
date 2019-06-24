import * as optimizely from '@optimizely/optimizely-sdk'

type User = {
  id: string
  attributes: optimizely.UserAttributes
}

export function areUsersEqual(user1: User, user2: User): boolean {
  if (user1.id !== user2.id) {
    return false
  }

  const user1keys = Object.keys(user1.attributes)
  const user2keys = Object.keys(user2.attributes)
  user1keys.sort()
  user2keys.sort()

  const areKeysLenEqual = user1keys.length === user2keys.length
  if (!areKeysLenEqual) {
    return false
  }

  for (let i = 0; i < user1keys.length; i++) {
    const key1 = user1keys[i]
    const key2 = user2keys[i]
    if (key1 !== key2) {
      return false
    }

    if (user1.attributes[key1] !== user2.attributes[key2]) {
      return false
    }
  }

  return true
}
