# Scorocode v2 JS Client SDK

## Установка

```
npm i @scorocode/client-sdk
```

## Описание

### Импорт SDK

SDK кросс-платформенная библиотека, ее можно использовать как в nodejs, так и в браузере.

#### CommonJS

```javascript
const sc = require('@scorocode/client-sdk').default
```

#### ES2015

```javascript
import sc from '@scorocode/client-sdk'
```

#### Browser

```html
<script src="https://accounts.scorocode.ru/downloads/client-sdk/latest/scorocode.js"></script>
<script>
  scorocode.initApp({ ... })
</script>
```

### Менеджер приложений

Работа с приложениями скорокода начинается с менеджера приложений.

```javascript
// Менеджер приложений отвечает за инициализацию, хранение и утилизацию приложений
const sc = require('@scorocode/client-sdk').default

// Инициируем приложение по умолчанию
const app = sc.initApp({
  appId: '654...',
})
// Данное приложение будет доступно без указания его идентификатора
const appRef = sc.app()
console.log(appRef === app) // true

// Создадим еще одно приложение с идентификатором 'anotherApp'
const anotherApp = sc.initApp({ appId: '213...' }, 'anotherApp')
// Данное приложение будет доступно с указанием его идентификатора
const anotherAppRef = sc.app('anotherApp')
console.log(anotherAppRef === anotherApp) // true

// Удалить приложение по умолчанию
sc.removeApp().then(() => {
  console.log('Default application has been removed!')
})

// Удалить приложение по идентификатору
sc.removeApp('anotherApp').then(() => {
  console.log('An "anotherApp" application has been removed!')
})
```

В браузерном окружении менеджер приложений будет доступен из глобальной переменной `window.scorocode`

### Приложение

Приложение предоставляет апи для работы с сервисами скорокод приложения (`auth`, `fs`, `pg`, `ws`)

```javascript
const sc = require('@scorocode/client-sdk').default
const app = sc.initApp({ ... })

// Синхронный пособ получить сервис (без конфигурации сервиса)
// если сервис не был создан, он будет создан с конфигурацией по умолчанию и возвращен
let pgService = app.pg()

// Асинхронный пособ получить сервис
async function example() {
    // если сервис не был создан, он будет создан с переданной конфигурацией поверх конфигурации по умолчанию и возвращен
    let authService = await app.auth({ ... })
    // если сервис уже был создан, то текущий сервис будет уничтожен и создан новый
    // ВАЖНО: если код приложения был подписан события сервиса, необходимо совершить переподписку в новой версии сервиса
    authService = await app.auth({ ... })
}
example()

// events
app.on('onRequest', (request) => {
  // событие срабатывает при каждом обращении к апи приложения, перед отправкой запроса
})

app.on('onRequestSuccess', (response, request) => {
  // событие срабатывает при успешном выполнении запроса к апи приложения
})

app.on('onRequestError', (error, request) => {
  // событие срабатывает при ошибке во время выполнения запроса к апи приложения
})
```

### Сервисы

- `fs` - сервис для работы с файлами

```javascript
const sc = require('@scorocode/client-sdk').default
const app = sc.initApp({ ... })

const fs = app.fs()

// Работа с папками
// Создание указателя на папку
const folder = fs.folder('path/to/folder')

// Синхронизировать с приложением и получить информацию о папке
folder.sync().then((folder) => {
  console.log('File list', folder.files)  // список указателей на папки/файлы
})

// Создать папку
folder.create().then((folder) => {
  console.log('Folder has been created', folder.path)
})

// Переименовать папку
folder.rename('newPath/to/folder').then((folder) => {
  console.log('Path', folder.path)  // 'newPath/to/folder'
})

// Удалить папку
folder.delete().then((folder) => {
  console.log('Folder has been deleted', folder.path)
})

// Работа с файлами
// Создание указателя на фаил
const file = fs.file('path/to/file')

// Синхронизировать с приложением и получить информацию о файле
file.sync().then((file) => {
  console.log('File list', file.content)
  // file.content - Blob объект с контентом файла в окружении браузера, либо
  // Readable стрим в окружении node js
})

// Загрузить текст
file.upload('text content').then((file) => {
  console.log(file.content)  // 'text content'
})

// Загрузить файл в окружении браузера
file.upload(new Blob(['file content']))
    .then((file) => file.sync())
    .then((file) => {
      console.log(file.content)  // Blob объект с загруженным контентом
    })


// Загрузить файл в окружении node js
const fs = require('fs')

file.upload(fs.createReadStream('/path/to/file'))
    .then((file) => file.sync())
    .then((file) => {
      console.log(file.content)  // Readable стрим с загруженным контентом
    })


// Переименовать файл
file.rename('newPath/to/file').then((file) => {
  console.log('Path', file.path)  // 'newPath/to/file'
})

// Удалить файл
file.delete().then((file) => {
  console.log('File has been deleted', file.path)
})
```

