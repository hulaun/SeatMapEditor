const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;
const ctx = canvas.getContext("2d");

const rectangleButton = document.getElementById("addRectangle");
const selectButton = document.getElementById("selectEditMode");
let isDrawing = false;
let startX, startY;
let selectedRectangle = null;

let shapes = [];
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((shape) => {
    if (shape === selectedRectangle) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
    }
    shape.draw(ctx);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const rect = new RoundedBorderRectangle(100, 100, 300, 300, 50);
  shapes.push(rect);
  drawAll();
});

rectangleButton.addEventListener("click", () => {
  canvas.addEventListener("mousedown", startDrawing);
});

selectButton.addEventListener("click", () => {
  canvas.addEventListener("click", selectRectangle);
});

function startDrawing(event) {
  const rect = canvas.getBoundingClientRect();
  startX = event.clientX - rect.left;
  startY = event.clientY - rect.top;
  isDrawing = true;

  canvas.addEventListener("mousemove", drawPreview);
  canvas.addEventListener("mouseup", finishDrawing);
}

function drawPreview(event) {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const currentX = event.clientX - rect.left;
  const currentY = event.clientY - rect.top;
  const width = currentX - startX;
  const height = currentY - startY;

  drawAll();

  const tempRect = new RoundedBorderRectangle(
    startX,
    startY,
    width,
    height,
    20
  ); // Adjust border radius as needed
  tempRect.draw(ctx);
}

function finishDrawing(event) {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const endX = event.clientX - rect.left;
  const endY = event.clientY - rect.top;
  const width = endX - startX;
  const height = endY - startY;

  isDrawing = false;
  canvas.removeEventListener("mousedown", startDrawing);
  canvas.removeEventListener("mousemove", drawPreview);
  canvas.removeEventListener("mouseup", finishDrawing);

  // Draw the final rectangle
  const finalRect = new RoundedBorderRectangle(
    startX,
    startY,
    width,
    height,
    20
  ); // Adjust border radius as needed
  shapes.push(finalRect);
  drawAll();
}

function selectRectangle(event) {
  console.log("true");
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  selectedRectangle = null;
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (
      mouseX >= shape.startX &&
      mouseX <= shape.startX + shape.width &&
      mouseY >= shape.startY &&
      mouseY <= shape.startY + shape.height
    ) {
      selectedRectangle = shape;
      break;
    }
  }

  drawAll(); // Redraw with selected rectangle highlighted
}

class RoundedBorderRectangle {
  constructor(x, y, width, height, borderRadius) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.borderRadius = borderRadius;
  }

  getHorizontalOffset() {
    return this.width < 0 ? this.borderRadius * -1 : this.borderRadius;
  }
  getVerticalOffset() {
    return this.height < 0 ? this.borderRadius * -1 : this.borderRadius;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x + this.getHorizontalOffset(), this.y);
    ctx.lineTo(this.x + this.width - this.getHorizontalOffset(), this.y);
    ctx.bezierCurveTo(
      this.x + this.width - this.getHorizontalOffset() * 0.1,
      this.y,
      this.x + this.width,
      this.y + this.getVerticalOffset() * 0.1,
      this.x + this.width,
      this.y + this.getVerticalOffset()
    );
    ctx.lineTo(
      this.x + this.width,
      this.y + this.height - this.getVerticalOffset()
    );
    ctx.bezierCurveTo(
      this.x + this.width,
      this.y + this.height - this.getVerticalOffset() * 0.1,
      this.x + this.width - this.getHorizontalOffset() * 0.1,
      this.y + this.height,
      this.x + this.width - this.getHorizontalOffset(),
      this.y + this.height
    );
    ctx.lineTo(this.x + this.getHorizontalOffset(), this.y + this.height);
    ctx.bezierCurveTo(
      this.x + this.getHorizontalOffset() * 0.1,
      this.y + this.height,
      this.x,
      this.y + this.height - this.getVerticalOffset() * 0.1,
      this.x,
      this.y + this.height - this.getVerticalOffset()
    );
    ctx.lineTo(this.x, this.y + this.getVerticalOffset());
    ctx.bezierCurveTo(
      this.x,
      this.y + this.getVerticalOffset() * 0.1,
      this.x + this.getHorizontalOffset() * 0.1,
      this.y,
      this.x + this.getHorizontalOffset(),
      this.y
    );
    ctx.stroke();
  }
}
