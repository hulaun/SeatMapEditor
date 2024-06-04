class Shape {
  constructor() {
    this.isHidden = false;
    this.type = "Shape";
  }

  serialize() {
    return {
      type: this.type,
      isHidden: this.isHidden,
    };
  }

  static deserialize(data) {
    const shape = new Shape();
    shape.isHidden = data.isHidden;
    return shape;
  }

  draw(ctx) {
    return "shape";
  }
}

class RoundedBorderRectangle extends Shape {
  constructor({
    x,
    y,
    width,
    height,
    topLeftBorderRadius = 0,
    topRightBorderRadius = 0,
    bottomLeftBorderRadius = 0,
    bottomRightBorderRadius = 0,
    borderRadius = 0,
    color = "white",
    rotation = 0,
  }) {
    super();
    this.type = "RoundedBorderRectangle";
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.topLeftBorderRadius =
      topLeftBorderRadius == 0 ? borderRadius : topLeftBorderRadius;
    this.topRightBorderRadius =
      topRightBorderRadius == 0 ? borderRadius : topRightBorderRadius;
    this.bottomLeftBorderRadius =
      bottomLeftBorderRadius == 0 ? borderRadius : bottomLeftBorderRadius;
    this.bottomRightBorderRadius =
      bottomRightBorderRadius == 0 ? borderRadius : bottomRightBorderRadius;
    this.color = color;
    this.rotation = rotation;
  }

  serialize() {
    return {
      ...super.serialize(),
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      topLeftBorderRadius: this.topLeftBorderRadius,
      topRightBorderRadius: this.topRightBorderRadius,
      bottomLeftBorderRadius: this.bottomLeftBorderRadius,
      bottomRightBorderRadius: this.bottomRightBorderRadius,
      color: this.color,
      rotation: this.rotation,
    };
  }

  static deserialize(data) {
    console.log(data);
    return new RoundedBorderRectangle(data);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.width / 2, -this.height / 2);
    ctx.beginPath();
    ctx.moveTo(this.topLeftBorderRadius, 0);
    ctx.lineTo(this.width - this.topRightBorderRadius, 0);
    ctx.quadraticCurveTo(this.width, 0, this.width, this.topRightBorderRadius);
    ctx.lineTo(this.width, this.height - this.bottomRightBorderRadius);
    ctx.quadraticCurveTo(
      this.width,
      this.height,
      this.width - this.bottomRightBorderRadius,
      this.height
    );
    ctx.lineTo(this.bottomLeftBorderRadius, this.height);
    ctx.quadraticCurveTo(
      0,
      this.height,
      0,
      this.height - this.bottomLeftBorderRadius
    );
    ctx.lineTo(0, this.topLeftBorderRadius);
    ctx.quadraticCurveTo(0, 0, this.topLeftBorderRadius, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
    return "rectangle";
  }
}
class Stage extends RoundedBorderRectangle {
  constructor({
    name = "Stage",
    x,
    y,
    width,
    height,
    borderRadius = 0,
    topLeftBorderRadius = 0,
    topRightBorderRadius = 0,
    bottomLeftBorderRadius = 0,
    bottomRightBorderRadius = 0,
    rotation = 0,
    color = "lightgrey",
  }) {
    super({
      x,
      y,
      width,
      height,
      borderRadius: borderRadius,
      topLeftBorderRadius: topLeftBorderRadius,
      topRightBorderRadius: topRightBorderRadius,
      bottomLeftBorderRadius: bottomLeftBorderRadius,
      bottomRightBorderRadius: bottomRightBorderRadius,
      rotation: rotation,
      color: color,
    });
    this.type = "Stage";
    this.name = name;
  }

  serialize() {
    return {
      ...super.serialize(),
      type: this.type,
      name: this.name,
    };
  }

  static deserialize(data) {
    return new Stage(data);
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.font = `${this.width / 12}px Arial`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height / 2);
    return "stage";
  }
}

class Area extends RoundedBorderRectangle {
  constructor({
    name,
    x,
    y,
    width,
    height,
    topLeftBorderRadius = 0,
    topRightBorderRadius = 0,
    bottomLeftBorderRadius = 0,
    bottomRightBorderRadius = 0,
    borderRadius = 0,
    color = "white",
    rotation = 0,
    shapes = null,
  }) {
    super({
      x,
      y,
      width,
      height,
      borderRadius,
      topLeftBorderRadius: topLeftBorderRadius,
      topRightBorderRadius: topRightBorderRadius,
      bottomLeftBorderRadius: bottomLeftBorderRadius,
      bottomRightBorderRadius: bottomRightBorderRadius,
      color,
      rotation,
    });
    this.type = "Area";
    this.name = name;
    this.shapes = shapes ?? [];
  }

  serialize() {
    return {
      ...super.serialize(),
      type: this.type,
      name: this.name,
      shapes: this.shapes.map((shape) => shape.serialize()),
    };
  }

