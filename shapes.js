class Shape {
  draw(ctx) {
    return "shape";
  }
}

class RoundedBorderRectangle extends Shape {
  constructor({ x, y, width, height, borderRadius = 0, color = "white" }) {
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
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x + this.topLeftBorderRadius, this.y);
    ctx.lineTo(this.x + this.width - this.topRightBorderRadius, this.y);
    ctx.quadraticCurveTo(
      this.x + this.width,
      this.y,
      this.x + this.width,
      this.y + this.topRightBorderRadius
    );

    ctx.lineTo(
      this.x + this.width,
      this.y + this.height - this.bottomRightBorderRadius
    );
    ctx.quadraticCurveTo(
      this.x + this.width,
      this.y + this.height,
      this.x + this.width - this.bottomRightBorderRadius,
      this.y + this.height
    );

    ctx.lineTo(this.x + this.bottomLeftBorderRadius, this.y + this.height);
    ctx.quadraticCurveTo(
      this.x,
      this.y + this.height,
      this.x,
      this.y + this.height - this.bottomLeftBorderRadius
    );

    ctx.lineTo(this.x, this.y + this.topLeftBorderRadius);
    ctx.quadraticCurveTo(
      this.x,
      this.y,
      this.x + this.topLeftBorderRadius,
      this.y
    );

    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fill();
    return "rectangle";
  }
}

class Stage extends RoundedBorderRectangle {
  constructor({ name, x, y, width, height, color = "lightgrey" }) {
    super({ x: x, y: y, width: width, height: height, color: color });
    this.name = name;
  }

  draw(ctx) {
    super.draw(ctx);
    ctx.font = `${this.width / 12}px Arial`;
    ctx.textBaseLine = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height / 2);
    return "stage";
  }
}
class Area extends RoundedBorderRectangle {
  constructor({ name, x, y, width, height }) {
    super({ x: x, y: y, width: width, height: height });
    this.name = name;
    this.rows = [];
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

  createRow({ name, startX, startY, seatRadius, seatSpacing = 10 }) {
    const row = new Row({ name, startX, startY, seatRadius, seatSpacing });
    this.addRow(row);
    return row;
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
      const row = this.createRow({
        name: `A${rowIndex + 1}.`,
        startX: this.x + seatRadius * 2,
        startY: startY,
        seatRadius: seatRadius,
        seatSpacing: seatSpacing,
      });

      for (let seatIndex = 0; seatIndex < seatsPerRow; seatIndex++) {
        row.createSeat({
          number: seatIndex + 1,
          isBuyed: isBuyed,
        });
      }
    }
  }
}

class Row {
  constructor({ name, startX, startY, seatRadius = 10, seatSpacing = 10 }) {
    this.name = name;
    this.startX = startX;
    this.startY = startY;
    this.seatRadius = seatRadius;
    this.seatSpacing = seatSpacing;
    this.seats = [];
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
    this.seats.forEach((seat) => seat.draw(ctx));
  }
}

class Seat {
  constructor({ rowName, number, x, y, radius, isBuyed = false }) {
    this.rowName = rowName;
    this.number = number;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.isBuyed = isBuyed;
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
