const express = require('express')
const multer = require('multer')
const cors = require('cors')
const bodyParser = require('body-parser')
const ws = require('ws')

const app = express()

const http = require('http').createServer()
const io = require('socket.io')(http)

// io.use((socket, next) => {
//   console.log(socket.client.request.headers['x-user-token'])
//   console.log(Object.keys(socket.client.request.res))
//   // console.log(socket.client.request.res)
//
//   next()
// })

io.on('connection', function(socket) {
  console.log('a user connected')

  socket.on('multi', function(...args) {
    console.log('multi', args)
  })

  socket.on('echo', function(payload, cb) {
    socket.emit('sc_app_message', {
      event: 'echo',
      payload,
    })
    console.log('ECHO', typeof payload, payload)

    if (cb) {
      cb(0)
    }
  })

  socket.on('sc_app_message', function(payload, cb) {
    console.log('sc_app_message', payload)

    if (cb) {
      cb(0)
    }
  })
})

io.sockets.on('TEST', function(payload) {
  console.log('TEST', payload)
})

function streamToString(stream) {
  return new Promise((res, rej) => {
    const chunks = []
    stream.on('data', (chunk) => {
      chunks.push(chunk.toString())
    })
    stream.on('end', () => {
      res(chunks.join(''))
    })
    stream.on('error', (err) => {
      rej(err)
    })
  })
}

const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())

app.get('/getText', (req, res) => {
  res.status(200).send('ok')
})
app.get('/getJson', (req, res) => {
  res.status(200).json({
    foo: 'bar',
  })
})
app.get('/getFile', (req, res) => {
  // const data = fs.createReadStream(__dirname + './mocks/data.file')
  //
  // res.status(200).set('content-type', 'application/octet-stream').send(data)

  res.status(200).sendFile(__dirname + '/mocks/data.file')
})
app.get('/getErrorText', (req, res) => {
  res.status(400).send('error text')
})
app.get('/getErrorJson', (req, res) => {
  res.status(400).json({
    code: 'error_code',
    message: 'error description',
  })
})
app.get('/getErrorJsonInvalid', (req, res) => {
  res.status(400).json({})
})

app.post('/postText', bodyParser.text(), (req, res) => {
  console.log(req.get('content-type'))

  res.status(200).send(req.body)
})
app.post('/postJson', bodyParser.json(), (req, res) => {
  if (req.get('content-type') === 'application/json') {
    return res.status(200).json(req.body)
  } else {
    return res.sendStatus(400)
  }
})
app.post('/postFile', bodyParser.raw(), (req, res) => {
  if (req.get('content-type') === 'application/octet-stream') {
    return res.status(200).send(req.body)
  } else {
    return res.sendStatus(400)
  }
})

app.post('/uploadFile', upload.single('file'), (req, res) => {
  console.log(req.get('content-type'))
  res.status(200).send(req.file.buffer)
})

// app.use('/upload', (req, res) => {
//   console.log(req.body, req.params, req.query)
//   res.status(200).send('ok');
// });

const port = process.env.PORT || 4000

// express
app.listen(port, () => {
  console.log(`Port ${port} is listened by our server.`)
})

// socket.io
http.listen(port + 1, function() {
  console.log(`Port ${port + 1} is listened by our WS server.`)
})

// ws
const webSocketServer = new ws.Server({
  port: 4002,
})
webSocketServer.on('connection', function(ws) {
  console.log('connection closed')

  ws.on('message', function(message) {
    ws.send(message)
  })

  ws.on('close', function() {
    console.log('connection closed')
  })
})
