import Application from '../Application'
import sc from '../index'

describe('Scorocode manager', () => {
  it('Creates and destroys default application', async () => {
    sc.initApp({
      appId: 'test',
    })

    expect(sc.app()).toBeInstanceOf(Application)

    await sc.removeApp()

    expect(() => {
      sc.app()
    }).toThrow('Application does not exists')

    return true
  })
})
