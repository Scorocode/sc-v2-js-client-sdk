import BaseRequest, { ErrorResponse } from './BaseRequest'

const STATUS_200 = 200
const STATUS_206 = 206
const XHR_READY_STATE_SUCCESS = 4

BaseRequest.FormData = FormData

export default class BrowserRequest extends BaseRequest {
  protected executeRequest(): Promise<any> {
    return new Promise((resolve: (xhr: XMLHttpRequest) => void) => {
      const xhr = new XMLHttpRequest()

      xhr.timeout = this.timeout
      if (xhr.upload) {
        xhr.upload.onprogress = (event) => {
          this.emit('onProgress', event)
        }
      }

      xhr.responseType = 'blob'

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
      xhr.open(this.method, url, true)

      Object.keys(this.headers).forEach((prop) =>
        xhr.setRequestHeader(prop, this.headers[prop])
      )

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XHR_READY_STATE_SUCCESS) {
          resolve(xhr)
        }
      }

      xhr.send(this.body as any)
    }).then(this._processResponse)
  }

  private _processResponse = async (xhr: XMLHttpRequest): Promise<any> => {
    try {
      const result: any = await this._getResultFromResponse(xhr)

      if (xhr.status < STATUS_200 || xhr.status > STATUS_206) {
        if (result && typeof result === 'string') {
          return Promise.reject(
            new ErrorResponse(xhr.status, xhr.status, result)
          )
        }

        if (
          result &&
          typeof result === 'object' &&
          result.code !== undefined &&
          result.message !== undefined
        ) {
          return Promise.reject(
            new ErrorResponse(xhr.status, result.code, result.message)
          )
        }

        return Promise.reject(
          new ErrorResponse(xhr.status, xhr.status, xhr.statusText)
        )
      } else {
        return Promise.resolve(result)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  private _getResultFromResponse(
    xhr: XMLHttpRequest
  ): Promise<string | {} | Blob> {
    const contentType = xhr.getResponseHeader('content-type') || ''

    if (/^application\/json/i.test(contentType)) {
      return this._blobToString(xhr.response).then(JSON.parse)
    }

    if (/^text/i.test(contentType)) {
      return this._blobToString(xhr.response)
    }

    return Promise.resolve(xhr.response)
  }

  private _blobToString(data: Blob): Promise<string> {
    return new Promise((res) => {
      const reader = new FileReader()

      reader.addEventListener('loadend', (e) => {
        res(reader.result as any)
      })

      reader.readAsText(data)
    })
  }
}
