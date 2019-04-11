import assign from 'lodash/assign'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
import set from 'lodash/set'
import Application from '../../Application'
import { IRecordRef } from '../client/PG'

export default class Record {
  private _ref?: IRecordRef
  private _keys?: string[]
  private _initialAttributes: {}
  private _attributes: {}
  private _isDeleted: boolean

  constructor(
    public readonly app: Application,
    public readonly dbId: string,
    public readonly schema: string,
    public readonly table: string,
    ref?: IRecordRef
  ) {
    this._initialAttributes = {}
    this._attributes = {}
    this._isDeleted = false

    if (ref) {
      this._keys = Object.keys(ref)
      this._ref = ref
    }
  }

  get attributes(): {} {
    return cloneDeep(this._attributes)
  }

  set attributes(attributes: {}) {
    this._initialAttributes = cloneDeep(attributes)
    this._attributes = cloneDeep(attributes)
  }

  get ref(): IRecordRef | void {
    return this._ref
  }

  get keys(): string[] | void {
    return this._keys
  }

  get id(): string {
    return this.ref ? Object.values(this.ref).join('\\') : ''
  }

  get isDeleted(): boolean {
    return this._isDeleted
  }

  setAttributes(attributes: {}): this {
    this.attributes = attributes

    return this
  }

  merge(attributes: {}): this {
    merge(this._attributes, attributes)

    return this
  }

  assign(attributes: {}): this {
    assign(this._attributes, attributes)

    return this
  }

  set(field: string | string[], value: any): this {
    set(this._attributes, field, value)

    return this
  }

  get(field: string | string[]): any {
    return get(this._attributes, field)
  }

  save(force = false): Promise<this> {
    if (!this.ref) {
      return this.app
        .client()
        .pg.insertRecord(this.dbId, this.schema, this.table, this
          .attributes as any)
        .then((record) => {
          this.attributes = record.data

          const keys = record.key
          const ref = {}

          keys.forEach((key) => (ref[key] = this.get(key)))
          this._keys = keys
          this._ref = ref

          return this
        })
    }

    // есть изменения - сохраняем
    if (
      this.ref &&
      (force || !isEqual(this._initialAttributes, this._attributes))
    ) {
      return this.app
        .client()
        .pg.updateRecord(this.dbId, this.schema, this.table, this.ref, this
          .attributes as any)
        .then((record) => {
          this.attributes = record.data

          return this
        })
    }

    return Promise.resolve(this)
  }

  delete(): Promise<this> {
    if (this.ref && !this.isDeleted) {
      return this.app
        .client()
        .pg.deleteRecord(this.dbId, this.schema, this.table, this.ref)
        .then(() => {
          this._isDeleted = true

          return this
        })
    }

    return Promise.resolve(this)
  }

  sync(): Promise<this> {
    if (this.ref) {
      return this.app
        .client()
        .pg.getRecordByRef(this.dbId, this.schema, this.table, this.ref)
        .then((record) => {
          this.attributes = record.data

          return this
        })
    }

    return Promise.resolve(this)
  }
}
