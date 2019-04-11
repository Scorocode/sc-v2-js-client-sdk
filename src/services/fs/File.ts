import { Readable } from 'stream'
import Application from '../../Application'

export default class File {
  private _path: string
  private _content?: Blob | Readable

  constructor(public readonly app: Application, path: string) {
    this._path = path
  }

  get path(): string {
    return this._path
  }

  get content(): Blob | Readable | void {
    return this._content
  }

  rename(newPath: string): Promise<this> {
    return this.app
      .client()
      .fs.fileRename(this.path, { newPath })
      .then(() => {
        this._path = newPath

        return Promise.resolve(this)
      })
  }

  delete(): Promise<this> {
    return this.app
      .client()
      .fs.fileDelete(this.path)
      .then(() => {
        this._content = undefined

        return Promise.resolve(this)
      })
  }

  sync(): Promise<this> {
    return this.app
      .client()
      .fs.fileDownload(this.path)
      .then((content) => {
        this._content = content

        return Promise.resolve(this)
      })
  }

  upload(content: Blob | Readable): Promise<this> {
    return this.app
      .client()
      .fs.fileUpload(this.path, content)
      .then(() => Promise.resolve(this))
  }
}
