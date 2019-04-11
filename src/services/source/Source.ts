import { eventEmitter } from '../../decorators'
import utils from '../../utils'
import { EventEmitterInterface } from '../../utils/EventEmitter'
import Service, { ServiceConfig } from '../Service'
import DataSource from './data/Data'
import RawSource from './raw/Raw'

export interface SourceConfig {
  sourcesPath?: string
  describePath?: string
  dataPageLimit?: number
}

interface ISourceMap {
  [name: string]: any
}

const DEFAULT_CONFIG: SourceConfig = {
  sourcesPath: '',
  describePath: '',
  dataPageLimit: 10,
}

@eventEmitter
export default class Source extends Service<SourceConfig & ServiceConfig>
  implements EventEmitterInterface {
  private _dataSources: ISourceMap = {}
  private _rawSources: ISourceMap = {}

  constructor(config: SourceConfig & ServiceConfig) {
    super({
      ...DEFAULT_CONFIG,
      ...config,
    })
  }

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

  // api
  data(sourceName: string): DataSource {
    if (!this._dataSources[sourceName]) {
      const source: DataSource = (this._dataSources[
        sourceName
      ] = new DataSource(this, sourceName))

      if (this.app.config.debug) {
        source
          .describe()
          .then((description) => {
            if (description.contentType !== 'application/json') {
              utils.throwError(
                'source.data.wrongContentType',
                `"${sourceName}" source has wrong content type. Content type should be "application/json".`
              )
            }
          })
          .catch((err) => {
            utils.throwError(
              'source.cantDescribe',
              `Can't get "${sourceName}" source description. Got error: ${
                err.message
              }.`
            )
          })
      }
    }

    return this._dataSources[sourceName]
  }

  raw(sourceName: string): RawSource {
    if (!this._rawSources[sourceName]) {
      const source: RawSource = (this._rawSources[sourceName] = new RawSource(
        this,
        sourceName
      ))

      if (this.app.config.debug) {
        console.log('describe')
        source
          .describe()
          .then((description) => {
            console.log('then', description)
            if (description.contentType !== 'application/octet-stream') {
              utils.throwError(
                'source.raw.wrongContentType',
                `"${sourceName}" source has wrong content type. Content type should be "application/octet-stream".`
              )
            }
          })
          .catch((err) => {
            console.log('catch', err)

            utils.throwError(
              'source.cantDescribe',
              `Can't get "${sourceName}" source description. Got error code ${
                err.code
              }.`
            )
          })
      }
    }

    return this._rawSources[sourceName]
  }
}
