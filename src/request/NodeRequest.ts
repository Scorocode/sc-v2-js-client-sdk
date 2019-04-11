import FormData from 'form-data'
import fetch, { Response } from 'node-fetch'
import { Readable } from 'stream'
import BaseRequest, { ErrorResponse } from './BaseRequest'

const STATUS_200 = 200
const STATUS_206 = 206

BaseRequest.FormData = FormData as any

export default class NodeRequest extends BaseRequest {
  protected executeRequest(): Promise<any> {
    let url = this.url
    if (this.query) {
      // todo проверять урл на наличие в нем queryString
      if (typeof this.query === 'string') {
        url += `?${this.query}`
      } else if (typeof this.query === 'object') {
        const query = Object.keys(this.query).map(
          (param) =>
            `${encodeURIComponent(param)}=${encodeURIComponent(
              this.query[param]
            )}`
        )
        url += `?${query.join('&')}`
      }
    }

    return fetch(url, {
      method: this.method,
      timeout: this.timeout,
      headers: this.headers,
      body: this.body as any,
    })
      .then((res) => {
        return this._getResultFromResponse(res).then((result) => {
          ;(res as any).result = result

          return res
        })
      })
      .then((res) => {
        const result: any = (res as any).result

        if (res.status < STATUS_200 || res.status > STATUS_206) {
          if (typeof result === 'string') {
            return Promise.reject(
              new ErrorResponse(res.status, res.status, result)
            )
          }

          if (
            typeof result === 'object' &&
            result.code !== undefined &&
            result.message !== undefined
          ) {
            return Promise.reject(
              new ErrorResponse(res.status, result.code, result.message)
            )
          }

          return Promise.reject(
            new ErrorResponse(res.status, res.status, res.statusText)
          )
        }

        return result
      })
      .catch((err) => {
        return Promise.reject(new ErrorResponse(0, err.code, err.message))
      })
  }

  private _getResultFromResponse(
    res: Response
  ): Promise<string | {} | Readable> {
    const contentType = res.headers.get('content-type') || ''

    if (/^application\/json/i.test(contentType)) {
      return res.json()
    }

    if (/^text/i.test(contentType)) {
      return res.text()
    }

    return Promise.resolve(res.body)
  }
}
