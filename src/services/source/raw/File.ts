import { Readable } from 'stream'
import RawSource from './Raw'

export default class File {
  private readonly _name: string
  private _content?: Blob | Readable
  private _isDeleted: boolean

  constructor(public readonly source: RawSource, name: string) {
    this._name = name
    this._isDeleted = false
  }

  get name(): string {
    return this._name
  }

  get content(): Blob | Readable | void {
    return this._content
  }

  get isDeleted(): boolean {
    return this._isDeleted
  }

  delete(): Promise<this> {
    return this.source
      .createRequest(this.name)
      .delete()
      .execute()
      .then(() => {
        this._content = undefined
        this._isDeleted = true

        return Promise.resolve(this)
      })
  }

  sync(): Promise<this> {
    return this.source
      .createRequest(this.name)
      .execute()
      .then((content) => {
        this._content = content

        return Promise.resolve(this)
      })
  }

  upload(content: Blob | Readable): Promise<this> {
    return this.source
      .createRequest(this.name)
      .postFile(content)
      .execute()
      .then(() => Promise.resolve(this))
  }
}
