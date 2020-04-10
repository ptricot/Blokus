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
const database = mysql.createConnection({
  host: 'blokus',
  user: 'blokus',
  password: '',
  database: 'blokus'
})
database.connect(function (err) {
  if (err) throw err
  console.log('Connected to Blokus database')
})

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
  req.session.user = 'guest-' + ++nGuests
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
          if (result) {
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
  req.session.destroy()
  res.redirect('/')
})

// -----------------
// -- Socket.io --
// -----------------
const sockets = []
const rooms = []
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
  // connection
  socket.on('new user', function (username) {
    socket.username = username
    sockets.push(socket)
    io.emit('users', getUsernames())
  })

  socket.on('disconnect', function () {
    sockets.splice(sockets.indexOf(socket), 1)
    if (re.test(socket.username)) {
      nGuests--
    }
    io.emit('users', getUsernames())
  })

  // message
  socket.on('nouveau message', function (msg) {
    socket.emit('reponse', msg) // emit : to all - sender included
    console.log('message: ' + msg)
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
    const room = {
      name: 'room-' + ++nRooms,
      user1: user1,
      user2: socket.username
    }
    rooms.push(room)
    findSocket(user1).join(room)
    socket.join(room)
    io.in(room).emit('new game', room)
  })

  // play turn in a room
  socket.on('play turn', function (data) {
    io.in(data.room).emit('turn played', {
      tile: data.tile,
      room: data.room
    })
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
