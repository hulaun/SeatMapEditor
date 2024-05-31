function setEditorTitle(title) {
  editorTitle.innerHTML = `
    ${title}
  `;
}

function setEditorContent(content) {
  editorContent.innerHTML = `
    ${content}
  `;
}

function reset() {
  selectedShape = null;
  removeEventListeners();
  drawAll();
}

function startDrawing(event) {
  startX = event.clientX;
  startY = event.clientY;
  isDrawing = true;
  console.log("start");
  if (selectedShape != null) {
    console.log("start");
    canvas.addEventListener("mousemove", drawSeatPreview);
    canvas.addEventListener("mouseup", finishSeatDrawing);
  } else {
    canvas.addEventListener("mousemove", drawAreaPreview);
    canvas.addEventListener("mouseup", finishAreaDrawing);
  }
}

function drawAreaPreview(event) {
  if (!isDrawing) return;

  const currentX = event.clientX;
  const currentY = event.clientY;
  const width = currentX - startX;
  const height = currentY - startY;

  drawAll();
  const tempRect = new RoundedBorderRectangle({
    x: startX,
    y: startY,
    width: width,
    height: height,
  });
  tempRect.draw(ctx);
}

function finishAreaDrawing(event) {
  if (!isDrawing) return;

  const endX = event.clientX;
  const endY = event.clientY;
  const width = endX - startX;
  const height = endY - startY;

  isDrawing = false;
  canvas.removeEventListener("mousemove", drawAreaPreview);
  canvas.removeEventListener("mouseup", finishAreaDrawing);

  const finalRect = new RoundedBorderRectangle({
    x: startX,
    y: startY,
    width: width,
    height: height,
  });
  shapes.push(finalRect);
  saveStateBeforeChanges();
  drawAll();
}

function drawSeatPreview(event) {
  if (!isDrawing) return;

  const currentX = event.clientX;
  const currentY = event.clientY;
  drawAll();

  if (selectedType === "single") {
    console.log("preview");
    drawSingleSeatPreview(currentX, currentY);
  } else if (selectedType === "row") {
    drawRowSeatPreview(currentX, currentY);
  }
}

