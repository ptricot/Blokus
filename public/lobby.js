/* global $ */
/* global io */

$(function () {
  const socket = io()

  // send message
  $('form').submit(function (e) {
    e.preventDefault()
    socket.emit('nouveau message', $('#msg').val())
    $('#msg').val('')
  })

  // receive message
  socket.on('reponse', function (msg) {
    $('#messages').append($('<li>').text(msg))
  })

  // show users
  var users = [
    { name: 'Taz' },
    { name: 'Paul' },
    { name: 'Jean' },
    { name: 'Pierre' }
  ]
  var lusers = document.getElementById('list-users')
  for (var i in users) {
    var user = users[i]
    var li = document.createElement('LI')
    var text = document.createTextNode(user.name)
    var button = document.createElement('BUTTON')

    button.innerHTML = 'Play with'
    button.classList.add('but')
    button.onclick = 'challenge(' + user.name + ')'

    li.appendChild(text)
    li.appendChild(button)

    lusers.appendChild(li)
  }
})