- `pg` - сервис баз данных postgres

```javascript
const sc = require('@scorocode/client-sdk').default
const app = sc.initApp({ ... })

// Записи (Records)

// Получить объект-ссылку на запись
const ref = { id: 1234 }  // объект описывающий ключи по которым будет искаться запись
let record = app.pg().record('dbId', 'schemaName', 'tableName', ref)

// Создать объект-ссылку на новую запись
record = app.pg().record('dbId', 'schemaName', 'tableName')

// Синхронизация - загрузка данных записи
record.sync().then((record) => {
  console.log(record.attributes)    // данные записи { fieldName => fieldValue }
})

// Сохранить изменения
record.set('price', 100)
record.save().then((record) => {
  console.log(record.attributes) // { price: 100, ... }
})

// Создать запись
const newRecord = app.pg().record('dbId', 'testSchema', 'usersTable')
newRecord.attributes = { foo: 'bar' }
newRecord.save().then((record) => {
  console.log(record.ref)   // table's primary keys object { pk1: 123, pk2: 'as3dfa...' }
  console.log(record.attributes) // { id: '123...', foo: 'bar' }
})

// Удалить запись
record.delete().then((record) => {
  console.log('Record deleted')
  console.log(record.isDeleted) // true
})

// Работа с данными записи
// Получить объект с данными записи
// Данные не передаются по ссылке, создается копия данных
record = app.pg().record('myDb', 'test', 'users')  // новая запись

record.attributes = { price: 10 } // установим значения
const attributes = record.attributes  // получим значения
console.log(attributes) // { price: 10 }
// любые изменения полученного объекта с данными не приведет к изменению записи
attributes.price = 20
console.log(record.attributes) // { price: 10 }

// Установить значения записи
record.attributes = { name: 'Product', price: 100 }
// или
record.setAttributes({ name: 'Product', price: 100 })

// Установить значение поля записи
record.set('price', 55)

// Получить значение поля записи
console.log(record.get('price'))  // 55

// Можно установить и получить вложенные значения
record.set('a[0].b.c', 'value')
console.log(record.get('a[0].b.c')) // 'value'
// или
record.set(['a', '0', 'b', 'c'], 'newValue')
console.log(record.get(['a', '0', 'b', 'c'])) // 'newValue'

// Merge - рекурсивное объединение данных
record.attributes = {
  a: 'A',
  b: 'B',
  o: {
    foo: 'foo'
  },
}
record.merge({
  b: 'b',
  o: {
    foo: 'FOO',
    bar: 'bar',
  },
  c: 'c'
})
console.log(record.attributes)
/*
{
  a: 'A',
  b: 'b',
  o: {
    foo: 'FOO',
    bar: 'bar',
  },
  c: 'c'
}
*/

// Assign - объединение данных
record.attributes = {
  a: 'A',
  b: 'B',
  o: {
    foo: 'foo'
  },
}
record.assign({
  b: 'b',
  o: {
    bar: 'bar',
  },
  c: 'c'
})
console.log(record.attributes)
/*
{
  a: 'A',
  b: 'b',
  o: {
    bar: 'bar',
  },
  c: 'c'
}
*/

// set* методы документа позволяют выстраивать цепочку обращений к документу
record
  .setAttributes({ a: '', b: '' })
  .set('a', 'A')
  .set('b', 'B')
  .assign({ c: 'C' })
  .merge({ a: 'AA', b: 'BB' })
  .save()


// Запросы к БД (Query)

// Создать объект-запрос к бд
const query = app.pg().query('dbId', 'schemaName', 'tableName')

// Работа с запросом
// Получить записи удовлетворяющие запросу
query
  .page(2)                        // получить записи начиная со второй страницы
  .limit(15)                      // лимит в 15 записей
  .orderBy('name', 'ascend')      // сортировать по имени по возрастанию
  .orderBy('price', 'descend')    // сортировать по цене по убыванию
  .filterBy({                     // фильтровать опубликованные записи
    isPublished: true,
  })
  .sync()                         // получить записи
  .then((list) => {
   console.log('List', list)
   /*
   {
      from: 15,         // пропущено записей
      limit: 15,        // лимит записей
      total: 25,        // всего записей
      page: 2,          // пропущено записей
      pageSize: 15,     // лимит записей
      totalPages: 2,    // всего записей
      items: [ ... ]    // массив записей (Record)
   }
    */
  })

// Получить количество записей удовлетворяющих запросу
query
  .count()
  .then((count) => {
     console.log('Records matched', count)
  })
```

