const OPEN = 0;
const HIGH = 1;
const LOW = 2;
const CLOSE = 3;
const BAR_WIDTH = 7;
const VERTICAL_OFFSET = 20;

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
    this.drawGraph();

    this.addBars(csv);
  }

  addBars(source) {
    this.source = source;
    this.heightCoeff  = this.findHeightCoeff();
    let barsCount = Math.ceil( this.width / this.getBarWidth() );
    if (this.source.length < barsCount) {
      barsCount = this.source.length;
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
    this.drawBars();
  }

  drawBars() {
    for (let a = 0; a < this.bars.length; a++) {
      let bar = this.bars[a];
      this.ctx.save();
      this.ctx.translate(bar.x, this.height - 10);
      this.ctx.fillStyle = "rgb(100, 210, 255)";
      this.ctx.rotate(-90*Math.PI/180);
      this.ctx.fillText(bar.date, 0, 0);
      this.ctx.restore();
      this.ctx.moveTo(bar.x + this.getBarWidth() / 2, bar.y + 0.5);
      this.ctx.lineTo(
        bar.x + this.getBarWidth() / 2,
        bar.y - bar.low + 0.5
      );
      this.ctx.stroke();
      if (bar.uprising) {
        this.ctx.fillStyle = "rgb(28, 209, 88)";
        this.ctx.fillRect(
          bar.x + 4,
          bar.y - bar.low - bar.body + 0.5,
          BAR_WIDTH * this.scaleCoeff,
          bar.body
        );
      } else {
        this.ctx.fillStyle = "rgb(255, 69, 58)";
        this.ctx.fillRect(
          bar.x + 4,
          bar.y - bar.low - bar.body + 0.5,
          BAR_WIDTH * this.scaleCoeff,
          bar.body
        );
      }
      this.ctx.moveTo(bar.x + this.getBarWidth() / 2, bar.y - bar.low - bar.body + 0.5);
      this.ctx.lineTo(
        bar.x + this.getBarWidth() / 2,
        bar.y - bar.low - bar.body - bar.high + 0.5
      );
      this.ctx.stroke();
    }
  }

  createBar(data, i, index) {
    let bar = {};
    bar.x = this.width - i * this.getBarWidth();
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
    let minHeight = this.source[this.sourceIndex][LOW];

    for (let i = this.sourceIndex; i < barsCount; i++) {
      if (this.source[i][HIGH] > maxHeight) {
        maxHeight = this.source[i][HIGH];
        maxHeightIndex = i;
      }
      if (this.source[i][LOW] < minHeight) {
        minHeight = this.source[i][LOW];
        minHeightIndex = i;
      }
    }
    this.low = minHeight;
    return (this.height - VERTICAL_OFFSET*2) / (maxHeight - minHeight);
  }

  getBarWidth() {
    return BAR_WIDTH * this.scaleCoeff + 8;
  }

  drawGraph() {
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(5.5, 0);
    this.ctx.lineTo(5.5, this.height - 5.5);
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
  new Graph(document.getElementById('cv'));
});
