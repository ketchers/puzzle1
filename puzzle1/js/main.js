var c = document.getElementById("canvas");
var solveBtn = document.getElementById("solveBtn");
var Soln = document.getElementById("Soln");

var ctx = c.getContext('2d');
var boardSize = c.width;
var img = new Image();

ctx.fillStyle = '#646464';
ctx.strokeStyle = '#969696';
var imgData = ctx.createImageData(boardSize, boardSize);
var tiles = {};

var dimention = 0;
var puzSize = dimention * dimention;
var tileSize = 0;
var debug = "";
var debug1 = "";
var blank = 0;

var startNode = [];


var solution = [];
var soln = "";
var timer;

var mouseX;
var mouseY;

var cnt = 0;

solveBtn.addEventListener('click', solveBtnHandler, false);

// A nbrMap[i] = [j,k,l,m] where j,k,l,m are adjacent (if i is a corner just [j,k], if i on edge and not corner just [j,k,l]). 
var nbrMap = {};

img.src = "img/sunday.png";

function imageChosen() {
    var input = document.getElementById("imagechoice");
    var fReader = new FileReader();
    fReader.readAsDataURL(input.files[0]);
    fReader.onloadend = function (event) {
        img.src = event.target.result;
    };
    setData();
    drawPuzzle();
}



function imageChosenWeb() {
    var input = document.getElementById("imagechoicefromweb");
    img.src = input.value; //  + '?' + new Date().getTime();
    //ctx.drawImage(img, 0, 0, boardSize, boardSize);
    //var fullQuality = c.toDataURL("image/jpeg", 1.0);
    //imgData.src = fullQuality;
    setData();
    drawPuzzle();
}


img.addEventListener('load', function () {
    setData();
    drawPuzzle();
}, false);

function solveBtnHandler() {

    solveBtn.style.visibility = 'hidden';

    var ln = soln.length;


    function move() {
        var node = tilesToArray();
        var idx = node.indexOf(soln[cnt]);
        movePiece(getX(idx), getY(idx));
        cnt++;
        if (cnt == ln) {
            clearInterval(timer);
            checkAns();
        }
    }

    var timer = setInterval(move, 300);
}

function aveMod(a, n, m) {
    var ave = 0;
    for (var i = m; i < a.length; i += n)
        ave = ave + a[i] / (a.length / n);
    return Math.floor(ave);
}

function getAveRGB(a) {
    return {
        red: aveMod(a, 4, 0)
        , green: aveMod(a, 4, 1)
        , blue: aveMod(a, 4, 2)
        , alpha: aveMod(a, 4, 3)
    };
}

// This builds a tile from the current canvas int the (x,y) position where pair(x,y) = i
function tile(i) {
    this.im = ctx.getImageData(getX(i) * tileSize, getY(i) * tileSize, tileSize, tileSize);
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

    this.toString = function () {
        return "idx: " + this.idx + " x0: " + this.x0 + " y0: " + this.y0 + " x:" + this.x + " y:" + this.y;
    }


    function mod(n, m) {
        var s = n % m;
        return s > 0 ? s : m - s;
    }

    this.draw = function () {
        ctx.putImageData(this.im, this.x * tileSize, this.y * tileSize);
        // Add number to tile
        var ft = Math.floor(tileSize / 3) + "px Sans Serif";
        ctx.save();
        ctx.globalAlpha = 0.5;
        var txtColor = 'rgb(' + mod(-100 + this.red, 256) + ', ' + mod(-200 + this.green, 256) + ', ' + mod(-100 + this.blue, 256) + ')';
        ctx.fillStyle = txtColor;
        ctx.font = ft;
        ctx.textAlign = "center";
        ctx.fillText(this.idx, tileSize * (1 / 2 + this.x), tileSize * (1 / 6 + 1 / 2 + this.y));
        ctx.restore();
    }
}


var Loc = {
    x: 0
    , y: 0
};

function getLoc(e) {
    mouseX = Math.floor(e.offsetX / c.width * dimention);
    mouseY = Math.floor(e.offsetY / c.height * dimention);
    debug = "(" + mouseX + ", " + mouseY + ")";
    debug += "<br> Internal postion = (" + (tiles[pair(mouseX, mouseY)]).x + ", " + (tiles[pair(mouseX, mouseY)]).y + ")";
    debug += "<br> Initial position = (" + tiles[pair(mouseX, mouseY)].x0 + ", " + tiles[pair(mouseX, mouseY)].y0 + ")";
    debug += "<br> Index = " + tiles[pair(mouseX, mouseY)].idx;
    document.getElementById("debug").innerHTML = debug;
}

function getPageLoc(e) {
    debug1 = "Location in the page: <br>"
    debug1 += "(" + e.pageX + ", " + e.pageY + ")";
    document.getElementById("debug1").innerHTML = debug1;
}

document.getElementById('canvas').addEventListener('mousemove', getLoc, false);
document.getElementById('body').addEventListener('mousemove', getPageLoc, false);

function clickHandler() {
    movePiece(mouseX, mouseY);
    checkAns();
    debug1 = "Click on: " + "(" + mouseX + ", " + mouseY + ")";
    document.getElementById("debug1").innerHTML = debug1;
}

document.getElementById('canvas').addEventListener('touchstart'
    , function () {
        movePiece(mouseX, mouseY);
        debug1 = "Click on: " + "(" + mouseX + ", " + mouseY + ")";
        document.getElementById("debug1").innerHTML = debug1;
    }
    , false);


