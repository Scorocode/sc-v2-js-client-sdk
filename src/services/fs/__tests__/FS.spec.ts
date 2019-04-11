import sc from '../../../index'
import File from '../File'
import Folder from '../Folder'
import FS from '../FS'

declare const __SC_APP_CONFIG__: any

beforeAll(() => sc.initApp(__SC_APP_CONFIG__))

afterAll(() => sc.removeApp())

describe('FS service', () => {
  it('Should return FS service', () => {
    expect(sc.app().fs()).toBeInstanceOf(FS)
  })

  it('Should return File object', () => {
    expect(
      sc
        .app()
        .fs()
        .file('/file.txt')
    ).toBeInstanceOf(File)
  })

  it('Should return Folder object', () => {
    expect(
      sc
        .app()
        .fs()
        .folder('/')
    ).toBeInstanceOf(Folder)
  })
})
