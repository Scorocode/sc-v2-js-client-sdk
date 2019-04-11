export interface EventEmitterInterface {
  on(event: string, listener: () => void): void
  removeListener(event: string, listener: () => void): void
  emit(event: string, ...args: any[]): void
  once(event: string, listener: () => void): void
}

export default class EventEmitter implements EventEmitterInterface {
  private _events: { [name: string]: (() => void)[] } = {}

  get events(): { [name: string]: (() => void)[] } {
    if (!this._events) {
      this._events = {}
    }

    return this._events
  }

  on(event: string, listener: () => void): void {
    if (!this.events[event]) {
      this.events[event] = []
    }

    this.events[event].push(listener)
  }

  removeListener(event: string, listener: () => void): void {
    if (this.events[event]) {
      const idx = this.events[event].indexOf(listener)

      if (idx > -1) {
        this.events[event].splice(idx, 1)
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      const listeners = this.events[event]

      if (listeners) {
        listeners.forEach((handler: (...args: any[]) => void) =>
          handler.apply(this, args)
        )
      }
    }
  }

  once(event: string, listener: (...args: any[]) => void): void {
    const handler = (...args: any[]) => {
      this.removeListener(event, handler)
      listener.apply(this, args)
    }

    this.on(event, handler)
  }
}
