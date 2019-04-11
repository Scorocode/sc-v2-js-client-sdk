import { Readable } from 'stream'
import Client from './Client'

export interface IRenameRequest {
  newPath: string
}

export interface IFileInfo {
  isDir: boolean
  path: string
}

export interface IFolderInfo {
  path: string
  filesInfo: IFileInfo[]
}

const API_PREFIX = '/sc/fs/api/v2'

/**
 * File system API
 */
export default class FS {
  constructor(public readonly client: Client) {}

  /*
    Folder API
   */

  /**
   * Read folder's items
   * @param {string} path
   * @returns {Promise<IFolderInfo>}
   */
  folderRead(path: string): Promise<IFolderInfo> {
    return this.client.app
      .createAuthorizedRequest(`${API_PREFIX}/folders/${path}`)
      .execute()
  }

  /**
   * Create folder
   * @param {string} path
   * @returns {Promise<void>}
   */
  folderCreate(path: string): Promise<void> {
    return this.client.app
      .createAuthorizedRequest(`${API_PREFIX}/folders/${path}`)
      .postJson({})
      .execute()
  }

  /**
   * Rename folder
   * @param {string} path
   * @param {IRenameRequest} payload
   * @returns {Promise<void>}
   */
  folderRename(path: string, payload: IRenameRequest): Promise<void> {
    return this.client.app
      .createAuthorizedRequest(`${API_PREFIX}/folders/${path}`)
      .putJson(payload)
      .execute()
  }

  /**
   * Delete folder
   * @param {string} path
   * @returns {Promise<void>}
   */
  folderDelete(path: string): Promise<void> {
    return this.client.app
      .createAuthorizedRequest(`${API_PREFIX}/folders/${path}`)
      .delete()
      .execute()
  }

  /*
    File API
   */

  /**
   * Download file
   * @param {string} path
   * @returns {Promise<Blob | Readable>}
   */
  fileDownload(path: string): Promise<Blob | Readable> {
    return this.client.app
      .createAuthorizedRequest(`${API_PREFIX}/files/${path}`)
      .execute()
  }

  /**
   * Upload file
   * @param {string} path
   * @param {Blob | Readable} payload
   * @returns {Promise<void>}
   */
  fileUpload(path: string, payload: Blob | Readable): Promise<void> {
    return this.client.app
      .createAuthorizedRequest(`${API_PREFIX}/files/${path}`)
      .upload({
        file: payload,
      })
      .execute()
  }

  /**
   * Rename file
   * @param {string} path
   * @param {IRenameRequest} payload
   * @returns {Promise<void>}
   */
  fileRename(path: string, payload: IRenameRequest): Promise<void> {
    return this.client.app
      .createAuthorizedRequest(`${API_PREFIX}/files/${path}`)
      .putJson(payload)
      .execute()
  }

  /**
   * Delete file
   * @param {string} path
   * @returns {Promise<void>}
   */
  fileDelete(path: string): Promise<void> {
    return this.client.app
      .createAuthorizedRequest(`${API_PREFIX}/files/${path}`)
      .delete()
      .execute()
  }
}
