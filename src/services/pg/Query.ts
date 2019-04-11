import Application from '../../Application'
import utils from '../../utils'
import { IQuery } from '../client/PG'
import Record from './Record'
import RecordList from './RecordList'

export const ORDER_ASC = 'ascend'
export const ORDER_DESC = 'descend'

export const DEFAULT_LIMIT = 20

export default class Query {
  private _from?: number
  private _limit: number
  private readonly _filter: string[]
  private readonly _order: string[]

  constructor(
    public readonly app: Application,
    public readonly dbId: string,
    public readonly schema: string,
    public readonly table: string
  ) {
    this._limit = (app.config.pg && app.config.pg.defaultLimit) || DEFAULT_LIMIT
    this._filter = []
    this._order = []
  }

  sync(): Promise<RecordList> {
    const dbQueryParams: IQuery = {
      calc_total: 1,
      limit: this._limit,
    }

    if (this._from !== undefined) {
      dbQueryParams.from = this._from
    }

    if (this._order.length) {
      dbQueryParams.order = this._order
    }

    if (this._filter.length) {
      dbQueryParams.filter = this._filter
    }

    return this.app
      .client()
      .pg.getRecordList(this.dbId, this.schema, this.table, dbQueryParams)
      .then((response) => {
        const items = response.items.map((record) => {
          const ref = {}
          response.key.forEach((key) => (ref[key] = record[key]))

          return new Record(
            this.app,
            this.dbId,
            this.schema,
            this.table,
            ref
          ).setAttributes(record)
        })

        return new RecordList(
          response.from,
          response.limit,
          response.total,
          items
        )
      })
  }

  count(): Promise<number> {
    const dbQueryParams: IQuery = {
      from: 0,
      limit: 0,
      calc_total: 1,
    }

    if (this._order.length) {
      dbQueryParams.order = this._order
    }

    if (this._filter.length) {
      dbQueryParams.filter = this._filter
    }

    return this.app
      .client()
      .pg.getRecordList(this.dbId, this.schema, this.table, dbQueryParams)
      .then((response) => response.total)
  }

  from(from: number): this {
    this._from = from

    return this
  }

  limit(limit: number): this {
    this._limit = limit

    return this
  }

  orderBy(field: string, dir: string): this {
    if (dir === ORDER_ASC) {
      this._order.push(`${field}+`)
    } else if (dir === ORDER_DESC) {
      this._order.push(`${field}-`)
    }

    return this
  }

  filterBy(fieldOrFilterObject: {} | string, value?: any): this {
    let filterBy: {} = {}

    if (value === undefined && typeof fieldOrFilterObject === 'string') {
      filterBy[fieldOrFilterObject] = value
    } else if (typeof fieldOrFilterObject === 'object') {
      filterBy = fieldOrFilterObject
    } else {
      utils.throwError(
        'PG.Query.FilterBy.BadParams',
        `Query::filterBy - received bad params`
      )
    }

    const toFilterFields = Object.entries(filterBy)

    toFilterFields.map(([name, val]) => this._filter.push(`${name}:${val}`))

    return this
  }

  page(page: number): this {
    return this.from(Math.max(Math.floor(page) - 1, 0) * this._limit)
  }
}
