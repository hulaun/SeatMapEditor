const insertAreaButton = document.getElementById("insertArea");
const selectButton = document.getElementById("selectEditMode");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");

const editorTitle = document.getElementById("editorTitle");
const editorContent = document.getElementById("editorContent");

function removeEventListeners() {
  canvas.removeEventListener("mousedown", startDrawing);
  canvas.removeEventListener("mousemove", drawAreaPreview);
  canvas.removeEventListener("mouseup", finishAreaDrawing);
  canvas.removeEventListener("click", selectShape);
}

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
  undoLastAction();
});

redoButton.addEventListener("click", () => {
  redoLastAction();
});

saveButton.addEventListener("click", () => {
  // Serialize canvas data into JSON format
  const canvasData = {
    shapes: shapes.map((shape) => ({
      type: shape.constructor.name,
      data: shape.serialize(),
    })),
  };

  // Convert to JSON string
  const json = JSON.stringify(canvasData);

  // Create a blob from the JSON string
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
      const ShapeClass = eval(shapeData.type); // Assuming shape classes are globally accessible
      const shape = new ShapeClass();
      shape.deserialize(shapeData.data);
      shapes.push(shape);
    });

    // Redraw canvas with loaded shapes
    drawAll();
  };

  reader.readAsText(file);
});
