class piece {
  constructor(i,cells,xmax,ymax) {
    this.cells = cells;
    this.id = i.toString();
    this.xmax = xmax;
    this.ymax = ymax;
    this.html = document.createElement('TABLE');
    this.html.classList.add('piece');
    this.html.dataset.master = i.toString();
    this.init();
  }
  init(){
    this.html.classList.add('piece');
    this.update();
    document.getElementById('orange').appendChild(this.html);
  }
  update(){
    for (var x=0; x<=this.xmax; x++) { // creation d'une table rectangulaire vide
      var tr = document.createElement('TR');
      tr.dataset.x=x;
      tr.classList.add('piece-row')
      for (var y=0; y<=this.ymax; y++) {
        var td = document.createElement('TD');
        td.dataset.x=x;
        td.dataset.y=y;
        td.classList.add('piece-cell');
        tr.appendChild(td);
      }
      this.html.appendChild(tr);
    }
    for (var j in this.cells) { // remplissage des cases
      var cell = this.cells[j];
      console.log(this.id,this.xmax,this.ymax,cell.x,cell.y);
      var td = this.html.childNodes[cell.x].childNodes[cell.y];
      var img = document.createElement('IMG');
      img.src = 'img/o.ico';
      td.appendChild(img);
    }
  }
  rotate() {
    // On enleve les images dans les cases
    for (var i in this.cells) {
      var cell = this.cell[i]
      var td = this.html.childNodes[cell.x].childNodes[cell.y];
      td.removeChild();
    }
    // On update le tableau des cases
    for (var i in this.cells) {
      // x = y et y = xmax - x
      var temp = this.cells[i].y;
      this.cells[i].y = this.xmax - this.cells[i].x;
      this.cells[i].x = temp;
      // echange de xmax et ymax
      temp = this.xmax;
      this.xmax = this.ymax;
      this.ymax = temp;
    }
    // On rajoute les images dans les cases
    for (var i in this.cells){
      var cell = this.cell[i];
      var td = this.html.childNodes[cell.x].childNodes[cell.y];
      var img = document.createElement('IMG');
      img.src = 'img/o.ico';
      td.appendChild(img);
    }
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
  new piece(3,[{x:0, y:0},{x:0, y:1},{x:0, y:2}],0,2)
];

var dam = new damier();
var selected = 0;

function validate() { // Au clic sur le bouton valider
  //  --> Requete serveur ici
  //

  // Vider le cache de selection
}

$(document).ready(function($){
  $('.piece').click(function(){
    if (!$(this).hasClass('clicked')){
      $('.clicked').removeClass('clicked');
      $(this).addClass('clicked');
      selected = $(this).id;
    }
    else {
      $(this).removeClass('clicked');
    }
  });
});
