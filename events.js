const insertArea = document.getElementById("insertArea");
const insertStage = document.getElementById("insertStage");
const insertAreaDropDown = document.getElementById("insertAreaDropDown");
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
const insertText = document.getElementById("insertText");

const editorTitle = document.getElementById("editorTitle");
const editorContent = document.getElementById("editorContent");

function removeMainMapEventListeners() {
  canvas.removeEventListener("mousedown", startStageDrawing);
  canvas.removeEventListener("mousedown", startAreaDrawing);
  canvas.removeEventListener("mousemove", drawAreaPreview);
  canvas.removeEventListener("mouseup", finishAreaDrawing);
  canvas.removeEventListener("mousedown", selectShape);
  canvas.removeEventListener("dblclick", zoomInArea);
  canvas.removeEventListener("mousemove", dragShape);
  canvas.removeEventListener("mouseup", stopDragShape);
  canvas.removeEventListener("mousedown", startPanning);
  canvas.removeEventListener("mousemove", panCanvas);
  canvas.removeEventListener("mouseup", stopPanning);
}

function mainMapReset() {
  selectedShape = null;
  removeMainMapEventListeners();
  drawAll();
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
    !event.target.matches("#insertArea") &&
    !event.target.matches("#insertArea *")
  ) {
    if (insertAreaDropDown.classList.contains("show")) {
      insertAreaDropDown.classList.remove("show");
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
dropdownMenuButton.addEventListener("click", (event) => {
  mapDropDown.classList.toggle("show");
});

insertStage.addEventListener("click", () => {
  mainMapReset();
  canvas.addEventListener("mousedown", startStageDrawing);
});
insertArea.addEventListener("click", () => {
  mainMapReset();
  insertAreaDropDown.classList.toggle("show");
  canvas.addEventListener("mousedown", startAreaDrawing);
});

selectButton.addEventListener("click", () => {
  mainMapReset();
  canvas.addEventListener("dblclick", zoomInArea);
  canvas.addEventListener("mousedown", selectShape);
  setEditorTitle("<h4>Select and Edit Options</h4>");
  setEditorContent("");
});

undoButton.addEventListener("click", () => {
  if (currentStateIndex > 0) {
    currentStateIndex--;
    restoreCanvasState(currentStateIndex);
  }
});

redoButton.addEventListener("click", () => {
  if (currentStateIndex < canvasStates.length - 1) {
    currentStateIndex++;
    restoreCanvasState(currentStateIndex);
  }
});

saveButton.addEventListener("click", () => {
  // Serialize canvas data into JSON format
  const canvasData = {
    shapes: shapes.map((shape) => ({
      data: shape.serialize(),
    })),
  };
  const json = JSON.stringify(canvasData);

  const blob = new Blob([json], { type: "application/json" });

  // Create a link element to trigger download
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "canvas_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

loadButton.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const json = e.target.result;
    const canvasData = JSON.parse(json);

    // Clear current canvas state
    shapes = [];

    // Deserialize shapes and add them to canvas
    canvasData.shapes.forEach((shapeData) => {
      const ShapeClass = window[shapeData.data.type];
      if (ShapeClass) {
        const shapeInstance = new ShapeClass();
        shapeInstance.deserialize(shapeData.data);
        shapes.push(shapeInstance);
      }
    });

    // Redraw canvas with loaded shapes
    drawAll();
  };

  reader.readAsText(file);
});
canvas.addEventListener("wheel", (event) => {
  handleWheel(event);
});
panningButton.addEventListener("click", () => {
  mainMapReset();
  canvas.addEventListener("mousedown", startPanning);
});

removeButton.addEventListener("click", (event) => {
  removeShape(event);
});

//-------Area Events---------

function removeAreaEventListeners() {
  canvas.removeEventListener("mousedown", startSeatDrawing);
  canvas.removeEventListener("mousedown", selectAreaShape);
}

function areaReset() {
  removeAreaEventListeners();
  selectedShape = null;
  selectedType = "";
  zoomedArea.draw(ctx, true);
}

backButton.addEventListener("click", () => {
  areaReset();
  zoomedArea = null;
  shapes.forEach((s) => (s.isHidden = false));
  currentStateIndex--;
  restoreCanvasState(currentStateIndex);
  mainMenuBar.style.display = "flex";
  areaMenuBar.style.display = "none";
});

insertSeats.addEventListener("click", (event) => {
  areaReset();
  insertSeatDropDown.classList.toggle("show");
  selectedType = "row";
  canvas.addEventListener("mousedown", startSeatDrawing);
});

insertGridSeats.addEventListener("click", () => {
  areaReset();
  selectedType = "grid";
  canvas.addEventListener("mousedown", startSeatDrawing);
});

insertCircleTable.addEventListener("click", () => {
  insertTableSeatDropDown.classList.toggle("show");
  // canvas.addEventListener("mousedown", startAreaDrawing);
});

selectSeatsMode.addEventListener("click", () => {
  areaReset();
  canvas.addEventListener("mousedown", selectAreaShape);
});

seatUndoButton.addEventListener("click", () => {
  undoAction();
});

seatRedoButton.addEventListener("click", () => {
  redoAction();
});

seatRemoveButton.addEventListener("click", () => {
  removeSelectedShape();
});

insertText.addEventListener("click", () => {});
