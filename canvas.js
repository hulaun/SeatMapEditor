const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;
const ctx = canvas.getContext("2d");

let isDrawing = false;
let startX, startY;
let translateX = 0;
let translateY = 0;
const touchpadScalingFactor = 1.5;
let selectedShape = null;
let offsetX, offsetY;
let canvasStates = []; // Stack to store canvas states
let currentStateIndex = -1; // Index to track the current state

let shapes = [];
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((shape) => {
    if (!shape.isHidden) {
      if (shape === selectedShape) {
        ctx.strokeStyle = "red";
      } else {
        ctx.strokeStyle = "black";
      }
      shape.draw(ctx);
    }
  });
}
window.addEventListener("resize", resizeCanvas, false);

function resizeCanvas() {
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;
  drawAll();
}

function saveCanvasState() {
  const state = {
    canvasImage: canvas.toDataURL(),
    shapes: shapes.map((shape) => shape.serialize()),
  };

  if (currentStateIndex < canvasStates.length - 1) {
    // If there are redo states ahead, remove them
    canvasStates.splice(currentStateIndex + 1);
  }

  canvasStates.push(state);
  currentStateIndex++;
}

function restoreCanvasState(index) {
  const state = canvasStates[index];

  // Restore the shapes list
  shapes = state.shapes.map((shapeData) => {
    console.log(shapeData.type);
    switch (shapeData.type) {
      case "RoundedBorderRectangle":
        return RoundedBorderRectangle.deserialize(shapeData);
      case "Stage":
        return Stage.deserialize(shapeData);
      case "Area":
        return Area.deserialize(shapeData);
      // Add cases for other shape types as needed
      default:
        throw new Error("Unknown shape type: " + shapeData.type);
    }
  });

  // Restore the canvas image
  const image = new Image();
  image.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    drawAll();
  };
  image.src = state.canvasImage;
}

document.addEventListener("DOMContentLoaded", () => {
  const dropdownMenuButton = document.getElementById("dropdownMenuButton");
  const customDropdownMenu = document.getElementById("customDropdownMenu");

  dropdownMenuButton.addEventListener("click", (event) => {
    customDropdownMenu.classList.toggle("show");
  });

  // Close the dropdown if the user clicks outside of it
  window.addEventListener("click", (event) => {
    if (
      !event.target.matches("#dropdownMenuButton") &&
      !event.target.matches("#dropdownMenuButton *")
    ) {
      if (customDropdownMenu.classList.contains("show")) {
        customDropdownMenu.classList.remove("show");
      }
    }
  });

  var map = new FirstTemplate(ctx, 100, 300, 700, 800);
  shapes = [...shapes, ...map.shapes];
  drawAll();
  saveCanvasState();
});
