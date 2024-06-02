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

function startDrawing(event) {
  startX = event.clientX;
  startY = event.clientY;
  isDrawing = true;
  canvas.addEventListener("mousemove", drawAreaPreview);
  canvas.addEventListener("mouseup", finishAreaDrawing);
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
  saveCanvasState();
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
  const mouseX = event.clientX - translateX;
  const mouseY = event.clientY - translateY;

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
        const expanded =
          dropdownToggle.getAttribute("aria-expanded") === "true";
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
  canvas.removeEventListener("mouseup", stopDragShape);
  saveCanvasState();
}

function startPanning(e) {
  isPanning = true;
  if (!isPanning) return;
  startX = e.clientX;
  startY = e.clientY;
  canvas.style.cursor = "move";
  canvas.addEventListener("mousemove", panCanvas);
  canvas.addEventListener("mouseup", stopPanning);
}

function panCanvas(e) {
  if (!isPanning) return;
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  startX = e.clientX;
  startY = e.clientY;
  translateX += deltaX;
  translateY += deltaY;
  ctx.translate(deltaX, deltaY);
  drawAll();
}

function stopPanning() {
  if (!isPanning) return;
  canvas.style.cursor = "default";
  isPanning = false;
}

function handleWheel(event) {
  if (event.ctrlKey) {
    // If the user is using ctrl + wheel for zooming, ignore panning
    return;
  }

  event.preventDefault(); // Prevent the default scrolling behavior
  const deltaX = event.deltaX * touchpadScalingFactor;
  const deltaY = event.deltaY * touchpadScalingFactor;
  console.log(deltaX, deltaY);
  translateX += deltaX;
  translateY += deltaY;
  ctx.translate(deltaX, deltaY);
  drawAll();
}

function removeShape(e) {
  shapes = shapes.filter((shape) => {
    console.log(shape);
    return shape !== selectedShape;
  });

  drawAll();
}

function zoomInArea(event) {
  const mouseX = event.clientX - translateX;
  const mouseY = event.clientY - translateY;

  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (shape instanceof Stage) continue;
    const minX = Math.min(shape.x, shape.x + shape.width);
    const maxX = Math.max(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxY = Math.max(shape.y, shape.y + shape.height);

    if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
      zoomInOnShape(shape);
      break;
    }
  }
}

function zoomInOnShape(shape) {
  saveCanvasState(); // Save state before zooming in

  shapes.forEach((s) => (s.isHidden = s !== shape));

  const zoomedWidth = window.innerWidth / 1.7;
  const zoomedHeight = (shape.height * zoomedWidth) / shape.width;

  // Calculate the new position to center the shape on the screen
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const newX = centerX - zoomedWidth / 1.5;
  const newY = centerY - zoomedHeight / 2;

  // Update shape properties
  shape.width = zoomedWidth;
  shape.height = zoomedHeight;
  shape.x = newX - translateX; // Adjust for the current translation
  shape.y = newY - translateY; // Adjust for the current translation
  document.getElementById("zoomOutButton").style.display = "block";

  setEditorTitle("<h4>Zoomed-In Editor</h4>");
  setEditorContent(`
    <label for="seatNumber">Number of Seats:</label>
    <input type="number" id="seatNumber" min="1" max="100">
    <br>
    <button id="addSeatsButton" class="btn btn-primary">Add Seats</button>
  `);

  document.getElementById("addSeatsButton").addEventListener("click", () => {
    const seatNumber = parseInt(
      document.getElementById("seatNumber").value,
      10
    );
    if (!isNaN(seatNumber) && seatNumber > 0) {
      for (let i = 0; i < seatNumber; i++) {
        shape.addSeat(); // Assume you have a method to add seats to the shape
      }
      drawAll();
    }
  });

  drawAll();
}
