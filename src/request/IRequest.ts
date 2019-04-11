import { Readable } from 'stream'

export type BodyPayloadTypes =
  | undefined
  | string
  | {}
  | ArrayBuffer
  | Blob
  | Readable
  | FormData

export interface IFormDataPayload {
  [name: string]: string | Blob | Readable
}

export default interface IRequest {
  // getters
  headers: {}
  url: string
  method: string
  query: string | {}
  body: BodyPayloadTypes
  timeout: number

  // setters
  setMethod(method: string): this
  setUrl(url: string): this
  setQueryParams(params: string | {}): this
  setRequestHeader(field: string, value: string): this
  setBody(body: any): this
  setJsonBody(body: any): this
  setTimeout(timeout: number): this
  setToken(token: string): this

  // shortcats

  // GET
  get(): this

  // POST
  post(body: BodyPayloadTypes): this
  postJson(body: {}): this
  postFile(body: Blob | Readable): this

  // PUT
  put(body: BodyPayloadTypes): this
  putJson(body: {}): this

  // PATCH
  patch(body: BodyPayloadTypes): this
  patchJson(body: {}): this

  // UPLOAD
  upload(payload: IFormDataPayload): this

  // DELETE
  delete(): this

  // use(onRequest?: onRequestHandler, onResponse?: onResponseHandler): this
  // useBefore(onRequest: onRequestHandler): this
  // useAfter(onResponse: onResponseHandler): this

  // execute request
  execute(): Promise<any>
}
