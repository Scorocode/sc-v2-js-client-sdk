import BrowserRequest from '../BrowserRequest'

function blobToString(data: Blob): Promise<string> {
  return new Promise((res) => {
    const reader = new FileReader()

    reader.addEventListener('loadend', (e) => {
      res(reader.result as string)
    })

    reader.readAsText(data)
  })
}

const MOCK_SERVER_URL = 'http://localhost:4000'

describe('BrowserRequest GET', () => {
  it('GET text', async () => {
    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/getText`,
    })

    return expect(request.execute()).resolves.toBe('ok')
  })

  it('GET json', async () => {
    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/getJson`,
    })

    return expect(request.execute()).resolves.toMatchObject({ foo: 'bar' })
  })

  it('GET file', async () => {
    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/getFile`,
    })

    return expect(request.execute().then(blobToString)).resolves.toEqual(
      'data file content\n'
    )
  })

  it('GET error from text', async () => {
    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/getErrorText`,
    })

    return expect(request.execute()).rejects.toMatchObject({
      code: 400,
      message: 'error text',
    })
  })

  it('GET error from json', async () => {
    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/getErrorJson`,
    })

    return expect(request.execute()).rejects.toMatchObject({
      code: 'error_code',
      message: 'error description',
    })
  })

  it('GET error from invalid json', async () => {
    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/getErrorJsonInvalid`,
    })

    return expect(request.execute()).rejects.toMatchObject({
      code: 400,
      message: 'Bad Request',
    })
  })

  // it('GET fatal error from invalid endpoint', async () => {
  //   const request = new BrowserRequest({
  //     url: `http://localhost:4001`
  //   })
  //
  //   const error = await request.execute().catch(err => err)
  //
  //   expect(error).toMatchObject({
  //     code: 0,
  //     message: ''
  //   })
  // })
})

describe('BrowserRequest POST', () => {
  it('POST text data', async () => {
    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/postText`,
    })

    request.post('test')

    return expect(request.execute()).resolves.toBe('test')
  })

  it('POST json data', async () => {
    const data = {
      foo: 'bar',
    }

    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/postJson`,
    })

    request.postJson(data)

    return expect(request.execute()).resolves.toMatchObject(data)
  })

  it('POST file data', async () => {
    const dataContent = 'test string'
    const data = new Blob([dataContent])

    const request = new BrowserRequest({
      url: `${MOCK_SERVER_URL}/postFile`,
    })

    request.postFile(data)

    return expect(request.execute().then(blobToString)).resolves.toBe(
      dataContent
    )
  })

  // it('UPLOAD file data', async () => {
  //   const dataContent = 'test string'
  //   // const file = new Blob([dataContent], { type : 'text/html' })
  //   const file = new Blob([dataContent])
  //
  //   const request = new BrowserRequest({
  //     url: `${MOCK_SERVER_URL}/uploadFile`,
  //   })
  //
  //   request.upload({ file }) // .setRequestHeader('content-type', 'multipart/form-data')
  //
  //   const response = await request.execute().then(blobToString)
  //
  //   expect(response).toBe(dataContent)
  // })
})
