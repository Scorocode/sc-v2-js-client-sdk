import fs from 'fs'
import { Readable } from 'stream'
import sc from '../../../../index'
import utils from '../../../../utils'

declare const __SC_APP_CONFIG__: any

const TEST_SOURCE_NAME = 'testRaw'
const TEST_FILE = 'test.file'

beforeAll(async () => {
  const app = sc.initApp(__SC_APP_CONFIG__)

  await sc
    .app()
    .auth()
    .signIn('test_user@mail.com', '123456')

  return app
    .source()
    .raw(TEST_SOURCE_NAME)
    .file(TEST_FILE)
    .delete()
    .catch(() => {
      return
    })
})

afterAll(async () => sc.removeApp())

describe('File source integration tests', () => {
  it('Should get an error', async () => {
    return expect(
      sc
        .app()
        .source()
        .raw(TEST_SOURCE_NAME)
        .file(TEST_FILE)
        .sync()
    ).rejects.toMatchObject({
      code: 2,
      message: expect.stringMatching(/file not found/),
    })
  })

  it('Create, read, rename and remove file using file as source', async () => {
    const app = sc.app()
    const data = fs.createReadStream(__dirname + '/data.file')
    const dataContent = fs.readFileSync(__dirname + '/data.file').toString()

    // upload
    const file = app
      .source()
      .raw(TEST_SOURCE_NAME)
      .file(TEST_FILE)
    await file.upload(data)
    await file.sync()

    // download
    const fileRef = app
      .source()
      .raw(TEST_SOURCE_NAME)
      .file(TEST_FILE)
    await fileRef.sync()

    const fileContent = await utils.streamToString(file.content as Readable)
    const fileRefContent = await utils.streamToString(
      fileRef.content as Readable
    )
    expect(fileContent).toBe(dataContent)
    expect(fileRefContent).toBe(dataContent)

    // delete
    await fileRef.delete()
    expect(fileRef.isDeleted).toBe(true)
    expect(fileRef.content).toBe(undefined)

    // check
    return expect(
      app
        .source()
        .raw(TEST_SOURCE_NAME)
        .file(TEST_FILE)
        .sync()
    ).rejects.toMatchObject({
      code: 2,
      message: expect.stringMatching(/file not found/),
    })
  })
})
