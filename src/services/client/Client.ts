import Service, { ServiceConfig } from '../Service'

import { eventEmitter } from '../../decorators'
import { EventEmitterInterface } from '../../utils/EventEmitter'
import Auth from './Auth'
import FS from './FS'
import PG from './PG'

export interface ClientConfig {}

@eventEmitter
export default class Client extends Service<ClientConfig & ServiceConfig>
  implements EventEmitterInterface {
  public readonly auth: Auth
  public readonly pg: PG
  public readonly fs: FS

  constructor(config: ClientConfig & ServiceConfig) {
    super(config)

    this.auth = new Auth(this)
    this.pg = new PG(this)
    this.fs = new FS(this)
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
}
