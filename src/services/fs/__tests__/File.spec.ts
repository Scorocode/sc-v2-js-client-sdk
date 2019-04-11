import fs from 'fs'
import { Readable } from 'stream'
import sc from '../../../index'
import utils from '../../../utils'

declare const __SC_APP_CONFIG__: any

const TEST_FILE = 'test.file'
const TEST_FILE_RENAMED = 'renamed.file'

beforeAll(async () => {
  const app = sc.initApp(__SC_APP_CONFIG__)

  await sc
    .app()
    .auth()
    .signIn('test_user@mail.com', '123456')

  await app
    .fs()
    .file(TEST_FILE)
    .delete()
    .catch(() => {
      return
    })

  return app
    .fs()
    .file(TEST_FILE_RENAMED)
    .delete()
    .catch(() => {
      return
    })
})

afterAll(async () => sc.removeApp())

describe('File integration tests', () => {
  it('Should get an error', async () => {
    await expect(
      sc
        .app()
        .fs()
        .file(TEST_FILE)
        .sync()
    ).rejects.toMatchObject({
      // code: 404,
      message: expect.stringMatching(/file not found/),
    })
  })

  it('Create, read, rename and remove file using file as source', async () => {
    const app = sc.app()
    const data = fs.createReadStream(__dirname + '/data.file')
    const dataContent = fs.readFileSync(__dirname + '/data.file').toString()

    // upload
    const file = app.fs().file(TEST_FILE)
    await file.upload(data)
    await file.sync()

    // download
    const fileRef = app.fs().file(TEST_FILE)
    await fileRef.sync()

    const fileContent = await utils.streamToString(file.content as Readable)
    const fileRefContent = await utils.streamToString(
      fileRef.content as Readable
    )
    expect(fileContent).toBe(dataContent)
    expect(fileRefContent).toBe(dataContent)

    // rename
    await fileRef.rename(TEST_FILE_RENAMED)
    expect(fileRef.path).toBe(TEST_FILE_RENAMED)

    const renamedRef = app.fs().file(TEST_FILE_RENAMED)
    await renamedRef.sync()

    expect(renamedRef.path).toBe(TEST_FILE_RENAMED)
    const renamedRefContent = await utils.streamToString(
      renamedRef.content as Readable
    )
    expect(renamedRefContent).toBe(dataContent)

    // delete
    await renamedRef.delete()

    // check
    await expect(
      app
        .fs()
        .file(TEST_FILE)
        .sync()
    ).rejects.toMatchObject({
      // code: 404,
      message: expect.stringMatching(/file not found/),
    })

    await expect(
      app
        .fs()
        .file(TEST_FILE_RENAMED)
        .sync()
    ).rejects.toMatchObject({
      // code: 404,
      message: expect.stringMatching(/file not found/),
    })
  })
})
