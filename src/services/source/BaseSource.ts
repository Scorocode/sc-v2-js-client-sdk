import Source from './Source'

interface IDescription {
  contentType: string
  contentFields?: string[]
  listFields?: string[]
  detailFields?: string[]
}

export default abstract class BaseSource {
  private _description?: IDescription

  constructor(public readonly manager: Source, public readonly name: string) {}

  describe(): Promise<IDescription> {
    if (this._description) {
      return Promise.resolve(this._description)
    }

    return this.manager.app
      .createRequest(
        ['', this.manager.config.describePath, this.name].join('/')
      )
      .execute()
      .then((description) => {
        return (this._description = description)
      })
  }

  createRequest(path?: string) {
    const uri = path
      ? ['', this.manager.config.sourcesPath, this.name, path]
      : ['', this.manager.config.sourcesPath, this.name]

    return this.manager.app.createAuthorizedRequest(uri.join('/'))
  }
}
