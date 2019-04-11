import Application from '../../Application'
import { IFileInfo } from '../client/FS'

export default class Folder {
  private _path: string
  private _files?: IFileInfo[]

  constructor(public readonly app: Application, path: string) {
    this._path = path
  }

  get path(): string {
    return this._path
  }

  get files(): IFileInfo[] | void {
    return this._files
  }

  rename(newPath: string): Promise<this> {
    return this.app
      .client()
      .fs.folderRename(this.path, { newPath })
      .then(() => {
        this._path = newPath

        return Promise.resolve(this)
      })
  }

  create(): Promise<this> {
    return this.app
      .client()
      .fs.folderCreate(this.path)
      .then(() => {
        this._files = []

        return Promise.resolve(this)
      })
  }

  delete(): Promise<this> {
    return this.app
      .client()
      .fs.folderDelete(this.path)
      .then(() => {
        this._files = undefined

        return Promise.resolve(this)
      })
  }

  sync(): Promise<this> {
    return this.app
      .client()
      .fs.folderRead(this.path)
      .then((folder) => {
        this._files = folder.filesInfo

        return Promise.resolve(this)
      })
  }
}