function drawSingleSeatPreview(x, y) {
  const radius = Math.sqrt(Math.pow(startX - x) + Math.pow(startY - y));
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawRowSeatPreview(x, y) {
  const radius = parseInt(document.getElementById("rowSeatRadius").value, 10);
  const numberOfSeats = parseInt(
    document.getElementById("rowNumberOfSeats").value,
    10
  );
  const spacing = parseInt(document.getElementById("rowSpacing").value, 10);

  for (let i = 0; i < numberOfSeats; i++) {
    ctx.beginPath();
    ctx.arc(x + i * (2 * radius + spacing), y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function finishSeatDrawing(event) {
  if (!isDrawing) return;
  console.log("finish");

  const endX = event.clientX;
  const endY = event.clientY;
  const radius = Math.sqrt(Math.pow(startX - endX) + Math.pow(startY - endY));
  isDrawing = false;
  canvas.removeEventListener("mousemove", drawSeatPreview);
  canvas.removeEventListener("mouseup", finishSeatDrawing);

  if (selectedType === "single") {
    if (selectedShape.rows.length === 0) {
      selectedShape
        .createRow({
          startX: endX,
          startY: endY,
          seatRadius: radius,
          seatSpacing: 10,
        })
        .createSeat({ number: 5, isBuyed: false });
    } else {
      const row = selectedShape.rows[selectedShape.rows.length - 1];
      row.createSeat({ number: 5, isBuyed: false });
    }
  } else if (selectedType === "row") {
    createRowOfSeats(endX, endY);
  }

  drawAll();
}

function selectShape(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  selectedShape = null;
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
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
          <div class="dropdown-menu bg-white" aria-labelledby="advancedOptionsDropdown" id="advancedOptionsMenu">
            <label for="topLeftBorderRadius" class="dropdown-item">Top Left Border Radius:</label>
            <input type="range" id="topLeftBorderRadius" class="form-range" min="0" max="${
              shape.height < shape.width ? shape.height / 2 : shape.width / 2
            }" step="1" value="${shape.topLeftBorderRadius}">
            <br>
            <label for="topRightBorderRadius" class="dropdown-item">Top Right Border Radius:</label>
            <input type="range" id="topRightBorderRadius" class="form-range" min="0" max="${
              shape.height < shape.width ? shape.height / 2 : shape.width / 2
            }" step="1" value="${shape.topRightBorderRadius}">
            <br>
            <label for="bottomLeftBorderRadius" class="dropdown-item">Bottom Left Border Radius:</label>
            <input type="range" id="bottomLeftBorderRadius" class="form-range" min="0" max="${
              shape.height < shape.width ? shape.height / 2 : shape.width / 2
            }" step="1" value="${shape.bottomLeftBorderRadius}">
            <br>
            <label for="bottomRightBorderRadius" class="dropdown-item">Bottom Right Border Radius:</label>
            <input type="range" id="bottomRightBorderRadius" class="form-range" min="0" max="${
              shape.height < shape.width ? shape.height / 2 : shape.width / 2
            }" step="1" value="${shape.bottomRightBorderRadius}">
          </div>
        </div>
        
      `);

      const dropdownToggle = document.getElementById("advancedOptionsDropdown");
      const dropdownMenu = document.getElementById("advancedOptionsMenu");

      dropdownToggle.addEventListener("click", () => {
        const expanded =
          dropdownToggle.getAttribute("aria-expanded") === "true";
        dropdownToggle.setAttribute("aria-expanded", !expanded);
        dropdownMenu.style.display = !expanded ? "block" : "none";
      });

      document.getElementById("positionX").addEventListener("input", (e) => {
        shape.x = parseInt(e.target.value, 10);
        saveStateBeforeChanges();
        drawAll();
      });

      document.getElementById("positionY").addEventListener("input", (e) => {
        shape.y = parseInt(e.target.value, 10);
        saveStateBeforeChanges();
        drawAll();
      });

      document.getElementById("curveWidth").addEventListener("input", (e) => {
        shape.width = parseInt(e.target.value, 10);
        saveStateBeforeChanges();
        drawAll();
      });

      document.getElementById("curveHeight").addEventListener("input", (e) => {
        shape.height = parseInt(e.target.value, 10);
        saveStateBeforeChanges();
        drawAll();
      });

      document
        .getElementById("curveBorderRadius")
        .addEventListener("input", (e) => {
          shape.topLeftBorderRadius = parseInt(e.target.value, 10);
          shape.topRightBorderRadius = parseInt(e.target.value, 10);
          shape.bottomLeftBorderRadius = parseInt(e.target.value, 10);
          shape.bottomRightBorderRadius = parseInt(e.target.value, 10);
          saveStateBeforeChanges();
          drawAll();
        });

      document
        .getElementById("topLeftBorderRadius")
        .addEventListener("input", (e) => {
          shape.topLeftBorderRadius = parseInt(e.target.value, 10);
          saveStateBeforeChanges();
          drawAll();
        });

      document
        .getElementById("topRightBorderRadius")
        .addEventListener("input", (e) => {
          shape.topRightBorderRadius = parseInt(e.target.value, 10);
          saveStateBeforeChanges();
          drawAll();
        });

      document
        .getElementById("bottomLeftBorderRadius")
        .addEventListener("input", (e) => {
          shape.bottomLeftBorderRadius = parseInt(e.target.value, 10);
          saveStateBeforeChanges();
          drawAll();
        });

      document
        .getElementById("bottomRightBorderRadius")
        .addEventListener("input", (e) => {
          shape.bottomRightBorderRadius = parseInt(e.target.value, 10);
          saveStateBeforeChanges();
          drawAll();
        });

      document.getElementById("rotation").addEventListener("input", (e) => {
        shape.rotation = parseInt(e.target.value, 10);
        saveStateBeforeChanges();
        drawAll();
      });

      // canvas.addEventListener("dblclick");
      canvas.addEventListener("mousemove", dragShape);
      canvas.addEventListener("mouseup", stopDragShape);
      break;
    }
  }

  drawAll();
}

function dragShape(event) {
  if (selectedShape) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    selectedShape.x = mouseX - offsetX;
    selectedShape.y = mouseY - offsetY;

    drawAll();
  }
}

function stopDragShape(event) {
  canvas.removeEventListener("mousemove", dragShape);
  canvas.removeEventListener("click", stopDragShape);
  saveStateBeforeChanges();
}

function undoLastAction() {
  if (currentStateIndex > 0) {
    currentStateIndex--;
    restoreCanvasState(currentStateIndex);
  }
}

function redoLastAction() {
  if (currentStateIndex < canvasStates.length - 1) {
    currentStateIndex++;
    restoreCanvasState(currentStateIndex);
  }
}

function saveStateBeforeChanges() {
  saveCanvasState();
}

function zoomInArea(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // Find the clicked area
  let clickedShape = null;
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    const minX = Math.min(shape.x, shape.x + shape.width);
    const maxX = Math.max(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxY = Math.max(shape.y, shape.y + shape.height);

    if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
      clickedShape = shape;
      break;
    }
  }

  if (!clickedShape) return; // If no shape was clicked, return

  // Zoom in on the clicked area
  const zoomedWidth = window.innerWidth / 1.7;
  const zoomedHeight = (clickedShape.height * zoomedWidth) / clickedShape.width;
  const zoomedX = 100;
  const zoomedY = window.innerHeight / 5;

  // Hide other areas and stage
  console.log(clickedShape);
  shapes.forEach((shape) => {
    if (shape !== clickedShape) {
      shape.isHidden = true;
    }
  });

  // Set the clicked area to the zoomed size and position
  clickedShape.width = zoomedWidth;
  clickedShape.height = zoomedHeight;
  clickedShape.x = zoomedX;
  clickedShape.y = zoomedY;

  // Redraw canvas with the updated state
  drawAll();

  // Show editor for the clicked area
  showEditorForArea(clickedShape);
}
function zoomOutArea() {
  // Reset all shapes to be visible
  shapes.forEach((shape) => {
    shape.isHidden = false;
  });

  // Reset canvas size to original
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;

  // Clear editor content
  editorTitle.innerHTML = "";
  editorContent.innerHTML = "";

  // Redraw canvas with the updated state
  drawAll();
}
function showEditorForArea(area) {
  // Clear editor content
  editorTitle.innerHTML = "";
  editorContent.innerHTML = "";

  // Display editor title
  editorTitle.innerHTML = "<h4>Edit Area</h4>";

  // Example editor content, you can customize this as needed
  editorContent.innerHTML = `
      <label for="seatType">Seat Type:</label>
      <select id="seatType">
          <option value="single">Single Seat</option>
          <option value="row">Row of Seats</option>
      </select>
      <div id="seatOptions"></div>
      <button id="addSeatButton" class="btn btn-primary">Add Seat</button>
  `;

  const seatTypeSelect = document.getElementById("seatType");
  const seatOptionsDiv = document.getElementById("seatOptions");

  // Event listener for seat type selection
  seatTypeSelect.addEventListener("change", () => {
    const selectedType = seatTypeSelect.value;
    if (selectedType === "single") {
      seatOptionsDiv.innerHTML = `
              <label for="seatRadius">Seat Radius:</label>
              <input type="range" id="seatRadius" min="1" max="50" step="1">
          `;
    } else if (selectedType === "row") {
      seatOptionsDiv.innerHTML = `
              <label for="rowSeatRadius">Seat Radius:</label>
              <input type="range" id="rowSeatRadius" min="1" max="50" step="1">
              <br>
              <label for="rowNumberOfSeats">Number of Seats:</label>
              <input type="number" id="rowNumberOfSeats" min="1" max="10" value="1">
              <br>
              <label for="rowSpacing">Spacing:</label>
              <input type="number" id="rowSpacing" min="0" max="50" value="10">
          `;
    }
  });

  // Event listener for adding a seat
  const addSeatButton = document.getElementById("addSeatButton");
  addSeatButton.addEventListener("click", () => {
    const selectedType = seatTypeSelect.value;
    if (selectedType === "single") {
      const seatRadius = document.getElementById("seatRadius").value;
      // Add single seat to the area
      area.createSeat({
        startX: area.x + area.width / 2,
        startY: area.y + area.height / 2,
        seatRadius: parseInt(seatRadius),
        isBuyed: false,
      });
    } else if (selectedType === "row") {
      const rowSeatRadius = document.getElementById("rowSeatRadius").value;
      const numberOfSeats = document.getElementById("rowNumberOfSeats").value;
      const spacing = document.getElementById("rowSpacing").value;
      // Add row of seats to the area
      area.createRow({
        startX: area.x + area.width / 4,
        startY: area.y + area.height / 2,
        seatRadius: parseInt(rowSeatRadius),
        numberOfSeats: parseInt(numberOfSeats),
        spacing: parseInt(spacing),
      });
    }
    drawAll(); // Redraw canvas with the updated state
  });
}
