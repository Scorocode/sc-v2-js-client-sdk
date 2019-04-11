import Application, { ApplicationConfig } from './Application'
import utils from './utils'

const DEFAULT_NAME = '__DEFAULT__'

export default class Scorocode {
  version = '${SDK_VERSION}'
  // ns = {
  //   Scorocode,
  //   Application,
  // }

  // private _factories: { [serviceName: string]: ServiceFactory } = {};
  private _apps: { [appName: string]: Application } = {}

  initApp(
    appConfig: ApplicationConfig,
    name: string = DEFAULT_NAME
  ): Application {
    // init
    if (this._apps[name]) {
      throw utils.throwError(
        'Scorocode.initApp.applicationExists',
        `Application "${name}" is already exists`
      )
    } else {
      this._apps[name] = new Application(this, name, appConfig)
    }

    return this._apps[name]
  }

  app(name: string = DEFAULT_NAME): Application {
    // get app
    const app = this._apps[name]

    if (!app) {
      throw new Error('Application does not exists')
    }

    return app
  }

  // /**
  //  * Регистрация сервиса в scorocode
  //  * @param {string} serviceName
  //  * @param {ServiceFactory} createService
  //  * @param {{}} serviceExport
  //  * @param {boolean} isSingleton
  //  */
  // registerService(
  //   serviceName: string,
  //   createService: ServiceFactory,
  //   serviceExport?: { [name: string]: any },
  //   isSingleton:boolean = false,
  // ) {
  //   if (this._factories[serviceName]) {
  //     throw new Error(`Service "${serviceName}" is already exists`);
  //   }
  //
  //   this._factories[serviceName] = createService;
  //
  //   Application.prototype[serviceName] = function(...args) {
  //     let config: Config = {};
  //     let instanceName: string = DEFAULT_NAME;
  //
  //     if (isSingleton) {
  //       if (typeof args[0] === 'string') {
  //         instanceName = args[0];
  //       } else if (typeof args[0] === 'object') {
  //         config = args[0];
  //       }
  //     } else {
  //       if (args.length > 1) {
  //         config = args[0];
  //         instanceName = args[1];
  //       }
  //
  //       if (args.length === 1) {
  //         instanceName = args[0];
  //       }
  //     }
  //
  //     let service = (this as Application).getService(serviceName, instanceName);
  //
  //     if (!service) {
  //       // todo pass remaining args?
  //       service = (this as Application).createService(createService, serviceName, instanceName, config);
  //     } else if (config) {
  //       service.configure(config);
  //     }
  //
  //     return service;
  //   };
  //
  //   Scorocode.prototype[serviceName] = function(config?: Config) {
  //     const app = (this as Scorocode).app();
  //     let service = app.getService(serviceName);
  //
  //     if (!service) {
  //       // todo pass remaining args?
  //       service = app.createService(createService, serviceName, DEFAULT_NAME, config);
  //     } else if (config) {
  //       service.configure(config);
  //     }
  //
  //     return service;
  //   };
  //
  //   if (serviceExport) {
  //     const target = Scorocode.prototype[serviceName];
  //
  //     Object.keys(serviceExport).forEach((k) => {
  //       target[k] = serviceExport[k];
  //     });
  //   }
  // }

  removeApp(name: string = DEFAULT_NAME): Promise<void> {
    return this.app(name)
      .destroy()
      .then(() => {
        delete this._apps[name]
      })
  }
}
