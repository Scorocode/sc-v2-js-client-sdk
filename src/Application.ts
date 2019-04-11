import extend from 'lodash/extend'
import QueryString from 'qs'
import { APP_ID_PLACEHOLDER } from './constants'
/* tslint:disable-next-line:match-default-export-name */
import Request from './request'
import Scorocode from './Scorocode'
// services
import { Auth, AuthConfig } from './services/auth'
import { Client, ClientConfig } from './services/client'
import { FS, FSConfig } from './services/fs'
import { PG, PGConfig } from './services/pg'
import Service from './services/Service'
import { Source, SourceConfig } from './services/source'
import { WS, WSConfig } from './services/ws'
import utils from './utils'
import EventEmitter from './utils/EventEmitter'

export interface ApplicationConfig {
  appId: string
  ssl?: boolean
  host?: string
  port?: number
  wsAutoConnect?: boolean
  requestTimeout?: number
  debug?: boolean
  client?: ClientConfig
  auth?: AuthConfig
  fs?: FSConfig
  pg?: PGConfig
  ws?: WSConfig
  source?: SourceConfig
}

const DEFAULT_APP_CONFIG: ApplicationConfig = {
  appId: '',
  host: `${APP_ID_PLACEHOLDER}.v2.scorocode.ru`,
  ssl: true,
  wsAutoConnect: true,
  requestTimeout: 120000,
  debug: false,
  auth: {
    preserveSession: true,
  },
  pg: {
    defaultLimit: 20,
  },
  ws: {
    url: `wss://ws-${APP_ID_PLACEHOLDER}.v2.scorocode.ru/connect`,
  },
  source: {
    sourcesPath: 'sources/shared',
    describePath: 'sources/describe',
  },
}

enum StatusCodes {
  Unauthorized = 401,
}

export default class Application extends EventEmitter {
  private readonly _sc: Scorocode
  private readonly _name: string
  private readonly _config: ApplicationConfig
  private readonly _services: { [name: string]: Service<any> }
  private _isDestroyed = false

  constructor(sc: Scorocode, name: string, config: ApplicationConfig) {
    super()

    this._sc = sc
    this._name = name
    this._config = extend({}, DEFAULT_APP_CONFIG, config)
    // services
    this._services = {}

    if (this.config.wsAutoConnect) {
      this.ws().establishConnection()
    }
  }

  get name(): string {
    return this._name
  }

  get config(): ApplicationConfig {
    return this._config
  }

  get scorocode(): Scorocode {
    return this._sc
  }

  // services
  public client(): Client
  public client(config?: ClientConfig): Promise<Client>
  public client(config?: ClientConfig) {
    this._checkIsAlive()

    return this.getService<Client>('client', Client, config)
  }

  public auth(): Auth
  public auth(config?: AuthConfig): Promise<Auth>
  public auth(config?: AuthConfig) {
    this._checkIsAlive()

    return this.getService<Auth>('auth', Auth, config)
  }

  public fs(): FS
  public fs(config?: FSConfig): Promise<FS>
  public fs(config?: FSConfig) {
    this._checkIsAlive()

    return this.getService<FS>('fs', FS, config)
  }

  public pg(): PG
  public pg(config?: PGConfig): Promise<PG>
  public pg(config?: PGConfig) {
    this._checkIsAlive()

    return this.getService<PG>('pg', PG, config)
  }

  public ws(): WS
  public ws(config?: WSConfig): Promise<WS>
  public ws(config?: WSConfig) {
    this._checkIsAlive()

    return this.getService<WS>('ws', WS, config)
  }

  public source(): Source
  public source(config?: SourceConfig): Promise<Source>
  public source(config?: SourceConfig) {
    this._checkIsAlive()

    return this.getService<Source>('source', Source, config)
  }

  // register external services
  registerService<T extends Service<any>>(
    name: string,
    constructor: new () => T
  ): void {
    if (Application.prototype[name]) {
      throw new Error('Service name is already used')
    }

    Application.prototype[name] = (config?: {}): T | Promise<T> => {
      this._checkIsAlive()

      return this.getService<T>(name, constructor, config)
    }
  }

