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
  canvas.removeEventListener("mousemove", drawPreview);
  canvas.removeEventListener("mouseup", finishDrawing);
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
  // Save functionality
});

loadButton.addEventListener("click", () => {
  // Load functionality
});
