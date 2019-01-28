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