  getService<T extends Service<any>>(
    name: string,
    constructor: new (config: any) => T,
    config?: {}
  ): T | Promise<T> {
    this._checkIsAlive()

    // При первоначальной инициализации объект сервиса возращается синхронно
    if (!this._services[name]) {
      this._services[name] = new constructor({
        ...this._config[name],
        ...config,
        app: this,
      })

      if (config) {
        return Promise.resolve(this._services[name] as T)
      }
    } else if (config) {
      // При повторной реинициализации объект возращается асинхронно
      return this._services[name].destroy().then(() => {
        return (this._services[name] = new constructor({
          ...this._config[name],
          ...config,
          app: this,
        }))
      })
    }

    return this._services[name] as T
  }

  destroy(): Promise<void> {
    this._checkIsAlive()

    // destroy app
    return new Promise((resolve) => {
      this._checkIsAlive()

      resolve()
    })
      .then(() =>
        Promise.all(
          Object.values(this._services).map((service) => service.destroy())
        )
      )
      .then(() => {
        this._isDestroyed = true
      })
  }

  createRequest(requestUri: string): Request {
    this._checkIsAlive()

    const request = new Request({
      url: this.createUrl(requestUri),
    })

    if (this.config.requestTimeout) {
      request.setTimeout(this.config.requestTimeout)
    }

    request.on('onRequest', (...args: any[]) => this.emit('onRequest', ...args))
    request.on('onResponseSuccess', (...args: any[]) =>
      this.emit('onResponseSuccess', ...args)
    )
    request.on('onResponseError', (...args: any[]) =>
      this.emit('onResponseError', ...args)
    )

    return request
  }

  createAuthorizedRequest(requestUri: string): Request {
    this._checkIsAlive()

    return this.createRequest(requestUri).use(
      this._applyAccessToken,
      this._refreshTokenFallback
    )
  }

  createAuthenticatedRequest(requestUri: string): Request {
    this._checkIsAlive()

    return this.createRequest(requestUri).use(
      this._applyIdToken,
      this._refreshTokenFallback
    )
  }

  createUrl(requestUri: string, query?: string | {}): string {
    this._checkIsAlive()

    const config = this.config

    const host = (config.host || 'localhost').replace(
      APP_ID_PLACEHOLDER,
      this.config.appId
    )

    let url = `${config.ssl ? 'https' : 'http'}://${host +
      (config.port ? `:${config.port}` : '')}${requestUri}`

    if (typeof query === 'string') {
      url += `?${query}`
    } else if (typeof query === 'object') {
      url += `?${QueryString.stringify(query)}`
    }

    return url
  }

  private _checkIsAlive() {
    if (this._isDestroyed) {
      throw utils.throwError(
        'Application.isNotAlive',
        `Application "${this._name}" is destroyed`
      )
    }
  }

  private _applyAccessToken = (request: Request) => {
    const session = this.auth().currentSession

    if (session) {
      request.setRequestHeader('Authorization', `Bearer ${session.token}`)
    }
  }

  private _applyIdToken = (request: Request) => {
    const session = this.auth().currentSession

    if (session) {
      request.setRequestHeader('Authorization', `Bearer ${session.token}`)
    }
  }

  private _refreshTokenFallback = (
    request: Request,
    response: Promise<any>
  ): Promise<any> => {
    return response.catch((error) => {
      if (error.status === StatusCodes.Unauthorized) {
        if (this.auth().currentSession) {
          return (
            this.auth()
              .refresh()
              // если не удалось обновить токен - возвращаем исходную ошибку
              .catch(() => Promise.reject(error))
              // если токен обновлен запускаем запрос по новой и возвращаем его ответ
              .then(() =>
                request.notUseAfter(this._refreshTokenFallback).execute()
              )
          )
        }
      }

      return Promise.reject(error)
    })
  }
}
