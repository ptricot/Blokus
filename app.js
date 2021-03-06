// --------------
// -- Includes --
// --------------

const express = require('express')
const session = require('express-session')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const mysql = require('mysql')

// MySQL
/* // LOCAL
var dbConfig = {
  host: 'localhost',
  user: 'blokus',
  password: '',
  database: 'blokus'
}
 */

var dbConfig = {
  host: 'eu-cdbr-west-02.cleardb.net',
  user: 'bd7d950cc1056b',
  password: 'bb98eee7',
  database: 'heroku_bbadf2b2121fcd1'
}

var database

function handleDisconnect () {
  database = mysql.createConnection(dbConfig) // Recreate the connection, since
  // the old one cannot be reused.

  database.connect(function (err) { // The server is either down
    if (err) { // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err)
      setTimeout(handleDisconnect, 2000) // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }) // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  database.on('error', function (err) {
    console.log('db error', err)
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect() // lost due to either server restart, or a
    } else { // connnection idle timeout (the wait_timeout
      throw err // server variable configures this)
    }
  })
}

handleDisconnect()

// Port
const PORT = process.env.PORT || 8080

// socket.io
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// set public path
app.use(express.static('public'))

// -------------
// -- Session --
// -------------

// Initialize express-session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

app.get('/', function (req, res) {
  if (req.session.user === undefined) {
    res.redirect('login.html')
  } else {
    res.redirect('lobby.html')
  }
})

// -------------
// -- Sign Up --
// -------------

const re = /^guest-[1-9]\d*$/

app.post('/signup', function (req, res) {
  const username = req.body.newUsername
  const password = req.body.newPassword
  const confirmPassword = req.body.confirmPassword
  if (!username || !password || !confirmPassword) {
    console.log('Champs incomplets')
    res.redirect('/')
  } else if (re.test(username)) {
    console.log('Username invalide')
    res.redirect('/')
  } else if (confirmPassword !== password) {
    console.log('Password ne correspondent pas')
    res.redirect('/')
  } else {
    bcrypt.hash(password, 10).then(function (hash) {
      database.query('INSERT INTO accounts VALUES (id, ?, ?)', [username, hash], function (error, result) {
        if (error) {
          console.log(error)
          res.redirect('/')
        } else {
          req.session.user = username
          res.cookie('user', req.session.user)
          console.log(`New user created : ${username}`)
          res.redirect('/')
        }
      })
    })
  }
})

// -----------
// -- Login --
// -----------

// Guest
let nGuests = 0

app.get('/login', function (req, res) {
  nGuests = nGuests + 1
  req.session.user = 'guest-' + nGuests
  res.cookie('user', req.session.user)
  console.log(`Login successful : ${req.session.user}`)
  res.redirect('/')
})

// Login
app.post('/login', function (req, res) {
  const username = req.body.username
  const password = req.body.password
  if (!username || !password) {
    console.log('Login incomplet')
    res.redirect('/')
  } else {
    database.query('SELECT * FROM accounts WHERE username = ?', username, function (error, results) {
      if (error) {
        console.log(error)
        res.redirect('/')
      } else if (results.length === 0) {
        console.log('Login incorrect')
        res.redirect('/')
      } else {
        bcrypt.compare(password, results[0].password).then(function (result) {
          if (!result) {
            console.log('Login incorrect')
            res.redirect('/')
          } else {
            req.session.user = username
            res.cookie('user', req.session.user)
            console.log(`Login successful : ${username}`)
            res.redirect('/')
          }
        })
      }
    })
  }
})

// Logout
app.get('/logout', function (req, res) {
  console.log(`Logout successful : ${req.session.user}`)
  res.clearCookie('user')
  res.clearCookie('connect.sid')
  res.clearCookie('io')
  req.session.destroy()
  res.redirect('/')
})

// -----------------
// -- Socket.io --
// -----------------
const sockets = []
const rooms = {}
let nRooms = 0

const getUsernames = function () {
  const users = []
  for (var s in sockets) {
    users.push(sockets[s].username)
  }
  return users
}

const findSocket = function (username) {
  let solution
  for (var s in sockets) {
    if (sockets[s].username === username) {
      solution = sockets[s]
    }
  }
  return solution
}

