import EventEmitter from '../EventEmitter'

describe('Events test', () => {
  it('Creates and removes listeners', async () => {
    const emitter = new EventEmitter()
    const observers = []
    const fn = jest.fn()
    const num = 3

    for (let k = 0; k < num; k++) {
      const obs = () => {
        fn()
      }
      emitter.on('test', obs)

      observers.push(obs)
    }

    emitter.emit('test')
    expect(fn).toHaveBeenCalledTimes(num)

    observers.forEach((obs) => emitter.removeListener('test', obs))
    fn.mockReset()

    emitter.emit('test')
    expect(fn).toHaveBeenCalledTimes(0)
  })
})
