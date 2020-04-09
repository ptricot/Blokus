  $(function () {
    const socket = io();

    // send message
    $('form').submit(function(e){
      e.preventDefault()
      socket.emit('nouveau message', $('#msg').val())
      $('#msg').val('')
    })

    // receive message
    socket.on('reponse', function(msg){
      $('#messages').append($('<li>').text(msg))
    })
  })