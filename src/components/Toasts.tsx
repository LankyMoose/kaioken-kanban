import {
  memo,
  Signal,
  signal,
  Transition,
  TransitionState,
  useComputed,
  useLayoutEffect,
  useMemo,
  useRef,
} from "kaioken"
import { match } from "lit-match"

export type Toast = {
  id: number
  type: "info" | "success" | "warning" | "danger"
  children: (cancel: () => void) => JSX.Children
  height: number
  expired?: boolean
  pauseOnHover?: boolean
  paused?: boolean
  remaining: Signal<number>
  duration: number
}

const defaultDuration = 13000

const toasts = signal<Toast[]>([])

setInterval(() => {
  let didExpire = false
  for (let i = 0; i < toasts.value.length; i++) {
    const t = toasts.value[i]
    if (t.paused) continue
    t.remaining.value -= 16
    if (t.remaining.value <= 0) {
      didExpire = true
      t.expired = true
    }
  }
  if (didExpire) {
    toasts.notify()
  }
}, 1000 / 60)

let id = 0

type ToastOptions = {
  type: Toast["type"]
  children: (cancel: () => void) => JSX.Children
  pauseOnHover?: boolean
  duration?: number
}
export const toast = (options: ToastOptions) => {
  const { type, children, duration, pauseOnHover } = options

  const _duration = duration ?? defaultDuration
  const toast: Toast = {
    id: ++id,
    type,
    height: 70,
    children,
    remaining: signal(_duration),
    duration: _duration,
    pauseOnHover,
  }

  toasts.value = [...toasts.value, toast]
}

export const Toasts: Kaioken.FC = () => {
  return toasts.value.map((toast, i) => (
    <Transition
      key={toast.id}
      in={!toast.expired}
      initialState="exited"
      duration={{
        in: 50,
        out: 300,
      }}
      onTransitionEnd={(state) => {
        if (state === "exited") {
          toasts.value = toasts.value.filter((t) => t.id !== toast.id)
        }
      }}
      element={(state) => <ToastItem toast={toast} state={state} index={i} />}
    />
  ))
}

type ToastItemProps = {
  toast: Toast
  state: TransitionState
  index: number
}

const ToastItem = memo(({ toast, state, index }: ToastItemProps) => {
  const width = useRef(400)
  const translateX = state === "entered" ? 0 : width.current
  const translateY = useMemo<string>(() => {
    let offset = 0
    const items = toasts.value
    for (let i = 0; i < index; i++) {
      offset -= items[i].height
    }
    return `calc(${offset}px - ${index} * 1rem)`
  }, [index])

  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    const box = ref.current.getBoundingClientRect()
    toast.height = box.height
    width.current = box.width + 32
  }, [])

  return (
    <div
      ref={ref}
      onmouseenter={() => {
        if (!toast.pauseOnHover) return
        toast.paused = true
      }}
      onmouseleave={() => {
        if (!toast.pauseOnHover) return
        toast.paused = false
      }}
      style={{
        transform: `translate(${translateX}px, ${translateY})`,
      }}
      className={[
        "transition-transform duration-300",
        "absolute right-4 bottom-4",
        "rounded flex flex-col items-start justify-between overflow-hidden",
        match(toast.type)
          .with("info", () => "bg-blue-500")
          .with("success", () => "bg-green-500")
          .with("danger", () => "bg-red-500")
          .with("warning", () => "bg-yellow-500")
          .exhaustive(),
      ]}
    >
      <div className="flex gap-2 p-4 items-center">
        {toast.children(() => {
          toast.expired = true
          toasts.notify()
        })}
      </div>
      <ToastProgress toast={toast} />
    </div>
  )
})

function ToastProgress({ toast }: { toast: Toast }) {
  const styles = useComputed(() => {
    const remaining = toast.remaining.value
    return {
      width: `${Math.abs(100 - (remaining / toast.duration) * 100)}%`,
    }
  })

  return <div className="h-1 bg-white/75" style={styles} />
}
