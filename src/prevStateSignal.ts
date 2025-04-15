import { Signal } from "kaioken"

export class PrevStateSignal<T> extends Signal<T> {
  prev: T
  constructor(initialValue: T) {
    super(initialValue)
    this.prev = initialValue

    const superValueSetter = Object.getOwnPropertyDescriptor(
      Signal.prototype,
      "value"
    )!.set
    Object.defineProperties(this, {
      value: {
        set: (value: T) => {
          this.prev = super.peek()
          superValueSetter!.call(this, value)
        },
        get: () => super.value,
      },
    })
  }
}