io.on('connection', function (socket) {
  // -----------
  // -- Lobby --
  // -----------

  socket.on('new user', function (username) {
    socket.username = username
    sockets.push(socket)
    console.log(`${username} joined lobby`)
    io.emit('users', JSON.stringify(getUsernames()))
  })

  socket.on('disconnect', function () {
    if (socket.username) {
      sockets.splice(sockets.indexOf(socket), 1)
      console.log(`${socket.username} left lobby`)
      io.emit('users', JSON.stringify(getUsernames()))
    }
  })

  // message
  socket.on('nouveau message', function (data) {
    io.emit('reponse', data) // emit : to all - sender included
    console.log('message: ' + JSON.stringify(data))
  })

  // user 1 send match request to user 2
  socket.on('envoi defi', function (user2) {
    findSocket(user2).emit('nouveau defi', socket.username)
    console.log(`defi de ${socket.username} pour ${user2}`)
  })

  // user 2 refuse defi
  socket.on('refus defi', function (user1) {
    findSocket(user1).emit('defi refuse', socket.username)
    console.log(`defi de ${socket.username} refusé par ${socket.username}`)
  })

  // user 2 accepte defi, new game start
  socket.on('accepte defi', function (user1) {
    // users 1 and 2 join room
    nRooms = nRooms + 1
    const roomName = 'room-' + nRooms
    const board = Array(14).fill(0)
    for (var i = 0; i < 14; i++) {
      board[i] = Array(14).fill(0)
    }
    const room = {
      name: roomName,
      user1: user1,
      user2: socket.username,
      playerPlaying: 1, // 1:joueur1 2:joueur2
      board: board, // 0:vide 1:joueur1 2:joueur2
      giveUp1: false,
      giveUp2: false
    }
    rooms[roomName] = room
    findSocket(user1).emit('new game', JSON.stringify(room))
    findSocket(socket.username).emit('new game', JSON.stringify(room))
  })

  // --------------------
  // -- Game handling ---
  // --------------------

  socket.on('user joined', function (data) {
    data = JSON.parse(data)
    const user = data.user
    const adversaire = data.adversaire
    const roomName = data.room
    Object.keys(rooms).forEach(key => {
      if (key === roomName && (rooms[key].user1 === user || rooms[key].user2 === user) && (rooms[key].user1 = adversaire || rooms[key].user2 === adversaire)) {
        socket.join(roomName)
      }
    })
  })

  function verify (data) { // verifie si la piece definie par cells du joueur numero peut rentrer dans le board (return boolean)
    var cells = data.cells
    var numero = data.numero
    var board = rooms[data.room].board
    if (numero !== rooms[data.room].playerPlaying) {
      console.log('Mauvais joueur')
      return false
    } else {
      var cornerTouch = false
      for (var k in cells) {
        var cell = cells[k]
        if (cell.x >= 14 || cell.x < 0 || cell.y >= 14 || cell.y < 0) {
          console.log('Sortie de board')
          return false
        // pas de sortie du board
        } else if (board[cell.x][cell.y] !== 0) {
          console.log('Superposition')
          return false
        // pas de superposition
        } else if ((numero === 1 && cell.x === 4 && cell.y === 4) || (numero === 2 && cell.x === 9 && cell.y === 9)) {
          console.log('premier coup')
          return true
        } else { // premier coup joué
          for (var i = 0; i < 14; i++) {
            for (var j = 0; j < 14; j++) {
            // verifie les coins adjacents
              if (board[i][j] === numero && Math.abs(i - cell.x) === 1 && Math.abs(j - cell.y) === 1) {
                cornerTouch = true
                console.log('Corner touch')
              }
              // verifie qu'il n'y ai pas de cotés adjacents
              if (board[i][j] === numero && ((Math.abs(i - cell.x) === 1 && Math.abs(j - cell.y) === 0) || (Math.abs(i - cell.x) === 0 && Math.abs(j - cell.y) === 1))) {
                console.log('Faces adjacentes')
                return false
              }
            }
          }
        }
      }
      return cornerTouch
    }
  }

  // play turn in a room
  socket.on('play turn', function (data) {
    data = JSON.parse(data)
    const room = rooms[data.room]
    let change = false
    if (verify(data)) {
      var board = rooms[data.room].board
      for (var i in data.cells) {
        var cell = data.cells[i]
        board[cell.x][cell.y] = data.numero
      }
      if (room.giveUp1) {
        room.playerPlaying = 2
      } else if (room.giveUp2) {
        room.playerPlaying = 1
      } else {
        change = true
        room.playerPlaying = 1 + (room.playerPlaying % 2)
      }
      data.change = change
      console.log(change)
      io.in(data.room).emit('turn played', JSON.stringify(data))
    }
  })

  // Fin de jeu
  socket.on('give up', function (data) {
    data = JSON.parse(data)
    const room = rooms[data.room]
    if (data.numero === 1) {
      room.giveUp1 = true
      room.playerPlaying = 1
    } else {
      room.giveUp2 = true
      room.playerPlaying = 2
    }
    if (room.giveUp1 && room.giveUp2) {
      const board = room.board
      let score1 = 0
      let score2 = 0
      let winner = 0
      for (var i = 0; i < 14; i++) {
        for (var j = 0; j < 14; j++) {
          if (board[i][j] === 1) {
            score1++
          } else if (board[i][j] === 2) {
            score2++
          }
        }
      }
      if (score1 > score2) {
        winner = 1
      } else if (score2 > score1) {
        winner = 2
      }
      const response = {
        winner: winner,
        score: [score1, score2]
      }
      io.in(data.room).emit('fin de jeu', JSON.stringify(response))
    } else {
      room.playerPlaying = room.playerPlaying % 2 + 1
      io.in(data.room).emit('turn pass', JSON.stringify({ numero: data.numero }))
    }
  })
})

// -----------------
// -- HTTP errors --
// -----------------

// handle 404
app.use(function (req, res, next) {
  res.status(404).sendFile(path.join(__dirname, '/error-404.html'))
})

// handle 500
app.use(function (req, res, next) {
  res.status(500).sendFile(path.join(__dirname, '/error-500.html'))
})

// ------------------
// -- Start server --
// ------------------

http.listen(PORT, function () {
  console.log(`\nServer started, listening on PORT ${PORT}`)
})
