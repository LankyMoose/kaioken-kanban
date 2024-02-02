import { Transition, useEffect, useState } from "kaioken"
import "./Notification.css"

type NotificationType = "info" | "success" | "danger" | "warning"

interface INotification {
  type: NotificationType
  text: string
  expirey: number
}

export { Notification, type INotification, type NotificationType }

function Notification({
  notification: { type, text, expirey },
}: {
  notification: INotification
}) {
  const [removed, setRemoved] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.now() >= expirey) {
        setRemoved(true)
      }
    }, 1e3 / 15) // 15fps
    return () => clearInterval(interval)
  }, [])

  let className = ""
  switch (type) {
    case "danger":
      className = "notification bg-red-700"
      break
    case "warning":
      className = "notification bg-orange-700"
      break
    case "success":
      className = "notification bg-green-700"
      break
    case "info":
    default:
      className = "notification bg-cyan-700"
  }

  return (
    <Transition
      in={!removed}
      timings={[40, 300, 150, 300]}
      element={(state) => {
        if (state === "exited") return null
        const translateX = state === "entered" ? 0 : 100
        const opacity = state === "entered" ? "1" : "0"
        const maxHeight = state === "entered" ? "100vh" : "0"
        const marginBottom = state === "entered" ? "0.5rem" : "0"
        return (
          <div
            className={className}
            style={{
              transform: `translateX(${translateX}%)`,
              opacity,
              maxHeight,
              marginBottom,
            }}
          >
            <div className="inner text-sm">{text}</div>
          </div>
        )
      }}
    />
  )
}
