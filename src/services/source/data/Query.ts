import utils from '../../../utils'
import DataSource from './Data'
import Item, { IRef } from './Item'
import ItemList from './ItemList'

export const ORDER_ASC = 'ascend'
export const ORDER_DESC = 'descend'

export const DEFAULT_LIMIT = 20

export interface IQuery {
  from?: number
  limit?: number
  calc_total?: number // 0 | 1
  filter?: { [name: string]: string }
  order?: { [name: string]: 'ascend' | 'descend' }
}

export interface IItemResponse {
  ref: IRef
  data: {}
}

export default class Query {
  private _from?: number
  private _limit: number
  private _filter: {}
  private readonly _order: {}

  constructor(public readonly source: DataSource) {
    this._limit = source.manager.config.dataPageLimit || DEFAULT_LIMIT
    this._filter = {}
    this._order = {}
  }

  sync(): Promise<ItemList> {
    const dbQueryParams: IQuery = {
      calc_total: 1,
      limit: this._limit,
    }

    if (this._from !== undefined) {
      dbQueryParams.from = this._from
    }

    if (Object.keys(this._order).length) {
      dbQueryParams.order = this._order
    }

    if (Object.keys(this._filter).length) {
      dbQueryParams.filter = this._filter
    }

    return this.source
      .createRequest()
      .setQueryParams(dbQueryParams)
      .execute()
      .then((response) => {
        const items = response.items.map((item: IItemResponse) => {
          return new Item(this.source, item.ref).setAttributes(item.data)
        })

        return new ItemList(
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

    if (Object.keys(this._order).length) {
      dbQueryParams.order = this._order
    }

    if (Object.keys(this._filter).length) {
      dbQueryParams.filter = this._filter
    }

    return this.source
      .createRequest()
      .setQueryParams(dbQueryParams)
      .execute()
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
    this._order[field] = dir

    return this
  }

  filterBy(fieldOrFilterObject: {} | string, value?: any): this {
    let filterBy: {} = {}

    if (value === undefined && typeof fieldOrFilterObject === 'string') {
      filterBy[fieldOrFilterObject] = value
    } else if (
      fieldOrFilterObject &&
      typeof fieldOrFilterObject === 'object' &&
      !Array.isArray(fieldOrFilterObject)
    ) {
      filterBy = fieldOrFilterObject
    } else {
      utils.throwError(
        'PG.Query.FilterBy.BadParams',
        `Query::filterBy - received bad params`
      )
    }

    this._filter = {
      ...this._filter,
      ...filterBy,
    }

    return this
  }

  page(page: number): this {
    return this.from(Math.max(Math.floor(page) - 1, 0) * this._limit)
  }
}
