import sc from '../index'
import Auth from '../services/auth/Auth'
import Client from '../services/client/Client'
import FS from '../services/fs/FS'
import PG from '../services/pg/PG'
import WS from '../services/ws/WS'

beforeAll(() => {
  sc.initApp({
    appId: 'test',
  })
})

describe('Application', () => {
  it('Get services', () => {
    expect(sc.app().auth()).toBeInstanceOf(Auth)
    expect(sc.app().client()).toBeInstanceOf(Client)
    expect(sc.app().fs()).toBeInstanceOf(FS)
    expect(sc.app().pg()).toBeInstanceOf(PG)
    expect(sc.app().ws()).toBeInstanceOf(WS)
  })

  it("Getting service and changing it's config", async () => {
    const v = 100

    expect(sc.app().pg().config.defaultLimit).toBe(
      (sc.app().config.pg as any).defaultLimit
    )

    const pg = await sc.app().pg({
      defaultLimit: v,
    })

    expect(pg.config.defaultLimit).toBe(v)

    const pgManager = await sc.app().pg({
      defaultLimit: v,
    })

    expect(pgManager.config.defaultLimit).toBe(v)

    return true
  })
})
