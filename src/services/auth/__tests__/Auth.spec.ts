/* tslint:disable:no-magic-numbers */
import sc from '../../../index'
import Session from '../Session'

declare const __SC_APP_CONFIG__: any

const TEST_USER_EMAIL = 'test_user@mail.com'
const TEST_USER_PASSWORD = '123456'

beforeEach(() => sc.initApp(__SC_APP_CONFIG__))

afterEach(async () => sc.removeApp())

describe('Auth integration tests', () => {
  it('Should sign in, sign out and refresh session', async () => {
    const fn = jest.fn()

    sc.app()
      .auth()
      .on('onSessionChanged', fn)

    // sign in
    await sc
      .app()
      .auth()
      .signIn(TEST_USER_EMAIL, TEST_USER_PASSWORD)

    const session = sc.app().auth().currentSession as Session
    expect(session).toMatchObject({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: expect.objectContaining({
        id: expect.any(String),
        email: TEST_USER_EMAIL,
      }),
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn.mock.calls[0][0]).toBe(session)

    // refresh
    await sc
      .app()
      .auth()
      .refresh()

    const _session = sc.app().auth().currentSession as Session
    expect(_session).toMatchObject({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: expect.objectContaining({
        id: expect.any(String),
        email: TEST_USER_EMAIL,
      }),
    })
    expect(_session.token).not.toEqual(session.token)
    expect(_session.refreshToken).not.toEqual(session.refreshToken)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn.mock.calls[1][0]).toBe(_session)

    // sign out
    await sc
      .app()
      .auth()
      .signOut()

    expect(sc.app().auth().currentSession).toBe(undefined)
    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn.mock.calls[2][0]).toBe(undefined)

    return true
  })

  it('Test Auth::onSessionChanged()', async () => {
    const fn = jest.fn()

    const subscription = sc
      .app()
      .auth()
      .onSessionChanged(fn)

    // sign in
    await sc
      .app()
      .auth()
      .signIn(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    // sign in
    await sc
      .app()
      .auth()
      .signIn(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    expect(fn).toHaveBeenCalledTimes(2)

    subscription.unsubscribe()

    // sign in
    await sc
      .app()
      .auth()
      .signIn(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('Test Auth::authorize()', async () => {
    const fn = jest.fn()

    const subscription = sc
      .app()
      .auth()
      .onSessionChanged(fn)

    // sign in
    await sc
      .app()
      .auth()
      .signIn(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    // re authorize
    await sc
      .app()
      .auth()
      .authorize()
    expect(fn).toHaveBeenCalledTimes(2)

    subscription.unsubscribe()

    // re authorize
    await sc
      .app()
      .auth()
      .authorize()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
