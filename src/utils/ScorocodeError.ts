export default class ScorocodeError extends Error {
  public name: string
  public code: string
  public message: string
  public stack?: string

  constructor(code: string, message: string) {
    super(message)

    this.name = 'ScorocodeError'
    this.code = code
    this.message = message

    if ((Error as any).captureStackTrace) {
      ;(Error as any).captureStackTrace(this, ScorocodeError)
    } else {
      this.stack = new Error().stack
    }
  }
}
