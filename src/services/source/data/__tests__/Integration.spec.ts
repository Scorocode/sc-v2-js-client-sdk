import sc from '../../../../index'
import ItemList from '../ItemList'

// tslint:disable-next-line:no-magic-numbers
jest.setTimeout(30000)

declare const __SC_APP_CONFIG__: any

const TEST_SOURCE_NAME = 'testData'
const TEST_SOURCE_FIELD_NAME = 'name'

beforeAll(async () => {
  sc.initApp(__SC_APP_CONFIG__)

  return sc
    .app()
    .auth()
    .signIn('test_user@mail.com', '123456')
})

afterAll(async () => sc.removeApp())

describe('Data source integration tests', () => {
  it('Items tests', async () => {
    const item = sc
      .app()
      .source()
      .data(TEST_SOURCE_NAME)
      .item()
    item.set(TEST_SOURCE_FIELD_NAME, 'foo')

    await item.save()
    expect(item.ref).not.toEqual(undefined)

    // try to fetch created item
    const _item = await sc
      .app()
      .source()
      .data(TEST_SOURCE_NAME)
      .item(item.ref as any)
      .sync()

    expect(_item.get(TEST_SOURCE_FIELD_NAME)).toEqual('foo')
    expect(item.attributes).toMatchObject(_item.attributes)
    expect(item.ref).toMatchObject(_item.ref as any)

    // try to update item
    item.set(TEST_SOURCE_FIELD_NAME, 'bar')
    await item.save()
    await _item.sync()

    expect(item.get(TEST_SOURCE_FIELD_NAME)).toEqual('bar')
    expect(_item.get(TEST_SOURCE_FIELD_NAME)).toEqual('bar')
    expect(item.attributes).toMatchObject(_item.attributes)

    // try to fetch item list
    const list = await sc
      .app()
      .source()
      .data(TEST_SOURCE_NAME)
      .query()
      .sync()
    expect(list).toBeInstanceOf(ItemList)

    // delete item
    expect(item.isDeleted).toBe(false)
    await item.delete()
    expect(item.isDeleted).toBe(true)

    return expect(_item.sync()).rejects.toMatchObject({
      code: 500,
      message: expect.stringMatching(/record not found/),
    })
  })
})
