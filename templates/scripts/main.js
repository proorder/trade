const OPEN = 0;
const HIGH = 1;
const LOW = 2;
const CLOSE = 3;
const BAR_WIDTH = 7;

class Graph {
  constructor(canvas) {
    this.canvas = canvas;
    this.setSize();
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    this.scaleCoeff = 1;
    this.bars = []

    this.ctx = canvas.getContext('2d');
    this.drawGraph();
    this.addBars(csv);
  }

  addBars(bars) {
    let middle = 0;
    for (let a = 0; a < 10; a++) {
      middle += bars[bars.length - 1 - a][HIGH] - bars[bars.length - 1 - a][LOW];
    }
    this.heightCoeff = this.height / (middle / 10) / 10;
    for (let a = 0; this.width > this.getBarsWidth(); a++) {
      let index = bars.length - 1 - a;
      let bar = { index, position: { x: 0, y: 0 } };
      bar.position.x = this.width - a * this.getBarWidth();
      bar.position.y = this.height / 2 + (bars[index][HIGH] - bars[index][LOW]) * this.heightCoeff / 2;
      bar.low = bars[index][OPEN] < bars[index][CLOSE] ?
        (bars[index][OPEN] - bars[index][LOW]) * this.heightCoeff :
        (bars[index][CLOSE] - bars[index][LOW]) * this.heightCoeff;
      bar.body = Math.abs(bars[index][OPEN] - bars[index][CLOSE]) * this.heightCoeff;
      bar.high = bars[index][OPEN] < bars[index][CLOSE] ?
        (bars[index][HIGH] - bars[index][CLOSE]) * this.heightCoeff :
        (bars[index][HIGH] - bars[index][OPEN]) * this.heightCoeff;
      bar.uprising = bars[index][OPEN] < bars[index][CLOSE];
      this.bars.push(bar);
    }
    this.drawBars();
  }

  drawBars() {
    for (let a = 0; a < this.bars.length; a++) {
      let bar = this.bars[a];
      this.ctx.moveTo(bar.position.x + this.getBarWidth() / 2, bar.position.y + 0.5);
      this.ctx.lineTo(
        bar.position.x + this.getBarWidth() / 2,
        bar.position.y - bar.low + 0.5
      );
      this.ctx.stroke();
      if (bar.uprising) {
        this.ctx.fillRect(
          bar.position.x + 4,
          bar.position.y - bar.low - bar.body + 0.5,
          BAR_WIDTH * this.scaleCoeff,
          bar.body
        );
      } else {
        this.ctx.rect(
          bar.position.x + 4,
          bar.position.y - bar.low - bar.body + 0.5,
          BAR_WIDTH * this.scaleCoeff,
          bar.body
        );
      }
      this.ctx.moveTo(bar.position.x + this.getBarWidth() / 2, bar.position.y - bar.low - bar.body + 0.5);
      this.ctx.lineTo(
        bar.position.x + this.getBarWidth() / 2,
        bar.position.y - bar.low - bar.body - bar.high + 0.5
      );
      this.ctx.stroke();
    }
  }

  getBarWidth() {
    return BAR_WIDTH * this.scaleCoeff + 8;
  }

  getBarsWidth() {
    return this.bars.length * this.getBarWidth();
  }

  drawBar() {
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
    console.log(this.canvas.parentNode.clientWidth);
    this.canvas.width = this.canvas.parentNode.clientWidth;
    this.canvas.height = 500;
  }
}

window.addEventListener('load', function() {
  new Graph(document.getElementById('cv'));
});
