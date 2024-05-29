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

  canvas.addEventListener("mousemove", drawPreview);
  canvas.addEventListener("mouseup", finishDrawing);
}

function drawPreview(event) {
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

function finishDrawing(event) {
  if (!isDrawing) return;

  const endX = event.clientX;
  const endY = event.clientY;
  const width = endX - startX;
  const height = endY - startY;

  isDrawing = false;
  canvas.removeEventListener("mousemove", drawPreview);
  canvas.removeEventListener("mouseup", finishDrawing);

  const finalRect = new RoundedBorderRectangle({
    x: startX,
    y: startY,
    width: width,
    height: height,
  });
  shapes.push(finalRect);
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
        <button id="insertSeat" class="btn btn-secondary">Add seats</button>
        <div id="seatOptions" style="display: none;">
          <label for="seatType">Select Seat Type:</label>
          <select id="seatType">
            <option value="single">Single Seat</option>
            <option value="row">Row of Seats</option>
            <option value="grid">Grid of Seats</option>
          </select>
          <div id="seatForm"></div>
        </div>
      `);

      const dropdownToggle = document.getElementById("advancedOptionsDropdown");
      const dropdownMenu = document.getElementById("advancedOptionsMenu");
      const insertSeatButton = document.getElementById("insertSeat");
      const seatOptions = document.getElementById("seatOptions");
      const seatType = document.getElementById("seatType");
      const seatForm = document.getElementById("seatForm");

      dropdownToggle.addEventListener("click", () => {
        const expanded =
          dropdownToggle.getAttribute("aria-expanded") === "true";
        dropdownToggle.setAttribute("aria-expanded", !expanded);
        dropdownMenu.style.display = !expanded ? "block" : "none";
      });

      insertSeatButton.addEventListener("click", () => {
        seatOptions.style.display = "block";
      });

      seatType.addEventListener("change", () => {
        const selectedType = seatType.value;
        let formHtml = "";

        if (selectedType === "single") {
          formHtml = `
            <label for="singleSeatRadius">Seat Radius:</label>
            <input type="number" id="singleSeatRadius" min="1" max="100">
            <br>
            <label for="singleSeatNumber">Seat Number:</label>
            <input type="number" id="singleSeatNumber" min="1">
            <br>
            <label for="singleSeatRowName">Row Name:</label>
            <input type="text" id="singleSeatRowName">
            <br>
            <button id="createSingleSeat" class="btn btn-primary">Create Single Seat</button>
          `;
        } else if (selectedType === "row") {
          formHtml = `
            <label for="rowStartX">Start X:</label>
            <input type="number" id="rowStartX" min="0">
            <br>
            <label for="rowStartY">Start Y:</label>
            <input type="number" id="rowStartY" min="0">
            <br>
            <label for="rowSeatRadius">Seat Radius:</label>
            <input type="number" id="rowSeatRadius" min="1" max="100">
            <br>
            <label for="rowNumberOfSeats">Number of Seats:</label>
            <input type="number" id="rowNumberOfSeats" min="1">
            <br>
            <label for="rowName">Row Name:</label>
            <input type="text" id="rowName">
            <br>
            <label for="rowSpacing">Seat Spacing:</label>
            <input type="number" id="rowSpacing" min="1">
            <br>
            <button id="createRowOfSeats" class="btn btn-primary">Create Row of Seats</button>
          `;
        } else if (selectedType === "grid") {
          formHtml = `
            <label for="gridSeatRadius">Seat Radius:</label>
            <input type="number" id="gridSeatRadius" min="1" max="100">
            <br>
            <label for="gridRowSpacing">Row Spacing:</label>
            <input type="number" id="gridRowSpacing" min="1">
            <br>
            <label for="gridSeatSpacing">Seat Spacing:</label>
            <input type="number" id="gridSeatSpacing" min="1">
            <br>
            <button id="createGridOfSeats" class="btn btn-primary">Create Grid of Seats</button>
          `;
        }

        seatForm.innerHTML = formHtml;

        if (selectedType === "single") {
          seatForm
            .querySelector("#createSingleSeat")
            .addEventListener("click", () => {
              const radius = parseInt(
                seatForm.querySelector("#singleSeatRadius").value,
                10
              );
              const number = parseInt(
                seatForm.querySelector("#singleSeatNumber").value,
                10
              );
              const rowName =
                seatForm.querySelector("#singleSeatRowName").value;

              selectedShape
                .createRow({
                  name: rowName,
                  startX: selectedShape.x,
                  startY: selectedShape.y,
                  seatRadius: radius,
                })
                .createSeat({ number });

              drawAll();
            });
        } else if (selectedType === "row") {
          seatForm
            .querySelector("#createRowOfSeats")
            .addEventListener("click", () => {
              const startX = parseInt(
                seatForm.querySelector("#rowStartX").value,
                10
              );
              const startY = parseInt(
                seatForm.querySelector("#rowStartY").value,
                10
              );
              const radius = parseInt(
                seatForm.querySelector("#rowSeatRadius").value,
                10
              );
              const numberOfSeats = parseInt(
                seatForm.querySelector("#rowNumberOfSeats").value,
                10
              );
              const rowName = document.getElementById("rowName").value;
              const spacing = parseInt(
                document.getElementById("rowSpacing").value,
                10
              );

              selectedShape.createRowOfSeats({
                startX: startX,
                startY: startY,
                seatRadius: radius,
                numberOfSeats: numberOfSeats,
                rowName: rowName,
                spacing: spacing,
                isBuyed: false,
              });

              drawAll();
            });
        } else if (selectedType === "grid") {
          document
            .getElementById("createGridOfSeats")
            .addEventListener("click", () => {
              const radius = parseInt(
                document.getElementById("gridSeatRadius").value,
                10
              );
              const rowSpacing = parseInt(
                document.getElementById("gridRowSpacing").value,
                10
              );
              const seatSpacing = parseInt(
                document.getElementById("gridSeatSpacing").value,
                10
              );

              selectedShape.createSeatsForAllAvailableSpace({
                seatRadius: radius,
                rowSpacing: rowSpacing,
                seatSpacing: seatSpacing,
                isBuyed: false,
              });

              drawAll();
              console.log(selectedShape);
            });
        }
      });

      document.getElementById("positionX").addEventListener("input", (e) => {
        shape.x = parseInt(e.target.value, 10);
        drawAll();
      });

      document.getElementById("positionY").addEventListener("input", (e) => {
        shape.y = parseInt(e.target.value, 10);
        drawAll();
      });

      document.getElementById("curveWidth").addEventListener("input", (e) => {
        shape.width = parseInt(e.target.value, 10);
        drawAll();
      });

      document.getElementById("curveHeight").addEventListener("input", (e) => {
        shape.height = parseInt(e.target.value, 10);
        drawAll();
      });

      document
        .getElementById("curveBorderRadius")
        .addEventListener("input", (e) => {
          shape.topLeftBorderRadius = parseInt(e.target.value, 10);
          shape.topRightBorderRadius = parseInt(e.target.value, 10);
          shape.bottomLeftBorderRadius = parseInt(e.target.value, 10);
          shape.bottomRightBorderRadius = parseInt(e.target.value, 10);
          drawAll();
        });

      document
        .getElementById("topLeftBorderRadius")
        .addEventListener("input", (e) => {
          shape.topLeftBorderRadius = parseInt(e.target.value, 10);
          drawAll();
        });

      document
        .getElementById("topRightBorderRadius")
        .addEventListener("input", (e) => {
          shape.topRightBorderRadius = parseInt(e.target.value, 10);
          drawAll();
        });

      document
        .getElementById("bottomLeftBorderRadius")
        .addEventListener("input", (e) => {
          shape.bottomLeftBorderRadius = parseInt(e.target.value, 10);
          drawAll();
        });

      document
        .getElementById("bottomRightBorderRadius")
        .addEventListener("input", (e) => {
          shape.bottomRightBorderRadius = parseInt(e.target.value, 10);
          drawAll();
        });

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
}

function undoLastAction() {
  if (shapes.length > 0) {
    bin.push(shapes.pop());
    drawAll();
  }
}

function redoLastAction() {
  if (bin.length > 0) {
    shapes.push(bin.pop());
    drawAll();
  }
}
