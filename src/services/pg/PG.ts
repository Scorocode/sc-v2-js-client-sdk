import { eventEmitter } from '../../decorators'
import { EventEmitterInterface } from '../../utils/EventEmitter'
import { IRecordRef } from '../client/PG'
import Service, { ServiceConfig } from '../Service'
import Query from './Query'
import Record from './Record'

export interface PGConfig {
  defaultLimit?: number
}

@eventEmitter
export default class PG extends Service<PGConfig & ServiceConfig>
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
  record(
    dbId: string,
    schema: string,
    table: string,
    ref?: IRecordRef
  ): Record {
    return new Record(this.app, dbId, schema, table, ref)
  }

  query(dbId: string, schema: string, table: string): Query {
    return new Query(this.app, dbId, schema, table)
  }
}
