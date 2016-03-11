var cvs = document.getElementById("cvs");
var ctx = cvs.getContext("2d");

var dbg = document.getElementById("debug1");

var disks = [];


var mouseX = 0;
var mouseY = 0;

function getMousePos(e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
}

function moveEvent(e) {
    getMousePos(e);
    dbg.innerHTML = "(" + mouseX + ", " + mouseY + ")";
}

function clickHandler(e) {
    getMousePos(e);
    var dsk = new Disk(mouseX, mouseY);
    disks.push(dsk);
    redraw();
}

function redraw() {
    for (var i = 0; i < disks.length; i++)
        disks[i].draw();
}

cvs.addEventListener('mousemove', moveEvent, false);
cvs.addEventListener('click', clickHandler, false);

function randColor() {
    return 'rgba(' + Math.floor(Math.random() * 250 + 1) +
        ',' + Math.floor(Math.random() * 250 + 1) + ',' +
        Math.floor(Math.random() * 250 + 1) + ',' + .6 + ")";
}

function Disk(x, y) {
    this.x = x;
    this.y = y;
    this.color1 = randColor();
    this.color2 = randColor();
    this.radius = Math.floor(Math.random() * 10 + 10);
    this.grad = ctx.createRadialGradient(this.x
        , this.y, 0 * this.radius, this.x
        , this.y, 1 * this.radius);
    this.grad.addColorStop(0, this.color1);
    this.grad.addColorStop(1, this.color2);
    this.draw = function () {
        ctx.fillStyle = this.grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();


    }
}