/* tslint:disable:no-magic-numbers */
import sc from '../../../index'
import { WS_EVENTS } from '../WS'

declare const __SC_APP_CONFIG__: any

beforeEach(() => {
  sc.initApp({
    ...__SC_APP_CONFIG__,
    wsAutoConnect: false,
  })
})

afterEach(async () => {
  return sc.removeApp()
})

describe('WS integration tests', () => {
  it('WS should establish and close connection', async () => {
    const ws = sc.app().ws()

    const fn = jest.fn()
    ws.on(WS_EVENTS.onConnect, fn)
    ws.on(WS_EVENTS.onClose, fn)

    ws.establishConnection()

    const delay = 150
    await new Promise((res) => setTimeout(res, delay))

    expect(fn).toHaveBeenCalledTimes(1)

    ws.closeConnection()

    await new Promise((res) => setTimeout(res, delay))

    expect(fn).toHaveBeenCalledTimes(2)

    return true
  })

  it('WS should send and receive message back', async () => {
    const ws = await sc.app().ws({
      url: 'ws://localhost:4002',
    })

    const fn = jest.fn((r) => r)
    ws.onMessage('test', fn)

    // sending messages through the messages queue
    const cb = jest.fn()
    ws.sendMessageSafe('test', 'foo', cb)

    ws.establishConnection()

    const delay = 500
    await new Promise((res) => setTimeout(res, delay))

    expect(fn.mock.results[0].value).toMatchObject({
      type: 'test',
      payload: 'foo',
    })
    expect(cb).toHaveBeenCalled()
    cb.mockReset()

    // send message direct
    expect(ws.isConnected).toBe(true)

    ws.sendMessageSafe('test', 'bar', cb)

    await new Promise((res) => setTimeout(res, delay))

    expect(fn.mock.results[1].value).toMatchObject({
      type: 'test',
      payload: 'bar',
    })
    expect(cb).toHaveBeenCalled()
  })
})
