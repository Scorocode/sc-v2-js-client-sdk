import BaseSource from '../BaseSource'
import Item, { IRef } from './Item'
import Query from './Query'

export default class DataSource extends BaseSource {
  query(): Query {
    return new Query(this)
  }

  item(ref?: IRef): Item {
    return new Item(this, ref)
  }
}
