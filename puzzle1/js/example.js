var c = document.getElementById("image");
var ctx = c.getContext('2d');
var boardSize = document.getElementById('image').width;
var img = new Image();

ctx.fillStyle = '#646464';
ctx.strokeStyle = '#969696';
var imgData = ctx.createImageData(boardSize, boardSize);
var tiles = [];
var scale = 0;
var tileSize = boardSize / scale;
var debug = "";
var debug1 = "";
var blank = 0;



img.src = "img/sunday.png";

function imageChosen() {
	var input = document.getElementById("imagechoice");
	var fReader = new FileReader();
	fReader.readAsDataURL(input.files[0]);
	fReader.onloadend = function(event) {
		img.src = event.target.result;
	};
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

function aveMod(a, n, m) {
   	var ave = 0;
   	for (var i = m; i < a.length; i += n) 
    	ave = ave + a[i] / (a.length / n);
   	return Math.floor(ave);
}

function getAveRGB(a) {
	return {red:aveMod(a, 4, 0), green:aveMod(a, 4, 1), blue:aveMod(a, 4, 2), alpha:aveMod(a, 4, 3)};
} 

// This builds a tile from the current canvas int the (x,y) position where pair(x,y) = i
function tile(i) {
	this.im = ctx.getImageData( getX(i) * tileSize, getY(i) * tileSize, tileSize, tileSize);
	var aveColor = getAveRGB(this.im.data);
	this.red = aveColor.red;
	this.green = aveColor.green;
	this.blue = aveColor.blue;
	this.alpha = aveColor.alpha;
	this.x0 = getX(i);
	this.y0 = getY(i);
	this.x = this.x0; // will change as piece moves
	this.y = this.y0; // will change as piece moves
	this.idx = i;
	this.inplace = this.x0 == this.x && this.y0 == this.y;
	this.badness = Math.abs(this.x0 - this.x) + Math.abs(this.y0 - this.y);

	this.toString = function() {
		return "idx: " + this.idx + " x0: " + this.x0 + " y0: " + this.y0 + " x:" + this.x + " y:" + this.y;
	}


	function mod(n,m) {
		var s = n % m;
		return s > 0 ? s : m - s;
	}

    this.draw = function() {
    	ctx.putImageData(this.im, this.x * tileSize, this.y * tileSize);
    	// Add number to tile
    	var ft = Math.floor(tileSize / 3) + "px Sans Serif";
    	ctx.save();
    	ctx.globalAlpha = 0.5;
    	var txtColor = 'rgb(' + mod(-100 + this.red, 256) + ', ' + mod(-200 + this.green, 256) + ', ' 
    		+ mod(-100 + this.blue, 256) + ')';
    	console.log(this.red +',' + this.green +',' + this.blue)
    	console.log(this.idx + ":" + txtColor);
    	ctx.fillStyle = txtColor;
		ctx.font = ft;
    	ctx.textAlign = "center";
    	ctx.fillText(this.idx, tileSize * (1 / 2 + this.x), tileSize * (1/6 + 1 / 2 + this.y));
    	ctx.restore();
    }
}


var Loc = {x: 0, y: 0};

function getLoc(e) {
	var mouseX = e.offsetX;
  	var mouseY = e.offsetY;
    Loc.x = Math.floor(mouseX / c.width * scale);
	Loc.y = Math.floor(mouseY / c.height * scale);	
    debug = "(" + Loc.x + ", " + Loc.y + ")" ;
	debug += "<br> Internal postion = (" + (tiles[pair(Loc.x, Loc.y)]).x + ", " + (tiles[pair(Loc.x, Loc.y)]).y + ")";
	debug += "<br> Initial position = (" + tiles[pair(Loc.x,Loc.y)].x0 + ", " + tiles[pair(Loc.x,Loc.y)].y0 + ")";
	debug += "<br> Index = " + tiles[pair(Loc.x,Loc.y)].idx;
	document.getElementById("debug").innerHTML = debug;
}

function getPageLoc(e) {
	debug1 = "Location in the page: <br>"
	debug1 += "(" + e.pageX + ", " + e.pageY + ")";
    document.getElementById("debug1").innerHTML = debug1;
}

document.getElementById('image').addEventListener('mousemove', getLoc, false);
document.getElementById('body').addEventListener('mousemove', getPageLoc, false);

function clickHandler() {
    movePiece(Loc.x, Loc.y);
    checkAns();
    debug1 = "Click on: " + "(" + Loc.x + ", " + Loc.y + ")" ;
    document.getElementById("debug1").innerHTML = debug1;
}

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
    
    document.getElementById('image').addEventListener('click', clickHandler, false);

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
	//ctx.putImageData(tiles[j].im, getX(j) * tileSize, getY(j) * tileSize);
	//ctx.putImageData(tiles[i].im, getX(i) * tileSize, getY(i) * tileSize);
	tiles[i].draw();
	tiles[j].draw();
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
			// ctx.putImageData(tiles[pair(i,j)].im, i * tileSize, j * tileSize);
			tiles[pair(i,j)].draw();
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
	if (test === true) {
            ctx.save();
            ctx.translate(175, 175);
            ctx.rotate(-Math.PI / 4);
            // Create gradient
            var grd = ctx.createRadialGradient(0, 0, 5, 0, 0, 175); 
            grd.addColorStop(0, "red");
            grd.addColorStop(1, "white");
            ctx.fillStyle = grd;
            ctx.font = "70px Sans Serif";
            ctx.textAlign = "center";
            ctx.fillText("Solved", 0, 20);
            ctx.restore();
            document.getElementById('image').removeEventListener('click', clickHandler);
    } 
}