// Pour chaque pièce, décrit les cases remplies

  var pieces =
{
  1:{
    0:[{x:0, y:0}],
    90:[{x:0, y:0}],
    180:[{x:0, y:0}],
    270:[{x:0, y:0}]
  },
  2:{
    0:[{x:0, y:0},{x:0, y:1}],
    90:[{x:0, y:0},{x:1, y:0}],
    180:[{x:0, y:0},{x:0, y:1}],
    270:[{x:0, y:0},{x:1, y:0}]
  },
  3:{
    0:[{x:0, y:0},{x:0, y:1},{x:1, y:1}],
    90:[{x:0, y:1},{x:1, y:1},{x:1, y:0}],
    180:[{x:1, y:1},{x:1, y:0},{x:0, y:0}],
    270:[{x:1, y:0},{x:0, y:0},{x:0, y:1}]
  },
  4:{
    0:[{x:0, y:0},{x:0, y:1},{x:0, y:2}],
    90:[{x:0, y:0},{x:1, y:0},{x:2, y:0}],
    180:[{x:0, y:0},{x:0, y:1},{x:0, y:2}],
    270:[{x:0, y:0},{x:1, y:0},{x:2, y:0}]
  }
};
var damier = document.getElementById('damier');

for (i=0; i<14; i++){
  var tr = document.createElement('TR');
  tr.classList.add('row');
  for (j=0; j<14; j++){
    var td = document.createElement('TD');
    td.classList.add('cell');
    td.id = i.toString()+'x'+j.toString();
    td.dataset.x = i;
    td.dataset.y = j;
    td.ondrop = function(event){drop(event)};
    td.ondragover = function(event){allowDrop(event)};
    tr.appendChild(td);
  }
  damier.appendChild(tr);
}

function drag(event){
  event.dataTransfer.setData("text", event.target.id);
}

function allowDrop(event){
  event.preventDefault();
}

function rotate(piece){
  piece.dataset.ang = (parseInt(piece.dataset.ang)+90 % 360).toString();
  piece.setAttribute('style','transform:rotate('+piece.dataset.ang+'deg)');
}

function toOr(x,y){
  var cell = document.getElementById(x.toString()+'x'+y.toString());
  cell.classList.remove("cell");
  cell.classList.add("cell-oran");
}

function drop(event){
  event.preventDefault();
  var cell = document.getElementById(event.target.id),
    npiece = event.dataTransfer.getData("text").substring(1),
    ang = parseInt(document.getElementById(event.dataTransfer.getData("text")).dataset.ang) % 360;
  var list = pieces[npiece][ang],
    x = parseInt(cell.dataset.x),
    y = parseInt(cell.dataset.y);
  for (i in list){
    toOr(list[i].x+x,list[i].y+y);
  }
}
