const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;
const ctx = canvas.getContext("2d");

let isDrawing = false;
let insertTextMode = false;
let selectedType = "";
let clickCount = 0;
let startX, startY;
let secondX, secondY;
let translateX = 0;
let translateY = 0;
const touchpadScalingFactor = 1.5;
let seatRadius = 6;
let seatSpacing = 6;
let currentPolygon = null;
let selectedShape = null;
let zoomedArea = null;
let offsetX, offsetY;

//MapState
let canvasStates = [];
let currentStateIndex = -1;

//AreaState
let canvasAreaStates = [];
let currentAreaStateIndex = -1;

let shapes = [];
let lines = [];

function drawAll() {
  ctx.clearRect(-600, -600, canvas.width * 1.5, canvas.height * 1.5);
  shapes.forEach((shape) => {
    if (!shape.isHidden) {
      if (zoomedArea != null) {
        ctx.fillStyle = "lightgrey";
        ctx.fillRect(-600, -600, canvas.width * 1.5, canvas.height * 1.5);
        zoomedArea.draw(true);
        if (selectedShape != null) {
          if (selectedShape.type === "Row") {
            selectedShape.drawBoundingRectangle();
          } else if (selectedShape.type === "Text") {
            selectedShape.drawBoundingRectangle();
          } else if (selectedShape.type === "Seat") {
            selectedShape.drawBoundingRectangle();
          }
        }
      } else if (shape === selectedShape) {
        if (shape.type === "Area") {
          ctx.strokeStyle = "red";
          shape.draw();
          shape.drawPoints();
        } else {
          ctx.strokeStyle = "red";
          shape.draw();
        }
      } else {
        ctx.strokeStyle = "black";
        shape.draw();
      }

      if (zoomedArea == null && shape.type === "Area") {
        shape.updateChildren();
      }
    }
  });
}
window.addEventListener("resize", resizeCanvas, false);

function extractLinesFromShapes() {
  lines = [];
  shapes.forEach((shape) => {
    if (shape.type === "RectangleStage") {
      lines.push(
        {
          startPoint: { x: shape.x, y: shape.y },
          endPoint: { x: shape.x + shape.width, y: shape.y },
        },
        {
          startPoint: { x: shape.x + shape.width, y: shape.y },
          endPoint: { x: shape.x + shape.width, y: shape.y + shape.height },
        },
        {
          startPoint: { x: shape.x + shape.width, y: shape.y + shape.height },
          endPoint: { x: shape.x, y: shape.y + shape.height },
        },
        {
          startPoint: { x: shape.x, y: shape.y + shape.height },
          endPoint: { x: shape.x, y: shape.y },
        }
      );
    } else if (shape.type === "Area") {
      for (let i = 0; i < shape.points.length; i++) {
        const startPoint = shape.points[i];
        const endPoint = shape.points[(i + 1) % shape.points.length];
        lines.push({ startPoint, endPoint });
      }
    }
  });
}

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
    canvasStates.splice(currentStateIndex + 1);
  }

  canvasStates.push(state);
  currentStateIndex++;

  sessionStorage.setItem("lastCanvasState", JSON.stringify(state));
}

function updateCurrentCanvasState() {
  if (currentStateIndex < 0) return;

  const currentState = { ...canvasStates[currentStateIndex - 1] };
  const updatedShapes = [...currentState.shapes];

  for (let i = 0; i < updatedShapes.length; i++) {
    if (updatedShapes[i].name === zoomedArea.name) {
      updatedShapes[i].shapes = zoomedArea.shapes;
      break;
    }
  }

  const updatedState = {
    ...currentState,
    shapes: updatedShapes,
  };
  canvasStates[currentStateIndex - 1] = updatedState;

  sessionStorage.setItem(
    "lastCanvasState",
    JSON.stringify(canvasStates[currentStateIndex - 1])
  );
}

function restoreCanvasState(index) {
  const state = canvasStates[index];
  shapes = state.shapes.map((shapeData) => {
    switch (shapeData.type) {
      case "RectangleStage":
        return RectangleStage.deserialize(shapeData);
      case "EllipseStage":
        return EllipseStage.deserialize(shapeData);
      case "Area":
        return PolygonArea.deserialize(shapeData);
      default:
        throw new Error("Unknown shape type: " + shapeData.type);
    }
  });

  const image = new Image();
  image.onload = function () {
    ctx.clearRect(-600, -600, canvas.width * 1.5, canvas.height * 1.5);
    ctx.drawImage(image, 0, 0);
    drawAll();
  };
  image.src = state.canvasImage;
}
function restoreCanvasStateFromSession(state) {
  const parsedState = JSON.parse(state);
  shapes = parsedState.shapes.map((shapeData) => {
    switch (shapeData.type) {
      case "RectangleStage":
        return RectangleStage.deserialize(shapeData);
      case "EllipseStage":
        return EllipseStage.deserialize(shapeData);
      case "Area":
        return PolygonArea.deserialize(shapeData);
      default:
        throw new Error("Unknown shape type: " + shapeData.type);
    }
  });

  const image = new Image();
  image.onload = function () {
    ctx.clearRect(-600, -600, canvas.width * 1.5, canvas.height * 1.5);
    ctx.drawImage(image, 0, 0);
    drawAll();
  };
  image.src = parsedState.canvasImage;
}

function saveAreaCanvasState() {
  const state = {
    canvasImage: canvas.toDataURL(),
    shapes: zoomedArea.shapes.map((shape) => shape.serialize()),
  };

  if (currentAreaStateIndex < canvasAreaStates.length - 1) {
    canvasAreaStates.splice(currentAreaStateIndex + 1);
  }

  canvasAreaStates.push(state);
  currentAreaStateIndex++;
}

function restoreAreaCanvasState(index) {
  const state = canvasAreaStates[index];

  zoomedArea.shapes = state.shapes.map((shapeData) => {
    switch (shapeData.type) {
      case "Row":
        return Row.deserialize(shapeData);
      case "Text":
        return Text.deserialize(shapeData);
      default:
        throw new Error("Unknown shape type: " + shapeData.type);
    }
  });

  const image = new Image();
  image.onload = function () {
    ctx.clearRect(-600, -600, canvas.width * 1.5, canvas.height * 1.5);
    ctx.drawImage(image, 0, 0);
    drawAll();
  };
  image.src = state.canvasImage;
}

async function loadInitialTemplate() {
  try {
    const response = await fetch("templates/stadium.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const stadiumData = await response.json();
    console.log(stadiumData.shapes);
    debugger;
    shapes = stadiumData.shapes.map((shapeData) => {
      switch (shapeData.data.type) {
        case "RectangleStage":
          return RectangleStage.deserialize(shapeData.data);
        case "EllipseStage":
          return EllipseStage.deserialize(shapeData.data);
        case "Area":
          return PolygonArea.deserialize(shapeData.data);
        default:
          throw new Error("Unknown shape type: " + shapeData.data.type);
      }
    });
    drawAll();
    saveCanvasState();
  } catch (error) {
    console.error("Failed to load stadium.json:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const state = sessionStorage.getItem("lastCanvasState");
  console.log(state);
  if (state) {
    restoreCanvasStateFromSession(state);
  } else {
    loadInitialTemplate();
  }
  mainEditor();
  saveCanvasState();
});
