const insertAreaButton = document.getElementById("insertArea");
const selectButton = document.getElementById("selectEditMode");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const panningButton = document.getElementById("panningButton");
const removeButton = document.getElementById("removeButton");

const zoomOutButton = document.getElementById("zoomOutButton");
const editorTitle = document.getElementById("editorTitle");
const editorContent = document.getElementById("editorContent");

function removeEventListeners() {
  canvas.removeEventListener("mousedown", startDrawing);
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

function reset() {
  selectedShape = null;
  removeEventListeners();
  drawAll();
}

zoomOutButton.addEventListener("click", () => {
  shapes.forEach((s) => (s.isHidden = false));
  restoreCanvasState(currentStateIndex); // Restore state to undo zoom in
  zoomOutButton.style.display = "none";
});

insertAreaButton.addEventListener("click", () => {
  reset();
  canvas.addEventListener("mousedown", startDrawing);
  setEditorTitle("<h4>Insert Options</h4>");
  setEditorContent(`
    <label for="curveWidth">Width:</label>
    <input type="range" id="curveWidth" min="1" max="10" step="1">
    <br>
    <label for="curveHeight">Height:</label>
    <input type="range" id="curveHeight" min="1" max="10" step="1">
    <br>
    <label for="curveBorderRadius">Border Radius:</label>
    <input type="range" id="curveBorderRadius" min="0" max="50" step="1">
  `);
});

selectButton.addEventListener("click", () => {
  reset();
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
  reset();
  canvas.addEventListener("mousedown", startPanning);
});

removeButton.addEventListener("click", (event) => {
  removeShape(event);
});