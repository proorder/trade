const OPEN = 0;
const HIGH = 1;
const LOW = 2;
const CLOSE = 3;
let BAR_MARGIN = 1;
let BAR_WIDTH = 3;
const VERTICAL_OFFSET = 40;
var graph;

class Graph {
  constructor(canvas) {
    this.canvas = canvas;
    this.setSize();
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    this.scaleCoeff = 1;
    this.source = [];
    this.bars = [];
    this.sourceIndex = 0;

    this.ctx = canvas.getContext('2d');
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.addBars(csv);
  }

  addBars(source) {
    this.source = source;
    this.heightCoeff  = this.findHeightCoeff();
    this.defineBars();
    this.drawBars();
  }

  defineBars() {
    this.bars = [];
    let barsCount = Math.ceil( this.width / this.getBarWidth() );
    if (this.source.length - this.sourceIndex < barsCount) {
      barsCount = this.source.length - this.sourceIndex;
    }

    for (let i = this.sourceIndex; i < barsCount; i++) {
      this.bars.push(
        this.createBar(
          this.source[this.source.length - 1 - i],
          i,
          this.source.length - 1 - i
        )
      );
    }
  }

  drawBars() {
    this.ctx.fillStyle = 'rgb(247, 247, 247)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    for (let a = 0; a < this.bars.length; a++) {
      let bar = this.bars[a];
      this.ctx.save();
      this.ctx.translate(bar.x, this.height - 10);
      // this.ctx.fillStyle = "rgb(100, 210, 255)";
      this.ctx.fillStyle = "rgb(180, 180, 180)";
      this.ctx.rotate(-90*Math.PI/180);
      this.ctx.fillText(
        bar.date + "     "
        + "HIGH: " + this.source[this.source.length - 1 - a][HIGH] + "     "
        + "LOW: " + this.source[this.source.length - 1 - a][LOW] + "     ",
        0, 4);
      this.ctx.restore();
      this.ctx.beginPath();
      /*
      if (bar.uprising) {
        this.ctx.strokeStyle = "rgb(28, 209, 88)";
      } else {
        this.ctx.strokeStyle = "rgb(255, 69, 58)";
      }
      */
      this.ctx.moveTo(bar.x + this.getBarWidth() / 2, bar.y + 0.5);
      this.ctx.lineTo(
        bar.x + this.getBarWidth() / 2,
        bar.y - bar.low + 0.5
      );
      this.ctx.stroke();
      if (bar.uprising) {
        this.ctx.fillStyle = "rgb(28, 209, 88)";
        this.ctx.fillRect(
          bar.x + BAR_MARGIN,
          bar.y - bar.low - bar.body + 0.5,
          BAR_WIDTH * this.scaleCoeff,
          bar.body
        );
      } else {
        this.ctx.fillStyle = "rgb(255, 69, 58)";
        this.ctx.fillRect(
          bar.x + BAR_MARGIN,
          bar.y - bar.low - bar.body + 0.5,
          BAR_WIDTH * this.scaleCoeff,
          bar.body
        );
      }
      this.ctx.beginPath();
      /*
      if (bar.uprising) {
        this.ctx.strokeStyle = "rgb(28, 209, 88)";
      } else {
        this.ctx.strokeStyle = "rgb(255, 69, 58)";
      }
      */
      this.ctx.moveTo(bar.x + this.getBarWidth() / 2, bar.y - bar.low - bar.body + 0.5);
      this.ctx.lineTo(
        bar.x + this.getBarWidth() / 2,
        bar.y - bar.low - bar.body - bar.high + 0.5
      );
      this.ctx.stroke();
    }
    this.drawGraph();
    this.drawLine(points);
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.defineBars();
    this.drawBars();
  }

  drawLine(points) {
    if (points.t1.LOW === null) {
      let t1 = this.bars[points.t1.HIGH];
      let t3 = this.bars[points.t3.HIGH];
      let t2 = this.bars[points.t2.LOW];
      let t4 = this.bars[points.t4.LOW];
      let t1_point;
      this.ctx.strokeStyle = "rgb(0, 83, 138)";
      this.ctx.moveTo(
        t1.x + this.getBarWidth() / 2,
        t1.y - t1.low - t1.body - t1.high + 0.5
      );
      this.ctx.lineTo(
        t3.x + this.getBarWidth() / 2,
        t3.y - t3.low - t3.body - t3.high + 0.5
      );
      this.ctx.moveTo(
        t2.x + this.getBarWidth() / 2,
        t2.y + 0.5
      );
      this.ctx.lineTo(
        t4.x + this.getBarWidth() / 2,
        t4.y + 0.5
      );
      this.ctx.stroke();
    } else {
      let t1 = this.bars[points.t1.LOW];
      let t3 = this.bars[points.t3.LOW];
      let t2 = this.bars[points.t2.HIGH];
      let t4 = this.bars[points.t4.HIGH];

      let t1t3h = Math.abs(t1.y - t3.y);
      let t1t3w = (t1.x + this.getBarWidth() / 2) - (t3.x + this.getBarWidth() / 2);
      let t1t3b = this.width - (t3.x + this.getBarWidth() / 2);

      let t2t4h = Math.abs(
        (t2.y - t2.low - t2.body - t2.high) -
        (t4.y - t4.low - t4.body - t4.high)
      );
      let t2t4w = Math.abs(
        (t2.x + this.getBarWidth() / 2) -
        (t4.x + this.getBarWidth() / 2)
      );
      let t2t4b = this.width - (t4.x + this.getBarWidth() / 2);

      this.ctx.strokeStyle = "rgb(0, 83, 138)";
      this.ctx.moveTo(
        this.width,
        t3.y + t1t3b * Math.tan(t1t3h/t1t3w) + 0.5
      );
      this.ctx.lineTo(
        0,
        t1.y - this.width * Math.tan(t1t3h/t1t3w) + 0.5
      );
      this.ctx.moveTo(
        t2.x + this.getBarWidth() / 2,
        t2.y - t2.low - t2.body - t2.high + 0.5
      );
      this.ctx.lineTo(
        t4.x + this.getBarWidth() / 2,
        t4.y - t4.low - t4.body - t4.high + 0.5
      );
      this.ctx.stroke();
    }
  }

  createBar(data, i, index) {
    let bar = {};
    bar.x = this.width - i * this.getBarWidth() - this.getBarWidth();
    bar.y = this.height - ( (data[LOW] - this.low) * this.heightCoeff ) - VERTICAL_OFFSET;
    bar.date = data[4];

    bar.low = (data[data[OPEN] < data[CLOSE] ? OPEN : CLOSE] - data[LOW])
      * this.heightCoeff;

    bar.body = Math.abs(data[OPEN] - data[CLOSE]) * this.heightCoeff;

    bar.high = (data[HIGH] - data[data[OPEN] < data[CLOSE] ? CLOSE : OPEN])
      * this.heightCoeff;

    bar.uprising = data[OPEN] < data[CLOSE];

    return bar;
  }

  findHeightCoeff() {
    let barsCount = Math.ceil( this.width / this.getBarWidth() );
    if (this.source.length < barsCount) {
      barsCount = this.source.length;
    }
    let minHeightIndex = 0;
    let maxHeightIndex = 0;
    let maxHeight = 0;
    let minHeight = this.source[this.source.length - 1 - this.sourceIndex][LOW];

    for (let i = this.sourceIndex; i < barsCount; i++) {
      let a = this.source.length - 1 - this.sourceIndex - i;
      if (this.source[a][HIGH] > maxHeight) {
        maxHeight = this.source[a][HIGH];
        maxHeightIndex = a;
      }
      if (this.source[a][LOW] < minHeight) {
        minHeight = this.source[a][LOW];
        minHeightIndex = this.source[a];
      }
    }
    this.low = minHeight;
    return (this.height - VERTICAL_OFFSET*2) / (maxHeight - minHeight);
  }

  getBarWidth() {
    return BAR_WIDTH * this.scaleCoeff + BAR_MARGIN*2;
  }

  drawGraph() {
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(0.5, 0);
    this.ctx.lineTo(0.5, this.height - 5.5);
    this.ctx.lineTo(this.width, this.height - 5.5);
    this.ctx.stroke();
  }

  setSize() {
    // this.canvas.width = this.canvas.parentNode.clientWidth;
    this.canvas.width = 700;
    this.canvas.height = 500;
  }
}

window.addEventListener('load', function() {
  graph = new Graph(document.getElementById('cv'));
});
