const insertArea = document.getElementById("insertArea");
const insertRectangleStage = document.getElementById("insertRectangleStage");
const insertEllipseStage = document.getElementById("insertEllipseStage");
const insertStageDropDown = document.getElementById("insertStageDropDown");
const insertSeats = document.getElementById("insertSeats");
const insertGridSeats = document.getElementById("insertGridSeats");
const insertSeatDropDown = document.getElementById("insertSeatDropDown");
const insertCircleTable = document.getElementById("insertCircleTable");
const insertTableSeatDropDown = document.getElementById(
  "insertTableSeatDropDown"
);
const selectButton = document.getElementById("selectArea");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const duplicateShape = document.getElementById("duplicateShape");
const mirrorHorizontally = document.getElementById("mirrorHorizontally");
const mirrorVertically = document.getElementById("mirrorVertically");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const panningButton = document.getElementById("panningButton");
const removeButton = document.getElementById("removeButton");
const mainMenuBar = document.getElementById("mainMenuBar");
const areaMenuBar = document.getElementById("areaMenuBar");
const backButton = document.getElementById("backButton");
const dropdownMenuButton = document.getElementById("dropdownMenuButton");
const mapDropDown = document.getElementById("mapDropDown");
const selectSeatsMode = document.getElementById("selectSeatsMode");
const seatUndoButton = document.getElementById("seatUndoButton");
const seatRedoButton = document.getElementById("seatRedoButton");
const seatRemoveButton = document.getElementById("seatRemoveButton");
const insertTextButton = document.getElementById("insertText");
const duplicateShapeInArea = document.getElementById("duplicateShapeInArea");

const editorTitle = document.getElementById("editorTitle");
const editorContent = document.getElementById("editorContent");

function removeMainMapEventListeners() {
  canvas.removeEventListener("mousedown", startStageDrawing);
  canvas.removeEventListener("mousedown", selectShape);
  canvas.removeEventListener("dblclick", zoomInArea);
  canvas.removeEventListener("mousemove", dragShape);
  canvas.removeEventListener("mouseup", stopDragShape);
  canvas.removeEventListener("mousedown", startPanning);
  canvas.removeEventListener("mousemove", panCanvas);
  canvas.removeEventListener("mouseup", stopPanning);
  canvas.removeEventListener("mousedown", selectPoint);
  canvas.removeEventListener("mousemove", movePoint);
  canvas.removeEventListener("mouseup", stopEditingArea);
  canvas.removeEventListener("mousemove", handleDrawArea);

  canvas.removeEventListener("click", addNewArea);
}
canvas.addEventListener("wheel", (event) => {
  handleWheel(event);
});
function mainMapReset() {
  selectedShape = null;
  selectedType = "";
  removeMainMapEventListeners();
  drawAll();
  extractLinesFromShapes();
}

