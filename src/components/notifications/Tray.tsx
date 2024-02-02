import { useSyncExternalStore } from "kaioken"
import {
  Notification,
  type INotification,
  type NotificationType,
} from "./Notification"

const store = {
  value: [] as INotification[],
  listeners: new Set<(value: INotification[]) => void>(),
  subscribe: function (func: (value: INotification[]) => void) {
    this.listeners.add(func)
    return () => this.listeners.delete(func)
  },
  update: function () {
    this.listeners.forEach((listener) => listener(this.value))
  },
}

export function addNotification({
  type = "info",
  text,
  duration = 3000,
}: {
  type?: NotificationType
  text: string
  duration?: number
}) {
  store.value = [
    ...store.value.filter((item) => performance.now() + 5000 >= item.expirey),
    {
      type,
      expirey: performance.now() + duration,
      text,
    },
  ]
  store.update()
}

export function NotificationTray() {
  const notifications = useSyncExternalStore(
    store.subscribe.bind(store),
    () => store.value
  )

  return (
    <div className="notification-tray">
      {notifications.map((notif) => (
        <Notification notification={notif} />
      ))}
    </div>
  )
}
