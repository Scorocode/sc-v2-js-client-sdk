import Client from './Client'

export interface IRecordRef {
  [key: string]: any
}

export interface IRecordData {
  [fieldName: string]: any
}

export interface IRecordResponse {
  key: string[]
  data: IRecordData
}

export interface IRecordList {
  from: number
  limit: number
  total: number
  key: string[]
  items: IRecordData[]
}

export interface IQuery {
  from?: number
  limit?: number
  calc_total?: number // 0 | 1
  filter?: string[] // fieldName:value
  order?: string[] // fieldName+ | fieldName-
}

const API_PREFIX = '/sc/db/api/v2/pg'

/**
 * Postgres Public API
 */
export default class PG {
  constructor(public readonly client: Client) {}

  /**
   * Get record list
   * @param {string} dbName
   * @param {string} dbSchema
   * @param {string} dbTable
   * @param {IQuery} dbQueryParams
   * @returns {Promise<IRecordList>}
   */
  getRecordList(
    dbName: string,
    dbSchema: string,
    dbTable: string,
    dbQueryParams: IQuery
  ): Promise<IRecordList> {
    return this.client.app
      .createAuthenticatedRequest(
        `${API_PREFIX}/${dbName}/${dbSchema}/${dbTable}`
      )
      .setQueryParams(dbQueryParams)
      .execute()
  }

  /**
   * Get record by ID
   * @param {string} dbName
   * @param {string} dbSchema
   * @param {string} dbTable
   * @param {IRecordRef} ref
   * @returns {Promise<IRecordResponse>}
   */
  getRecordByRef(
    dbName: string,
    dbSchema: string,
    dbTable: string,
    ref: IRecordRef
  ): Promise<IRecordResponse> {
    return this.client.app
      .createAuthenticatedRequest(
        `${API_PREFIX}/${dbName}/${dbSchema}/${dbTable}/${Object.values(
          ref
        ).join('/')}`
      )
      .execute()
  }

  /**
   * Insert new record
   * @param {string} dbName
   * @param {string} dbSchema
   * @param {string} dbTable
   * @param {IRecordData} record
   * @returns {Promise<IRecordResponse>}
   */
  insertRecord(
    dbName: string,
    dbSchema: string,
    dbTable: string,
    record: IRecordData
  ): Promise<IRecordResponse> {
    return this.client.app
      .createAuthenticatedRequest(
        `${API_PREFIX}/${dbName}/${dbSchema}/${dbTable}`
      )
      .postJson(record)
      .execute()
  }

  /**
   * Update record
   * @param {string} dbName
   * @param {string} dbSchema
   * @param {string} dbTable
   * @param {IRecordRef} ref
   * @param {IRecordData} record
   * @returns {Promise<IRecordResponse>}
   */
  updateRecord(
    dbName: string,
    dbSchema: string,
    dbTable: string,
    ref: IRecordRef,
    record: IRecordData
  ): Promise<IRecordResponse> {
    return this.client.app
      .createAuthenticatedRequest(
        `${API_PREFIX}/${dbName}/${dbSchema}/${dbTable}/${Object.values(
          ref
        ).join('/')}`
      )
      .putJson(record)
      .execute()
  }

  /**
   * Delete record
   * @param {string} dbName
   * @param {string} dbSchema
   * @param {string} dbTable
   * @param {IRecordRef} ref
   * @returns {Promise<void>}
   */
  deleteRecord(
    dbName: string,
    dbSchema: string,
    dbTable: string,
    ref: IRecordRef
  ): Promise<void> {
    return this.client.app
      .createAuthenticatedRequest(
        `${API_PREFIX}/${dbName}/${dbSchema}/${dbTable}/${Object.values(
          ref
        ).join('/')}`
      )
      .delete()
      .execute()
  }
}
