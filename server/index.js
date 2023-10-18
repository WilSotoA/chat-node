import express from 'express'
import logger from 'morgan'

import { Server } from 'socket.io'
import { createServer } from 'node:http'

const port = process.env.PORT ?? 3000

const app = express()

const server = createServer(app)

const io = new Server(server)

io.on('connection', (socket) => {
  console.log('un usuario se ha conectado')

  socket.on('disconnect', () => {
    console.log('un usuario se ha desconectado')
  })
})

app.use(logger('dev'))

app.use(express.static('client'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
