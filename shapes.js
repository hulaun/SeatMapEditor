class Shape {
  constructor() {
    this.isHidden = false;
  }

  serialize() {
    return {
      type: "Shape",
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
    borderRadius = 0,
    color = "white",
    rotation = 0,
  }) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.topLeftBorderRadius = borderRadius;
    this.topRightBorderRadius = borderRadius;
    this.bottomLeftBorderRadius = borderRadius;
    this.bottomRightBorderRadius = borderRadius;
    this.color = color;
    this.rotation = rotation;
  }

  serialize() {
    return {
      ...super.serialize(),
      type: "RoundedBorderRectangle",
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
  constructor({ name = "Stage", x, y, width, height, color = "lightgrey" }) {
    super({ x, y, width, height, color });
    this.name = name;
  }

  serialize() {
    return {
      ...super.serialize(),
      type: "Stage",
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
  constructor({ name, x, y, width, height }) {
    super({ x, y, width, height });
    this.name = name;
    this.rows = [];
  }

  serialize() {
    return {
      ...super.serialize(),
      type: "Area",
      name: this.name,
      rows: this.rows.map((row) => row.serialize()),
    };
  }

  static deserialize(data) {
    const area = new Area(data);
    area.rows = data.rows.map((rowData) => Row.deserialize(rowData));
    return area;
  }

  addRow(row) {
    this.rows.push(row);
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.font = `${this.width / 12}px Arial`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "lightgrey";
    ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height / 2);

    // Fill the rows and seats
    this.rows.forEach((row) => row.draw(ctx));

    return "stage";
  }

  createRow({ name = "", startX, startY, seatRadius, seatSpacing = 10 }) {
    const row = new Row({ name, startX, startY, seatRadius, seatSpacing });
    this.addRow(row);
    return row;
  }

  createSeatsForRow({
    name,
    startX,
    startY,
    seatRadius,
    numberOfSeats,
    seatSpacing = 10,
  }) {
    const row = this.createRow({
      name,
      startX,
      startY,
      seatRadius,
      seatSpacing,
    });

    for (let seatIndex = 0; seatIndex < numberOfSeats; seatIndex++) {
      row.createSeat({
        number: seatIndex + 1,
        isBuyed: false,
      });
    }
  }

  createSeatsForAllAvailableSpace({
    seatRadius,
    rowSpacing = 20,
    seatSpacing = 10,
    isBuyed = false,
  }) {
    const rows = Math.floor(this.height / (seatRadius * 2 + rowSpacing));
    const seatsPerRow = Math.floor(this.width / (seatRadius * 2 + seatSpacing));

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      const startY =
        this.y + seatRadius * 2 + rowIndex * (seatRadius * 2 + rowSpacing);
      this.createSeatsForRow({
        name: `A${rowIndex + 1}`,
        startX: this.x + seatRadius * 2,
        startY: startY,
        seatRadius: seatRadius,
        numberOfSeats: seatsPerRow,
        seatSpacing: seatSpacing,
      });
    }
  }
}

class Row {
  constructor({
    name = "",
    startX,
    startY,
    seatRadius = 10,
    seatSpacing = 10,
  }) {
    this.name = name;
    this.startX = startX;
    this.startY = startY;
    this.seatRadius = seatRadius;
    this.seatSpacing = seatSpacing;
    this.seats = [];
    this.rotation = 0; // Added rotation property
  }

  serialize() {
    return {
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
}

class Seat {
  constructor({ rowName = "", number, x, y, radius, isBuyed = false }) {
    this.rowName = rowName;
    this.number = number;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.isBuyed = isBuyed;
  }

  serialize() {
    return {
      type: "Seat",
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
