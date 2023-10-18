import express from 'express'
import logger from 'morgan'

import { Server } from 'socket.io'
import { createServer } from 'node:http'

import { client } from './database.js'

const port = process.env.PORT ?? 3000

const app = express()

const server = createServer(app)

const io = new Server(server, {
  connectionStateRecovery: {}
})

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT
    )`)
} catch (e) {
  console.error(e)
}

io.on('connection', async (socket) => {
  console.log('un usuario se ha conectado')

  socket.on('disconnect', () => {
    console.log('un usuario se ha desconectado')
  })

  socket.on('chat message', async (msg) => {
    let result
    try {
      result = await client.query(
        'INSERT INTO messages (content) VALUES ($1) RETURNING id',
        [msg]
      )
    } catch (e) {
      console.error(e)
      return
    }
    io.emit('chat message', msg, result.rows[0].id)
  })
  if (!socket.recovered) {
    try {
      const results = await client.query(
        'SELECT * FROM messages WHERE id > $1',
        [socket.handshake.auth.serverOffSet ?? 0]
      )

      results.rows.forEach(row => {
        socket.emit('chat message', row.content, row.id)
      })
    } catch (e) {
      console.error(e)
    }
  }
})

app.use(logger('dev'))

app.use(express.static('client'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
