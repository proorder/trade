const OPEN = 0;
const HIGH = 1;
const LOW = 2;
const CLOSE = 3;
let BAR_MARGIN = 3;
let BAR_WIDTH = 5;
const VERTICAL_OFFSET = 40;
const HORIZONTAL_OFFSET = 50;
var graph;

class Graph {
  constructor(canvas) {
    this.canvas = canvas;
    this.setSize();
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    let {x, y} = this.canvas.getBoundingClientRect();
    this.x = x;
    this.y = y;
    this.scaleCoeff = 1;
    this.source = [];
    this.bars = [];
    this.sourceIndex = 10;

    this.ctx = canvas.getContext('2d');
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.canvas.addEventListener('mousemove', event => {
      this.crossX = {
        x: Math.floor((this.width - HORIZONTAL_OFFSET - (event.clientX - this.x)) / this.getBarWidth() + this.sourceIndex),
        y: event.clientY - this.y + 0.5
      };
    });
    this.canvas.addEventListener('mouseout', event => {
      delete this.crossX;
    });
    this.canvas.addEventListener('click', () => {
      if (this.crossX !== undefined) {
        let id = this.source.length - 1 - this.crossX.x
        post('select/', { id })
          .then(body => body.json())
          .then(res => {
            console.log(res);
            if (res.t1 !== undefined && res.t3 !== undefined) {
              this.points = res;
              // this.redraw();
            }
          });
      }
    });

    var requestId = requestAnimationFrame(this.redraw.bind(this));

    this.addBars(csv);
  }

  addBars(source) {
    this.source = source;
    this.defineBars();
    this.drawBars();
  }

  defineBars() {
    this.heightCoeff  = this.findHeightCoeff();
    this.bars = [];
    let barsCount = Math.ceil( (this.width - HORIZONTAL_OFFSET*2) / this.getBarWidth() );
    if (this.source.length - this.sourceIndex < barsCount) {
      barsCount = this.source.length - this.sourceIndex;
    }

    for (let i = Math.floor(this.sourceIndex); i < barsCount + this.sourceIndex; i++) {
      this.bars.push(
        this.createBar(
          this.source[this.source.length - 1 - i],
          i,
          this.source.length - 1 - i
        )
      );
    }
  }

  drawX() {
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.width - ((this.crossX.x-this.sourceIndex)*this.getBarWidth()) - HORIZONTAL_OFFSET - this.getBarWidth()/2,
      0
    );
    this.ctx.lineTo(
      this.width - ((this.crossX.x-this.sourceIndex)*this.getBarWidth()) - HORIZONTAL_OFFSET - this.getBarWidth()/2,
      this.height
    );
    this.ctx.moveTo(HORIZONTAL_OFFSET, this.crossX.y);
    this.ctx.lineTo(this.width - HORIZONTAL_OFFSET, this.crossX.y);
    this.ctx.stroke();
    this.ctx.fillText(this.crossX.x, this.width - HORIZONTAL_OFFSET + 10, this.crossX.y);
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
      /*
      this.ctx.beginPath();
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
    this.ctx.clearRect(0, 0, HORIZONTAL_OFFSET, this.height);
    this.ctx.clearRect(this.width - HORIZONTAL_OFFSET, 0, HORIZONTAL_OFFSET, this.height);
    this.drawGraph();
    if (this.points !== undefined) {
      this.drawLine(this.points);
    }
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.defineBars();
    this.drawBars();
    if (this.crossX !== undefined) {
      this.drawX();
    }
    setTimeout(() => {
      requestAnimationFrame(this.redraw.bind(this));
    }, 10);
  }

  drawLine(points) {
    if (points.t1.LOW === null) {
      let t1 = this.bars[points.t1.HIGH];
      let t3 = this.bars[points.t3.HIGH];
      let t2 = this.bars[points.t2.LOW];
      let t4 = this.bars[points.t4.LOW];
      let t1_point;

      let {point_1, point_2} = find_diagonal_height(
        {x: t1.x + this.getBarWidth() / 2, y: t1.y - t1.low - t1.body - t1.high},
        {x: t3.x + this.getBarWidth() / 2, y: t3.y - t3.low - t3.body - t3.high},
        this.width
      );
      /*
      console.log(point_1, point_2);
      this.ctx.strokeStyle = "rgb(0, 83, 138)";
      this.ctx.moveTo(
        point_1.x,
        point_1.y + 0.5
      );
      this.ctx.lineTo(
        point_2.x,
        point_2.y + 0.5
      );
      */

