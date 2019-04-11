import utils from './index'

export interface IStorage {
  get(key: string): any
  set(key: string, value: string): void
  remove(key: string): void

  // addStorageListener(handler: (event: StorageEvent) => void) {}
  // removeStorageListener(handler: (event: StorageEvent) => void) {}
}

export interface LocalStorageConfig {
  keyPrefix?: string
}

export class LocalStorage implements IStorage {
  private readonly _keyPrefix: string

  constructor(config: LocalStorageConfig = {}) {
    this._keyPrefix = config.keyPrefix || 'scorocode'

    if (typeof utils.global.localStorage === 'undefined') {
      utils.throwError(
        'auth/localStorage',
        "LocalStorage does't exists. Probably it is a wrong environment"
      )
    }
  }

  get(key: string): any {
    return localStorage.getItem(this._makeKey(key))
  }

  set(key: string, value: string): void {
    localStorage.setItem(this._makeKey(key), value)
  }

  remove(key: string): void {
    localStorage.removeItem(this._makeKey(key))
  }

  private _makeKey(key: string): string {
    return `${this._keyPrefix}.${key}`
  }
}

export class Storage implements IStorage {
  private _storage: { [key: string]: any } = {}

  get(key: string): any {
    return this._storage[key]
  }

  set(key: string, value: string): void {
    this._storage[key] = value
  }

  remove(key: string): void {
    delete this._storage[key]
  }
}
