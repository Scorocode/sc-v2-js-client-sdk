import { Readable } from 'stream'
import EventEmitter from '../utils/EventEmitter'
import IRequest, { BodyPayloadTypes, IFormDataPayload } from './IRequest'

const REQUEST_TIMEOUT = 120000

export class ErrorResponse {
  constructor(
    public status: number,
    public code: string | number,
    public message: string
  ) {}
}

interface OnRequestHandler<T extends IRequest> {
  (request: T): void
}

interface OnResponseHandler<T extends IRequest> {
  (request: T, response: Promise<any>): Promise<any>
}

export interface IHttpRequestOptions {
  url: string
  method?: string
  query?: string | {}
  headers?: { [name: string]: string }
  body?: any
  timeout?: number
}

export default abstract class BaseRequest extends EventEmitter
  implements IRequest {
  static FormData: new () => FormData

  private readonly _headers: {}
  private _url: string
  private _method: string
  private _query: string | {}
  private _body: BodyPayloadTypes
  private _timeout: number
  private _onBeforeHandlers: OnRequestHandler<any>[]
  private _onAfterHandlers: OnResponseHandler<any>[]

  constructor(config: IHttpRequestOptions) {
    super()

    this._url = config.url
    this._method = config.method || 'GET'
    this._query = config.query || ''
    this._body = config.body
    this._timeout = config.timeout || REQUEST_TIMEOUT
    this._headers = config.headers || {}
    this._onBeforeHandlers = []
    this._onAfterHandlers = []
  }

  get headers(): {} {
    return this._headers
  }

  get url(): string {
    return this._url
  }

  get method(): string {
    return this._method
  }

  get query(): string | {} {
    return this._query
  }

  get body(): BodyPayloadTypes {
    return this._body
  }

  get timeout(): number {
    return this._timeout
  }

  setMethod(method: string): this {
    this._method = method

    return this
  }

  setUrl(url: string): this {
    this._url = url

    return this
  }

  setQueryParams(params: string | {}): this {
    this._query = params

    return this
  }

  setRequestHeader(field: string, value: string): this {
    this._headers[field] = value

    return this
  }

  setBody(body: any): this {
    this._body = body

    return this
  }

  setJsonBody(body: any): this {
    this._body = JSON.stringify(body)

    return this
  }

  setTimeout(timeout: number): this {
    this._timeout = timeout

    return this
  }

  setToken(token: string): this {
    return this.setRequestHeader('Authorization', `Bearer ${token}`)
  }

  get(): this {
    return this.setMethod('GET')
  }

  post(body: BodyPayloadTypes): this {
    return this.setMethod('POST').setBody(body)
  }

  postJson(body: {}): this {
    return this.setMethod('POST')
      .setJsonBody(body)
      .setRequestHeader('Content-Type', 'application/json')
  }

  postFile(body: Blob | Readable): this {
    return this.setMethod('POST')
      .setBody(body)
      .setRequestHeader('Content-Type', 'application/octet-stream')
  }

  put(body: BodyPayloadTypes): this {
    return this.setMethod('PUT').setBody(body)
  }

  putJson(body: {}): this {
    return this.setMethod('PUT')
      .setJsonBody(body)
      .setRequestHeader('Content-Type', 'application/json')
  }

  patch(body: BodyPayloadTypes): this {
    return this.setMethod('PATCH').setBody(body)
  }

  patchJson(body: {}): this {
    return this.setMethod('PATCH')
      .setJsonBody(body)
      .setRequestHeader('Content-Type', 'application/json')
  }

  upload(payload: IFormDataPayload): this {
    const formData = this._payloadToFormData(payload)

    return this.setMethod('POST').setBody(formData)
  }

  delete(): this {
    return this.setMethod('DELETE')
  }

  use(
    onRequest?: OnRequestHandler<any>,
    onResponse?: OnResponseHandler<any>
  ): this {
    if (onRequest) {
      this.useBefore(onRequest)
    }

    if (onResponse) {
      this.useAfter(onResponse)
    }

    return this
  }

  useBefore(onRequest: OnRequestHandler<any>): this {
    this._onBeforeHandlers.push(onRequest)

    return this
  }

  notUseBefore(onRequest: OnRequestHandler<any>): this {
    this._onBeforeHandlers = this._onBeforeHandlers.filter(
      (handler) => handler !== onRequest
    )

    return this
  }

  useAfter(onResponse: OnResponseHandler<any>): this {
    this._onAfterHandlers.push(onResponse)

    return this
  }

  notUseAfter(onResponse: OnResponseHandler<any>): this {
    this._onAfterHandlers = this._onAfterHandlers.filter(
      (handler) => handler !== onResponse
    )

    return this
  }

  execute(): Promise<any> {
    this._onBeforeHandlers.forEach((handler: OnRequestHandler<any>) =>
      handler(this)
    )

    this.emit('onRequest', this)

    let promise = this.executeRequest()

    this._onAfterHandlers.forEach((handler: OnResponseHandler<any>) => {
      promise = handler(this, promise)
    })

    return promise
      .then((result) => {
        this.emit('onResponseSuccess', result, this)

        return result
      })
      .catch((error) => {
        this.emit('onResponseError', error, this)

        return Promise.reject(error)
      })
  }

  protected executeRequest(): Promise<any> {
    return Promise.resolve({})
  }

  private _payloadToFormData(payload: IFormDataPayload): FormData {
    const formData = new BaseRequest.FormData()
    Object.entries(payload).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((item) => formData.append(k, item))
      } else {
        formData.append(k, v as any)
      }
    })

    return formData
  }
}
