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
//--------Main menu functions---------
//Area
function startAreaDrawing(event) {
  startX = event.clientX - translateX;
  startY = event.clientY - translateY;
  isDrawing = true;
  canvas.addEventListener("mousemove", drawAreaPreview);
  canvas.addEventListener("mouseup", finishAreaDrawing);
}

function drawAreaPreview(event) {
  if (!isDrawing) return;

  const currentX = event.clientX - translateX;
  const currentY = event.clientY - translateY;
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

  const endX = event.clientX - translateX;
  const endY = event.clientY - translateY;
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
//Stage
function startStageDrawing(event) {
  startX = event.clientX - translateX;
  startY = event.clientY - translateY;
  isDrawing = true;
  canvas.addEventListener("mousemove", drawStagePreview);
  canvas.addEventListener("mouseup", finishStageDrawing);
}

function drawStagePreview(event) {
  if (!isDrawing) return;

  const currentX = event.clientX - translateX;
  const currentY = event.clientY - translateY;
  const width = currentX - startX;
  const height = currentY - startY;

  drawAll(); // Clear and redraw the canvas
  const tempRect = new Stage({
    x: startX,
    y: startY,
    width: width,
    height: height,
  });
  tempRect.draw(ctx);
}

function finishStageDrawing(event) {
  if (!isDrawing) return;

  const endX = event.clientX - translateX;
  const endY = event.clientY - translateY;
  const width = endX - startX;
  const height = endY - startY;

  isDrawing = false;
  canvas.removeEventListener("mousemove", drawStagePreview);
  canvas.removeEventListener("mouseup", finishStageDrawing);

  const finalRect = new Stage({
    x: startX,
    y: startY,
    width: width,
    height: height,
  });
  shapes.push(finalRect);
  saveCanvasState();
  drawAll();
}

function selectShape(event) {
  const mouseX = event.clientX - translateX;
  const mouseY = event.clientY - translateY;

  selectedShape = null;
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i] instanceof Area) {
      roundedRectangleEditor(shapes[i], mouseX, mouseY);
      if (selectedShape == null) {
        continue;
      } else {
        break;
      }
    } else if (shapes[i] instanceof Stage) {
      roundedRectangleEditor(shapes[i], mouseX, mouseY);
      if (selectedShape == null) {
        continue;
      } else {
        break;
      }
    } else {
      // Todo
    }
  }
  drawAll();
}

function dragShape(event) {
  if (selectedShape) {
    const mouseX = event.clientX - translateX;
    const mouseY = event.clientY - translateY;

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
  mainMapReset();
  const mouseX = event.clientX - translateX;
  const mouseY = event.clientY - translateY;
  console.log("zoom");
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i] instanceof Stage) continue;
    if (isPointInRotatedRect(mouseX, mouseY, shapes[i])) {
      zoomedArea = shapes[i];
      zoomInOnShape(shapes[i]);
      mainMenuBar.style.display = "none";
      areaMenuBar.style.display = "flex";
      break;
    }
  }
}

function zoomInOnShape(shape) {
  saveCanvasState(); // Save state before zooming in

  shapes.forEach((s) => (s.isHidden = s !== shape));

  let zoomedWidth, zoomedHeight;

  if (shape.height > shape.width) {
    zoomedHeight = window.innerHeight / 1.7;
    zoomedWidth = (shape.width * zoomedHeight) / shape.height;
  } else {
    zoomedWidth = window.innerWidth / 1.7;
    zoomedHeight = (shape.height * zoomedWidth) / shape.width;
  }
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

//---------Area functions----------

//Seats
function startDrawing(event) {
  isDrawing = true;
  startX = event.clientX;
  startY = event.clientY;
  canvas.addEventListener("mousemove", drawSeatPreview);
  canvas.addEventListener("mouseup", finishSeatDrawing);
}

function drawSeatPreview(event) {
  if (!isDrawing) return;

  const currentX = event.clientX;
  const currentY = event.clientY;
  drawAll();

  if (selectedType === "grid") {
    drawGridSeatPreview(currentX, currentY);
  } else if (selectedType === "row") {
    drawRowSeatPreview(currentX, currentY);
  }
}

function drawGridSeatPreview(x, y) {
  const radius = Math.sqrt(Math.pow(startX - x) + Math.pow(startY - y));
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawRowSeatPreview(x, y) {
  const seatRadius = 10;
  const seatSpacing = 10;

  // Calculate the angle of the row
  const angle = Math.atan2(y - startY, x - startX);

  // Calculate the total width of the row
  const totalWidth = Math.sqrt(
    Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
  );
  const numberOfSeats = Math.floor(totalWidth / (2 * seatRadius + seatSpacing));

  for (let i = 0; i < numberOfSeats; i++) {
    const seatX = startX + i * (2 * seatRadius + seatSpacing) * Math.cos(angle);
    const seatY = startY + i * (2 * seatRadius + seatSpacing) * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(seatX, seatY, seatRadius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function finishSeatDrawing(event) {
  if (!isDrawing) return;
  isDrawing = false;

  canvas.removeEventListener("mousemove", drawSeatPreview);
  canvas.removeEventListener("mouseup", finishSeatDrawing);

  const endX = event.clientX;
  const endY = event.clientY;

  // Calculate the angle of the row
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  // Calculate the total width of the row
  const totalWidth = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  const numberOfSeats = Math.floor(totalWidth / (2 * seatRadius + seatSpacing));
  console.log("1");
  if (selectedType === "row") {
    zoomedArea.createSeatsForRow({
      name: "Row",
      startX,
      startY,
      seatRadius,
      numberOfSeats,
      seatSpacing,
      rotation: angle,
    });
  }

  drawAll();
}
