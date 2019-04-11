import sc from '../../../index'
import RecordList from '../RecordList'

// tslint:disable-next-line:no-magic-numbers
jest.setTimeout(30000)

declare const __SC_APP_CONFIG__: any

const TEST_DB = 'test'
const TEST_SCHEMA = 'public'
const TEST_TABLE = 'test'

const TEST_TABLE_FIELD_NAME = 'name'

beforeAll(async () => {
  sc.initApp(__SC_APP_CONFIG__)

  return sc
    .app()
    .auth()
    .signIn('test_user@mail.com', '123456')
})

afterAll(async () => sc.removeApp())

describe('DB integration tests', () => {
  it('Record tests', async () => {
    const record = sc
      .app()
      .pg()
      .record(TEST_DB, TEST_SCHEMA, TEST_TABLE)
    record.set(TEST_TABLE_FIELD_NAME, 'foo')

    await record.save()
    expect(record.id).not.toEqual('')

    // try to fetch created record
    const _record = await sc
      .app()
      .pg()
      .record(TEST_DB, TEST_SCHEMA, TEST_TABLE, record.ref as any)
      .sync()

    expect(_record.get(TEST_TABLE_FIELD_NAME)).toEqual('foo')
    expect(record.attributes).toMatchObject(_record.attributes)
    expect(record.id).toEqual(_record.id)

    // try to update record
    record.set(TEST_TABLE_FIELD_NAME, 'bar')
    await record.save()
    await _record.sync()

    expect(record.get(TEST_TABLE_FIELD_NAME)).toEqual('bar')
    expect(_record.get(TEST_TABLE_FIELD_NAME)).toEqual('bar')
    expect(record.attributes).toMatchObject(_record.attributes)

    // try to fetch record list
    const list = await sc
      .app()
      .pg()
      .query(TEST_DB, TEST_SCHEMA, TEST_TABLE)
      .sync()
    expect(list).toBeInstanceOf(RecordList)

    // delete item
    expect(record.isDeleted).toBe(false)
    await record.delete()
    expect(record.isDeleted).toBe(true)

    return expect(_record.sync()).rejects.toMatchObject({
      code: 'bad_request',
      message: expect.stringMatching(/record not found/),
    })
  })
})
