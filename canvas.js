const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;
const ctx = canvas.getContext("2d");

let isDrawing = false;
let startX, startY;
let selectedShape = null;
let offsetX, offsetY;
let isDragging = false;

let bin = [];
let shapes = [];
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((shape) => {
    if (shape === selectedShape) {
      ctx.strokeStyle = "red";
    } else {
      ctx.strokeStyle = "black";
    }
    shape.draw(ctx);
  });
}
window.addEventListener("resize", resizeCanvas, false);

function resizeCanvas() {
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;
  drawAll();
}

document.addEventListener("DOMContentLoaded", () => {
  var map = new FirstTemplate(ctx, 100, 100, 700, 800);
  shapes = [...shapes, ...map.shapes];
  drawAll();
});
