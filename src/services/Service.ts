import Application from '../Application'

export interface ServiceConfig {
  app: Application
}

export default class Service<T extends ServiceConfig> {
  private readonly _app: Application
  private readonly _config: T

  constructor(config: T) {
    this._app = config.app
    this._config = config
  }

  destroy(): Promise<void> {
    return Promise.resolve()
  }

  get app(): Application {
    return this._app
  }

  get config(): T {
    return this._config
  }
}