  static deserialize(data) {
    const area = new Area(data);
    console.log(area);
    area.shapes = data.shapes.map((shapeData) => {
      console.log(shapeData);
      switch (shapeData.type) {
        case "Row":
          return Row.deserialize(shapeData);
        case "Text":
          return Text.deserialize(shapeData);
        // Add more cases for other shape types if needed
        default:
          throw new Error(`Unknown shape type: ${shapeData.type}`);
      }
    });
    return area;
  }

  addShape(shape) {
    this.shapes.push(shape);
  }

  draw(ctx, isZoomed = false) {
    super.draw(ctx);
    ctx.font = `${this.width / 12}px Arial`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "lightgrey";
    ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height / 2);
    if (isZoomed) {
      this.shapes.forEach((shape) => {
        shape.draw(ctx);
      });
    }
    return "stage";
  }

  // Add Text to the shapes
  addText({ content, x, y, fontSize, fontFamily, color }) {
    const text = new Text({ content, x, y, fontSize, fontFamily, color });
    this.addShape(text);
    return text;
  }

  createRow({
    name = "",
    startX,
    startY,
    seatRadius,
    seatSpacing = 10,
    rotation = 0,
  }) {
    const row = new Row({
      name,
      startX,
      startY,
      seatRadius,
      seatSpacing,
      rotation,
    });
    return row;
  }

  createSeatsForRow({
    name,
    startX,
    startY,
    seatRadius,
    numberOfSeats,
    seatSpacing = 10,
    rotation,
  }) {
    const row = this.createRow({
      name,
      startX,
      startY,
      seatRadius,
      seatSpacing,
      rotation,
    });

    for (let seatIndex = 0; seatIndex < numberOfSeats; seatIndex++) {
      row.createSeat({
        number: seatIndex + 1,
        isBuyed: false,
      });
    }
    this.addShape(row);
  }
}
class Text {
  constructor({
    content,
    x,
    y,
    fontSize,
    fontFamily = "Arial",
    color = "black",
  }) {
    this.content = content;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.type = "Text";
  }

  serialize() {
    return {
      type: this.type,
      content: this.content,
      x: this.x,
      y: this.y,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      color: this.color,
    };
  }

  static deserialize(data) {
    return new Text(data);
  }

  draw(ctx) {
    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    ctx.fillStyle = this.color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(this.content, this.x, this.y);
  }
}
class Row {
  constructor({
    name = "",
    startX,
    startY,
    seatRadius = 10,
    seatSpacing = 10,
    rotation = 0,
  }) {
    this.name = name;
    this.startX = startX;
    this.startY = startY;
    this.seatRadius = seatRadius;
    this.seatSpacing = seatSpacing;
    this.seats = [];
    this.rotation = rotation;
    this.type = "Row";
  }

  serialize() {
    return {
      type: this.type,
      name: this.name,
      startX: this.startX,
      startY: this.startY,
      seatRadius: this.seatRadius,
      seatSpacing: this.seatSpacing,
      seats: this.seats.map((seat) => seat.serialize()),
      rotation: this.rotation,
    };
  }

  static deserialize(data) {
    const row = new Row(data);
    row.seats = data.seats.map((seatData) => Seat.deserialize(seatData));
    return row;
  }

  addSeat(seat) {
    this.seats.push(seat);
  }

  createSeat({ number, isBuyed = false }) {
    const x =
      this.startX +
      this.seats.length * (this.seatRadius * 2 + this.seatSpacing);
    const y = this.startY;
    const seat = new Seat({
      rowName: this.name,
      number: number,
      x: x,
      y: y,
      radius: this.seatRadius,
      isBuyed,
    });
    this.addSeat(seat);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.startX, this.startY);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.startX, -this.startY);

    this.seats.forEach((seat) => seat.draw(ctx));

    ctx.restore();
  }

  drawBoundingRectangle(ctx) {
    ctx.save();
    ctx.translate(this.startX, this.startY);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.translate(-this.startX, -this.startY);

    const totalWidth =
      (this.seats.length - 1) * (this.seatRadius * 2 + this.seatSpacing);
    const rectWidth = totalWidth + this.seatRadius * 2;
    const rectHeight = this.seatRadius * 2;

    ctx.strokeStyle = "red";
    ctx.strokeRect(
      this.startX - this.seatRadius - 2,
      this.startY - this.seatRadius - 2,
      rectWidth + 4,
      rectHeight + 4
    );

    ctx.restore();
  }
}

class Seat {
  constructor({ rowName = "", number, x, y, radius, isBuyed = false }) {
    this.rowName = rowName;
    this.number = number;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.isBuyed = isBuyed;
    this.type = "Seat";
  }

  serialize() {
    return {
      type: this.type,
      rowName: this.rowName,
      number: this.number,
      x: this.x,
      y: this.y,
      radius: this.radius,
      isBuyed: this.isBuyed,
    };
  }

  static deserialize(data) {
    return new Seat(data);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.strokeStyle = "black";
    ctx.stroke();
    if (this.isBuyed) {
      ctx.fillStyle = "red";
      ctx.fill();
    }
    ctx.fillStyle = "black";
    ctx.font = `${this.radius * 0.75}px Arial`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(this.rowName + this.number, this.x, this.y);
  }
}
