var c = document.getElementById("image");
var ctx = c.getContext('2d');
var boardSize = document.getElementById('image').width;
var img = new Image();

ctx.fillStyle = '#646464'
ctx.strokeStyle = '#969696';
var imgData = ctx.createImageData(boardSize,boardSize);
var tiles = [];
var scale = 0;
var tileSize = boardSize / scale;
var debug = "";
var debug1 = "";
var blank = 0;

img.src = "img/sunday.png";

function imageChosen () {
	var input = document.getElementById("imagechoice");
	var fReader = new FileReader();
	fReader.readAsDataURL(input.files[0]);
	fReader.onloadend = function(event){
		img.src = event.target.result;
	}
	setData();
	drawPuzzle();
}



function imageChosenWeb () {
	var input = document.getElementById("imagechoicefromweb");
	// img.setAttribute('crossOrigin', '');
	img.src = input.value; //  + '?' + new Date().getTime();
	setData();
	drawPuzzle();
}


img.addEventListener('load', function() {setData();drawPuzzle();}, false);

var Loc = {x: 0, y: 0};

function getLoc(e) {
	var mouseX = e.offsetX;
  	var mouseY = e.offsetY;
    Loc.x = Math.floor(mouseX / c.width * scale);
	Loc.y = Math.floor(mouseY / c.height * scale);	
    debug = "(" + Loc.x + ", " + Loc.y + ")" ;
	debug += "<br> Internal postion = (" + tiles[pair(Loc.x,Loc.y)].x + ", " + tiles[pair(Loc.x,Loc.y)].y + ")";
	debug += "<br> Initial position = (" + tiles[pair(Loc.x,Loc.y)].x0 + ", " + tiles[pair(Loc.x,Loc.y)].y0 + ")";
	debug += "<br> Index = " + tiles[pair(Loc.x,Loc.y)].idx;
    document.getElementById("debug").innerHTML = debug;
  	
}

document.getElementById('image').addEventListener('mousemove', getLoc, false);
		

document.getElementById('image').addEventListener('click', 
	function() {
		movePiece(Loc.x,Loc.y);
		if (checkAns() == true) {
			e = document.getElementById("result")
			e.innerHTML = "You Solved It!";
			e.style.color = '#FF0000';
			e.style.fontSize = 'x-large';
		}
		debug1 = "Click on: " + "(" + Loc.x + ", " + Loc.y + ")" ;
    	document.getElementById("debug1").innerHTML = debug1;
  	},
  	false);


document.getElementById('image').addEventListener('touchstart', 
	function() {
		movePiece(Loc.x,Loc.y);
		debug1 = "Click on: " + "(" + Loc.x + ", " + Loc.y + ")" ;
    	document.getElementById("debug1").innerHTML = debug1;
  	},
  	false);


// Draw background grid
function setBackground () {
	for (var i = 0; i < scale + 1; i++) {
		ctx.beginPath();
		ctx.linewidth = 10;
		ctx.moveTo(i * tileSize, 0);
		ctx.lineTo(i * tileSize, boardSize);
		ctx.moveTo(0, i * tileSize);
		ctx.lineTo(boardSize, i * tileSize);
		ctx.stroke();
		ctx.closePath();
	}
}


// This builds a tile from the current canvas int the (x,y) position where pair(x,y) = i
function tile(i) {
	this.im = ctx.getImageData( getX(i) * tileSize, getY(i) * tileSize, tileSize, tileSize);
	this.x0 = getX(i);
	this.y0 = getY(i);
	this.x = this.x0 // will change as piece moves
	this.y = this.y0; // will change as piece moves
	this.idx = i;
	this.inplace = this.x0 == this.x && this.y0 == this.y;
	this.badness = Math.abs(this.x0 - this.x) + Math.abs(this.y0 - this.y);
	this.toString = function() {
		return "idx: " + this.idx + " x0: " + this.x0 + " y0: " + this.y0 + " x:" + this.x + " y:" + this.y;
	}
}

