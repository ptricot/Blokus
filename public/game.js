
class piece {
  constructor(i,cells,xmax,ymax) {
    this.cells = cells;
    this.xmax = xmax;
    this.ymax = ymax;
    this.max = Math.max(xmax,ymax);
    this.html = document.createElement('TABLE');
    this.html.classList.add('piece');
    this.html.dataset.xmax = xmax;
    this.html.dataset.ymax = ymax;
    this.html.id = i;
    this.init();
  }
  init(){
    this.html.classList.add('piece');
    for (var x=0; x<=this.max; x++) { // creation d'une table rectangulaire vide
      var tr = document.createElement('TR');
      tr.dataset.x=x;
      tr.classList.add('piece-row')
      for (var y=0; y<=this.max; y++) {
        var td = document.createElement('TD');
        td.dataset.x=x;
        td.dataset.y=y;
        td.classList.add('piece-cell');
        tr.appendChild(td);
      }
      this.html.appendChild(tr);
    }
    this.fill();
    document.getElementById('orange').appendChild(this.html);
  }
  fill(){
    for (var j in this.cells) { // remplissage des cases
      var cell = this.cells[j];
      var td = this.html.childNodes[cell.x].childNodes[cell.y];
      var img = document.createElement('IMG');
      img.src = 'img/o.ico';
      td.appendChild(img);
    }
  }
  empty(){
    for (var i in this.cells) {
      var cell = this.cells[i]
      var td = this.html.childNodes[cell.x].childNodes[cell.y];
      td.innerHTML='';
    }
  }
  rotate() {
    this.empty()

    // On update le tableau des cases
    for (var i in this.cells) {
      // x = y et y = xmax - x
      var temp = this.cells[i].y;
      this.cells[i].y = this.xmax - this.cells[i].x;
      this.cells[i].x = temp;
    }

    // echange de xmax et ymax
    temp = this.xmax;
    this.xmax = this.ymax;
    this.ymax = temp;

    this.fill();
  }
  flip_vert(){
    this.empty()
    for (var i in this.cells){
      this.cells[i].y = this.ymax - this.cells[i].y;
    }
    this.fill()
  }
  flip_hori(){
    this.empty()
    for (var i in this.cells){
      this.cells[i].x = this.xmax - this.cells[i].x;
    }
    this.fill()
  }
}

class damier {
  constructor() {
    this.html = document.getElementById('damier');
    this.tableau = [];
    this.init();
  }
  init() {
    for (var i=0; i<14; i++){
      this.tableau.push([]);
      var tr = document.createElement('TR');
      tr.classList.add('row');
      for (var j=0; j<14; j++){
        this.tableau[i].push(0);
        var td = document.createElement('TD');
        td.classList.add('cell');
        td.dataset.x = i;
        td.dataset.y = j;
        tr.appendChild(td);
      }
      this.html.appendChild(tr);
    }
  }
}

// Pour chaque piece, decrit les cases remplies et cree les pieces

var pieces = [
  new piece(0,[{x:0, y:0}],0,0),
  new piece(1,[{x:0, y:0},{x:0, y:1}],0,1),
  new piece(2,[{x:0, y:0},{x:0, y:1},{x:1, y:1}],1,1),
  new piece(3,[{x:0, y:0},{x:0, y:1},{x:0, y:2}],0,2),
  new piece(4,[{x:0, y:0},{x:0, y:1},{x:1, y:0},{x:1, y:1}],1,1),
  new piece(5,[{x:0, y:1},{x:1, y:0},{x:1, y:1},{x:1, y:2}],1,2),
  new piece(6,[{x:0, y:0},{x:0, y:1},{x:0, y:2},{x:0, y:3}],0,3),
  new piece(7,[{x:0, y:2},{x:1, y:0},{x:1, y:1},{x:1, y:2}],1,2),
  new piece(8,[{x:0, y:1},{x:0, y:2},{x:1, y:0},{x:1, y:1}],1,2),
  new piece(9,[{x:0, y:0},{x:1, y:0},{x:1, y:1},{x:1, y:2},{x:1, y:3}],1,3),
  new piece(10,[{x:0, y:1},{x:1, y:1},{x:2, y:0},{x:2, y:1},{x:2, y:2}],2,2),
  new piece(11,[{x:0, y:0},{x:1, y:0},{x:2, y:0},{x:2, y:1},{x:2, y:2}],2,2),
  new piece(12,[{x:0, y:1},{x:0, y:2},{x:0, y:3},{x:1, y:0},{x:1, y:1}],1,3),
  new piece(13,[{x:0, y:2},{x:1, y:0},{x:1, y:1},{x:1, y:2},{x:2, y:0}],2,2),
  new piece(14,[{x:0, y:0},{x:0, y:1},{x:0, y:2},{x:0, y:3},{x:0, y:4}],0,4),
  new piece(15,[{x:0, y:1},{x:0, y:2},{x:1, y:0},{x:1, y:1},{x:1, y:2}],1,2),
  new piece(16,[{x:0, y:1},{x:0, y:2},{x:1, y:0},{x:1, y:1},{x:2, y:0}],2,2),
  new piece(17,[{x:0, y:0},{x:0, y:1},{x:1, y:0},{x:2, y:0},{x:2, y:1}],2,1),
  new piece(18,[{x:0, y:1},{x:0, y:2},{x:1, y:0},{x:1, y:1},{x:2, y:1}],2,2),
  new piece(19,[{x:0, y:1},{x:1, y:0},{x:1, y:1},{x:1, y:2},{x:2, y:1}],2,2),
  new piece(20,[{x:0, y:1},{x:1, y:0},{x:1, y:1},{x:1, y:2},{x:1, y:3}],1,3),
];

var dam = new damier();

function rotate_left(){
  pieces[$('.clicked').attr('id')].rotate();
  pieces[$('.clicked').attr('id')].rotate();
  pieces[$('.clicked').attr('id')].rotate();
}

function rotate_right(){
  pieces[$('.clicked').attr('id')].rotate();
}

function flip_hori(){
  pieces[$('.clicked').attr('id')].flip_hori();
}

function flip_vert(){
  pieces[$('.clicked').attr('id')].flip_vert();
}

$(document).ready(function($){
  // Selection/deselection des pieces
  $('.piece').click(function(){
    if (!$(this).hasClass('clicked')){
      $('.clicked').removeClass('clicked');
      $('.cell-anchor').removeClass('cell-anchor');
      $(this).addClass('clicked');
      $(this).children().eq(0).children().eq(0).addClass('cell-anchor');
    }
    else {
      $(this).removeClass('clicked');
      $(this).children().eq(0).children().eq(0).removeClass('cell-anchor');
    }
  });

  // Placement sur le board
  $('.cell').click(function(){
    var x = $(this).data('x'), y = $(this).data('y'); // la case cliquee
    if ($('.clicked').length>0 & x+$('.clicked').eq(0).data('xmax')<14 & y+$('.clicked').eq(0).data('ymax')<14) {
      var cells = pieces[$('.clicked').eq(0).attr('id')].cells; // Les cases a colorer
      $('.cell-select').removeClass('cell-select'); // On retire un eventuel autre placement
      for (i in cells) {
        $('#damier').children().eq(x+cells[i].x).children().eq(y+cells[i].y).addClass('cell-select');
      }
    }
    else {
      console.log('clic invalide');
    }
  });
});


function validate() { // Au clic sur le bouton valider
  //  --> Requete serveur ici
  //

  // Vider le cache de selection
}
