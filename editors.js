function roundedRectangleEditor(shape, mouseX, mouseY) {
  const minX = Math.min(shape.x, shape.x + shape.width);
  const maxX = Math.max(shape.x, shape.x + shape.width);
  const minY = Math.min(shape.y, shape.y + shape.height);
  const maxY = Math.max(shape.y, shape.y + shape.height);

  if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
    selectedShape = shape;

    offsetX = mouseX - shape.x;
    offsetY = mouseY - shape.y;
    setEditorContent(`
      <label for="positionX">Position X:</label>
      <input type="range" id="positionX" min="0" max="1000" step="1" value="${
        shape.x
      }">
      <br>
      <label for="positionY">Position Y:</label>
      <input type="range" id="positionY" min="0" max="1000" step="1" value="${
        shape.y
      }">
      <br>
      <label for="curveWidth">Width:</label>
      <input type="range" id="curveWidth" min="1" max="1000" step="1" value="${
        shape.width
      }">
      <br>
      <label for="curveHeight">Height:</label>
      <input type="range" id="curveHeight" min="1" max="1000" step="1" value="${
        shape.height
      }">
      <br>
      <label for="curveBorderRadius">Border Radius:</label>
      <input type="range" id="curveBorderRadius" min="0" max="${
        shape.height < shape.width ? shape.height / 2 : shape.width / 2
      }" step="1" value="${shape.topLeftBorderRadius}">
      <br>
      <label for="rotation">Rotation (degrees):</label>
      <input type="range" id="rotation" min="0" max="360" step="1" value="${
        shape.rotation
      }">
      <br>
      <div class="dropdown">
        <div class="dropdown-toggle" id="advancedOptionsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          Advanced
        </div>
        <div class="dropdown-menu" aria-labelledby="advancedOptionsDropdown" id="advancedOptionsMenu">
          <label for="topLeftBorderRadius" class="dropdown-item">Top Left Border Radius:</label>
          <input class="ms-3" type="range" id="topLeftBorderRadius" class="form-range" min="0" max="${
            shape.height < shape.width ? shape.height / 2 : shape.width / 2
          }" step="1" value="${shape.topLeftBorderRadius}">
          <br>
          <label for="topRightBorderRadius" class="dropdown-item">Top Right Border Radius:</label>
          <input class="ms-3" type="range" id="topRightBorderRadius" class="form-range" min="0" max="${
            shape.height < shape.width ? shape.height / 2 : shape.width / 2
          }" step="1" value="${shape.topRightBorderRadius}">
          <br>
          <label for="bottomLeftBorderRadius" class="dropdown-item">Bottom Left Border Radius:</label>
          <input class="ms-3" type="range" id="bottomLeftBorderRadius" class="form-range" min="0" max="${
            shape.height < shape.width ? shape.height / 2 : shape.width / 2
          }" step="1" value="${shape.bottomLeftBorderRadius}">
          <br>
          <label for="bottomRightBorderRadius" class="dropdown-item">Bottom Right Border Radius:</label>
          <input class="ms-3" type="range" id="bottomRightBorderRadius" class="form-range" min="0" max="${
            shape.height < shape.width ? shape.height / 2 : shape.width / 2
          }" step="1" value="${shape.bottomRightBorderRadius}">
        </div>
      </div>
      
    `);

    const dropdownToggle = document.getElementById("advancedOptionsDropdown");
    const dropdownMenu = document.getElementById("advancedOptionsMenu");

    dropdownToggle.addEventListener("click", () => {
      const expanded = dropdownToggle.getAttribute("aria-expanded") === "true";
      dropdownToggle.setAttribute("aria-expanded", !expanded);
      dropdownMenu.style.display = !expanded ? "block" : "none";
    });

    document.getElementById("positionX").addEventListener("input", (e) => {
      shape.x = parseInt(e.target.value, 10);
      saveCanvasState();
      drawAll();
    });

    document.getElementById("positionY").addEventListener("input", (e) => {
      shape.y = parseInt(e.target.value, 10);
      saveCanvasState();
      drawAll();
    });

    document.getElementById("curveWidth").addEventListener("input", (e) => {
      shape.width = parseInt(e.target.value, 10);
      saveCanvasState();
      drawAll();
    });

    document.getElementById("curveHeight").addEventListener("input", (e) => {
      shape.height = parseInt(e.target.value, 10);
      saveCanvasState();
      drawAll();
    });

    document
      .getElementById("curveBorderRadius")
      .addEventListener("input", (e) => {
        shape.topLeftBorderRadius = parseInt(e.target.value, 10);
        shape.topRightBorderRadius = parseInt(e.target.value, 10);
        shape.bottomLeftBorderRadius = parseInt(e.target.value, 10);
        shape.bottomRightBorderRadius = parseInt(e.target.value, 10);
        saveCanvasState();
        drawAll();
      });

    document
      .getElementById("topLeftBorderRadius")
      .addEventListener("input", (e) => {
        shape.topLeftBorderRadius = parseInt(e.target.value, 10);
        saveCanvasState();
        drawAll();
      });

    document
      .getElementById("topRightBorderRadius")
      .addEventListener("input", (e) => {
        shape.topRightBorderRadius = parseInt(e.target.value, 10);
        saveCanvasState();
        drawAll();
      });

    document
      .getElementById("bottomLeftBorderRadius")
      .addEventListener("input", (e) => {
        shape.bottomLeftBorderRadius = parseInt(e.target.value, 10);
        saveCanvasState();
        drawAll();
      });

    document
      .getElementById("bottomRightBorderRadius")
      .addEventListener("input", (e) => {
        shape.bottomRightBorderRadius = parseInt(e.target.value, 10);
        saveCanvasState();
        drawAll();
      });

    document.getElementById("rotation").addEventListener("input", (e) => {
      shape.rotation = parseInt(e.target.value, 10);
      saveCanvasState();
      drawAll();
    });

    canvas.addEventListener("mousemove", dragShape);
    canvas.addEventListener("mouseup", stopDragShape);
  }
}
