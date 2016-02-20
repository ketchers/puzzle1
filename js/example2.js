var c = document.getElementById("image");
var ctx = c.getContext('2d');
var boardSize = document.getElementById('image').width;
var img = new Image();
var tileSize = boardSize / document.getElementById('scale').value;
img.src = "img/sunday.png";
img.addEventListener('load', drawImage1, false);

function drawImage1() {
			ctx.drawImage(img, 0, 0, boardSize, boardSize, 0, 0, tileSize, tileSize);
			ctx.drawImage(img, 0, 0, boardSize, boardSize, tileSize, tileSize, tileSize, tileSize);
}