// Draw background grid
function setBackground() {
    for (var i = 0; i < dimention + 1; i++) {
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


function tilesToArray() {
    var node = [];
    for (var i = 0; i < puzSize; i++)
        node.push(tiles[i].idx);
    return node;
}

function neighbor(i) {
    //debugger;
    var nbr = [];
    var x = getX(i);
    var y = getY(i);
    if (x - 1 >= 0)
        nbr.push(pair(x - 1, y));
    if (y - 1 >= 0)
        nbr.push(pair(x, y - 1));
    if (x + 1 < dimention)
        nbr.push(pair(x + 1, y));
    if (y + 1 < dimention)
        nbr.push(pair(x, y + 1));
    return nbr;
}

function neighbors() {
    var nbrs = {};
    for (var k = 0; k < puzSize; k++) {
        var nbr = neighbor(k);
        nbrs[k] = nbr;
        // console.log("key:" + k + ", value:" + nbr);
    }
    return nbrs;
}

function setData() {
    dimention = document.getElementById('dimention').value;
    puzSize = dimention * dimention;
    tileSize = boardSize / dimention;

    clearCtx();
    ctx.drawImage(img, 0, 0, boardSize, boardSize);
    setBackground();
    blank = 0;
    cnt = 0;

    // Make 0th rect blank
    ctx.fillStyle = '#222222'
    ctx.fillRect(0, 0, tileSize, tileSize);
    ctx.fillStyle = '#646464'



    // Get an internal copy to manipulate
    imgData = ctx.getImageData(0, 0, boardSize, boardSize);
    // console.log(imgData);
    // var fullQuality = c.toDataURL("image/jpeg", 1.0);
    // imgData.src = fullQuality;
    // console.log(imgData);
    for (var i = 0; i < dimention * dimention; i++) {
        tiles[i] = new tile(i);
    }
    nbrMap = neighbors();
    clearCtx();

    c.addEventListener('click', clickHandler, false);

}

// This is how we associate an array index to a pair. (x,y) <-> (column, row)
// This might have been a bad idea.
function pair(i, j) {
    if (i < 0 || i - 1 > dimention || j < 0 || j - 1 > dimention) {
        return -1;
    }
    return j * dimention + i;
}

function getX(i) {
    return i % dimention;
}

function getY(i) {
    return (i - (i % dimention)) / dimention;
}


function swapTile(j, i) {
    // i and j must be in the appropriate range
    if (i < 0 || i > dimention * dimention - 1 || j < 0 || j > dimention * dimention - 1)
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
function movePiece(i, j) {
    var curTile = pair(i, j);

    // console.log("(" + i + ", " + j + ")");

    if (blank == pair(i - 1, j)) {
        swapTile(curTile, blank);
    } else if (blank == pair(i + 1, j)) {
        swapTile(curTile, blank);
    } else if (blank == pair(i, j - 1)) {
        swapTile(curTile, blank);
    } else if (blank == pair(i, j + 1)) {
        swapTile(curTile, blank);
    } else {
        // console.log("(" + i + ", " + j + ") is not adjacent to blank");
    }
}


// This is a silly shuffle, but it garantees that the puzzle s solvable.
function shuffle() {
    cnt = 0;
    Soln.innerHTML = "";
    var count = 0;
    for (var i = 1; i < dimention * dimention; i++) {
        var j = Math.ceil(Math.random() * i);
        if (i != j) {
            swapTile(i, j);
            count++;
        }
    }
    if (count % 2 == 1) { // We can only allow even permutations
        swapTile(1, 2);
    }
}


function drawPuzzle() {
    for (var i = 0; i < dimention; i++) {
        for (var j = 0; j < dimention; j++) {
            tiles[pair(i, j)].draw();
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
    for (var i = 0; i < puzSize; i++) {
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
        c.removeEventListener('click', clickHandler);
    }
}

// Common and quick code related to solver is here





function getNodes(backTrackMap, startNode) {
    var node = startNode;
    var solutionPath = [node];
    while (true) {
        var newNode = backTrackMap[node];
        if (newNode != null) {
            solutionPath.push(newNode);
            node = newNode;
        } else
            break;
    }
    return solutionPath;
}

function findSoln(solutionPath) {
    solution = [];
    soln = "";
    var result;
    for (var i = solutionPath.length - 1; i > 0; i--) {
        dex = solutionPath.length - (i + 1);
        result = solutionPath[i][solutionPath[i - 1].indexOf(0)];
        solution[dex] = result;
        soln = soln + " " + result;
    }
    return solution;
}

function bfsSolve() {

    // var backTrackMap = bfs();
    startWorker();

}

// A* will be in a worker

// BFS will be in a worker

// Variable to pass into the bfs routine is the current node (puzzle as an array)




function startWorker() {
    var backTrackMap = null;
    for (var i = 0; i < puzSize; i++) {
        startNode[i] = i;
    }
    if (typeof (Worker) !== "undefined") {
        if (typeof (w) == "undefined") {
            w = new Worker("./js/bfs_solver.js");
        }
        Node = tilesToArray();
        var vars = {
            'Node': Node
            , 'puzSize': puzSize
            , 'nbrMap': nbrMap
        }
        w.postMessage(vars);
        w.onmessage = function (event) {
            var msg = event.data;
            backTrackMap = msg['backTrackMap'];

            Soln.innerHTML = "Nodes Checked: " + msg['count'];

            if (backTrackMap != null) {
                var solutionPath = getNodes(backTrackMap, startNode);
                soln = findSoln(solutionPath);
                Soln.innerHTML = "Nodes Checked: " + msg['count'] + "\nSolution: " + soln;
                solveBtn.style.visibility = 'visible';
                stopWorker();
            }
        };

    } else {
        Soln.innerHTML = "Sorry, your browser does not support Web Workers...";
    }
}

function stopWorker() {
    w.terminate();
    w = undefined;
}