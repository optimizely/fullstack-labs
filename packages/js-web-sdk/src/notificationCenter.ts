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
import { NotificationCenter } from "@optimizely/optimizely-sdk";

export class NoopNotificationCenter implements NotificationCenter {
  addNotificationListener(notificationType: string, callback: (args: any) => void): number {
    console.warn('NotificationCenter must be setup after optimizely is initialized. (eg `await optimizely.onReady()`)')
    return -1
  }

  removeNotificationListener(listenerId: number): boolean {
    console.warn('NotificationCenter must be setup after optimizely is initialized. (eg `await optimizely.onReady()`)')
    return false
  }

  clearAllNotificationListeners(): void {
  }

  clearNotificationListeners(notificationType: string): void {
  }
}