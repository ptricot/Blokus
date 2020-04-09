/* global $ */

class Piece {
  constructor (i, cells, xmax, ymax) {
    this.cells = cells
    this.xmax = xmax
    this.ymax = ymax
    this.max = Math.max(xmax, ymax)
    this.html = document.createElement('TABLE')
    this.html.classList.add('piece')
    this.html.dataset.xmax = xmax
    this.html.dataset.ymax = ymax
    this.html.id = i
    this.init()
  }

  init () {
    this.html.classList.add('piece')
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
    document.getElementById('orange').appendChild(this.html)
  }

  fill () {
    for (var j in this.cells) { // remplissage des cases
      var cell = this.cells[j]
      var td = this.html.childNodes[cell.x].childNodes[cell.y]
      var img = document.createElement('IMG')
      img.src = 'img/o.ico'
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
class Damier {
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
  }
  update (tableau) { // 0:vide, 1:orange, 2:violet
    for (var i in tableau){
      for (var j in tableau[i]){
        switch(tableau[i][j]){
          case 0:
            break;
          case 1:
            this.html.children[i].children[j].classList.add('cell-oran');
            break;
          case 2:
            this.html.children[i].children[j].classList.add('cell-purp');
            break;
      }
    }
  }
}
}
// Pour chaque piece, decrit les cases remplies et cree les pieces

var pieces = [
  new Piece(0, [{ x: 0, y: 0 }], 0, 0),
  new Piece(1, [{ x: 0, y: 0 }, { x: 0, y: 1 }], 0, 1),
  new Piece(2, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], 1, 1),
  new Piece(3, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }], 0, 2),
  new Piece(4, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 1),
  new Piece(5, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2),
  new Piece(6, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }], 0, 3),
  new Piece(7, [{ x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2),
  new Piece(8, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 2),
  new Piece(9, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }], 1, 3),
  new Piece(10, [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 2, 2),
  new Piece(11, [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], 2, 2),
  new Piece(12, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 1, 3),
  new Piece(13, [{ x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 0 }], 2, 2),
  new Piece(14, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }], 0, 4),
  new Piece(15, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], 1, 2),
  new Piece(16, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }], 2, 2),
  new Piece(17, [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }], 2, 1),
  new Piece(18, [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], 2, 2),
  new Piece(19, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }], 2, 2),
  new Piece(20, [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }], 1, 3)
];
var dam = new Damier();
var cache;
const socket = io();

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
  if (cache){
    // Requete serveur ici
    socket.emit('play turn', JSON.stringify(cache));
  }
}

$(document).ready(function ($) {
  // Selection/deselection des pieces
  $('.piece').click(function () {
    if (!$(this).hasClass('clicked')) {
      $('.clicked').removeClass('clicked')
      $('.cell-anchor').removeClass('cell-anchor')
      $(this).addClass('clicked')
      $(this).children().eq(0).children().eq(0).addClass('cell-anchor')
    } else {
      $(this).removeClass('clicked')
      $(this).children().eq(0).children().eq(0).removeClass('cell-anchor')
    }
  });

  // Placement sur le board
  $('.cell').click(function () {
    var x = $(this).data('x'); var y = $(this).data('y') // la case cliquee
    if ($('.clicked').length > 0 & x + $('.clicked').eq(0).data('xmax') < 14 & y + $('.clicked').eq(0).data('ymax') < 14) {
      // Coloration des cases sur le board et remplissage du cache
      var cells = pieces[$('.clicked').eq(0).attr('id')].cells; // Les cases a colorer
      $('.cell-select').removeClass('cell-select'); // On retire un eventuel autre placement
      cache = {
        id:$('.clicked').eq(0).attr('id'),
        cells:[]
      };
      for (var i in cells) {
        $('#damier').children().eq(x+cells[i].x).children().eq(y+cells[i].y).addClass('cell-select');
        cache.cells.push({x:x+cells[i].x,y:y+cells[i].y});
      }
    } else {
      console.log('clic invalide');
    }
  });
});

socket.on('end turn', function (msg) {

});
socket.on('turn played', function (msg) {

});
