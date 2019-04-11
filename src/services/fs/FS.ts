import { eventEmitter } from '../../decorators'
import { EventEmitterInterface } from '../../utils/EventEmitter'
import Service, { ServiceConfig } from '../Service'
import File from './File'
import Folder from './Folder'

export interface FSConfig {}

@eventEmitter
export default class FS extends Service<FSConfig & ServiceConfig>
  implements EventEmitterInterface {
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
  folder(path: string): Folder {
    return new Folder(this.app, path)
  }

  file(path: string): File {
    return new File(this.app, path)
  }
}
