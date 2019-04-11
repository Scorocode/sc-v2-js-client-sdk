import fs from 'fs'
import utils from '../../utils'
import NodeRequest from '../NodeRequest'

const MOCK_SERVER_URL = 'http://localhost:4000'

describe('NodeRequest GET', () => {
  it('GET text', async () => {
    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/getText`,
    })

    const response = await request.execute()

    expect(response).toBe('ok')
  })

  it('GET json', async () => {
    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/getJson`,
    })

    const response = await request.execute()

    expect(response).toMatchObject({ foo: 'bar' })
  })

  it('GET file', async () => {
    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/getFile`,
    })

    const response = await request.execute().then(utils.streamToString)

    expect(response).toEqual('data file content\n')
  })

  it('GET error from text', async () => {
    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/getErrorText`,
    })

    const error = await request.execute().catch((err) => err)

    expect(error).toMatchObject({
      code: 400,
      message: 'error text',
    })
  })

  it('GET error from json', async () => {
    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/getErrorJson`,
    })

    const error = await request.execute().catch((err) => err)

    expect(error).toMatchObject({
      code: 'error_code',
      message: 'error description',
    })
  })

  it('GET error from invalid json', async () => {
    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/getErrorJsonInvalid`,
    })

    const error = await request.execute().catch((err) => err)

    expect(error).toMatchObject({
      code: 400,
      message: 'Bad Request',
    })
  })

  it('GET fatal error from invalid endpoint', async () => {
    const request = new NodeRequest({
      url: `http://localhost:4010`,
    })

    const error = await request.execute().catch((err) => err)

    expect(error).toMatchObject({
      code: 'ECONNREFUSED',
      message:
        'request to http://localhost:4010/ failed, reason: connect ECONNREFUSED 127.0.0.1:4010',
    })
  })
})

describe('NodeRequest POST', () => {
  it('POST text data', async () => {
    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/postText`,
    })

    request.post('test')

    const response = await request.execute()

    expect(response).toBe('test')
  })

  it('POST json data', async () => {
    const data = {
      foo: 'bar',
    }

    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/postJson`,
    })

    request.postJson(data)

    const response = await request.execute()

    expect(response).toMatchObject(data)
  })

  it('POST file data', async () => {
    const data = fs.createReadStream(__dirname + '/data.file')
    const dataContent = fs.readFileSync(__dirname + '/data.file').toString()

    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/postFile`,
    })

    request.postFile(data)

    const response = await request.execute().then(utils.streamToString)

    expect(response).toBe(dataContent)
  })

  it('UPLOAD file data', async () => {
    const data = fs.createReadStream(__dirname + '/data.file')
    const dataContent = fs.readFileSync(__dirname + '/data.file').toString()

    const request = new NodeRequest({
      url: `${MOCK_SERVER_URL}/uploadFile`,
    })

    request.upload({
      file: data,
    })

    const response = await request.execute().then(utils.streamToString)

    expect(response).toBe(dataContent)
  })
})
