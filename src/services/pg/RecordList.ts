import Record from './Record'

export default class RecordList {
  public readonly page: number // calculated page number
  public readonly totalPages: number // total pages
  public readonly pageSize: number // record's limit

  constructor(
    public readonly from: number, // skipped records
    public readonly limit: number, // record's limit
    public readonly total: number, // total records
    public readonly items: Record[] // records
  ) {
    this.page = Math.floor(from / limit) + 1
    this.pageSize = limit
    this.totalPages = Math.ceil(this.total / limit)
  }
}