function setData () {
	scale = document.getElementById('scale').value;
	tileSize = boardSize / scale;

	clearCtx();
	ctx.drawImage(img, 0, 0, boardSize, boardSize);
	setBackground();
	blank = 0;
	
	// Make 0th rect blank
	ctx.fillStyle = '#222222'
	ctx.fillRect(0, 0, tileSize, tileSize);
	ctx.fillStyle = '#646464'

	// Get an internal copy to manipulate
	imgData = ctx.getImageData(0, 0, boardSize, boardSize);
	for (var i = 0; i < scale * scale; i++) {
		tiles[i] = new tile(i);
	}
	clearCtx();
	e = document.getElementById("result")
	e.innerHTML = "Solve It!";
	e.style.color = '#AA00AA';
	e.style.fontSize = 'x-large';
}

// This is how we associate an array index to a pair. (x,y) <-> (column, row)
// This might have been a bad idea.
function pair(i,j) {
	if (i < 0 || i - 1 > scale || j < 0 || j - 1 > scale) {
		return -1;
	}
	return j * scale + i;
}

function getX(i) {
	return i % scale;
}

function getY(i) {
	return (i - (i % scale)) / scale;
}


function swapTile(j,i) {
	// i and j must be in the appropriate range
 	if (i < 0 || i > scale * scale -1 || j < 0 || j > scale * scale -1)
 		return; // do nothing

	var tmpBlank = blank;
	if (i == blank)
		tmpBlank = j;
	else if (j == blank)
		tmpBlank = i;

	blank = tmpBlank;

	var tmp = tiles[i];
	tiles[i] = tiles[j];
	tiles[i].x = getX(i);
	tiles[i].y = getY(i);
	tiles[j] = tmp;
	tiles[j].x = getX(j);
	tiles[j].y = getY(j);
	ctx.putImageData(tiles[j].im, getX(j) * tileSize, getY(j) * tileSize);
	ctx.putImageData(tiles[i].im, getX(i) * tileSize, getY(i) * tileSize);
}

// move the (i,j)th piece if it is next to blank
function movePiece(i,j) {
	var curTile = pair(i,j);

	// console.log("(" + i + ", " + j + ")");
	
	if (blank == pair(i - 1, j)) {
		swapTile(curTile,blank);
	} else if (blank == pair(i + 1, j)){
		swapTile(curTile,blank);
	} else if (blank == pair(i , j - 1)){
		swapTile(curTile,blank);
	} else if (blank == pair(i , j + 1)){
		swapTile(curTile,blank);
	} else {
		// console.log("(" + i + ", " + j + ") is not adjacent to blank");
	}
}


// This is a silly shuffle, but it garantees that the puzzle s solvable.
function shuffle1() {
	for (var i = 0; i < scale / 2 * scale  * scale * scale; i++) {
		var r = Math.floor(Math.random() * 2);
		var s = Math.floor(Math.random() * 2) - 1;
		s = (s == 0 ? -1 : 1);
		var x = tiles[blank].x + s*r;
		var y = tiles[blank].y + s*(1-r);
		if (x >= 0 && x < scale && y >= 0 && y < scale) {
			 movePiece(x, y);
		}
	}
}

function shuffle () {
	var count = 0;
	timer = setInterval(function () {
		var r = Math.floor(Math.random() * 2);
		var s = Math.floor(Math.random() * 2) - 1;
		s = (s == 0 ? -1 : 1);
		var x = tiles[blank].x + s*r;
		var y = tiles[blank].y + s*(1-r);
		if (x >= 0 && x < scale && y >= 0 && y < scale) {
			movePiece(x, y);
		}
		if (count++ > scale * scale * scale)
			clearInterval(timer);
	}, 40);

}

function drawPuzzle() {
	for (var i = 0; i < scale; i++) {
		for (var j = 0; j < scale; j++) {
			ctx.putImageData(tiles[pair(i,j)].im, i * tileSize, j * tileSize);
		}
	}
}

function clearCtx() {
	ctx.clearRect(0, 0, ctx.width, ctx.height);
	ctx.fillRect(0, 0, boardSize, boardSize);
	setBackground();
}

function checkAns() {
	var test = true;
	for (var i = 0; i < tiles.length; i++) {
		if (tiles[i].idx != i)
			test = false && test;
	}
	return test;
}