      this.ctx.strokeStyle = "rgb(0, 83, 138)";
      this.ctx.moveTo(
        t1.x + this.getBarWidth() / 2,
        t1.y - t1.low - t1.body - t1.high + 0.5
      );
      this.ctx.lineTo(
        t3.x + this.getBarWidth() / 2,
        t3.y - t3.low - t3.body - t3.high + 0.5
      );
      /*
      this.ctx.moveTo(
        t2.x + this.getBarWidth() / 2,
        t2.y + 0.5
      );
      this.ctx.lineTo(
        t4.x + this.getBarWidth() / 2,
        t4.y + 0.5
      );
      */
      this.ctx.stroke();
    } else {
      let t1 = this.bars[points.t1.LOW];
      let t3 = this.bars[points.t3.LOW];
      let t2 = this.bars[points.t2.HIGH];
      let t4 = this.bars[points.t4.HIGH];

      let t1t3h = Math.abs(t1.y - t3.y);
      let t1t3w = (t1.x + this.getBarWidth() / 2) - (t3.x + this.getBarWidth() / 2);
      let t1t3b = this.width - (t3.x + this.getBarWidth() / 2);

      /*
      let t2t4h = Math.abs(
        (t2.y - t2.low - t2.body - t2.high) -
        (t4.y - t4.low - t4.body - t4.high)
      );
      let t2t4w = Math.abs(
        (t2.x + this.getBarWidth() / 2) -
        (t4.x + this.getBarWidth() / 2)
      );
      let t2t4b = this.width - (t4.x + this.getBarWidth() / 2);
      */

      this.ctx.strokeStyle = "rgb(0, 83, 138)";
      this.ctx.moveTo(
        this.width,
        t3.y + t1t3b * Math.tan(t1t3h/t1t3w) + 0.5
      );
      this.ctx.lineTo(
        0,
        t1.y - this.width * Math.tan(t1t3h/t1t3w) + 0.5
      );
      /*
      this.ctx.moveTo(
        t2.x + this.getBarWidth() / 2,
        t2.y - t2.low - t2.body - t2.high + 0.5
      );
      this.ctx.lineTo(
        t4.x + this.getBarWidth() / 2,
        t4.y - t4.low - t4.body - t4.high + 0.5
      );
      */
      this.ctx.stroke();
    }
  }

  createBar(data, i, index) {
    let bar = {};
    bar.x = this.width - (i - this.sourceIndex) * this.getBarWidth() - this.getBarWidth() - HORIZONTAL_OFFSET;
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
    let minHeight = this.source[this.source.length - 1 - Math.floor(this.sourceIndex)][LOW];

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
    this.ctx.moveTo(HORIZONTAL_OFFSET - 0.5, 0);
    this.ctx.lineTo(HORIZONTAL_OFFSET - 0.5, this.height - 0.5);
    this.ctx.lineTo(this.width - HORIZONTAL_OFFSET - 0.5, this.height - 0.5);
    this.ctx.stroke();
  }

  setSize() {
    // this.canvas.width = this.canvas.parentNode.clientWidth;
    this.canvas.width = 900;
    this.canvas.height = 500;
  }
}

window.addEventListener('load', function() {
  graph = new Graph(document.getElementById('cv'));
});
