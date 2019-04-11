import { eventEmitter } from '../../decorators'
import { EventEmitterInterface } from '../../utils/EventEmitter'
import ISubscription from '../../utils/ISubscription'
import ScorocodeError from '../../utils/ScorocodeError'
import { IStorage, LocalStorage, Storage } from '../../utils/Storages'
import { ISession } from '../client/Auth'
import Service, { ServiceConfig } from '../Service'
import Session from './Session'

export interface AuthConfig {
  storage?: IStorage
  preserveSession?: boolean
}

@eventEmitter
export default class Auth extends Service<AuthConfig & ServiceConfig>
  implements EventEmitterInterface {
  private _currentSession?: Session
  private _storage?: IStorage

  // EventEmitter interface implementation
  on(event: string, listener: (...args: any[]) => void): void {
    return
  }
  removeListener(event: string, listener: (...args: any[]) => void): void {
    return
  }
  emit(event: string, ...args: any[]): void {
    return
  }
  once(event: string, listener: (...args: any[]) => void): void {
    return
  }

  destroy(): Promise<void> {
    return Promise.resolve()
  }

  // Auth API
  get storage(): IStorage {
    if (this.config.storage) {
      return this.config.storage
    } else {
      if (!this._storage) {
        try {
          this._storage = new LocalStorage()
        } catch (e) {
          this._storage = new Storage()
        }
      }

      return this._storage
    }
  }

  get currentSession(): Session | void {
    return this._currentSession
  }

  signIn(email: string, password: string): Promise<Session> {
    return this.app
      .client()
      .auth.signin({
        email,
        password,
      })
      .then((session) => {
        this._setCurrentSession(session)

        return this.currentSession as Session
      })
  }

  signUp(email: string, password: string): Promise<Session> {
    return this.app
      .client()
      .auth.signup({
        email,
        password,
      })
      .then((session) => {
        this._setCurrentSession(session)

        return this.currentSession as Session
      })
  }

  signOut(): Promise<void> {
    if (this.currentSession) {
      return this.app
        .client()
        .auth.signout({
          token: this.currentSession.token,
        })
        .then(() => {
          this._setCurrentSession()
        })
    }

    return Promise.resolve()
  }

  refresh(): Promise<Session> {
    if (this.currentSession) {
      return this.app
        .client()
        .auth.refreshSession({
          token: this.currentSession.refreshToken,
        })
        .then((session) => {
          this._setCurrentSession(session)

          return this.currentSession as Session
        })
    }

    return Promise.reject<Session>(
      new ScorocodeError(
        'auth.refresh.sessionUndefined',
        "Can't refresh undefined session"
      )
    )
  }

  authorize(givenSession?: ISession): Promise<Session> {
    let session = givenSession

    if (!session && this.config.preserveSession) {
      // restore session from storage
      session = this._getPreservedSession()

      if (!session) {
        this._setCurrentSession()

        return Promise.reject(
          new ScorocodeError(
            'auth.authorize.unsavedSession',
            "Can't preserved user's session in storage"
          )
        )
      }
    }

    if (session) {
      return this.app
        .client()
        .auth.verifyToken({
          token: session.token,
        })
        .then(() => {
          this._setCurrentSession(session)

          return this.currentSession as any
        })
        .catch(() => {
          return this.app
            .client()
            .auth.refreshSession({
              token: (session as any).refreshToken,
            })
            .catch(() => {
              this._setCurrentSession() // clear bad session

              return Promise.reject(
                new ScorocodeError(
                  'auth.authorize.badSession',
                  "Can't reuse stored session"
                )
              )
            })
        })
    }

    this._setCurrentSession()

    return Promise.reject(
      new ScorocodeError(
        'auth.authorize.undefinedSession',
        "User's session is not specified"
      )
    )
  }

  onSessionChanged(handler: (session: ISession) => void): ISubscription {
    this.on('onSessionChanged', handler)

    return {
      unsubscribe: (): void => {
        this.removeListener('onSessionChanged', handler)
      },
    }
  }

  private _getPreservedSession(): ISession | undefined {
    try {
      const session = this.storage.get(
        this._makeSessionStorageKey(this.app.name)
      )

      if (session) {
        return JSON.parse(session)
      }
    } catch (e) {
      // nothing do
    }
  }

  private _preserveSession() {
    if (this._currentSession) {
      this.storage.set(
        this._makeSessionStorageKey(this.app.name),
        this._currentSession.json
      )
    } else {
      this.storage.remove(this._makeSessionStorageKey(this.app.name))
    }
  }

  private _makeSessionStorageKey(id: string): string {
    return `auth.currentSession.${id}`
  }

  private _setCurrentSession = (session?: ISession): void => {
    this._currentSession = session ? new Session(session) : undefined

    if (this.config.preserveSession) {
      this._preserveSession()
    }

    this.emit('onSessionChanged', this._currentSession)
  }
}
