import sc from '../../../index'

declare const __SC_APP_CONFIG__: any

const TEST_FOLDER = 'test'

beforeAll(async () => {
  const app = sc.initApp(__SC_APP_CONFIG__)

  await sc
    .app()
    .auth()
    .signIn('test_user@mail.com', '123456')

  return app
    .fs()
    .folder(TEST_FOLDER)
    .delete()
    .catch(() => {
      return
    })
})

afterAll(async () => sc.removeApp())

describe('Folder integration tests', () => {
  it('Should sync folder', async () => {
    const folder = await sc
      .app()
      .fs()
      .folder('')
      .sync()

    expect(folder.files).toBeInstanceOf(Array)
  })

  it('Should create and remove folder', async () => {
    const folder = await sc
      .app()
      .fs()
      .folder(TEST_FOLDER)
      .create()
    expect(folder.path).toBe(TEST_FOLDER)

    await expect(
      sc
        .app()
        .fs()
        .folder(TEST_FOLDER)
        .sync()
    ).resolves.toMatchObject({
      path: TEST_FOLDER,
    })

    await folder.delete()

    return expect(
      sc
        .app()
        .fs()
        .folder(TEST_FOLDER)
        .sync()
    ).rejects.toMatchObject({
      code: 'internal_error',
      message: expect.stringMatching(/internal error/),
    })
  })
})