window.addEventListener("click", (event) => {
  if (
    !event.target.matches("#dropdownMenuButton") &&
    !event.target.matches("#dropdownMenuButton *")
  ) {
    if (mapDropDown.classList.contains("show")) {
      mapDropDown.classList.remove("show");
    }
  }
  if (
    !event.target.matches("#insertRectangleStage") &&
    !event.target.matches("#insertRectangleStage *")
  ) {
    if (insertStageDropDown.classList.contains("show")) {
      insertStageDropDown.classList.remove("show");
    }
  }
  if (
    !event.target.matches("#insertSeats") &&
    !event.target.matches("#insertSeats *")
  ) {
    if (insertSeatDropDown.classList.contains("show")) {
      insertSeatDropDown.classList.remove("show");
    }
  }
  if (
    !event.target.matches("#insertCircleTable") &&
    !event.target.matches("#insertCircleTable *")
  ) {
    if (insertTableSeatDropDown.classList.contains("show")) {
      insertTableSeatDropDown.classList.remove("show");
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "z") {
    event.preventDefault(); // Prevent the default undo action
    if (zoomedArea) {
      if (currentAreaStateIndex > 0) {
        currentAreaStateIndex--;
        restoreAreaCanvasState(currentAreaStateIndex);
        validateRows();
        areaEditor();
      }
    } else {
      if (currentStateIndex > 0) {
        currentStateIndex--;
        restoreCanvasState(currentStateIndex);
        mainEditor();
      }
    }
  } else if (event.ctrlKey && event.key === "y") {
    event.preventDefault(); // Prevent the default redo action
    if (zoomedArea) {
      if (currentAreaStateIndex < canvasAreaStates.length - 1) {
        currentAreaStateIndex++;
        restoreAreaCanvasState(currentAreaStateIndex);
        areaEditor();
      }
    } else {
      if (currentStateIndex < canvasStates.length - 1) {
        currentStateIndex++;
        restoreCanvasState(currentStateIndex);
        mainEditor();
      }
    }
  } else if (event.ctrlKey && event.key === "v") {
    console.log("yes");
    event.preventDefault(); // Prevent the default paste action

    if (zoomedArea) {
      // Duplicate shape in zoomed area
      if (selectedShape == null) return;
      switch (selectedShape.type) {
        case "Row": {
          const newShape = new Row({ ...selectedShape, name: "R" });
          selectedShape.seats.map((seat) => {
            newShape.seats.push(new Seat(seat));
          });
          newShape.startX += 10;
          newShape.startY += 10;
          newShape.updateChildren();
          zoomedArea.shapes.push(newShape);
          selectedShape = newShape;
          break;
        }
        case "Text": {
          const newShape = new Text({ ...selectedShape, name: "New Name" });
          newShape.x += 10;
          newShape.y += 10;
          zoomedArea.shapes.push(newShape);
          selectedShape = newShape;
          break;
        }
      }
      saveAreaCanvasState();
      drawAll();
      areaEditor();
    } else {
      // Duplicate shape on canvas
      if (selectedShape == null || selectedShape.type !== "Area") return;
      const newShape = new PolygonArea({ ...selectedShape, name: "New Name" });

      // Update the new shape's coordinates
      newShape.x += 10;
      newShape.y += 10;

      // Push the new shape into the shapes array
      shapes.push(newShape);
      newShape.updatePoints();
      newShape.setOffsetPoints();
      selectedShape = newShape;
      saveCanvasState();
      drawAll();
      mainEditor();
    }
  }
});

dropdownMenuButton.addEventListener("click", (event) => {
  mapDropDown.classList.toggle("show");
});

insertRectangleStage.addEventListener("click", () => {
  mainMapReset();
  selectedType = "Rectangle";
  insertStageDropDown.classList.toggle("show");
  canvas.addEventListener("mousedown", startStageDrawing);
});
insertEllipseStage.addEventListener("click", () => {
  mainMapReset();
  selectedType = "Ellipse";
  canvas.addEventListener("mousedown", startStageDrawing);
});
insertArea.addEventListener("click", () => {
  mainMapReset();
  canvas.addEventListener("mousemove", handleDrawArea);
  canvas.addEventListener("click", addNewArea);
  extractLinesFromShapes();
});

selectButton.addEventListener("click", () => {
  mainMapReset();
  canvas.addEventListener("dblclick", zoomInArea);
  canvas.addEventListener("mousedown", selectShape);
});

undoButton.addEventListener("click", () => {
  if (currentStateIndex > 0) {
    currentStateIndex--;
    restoreCanvasState(currentStateIndex);
    mainEditor();
  }
});

redoButton.addEventListener("click", () => {
  if (currentStateIndex < canvasStates.length - 1) {
    currentStateIndex++;
    restoreCanvasState(currentStateIndex);
    mainEditor();
  }
});

duplicateShape.addEventListener("click", () => {
  if (selectedShape == null && selectedShape.type !== "Area") return;
  const newShape = new PolygonArea({ ...selectedShape, name: "New Name" });

  // Update the new shape's coordinates
  newShape.x += 10;
  newShape.y += 10;
  // Push the new shape into the shapes array
  shapes.push(newShape);
  newShape.updatePoints();
  newShape.setOffsetPoints();
  selectedShape = newShape;
  saveCanvasState();
  drawAll();
  mainEditor();
});
mirrorHorizontally.addEventListener("click", () => {
  if (selectedShape == null) return;
  selectedShape.mirrorHorizontally();
  saveCanvasState();
  drawAll();
  mainEditor();
});
mirrorVertically.addEventListener("click", () => {
  if (selectedShape == null) return;
  selectedShape.mirrorVertically();
  saveCanvasState();
  drawAll();
  mainEditor();
});

saveButton.addEventListener("click", () => {
  const canvasData = {
    shapes: shapes.map((shape) => ({
      data: shape.serialize(),
    })),
  };
  const json = JSON.stringify(canvasData);

  const blob = new Blob([json], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "canvas_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

loadButton.addEventListener("click", () => {
  document.getElementById("fileInput").click();
});
document.getElementById("fileInput").addEventListener("change", (event) => {
  const fileInput = event.target;
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const json = e.target.result;
    const canvasData = JSON.parse(json);

    shapes = [];

    shapes = canvasData.shapes.map((shapeData) => {
      switch (shapeData.data.type) {
        case "EllipseStage":
          return EllipseStage.deserialize(shapeData.data);
        case "RectangleStage":
          return RectangleStage.deserialize(shapeData.data);
        case "Area":
          return PolygonArea.deserialize(shapeData.data);
        default:
          console.log(shapeData);
      }
    });
    console.log(shapes);

    drawAll();
  };

  reader.readAsText(file);
});

panningButton.addEventListener("click", () => {
  mainMapReset();
  canvas.addEventListener("mousedown", startPanning);
});

removeButton.addEventListener("click", (event) => {
  removeShape();
  saveCanvasState();
  mainEditor();
});

//-------Area Events---------

function removeAreaEventListeners() {
  canvas.removeEventListener("mousedown", startSeatDrawing);
  canvas.removeEventListener("mousedown", selectAreaShape);
  canvas.removeEventListener("mousemove", dragShape);
  canvas.removeEventListener("mouseup", stopDragShape);
  canvas.removeEventListener("mousedown", startPanning);
  canvas.removeEventListener("mousedown", insertText);
  canvas.removeEventListener("dblclick", selectSeat);
}

function preventDefault(event) {
  event.preventDefault();
}
function preventPanning() {
  canvas.addEventListener("mousedown", preventDefault);
  canvas.addEventListener("mousemove", preventDefault);
  canvas.addEventListener("mouseup", preventDefault);
  canvas.addEventListener("wheel", preventDefault);
}

function areaReset() {
  removeAreaEventListeners();
  selectedShape = null;
  selectedType = "";
  insertTextMode = false;
  zoomedArea.draw(ctx, true);
}

backButton.addEventListener("click", () => {
  if (validateRows()) {
    return;
  }
  areaReset();
  updateCurrentCanvasState();
  canvasAreaStates = [];
  zoomedArea = null;
  shapes.forEach((s) => (s.isHidden = false));
  currentStateIndex--;
  restoreCanvasState(currentStateIndex);
  currentAreaStateIndex = 0;
  mainMenuBar.style.display = "flex";
  areaMenuBar.style.display = "none";
  mainEditor();
  canvas.addEventListener("dblclick", zoomInArea);
  canvas.addEventListener("mousedown", selectShape);
});

insertSeats.addEventListener("click", (event) => {
  areaReset();
  insertSeatDropDown.classList.toggle("show");
  selectedType = "row";
  canvas.addEventListener("click", startSeatDrawing);
});

insertGridSeats.addEventListener("click", () => {
  areaReset();
  selectedType = "grid";
  canvas.addEventListener("click", startSeatDrawing);
});

selectSeatsMode.addEventListener("click", () => {
  areaReset();
  canvas.addEventListener("mousedown", selectAreaShape);
});

seatUndoButton.addEventListener("click", () => {
  if (currentAreaStateIndex > 0) {
    currentAreaStateIndex--;
    restoreAreaCanvasState(currentAreaStateIndex);
    mainEditor();
  }
});

seatRedoButton.addEventListener("click", () => {
  if (currentAreaStateIndex < canvasAreaStates.length - 1) {
    currentAreaStateIndex++;
    restoreAreaCanvasState(currentAreaStateIndex);
    mainEditor();
  }
});

seatRemoveButton.addEventListener("click", () => {
  removeAreaShape();
  mainEditor();
});

insertTextButton.addEventListener("click", () => {
  areaReset();
  insertTextMode = true;
  canvas.addEventListener("mousedown", insertText);
});

duplicateShapeInArea.addEventListener("click", () => {
  if (selectedShape == null) return;
  switch (selectedShape.type) {
    case "Row": {
      const newShape = new Row({ ...selectedShape, name: "R" });
      selectedShape.seats.map((seat) => {
        newShape.seats.push(new Seat(seat));
      });
      newShape.startX += 10;
      newShape.startY += 10;
      newShape.updateChildren();
      zoomedArea.shapes.push(newShape);
      selectedShape = newShape;
      break;
    }
    case "Text": {
      console.log(selectedShape);
      const newShape = new Text({ ...selectedShape, name: "R" });
      newShape.x += 10;
      newShape.y += 10;
      zoomedArea.shapes.push(newShape);
      selectedShape = newShape;
      break;
    }
  }
  saveAreaCanvasState();
  drawAll();
  mainEditor();
});
