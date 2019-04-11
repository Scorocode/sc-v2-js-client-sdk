import EventEmitter from '../utils/EventEmitter'

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      derivedCtor.prototype[name] = baseCtor.prototype[name]
    })
  })
}

export function eventEmitter(constructor: any) {
  return applyMixins(constructor, [EventEmitter])
}

export function mixins(baseCtors: any[]) {
  return function(constructor: any) {
    return applyMixins(constructor, baseCtors)
  }
}
