import sc from '../../../index'
import Source from '../Source'

declare const __SC_APP_CONFIG__: any

beforeAll(() => {
  sc.initApp(__SC_APP_CONFIG__)
})

afterAll(() => sc.removeApp())

describe('Source tests', () => {
  it('Should return Source service', () => {
    expect(sc.app().source()).toBeInstanceOf(Source)
  })
})
