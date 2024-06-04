const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;
const ctx = canvas.getContext("2d");

let isDrawing = false;
let selectedType = "";
let clickCount = 0;
let startX, startY;
let secondX, secondY;
let translateX = 0;
let translateY = 0;
const touchpadScalingFactor = 1.5;
const seatRadius = 10;
const seatSpacing = 10;
let selectedShape = null;
let zoomedArea = null;
let offsetX, offsetY;
let canvasStates = []; // Stack to store canvas states
let currentStateIndex = -1; // Index to track the current state

let shapes = [];
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((shape) => {
    if (!shape.isHidden) {
      if (zoomedArea != null) {
        ctx.fillStyle = "lightgrey";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        zoomedArea.draw(ctx, true);
        if (selectedShape != null) {
          if (selectedShape.type === "Row") {
            selectedShape.drawBoundingRectangle(ctx);
          }
        }
      } else if (shape === selectedShape) {
        ctx.strokeStyle = "red";
        shape.draw(ctx);
      } else {
        ctx.strokeStyle = "black";
        shape.draw(ctx);
      }
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
function updateCurrentCanvasState() {
  if (currentStateIndex < 0) return; // Ensure there is a current state to update

  // Clone the current state to avoid mutation
  const currentState = { ...canvasStates[currentStateIndex - 1] };
  const updatedShapes = [...currentState.shapes];

  for (let i = 0; i < updatedShapes.length; i++) {
    if (updatedShapes[i].name === zoomedArea.name) {
      // Assuming each shape has a unique `id`
      updatedShapes[i].shapes = zoomedArea.shapes;
      break;
    }
  }

  // Create the updated state
  const updatedState = {
    ...currentState,
    shapes: updatedShapes,
  };
  // Replace the current state in the canvasStates array
  canvasStates[currentStateIndex - 1] = updatedState;
}

function restoreCanvasState(index) {
  const state = canvasStates[index];

  // Restore the shapes list
  shapes = state.shapes.map((shapeData) => {
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
  var map = new FirstTemplate(ctx, 100, 300, 700, 800);
  shapes = [...shapes, ...map.shapes];
  drawAll();
  saveCanvasState();
});
