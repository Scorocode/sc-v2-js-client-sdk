import BaseSource from '../BaseSource'
import File from './File'

export default class RawSource extends BaseSource {
  file(name: string): File {
    return new File(this, name)
  }
}
