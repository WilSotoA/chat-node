import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

const getUsername = async () => {
  const username = localStorage.getItem('username')
  if (username) return username
  const res = await fetch(
    'https://random-data-api.com/api/users/random_user'
  )
  const { username: randomUsername } = await res.json()

  localStorage.setItem('username', randomUsername)
  return randomUsername
}

const socket = io({
  auth: {
    username: await getUsername(),
    serverOffSet: 0
  }
})

const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')

socket.on('chat message', (msg, serverOffSet, username) => {
  const item = `
        <li
          class="shadow-lg shadow-blue-800 border border-blue-900 rounded-lg ml-2 my-2 p-2 odd:bg-slate-200 odd:text-black text-white"
        >
          <small class="text-xs font-semibold">${username}</small>
          <p>${msg}</p>
        </li>`
  messages.insertAdjacentHTML('beforeend', item)
  socket.auth.serverOffSet = serverOffSet
  messages.scrollTop = messages.scrollHeight
})

form.addEventListener('submit', (e) => {
  e.preventDefault()

  if (input.value) {
    socket.emit('chat message', input.value)
    input.value = ''
  }
})
