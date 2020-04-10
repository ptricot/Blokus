/* global $ */
/* global io */
/* global alert */

$(function () {
  const socket = io()

  // Read cookies : user=username; adversaire=username2; room=room-name; numero=joueur
  const cookies = {}
  const text = document.cookie.split('; ')
  for (var i in text) {
    var key, value
    [key, value] = text[i].split('=')
    cookies[key] = value
  }
  cookies.numero = parseInt(cookies.numero)

  socket.emit('user joined', JSON.stringify(cookies))

  // classes
  class Piece {
    constructor (i, cells, xmax, ymax, color) {
      this.cells = cells
      this.xmax = xmax
      this.ymax = ymax
      this.max = Math.max(xmax, ymax)
      this.html = document.createElement('TABLE')
      this.html.dataset.xmax = xmax
      this.html.dataset.ymax = ymax
      this.html.id = i
      this.color = color
      this.init()
    }

    init () {
      if (this.color === 'orange') { this.html.classList.add('piece-or') } else { this.html.classList.add('piece-pu') }
      for (var x = 0; x <= this.max; x++) { // creation d'une table rectangulaire vide
        var tr = document.createElement('TR')
        tr.dataset.x = x
        tr.classList.add('piece-row')
        for (var y = 0; y <= this.max; y++) {
          var td = document.createElement('TD')
          td.dataset.x = x
          td.dataset.y = y
          td.classList.add('piece-cell')
          tr.appendChild(td)
        }
        this.html.appendChild(tr)
      }
      this.fill()
      if (this.color === 'orange') { document.getElementById('orange').appendChild(this.html) } else { document.getElementById('purple').appendChild(this.html) }
    }

    fill () {
      for (var j in this.cells) { // remplissage des cases
        var cell = this.cells[j]
        var td = this.html.childNodes[cell.x].childNodes[cell.y]
        var img = document.createElement('IMG')
        if (this.color === 'orange') { img.src = 'img/o.ico' } else { img.src = 'img/p.ico' }
        td.appendChild(img)
      }
    }

    toGray () {
      for (var j in this.cells) { // remplissage des cases
        var cell = this.cells[j]
        var td = this.html.childNodes[cell.x].childNodes[cell.y]
        var img = document.createElement('IMG')
        img.src = 'img/g.ico'
        td.innerHTML = ''
        td.appendChild(img)
      }
    }

    empty () {
      for (var i in this.cells) {
        var cell = this.cells[i]
        var td = this.html.childNodes[cell.x].childNodes[cell.y]
        td.innerHTML = ''
      }
    }

    rotate () {
      this.empty()

      // On update le tableau des cases
      for (var i in this.cells) {
        // x = y et y = xmax - x
        var temp = this.cells[i].y
        this.cells[i].y = this.xmax - this.cells[i].x
        this.cells[i].x = temp
      }

      // echange de xmax et ymax
      temp = this.xmax
      this.xmax = this.ymax
      this.ymax = temp

      this.fill()
    }

    flipVert () {
      this.empty()
      for (var i in this.cells) {
        this.cells[i].y = this.ymax - this.cells[i].y
      }
      this.fill()
    }

    flipHori () {
      this.empty()
      for (var i in this.cells) {
        this.cells[i].x = this.xmax - this.cells[i].x
      }
      this.fill()
    }
  }
  class Board {
    constructor () {
      this.html = document.getElementById('damier')
      this.init()
    }

    init () {
      for (var i = 0; i < 14; i++) {
        var tr = document.createElement('TR')
        tr.classList.add('row')
        for (var j = 0; j < 14; j++) {
          var td = document.createElement('TD')
          td.classList.add('cell')
          td.dataset.x = i
          td.dataset.y = j
          tr.appendChild(td)
        }
        this.html.appendChild(tr)
      }
      if (cookies.numero === 1) {
        $('#damier').children().eq(4).children().eq(4).removeClass('cell')
        $('#damier').children().eq(9).children().eq(9).removeClass('cell')
        $('#damier').children().eq(4).children().eq(4).addClass('border-or')
        $('#damier').children().eq(9).children().eq(9).addClass('border-pur')
        $('#info').text('A vous de jouer.\n Sélectionnez une pièce, tournez-la\n et placez-la sur le plateau.')
      }
      if (cookies.numero === 2) {
        $('#damier').children().eq(4).children().eq(4).removeClass('cell')
        $('#damier').children().eq(9).children().eq(9).removeClass('cell')
        $('#damier').children().eq(4).children().eq(4).addClass('border-pur')
        $('#damier').children().eq(9).children().eq(9).addClass('border-or')
        $('#info').text("L'adversaire est en train de jouer.")
      }
    }

    update (tableau) { // 0:vide, 1:orange, 2:violet
      for (var i in tableau) {
        for (var j in tableau[i]) {
          switch (tableau[i][j]) {
            case 0:
              break
            case 1:
              this.html.children[i].children[j].classList.add('cell-oran')
              break
            case 2:
              this.html.children[i].children[j].classList.add('cell-purp')
              break
          }
        }
      }
    }

    color (liste, couleur) {
      if (couleur === 'orange') {
        for (var i in liste) {
          this.html.children[liste[i].x].children[liste[i].y].classList.add('cell-oran')
        }
      } else {
        for (i in liste) {
          this.html.children[liste[i].x].children[liste[i].y].classList.add('cell-purp')
        }
      }
    }
  }

  // Pour chaque piece, decrit les cases remplies et cree les pieces
  var pieces = [
    new Piece(0, [{ x: 0, y: 0 }], 0, 0, 'orange'),
    new Piece(1, [{ x: 0, y: 0 }, { x: 0, y: 1 }], 0, 1, 'orange'),
    new Piece(2, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], 1, 1, 'orange'),
    new Piece(3, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }], 0, 2, 'orange'),
    new Piece(4, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 1, 'orange'),
    new Piece(5, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2, 'orange'),
    new Piece(6, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], 0, 3, 'orange'),
    new Piece(7, [{ x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2, 'orange'),
    new Piece(8, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 2, 'orange'),
    new Piece(9, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }], 1, 3, 'orange'),
    new Piece(10, [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 2, 2, 'orange'),
    new Piece(11, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 2, 2, 'orange'),
    new Piece(12, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 3, 'orange'),
    new Piece(13, [{ x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }], 2, 2, 'orange'),
    new Piece(14, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }], 0, 4, 'orange'),
    new Piece(15, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2, 'orange'),
    new Piece(16, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }], 2, 2, 'orange'),
    new Piece(17, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }], 2, 1, 'orange'),
    new Piece(18, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], 2, 2, 'orange'),
    new Piece(19, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }], 2, 2, 'orange'),
    new Piece(20, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }], 1, 3, 'orange')
  ]
  var piecesPurp = [
    new Piece(21, [{ x: 0, y: 0 }], 0, 0, 'purple'),
    new Piece(22, [{ x: 0, y: 0 }, { x: 0, y: 1 }], 0, 1, 'purple'),
    new Piece(23, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], 1, 1, 'purple'),
    new Piece(24, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }], 0, 2, 'purple'),
    new Piece(25, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 1, 'purple'),
    new Piece(26, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2, 'purple'),
    new Piece(27, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], 0, 3, 'purple'),
    new Piece(28, [{ x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2, 'purple'),
    new Piece(29, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 2, 'purple'),
    new Piece(30, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }], 1, 3, 'purple'),
    new Piece(31, [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 2, 2, 'purple'),
    new Piece(32, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 2, 2, 'purple'),
    new Piece(33, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 3, 'purple'),
    new Piece(34, [{ x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }], 2, 2, 'purple'),
    new Piece(35, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }], 0, 4, 'purple'),
    new Piece(36, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2, 'purple'),
    new Piece(37, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }], 2, 2, 'purple'),
    new Piece(38, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }], 2, 1, 'purple'),
    new Piece(39, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], 2, 2, 'purple'),
    new Piece(40, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }], 2, 2, 'purple'),
    new Piece(41, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }], 1, 3, 'purple')
  ]
  var board = new Board()
  var cache

  function rotateLeft () {
    pieces[$('.clicked').attr('id')].rotate()
    pieces[$('.clicked').attr('id')].rotate()
    pieces[$('.clicked').attr('id')].rotate()
  }
  function rotateRight () {
    pieces[$('.clicked').attr('id')].rotate()
  }
  function flipHori () {
    pieces[$('.clicked').attr('id')].flipHori()
  }
  function flipVert () {
    pieces[$('.clicked').attr('id')].flipVert()
  }
  function validate () { // Au clic sur le bouton valider
    if (cache) {
      // Requete serveur ici
      socket.emit('play turn', JSON.stringify(cache))
    }
  }

  $('#left').click(() => rotateLeft())
  $('#right').click(() => rotateRight())
  $('#hori').click(() => flipHori())
  $('#verti').click(() => flipVert())
  $('#but').click(() => validate())

  // Selection/deselection des pieces
  $('.piece-or').click(function () {
    if (!$(this).hasClass('clicked')) {
      $('.clicked').removeClass('clicked')
      $('.cell-anchor').removeClass('cell-anchor')
      $(this).addClass('clicked')
      $(this).children().eq(0).children().eq(0).addClass('cell-anchor')
    } else {
      $(this).removeClass('clicked')
      $(this).children().eq(0).children().eq(0).removeClass('cell-anchor')
    }
  })

  // Placement sur le board
  $('.cell, .border-or, .border-pur').click(function () {
    var x = $(this).data('x'); var y = $(this).data('y') // la case cliquee
    if ($('.clicked').length > 0) {
      // Coloration des cases sur le board et remplissage du cache
      var cells = pieces[$('.clicked').eq(0).attr('id')].cells // Les cases a colorer
      $('.cell-select').removeClass('cell-select') // On retire un eventuel autre placement
      cache = {
        id: $('.clicked').eq(0).attr('id'),
        cells: [],
        numero: cookies.numero,
        room: cookies.room
      }
      for (var i in cells) {
        $('#damier').children().eq(x + cells[i].x).children().eq(y + cells[i].y).addClass('cell-select')
        cache.cells.push({ x: x + cells[i].x, y: y + cells[i].y })
      }
    } else {
      console.log('clic invalide')
    }
  })

  socket.on('turn played', function (data) { // Le serveur envoie ce qui a été joué (avec les cases a colorer)
    data = JSON.parse(data)
    var color
    if (data.numero === cookies.numero) { // Ce joueur a joué
      color = 'orange'
      $('#' + data.id).unbind('click') // desactive le clic sur la piece
      $('.cell-select').removeClass('cell-select') // On retire un eventuel autre placement
      pieces[data.id].toGray() // la piece devient grisée dans le bac a pieces
      cache = null
      $('.clicked').removeClass('clicked')
      $('.cell-anchor').removeClass('cell-anchor')
      $('#info').text("L'adversaire est en train de jouer.")
    } else { // l'adversaire a joué
      color = 'purple'
      piecesPurp[data.id].toGray() // la piece devient grisée dans le bac a pieces
      console.log("l'adversaire a joué")
      $('#info').text('A vous de jouer.\n Sélectionnez une pièce, tournez-la\n et placez-la sur le plateau.')
    }
    board.color(data.cells, color) // coloration sur le board
  })

  $('#giveup').click(function () {
    socket.emit('give up', JSON.stringify(cookies))
  })

  socket.on('fin de jeu', function (data) {
    data = JSON.parse(data)
    if (data.numero === cookies.numero) {
      alert('Dommage, vous avez perdu !')
      window.location = '/'
    } else {
      alert('Bravo, vous avez gagné !')
      window.location = '/'
    }
  })

  socket.on('turn pass',function (data) {
    data=JSON.parse(data)
    if (data.numero===cookies.numero){
      $('#giveup').unbind('click')
      $('#info').text("L'adversaire est en train de jouer.")
    }
    else {
      $('#info').text('L\'adversaire ne peut plus jouer, c\'est à vous de jouer.')
    }
  })
})