- `auth` - сервис авторизации

```javascript
const sc = require('@scorocode/client-sdk').default
const app = sc.initApp({ ... })

// Сервис авторизации и аутентификации пользователя
// При инициализации приложения сервис автоматически восстанавливает аутентификацию,
// в браузере используется локал сторедж
const auth = app.auth(/* {
  storage: LocalStorage,  // провайдер хранилища данных
  preserveSession: true,  // сохранять сессию в хранилище для последующего атоматического использования
} */)

// получить текущую сессию
const user = auth.currentSession // объект Session

// полномочия
const token = session.token                 // авторизационный токен
const refreshToken = session.refreshToken   // токен обновления сессии
const isExpired = session.isExpired         // сессия истекла

// получить информацию о пользователе
const user = session.info  // объект UserInfo

// Аутентифицировать пользователя по емеилу и паролю
auth.signIn('user@mail.com', '123qwe').then((session) => {
  console.log('Authenticated user', session.user)
})

// Зарегистрировать пользователя
auth.signUp('user@mail.com', '123qwe').then((session) => {
  console.log('Registered and authenticated user', session.user)
})

// Разлогинить пользователя
auth.signOut().then(() => {
  console.log('User logged out')
})

// Обновить сессию пользователя
auth.refresh().then((session) => {
  console.log('The user has refreshed session', session)
})

// events
// onSessionChanged - состояние аутентификации изменено (авторизован / разлогинен)
auth.on('onSessionChanged', (session) => {
  console.log('Current session state', session)
})
```

- `ws` - сервис веб сокетов

```javascript
const sc = require('@scorocode/client-sdk').default
const app = sc.initApp({
  wsAutoConnect: true, // автоматически устанавливать соединение, по умолчанию true
})

// Сервис веб сокетов
const ws = app.auth(/* {
  url: 'ws://ws-{appId}.scorocode.ru/connect'   // ендпоинт сервиса веб сокетов приложения
  reconnection: true,                           // автоматическое переподключение при потере соединения
  reconnectionAttempts: 0,                      // количество попыток переподключения (0 - неограниченно)
  reconnectionDelay: 5000,                      // интервал между попытками переподключения
} */)

// Установить соединение с веб сервисом
// Если в настройках приложения указано wsAutoConnect: false, то для работы с веб сервисом
// необходимо в ручную установить соединение:
ws.establishConnection()

// Закрыть соединение
ws.closeConnection()

// Состояние соединения
if (ws.isConnected) {
  console.log('Connection ready')
}

// подписаться на сообщения
ws.onMessage('post.updated', (message) => {
  console.log(message)
  // {
  //  type: 'post.updated',
  //  payload: { postId: '123...' }
  //}

  // do some staff...
})

// подписаться на одно сообщение
ws.onMessageOnce('post.updated', (message) => {
  // колбэк отработает один раз при поступлении сообщения типа 'post.updated'
  // do some staff...
})

// отписать колбэк от события
const helloHandler = (message) => {}
// подписка
ws.onMessage('hello', helloHandler)
// отписка
ws.removeMessageListener('hello', callbackFn)

// отправить сообщение не зависимо от состояния соединения
const payload = { foo: bar } // массивы, объекты, простые типы
ws.sendMessage('test', payload) // если соединение разорвано, сообщение не будет отправлено

// отправить сообщение с подтверждением
const payload = { foo: bar } // массивы, объекты, простые типы
// если соединение разорвано, сообщение будет добавлено в стек и отправлено при восстановлении соединения
ws.sendMessageSafe('test', payload, () => {
  console.log('Message has been sent successfully')
})

// events
// onConnect - попытка установить соединение
ws.on('onConnect', () => {
  // do some staff...
})

// onReconnect - переподключение
ws.on('onReconnect', () => {
  // do some staff...
})

// onOpen - соединение открыто и готово к использованию
ws.on('onOpen', (event) => {
  // event - native WebSocket event object
  // do some staff...
})

// onClose - соединение закрыто
ws.on('onClose', (event) => {
  // event - native WebSocket event object

  if (event.code === 1000) {
    console.log('Connection properly closed')
  }

  // do some staff...
})

// onError - ошибка
ws.on('onError', (event) => {
  // event - native WebSocket event object
  // do some staff...
})

// onMessage - получено сообщение
ws.on('onMessage', (message) => {
  // do some staff...
})
```
