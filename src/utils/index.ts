import { Readable } from 'stream'
import ScorocodeError from './ScorocodeError'

export default {
  /**
   * Throw the Scorocode error
   * @param {string} code
   * @param {string} message
   */
  throwError(code: string, message: string): void {
    throw new ScorocodeError(code, message)
  },

  setReadonlyProperties(obj: object, props: string[]): void {
    if (!props) {
      return
    }

    for (const key in props) {
      if (props.hasOwnProperty(key)) {
        Object.defineProperty(obj, key, {
          configurable: true,
          enumerable: true,
          value: props[key],
        })
      }
    }
  },

  setProperties(
    obj: object,
    props: object,
    readOnlyProps: string[] = []
  ): void {
    for (const key in props) {
      if (props.hasOwnProperty(key)) {
        if (readOnlyProps.indexOf(key) !== -1) {
          Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            value: props[key],
          })
        } else {
          obj[key] = props[key]
        }
      }
    }
  },

  get global(): any {
    let win

    // tslint:disable:strict-type-predicates
    if (typeof window !== 'undefined') {
      win = window
    } else if (typeof global !== 'undefined') {
      win = global
    } else if (typeof self !== 'undefined') {
      win = self
    } else {
      win = {}
    }

    return win
  },

  isNodeEnv(): boolean {
    if (typeof process === 'object') {
      if (typeof process.versions === 'object') {
        if (typeof process.versions.node !== 'undefined') {
          return true
        }
      }
    }

    return false
  },

  streamToString(stream: Readable): Promise<string> {
    return new Promise((res, rej) => {
      const chunks: string[] = []
      stream.on('data', (chunk) => {
        chunks.push(chunk.toString())
      })
      stream.on('end', () => {
        res(chunks.join(''))
      })
      stream.on('error', (err) => {
        rej(err)
      })
    })
  },

  blobToString(data: Blob): Promise<string> {
    return new Promise((res) => {
      const reader = new FileReader()

      reader.addEventListener('loadend', (e) => {
        res(reader.result as string)
      })

      reader.readAsText(data)
    })
  },
}
