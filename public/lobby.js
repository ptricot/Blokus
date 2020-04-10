/* global $ */
/* global io */
/* global alert */
/* global confirm */

$(function () {
  const socket = io()

  // send username to socket
  const username = document.cookie.split(';')[0].split('=')[1]
  socket.emit('new user', username)

  // users update
  socket.on('users', function (users) {
    // remove self
    users.splice(users.indexOf(username), 1)
    $('#nUsers').html(users.length)
    // add users to list
    var lusers = $('#list-users')
    lusers.empty()
    for (var i in users) {
      var user = users[i]
      var li = document.createElement('li')
      var text = document.createTextNode(user)
      var button = document.createElement('button')

      button.innerHTML = 'Play with'
      button.classList.add('but')
      button.id = user

      li.append(text)
      li.append(button)

      lusers.append(li)
    }
  })

  // envoi defi
  $(document).on('click', '#list-users button', function () {
    console.log(this.id)
    socket.emit('envoi defi', this.id)
    alert('défi envoyé')
  })

  // defi reçu
  socket.on('nouveau defi', function (user) {
    var reponse = confirm(`Nouveau défi de ${user} !`)
    if (reponse) {
      socket.emit('accepte defi', user)
    } else {
      socket.emit('refus defi', user)
    }
  })

  // defi envoyé a été refusé
  socket.on('defi refuse', function (user) {
    alert(`Défi refusé par ${user} !`)
  })

  // entrer dans une room
  socket.on('new game', function (room) {
    const name = room.name
    const user1 = room.user1
    const user2 = room.user2
    let adversaire = user2
    let numero = 1
    if (adversaire === username) {
      adversaire = user1
      numero = 2
    }
    document.cookie = 'room=' + name
    document.cookie = 'adversaire=' + adversaire
    document.cookie = 'numero=' + numero
    window.location = 'game.html'
  })

  // send message
  $('#chat').submit(function (e) {
    e.preventDefault()
    socket.emit('nouveau message', $('#msg').val())
    $('#msg').val('')
  })

  // receive message
  socket.on('reponse', function (msg) {
    $('#messages').append($('<li>').text(msg))
  })
})
