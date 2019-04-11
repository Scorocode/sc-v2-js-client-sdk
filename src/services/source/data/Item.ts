import assign from 'lodash/assign'
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
import set from 'lodash/set'
import ScorocodeError from '../../../utils/ScorocodeError'
import DataSource from './Data'

export interface IRef {
  [key: string]: string
}

export default class Item {
  private _ref?: IRef
  private _initialAttributes: {}
  private _attributes: {}
  private _isDeleted: boolean

  constructor(public readonly source: DataSource, ref?: IRef) {
    this._initialAttributes = {}
    this._attributes = {}
    this._isDeleted = false

    if (ref) {
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

  get ref(): IRef | void {
    return this._ref
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
      return this.source
        .createRequest()
        .postJson(this.attributes)
        .execute()
        .then((item) => {
          this.attributes = item.data

          this._ref = item.ref

          return this
        })
    }

    if (
      this.ref &&
      (force || !isEqual(this._initialAttributes, this._attributes))
    ) {
      return this.source
        .createRequest(JSON.stringify(this.ref))
        .putJson(this.attributes)
        .execute()
        .then((item) => {
          this.attributes = item.data

          return this
        })
    }

    return Promise.resolve(this)
  }

  delete(): Promise<this> {
    if (this.ref && !this.isDeleted) {
      return this.source
        .createRequest(JSON.stringify(this.ref))
        .delete()
        .execute()
        .then(() => {
          this._isDeleted = true

          return this
        })
    }

    return Promise.resolve(this)
  }

  sync(): Promise<this> {
    if (this.ref) {
      return this.source
        .createRequest(JSON.stringify(this.ref))
        .execute()
        .then((item) => {
          this.attributes = item.data

          return this
        })
    }

    return Promise.reject<this>(
      new ScorocodeError(
        'source.data.itemUndefined',
        "Cant't sync item - item's ref is not specified."
      )
    )
  }
}
