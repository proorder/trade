function prevSize() {
  BAR_MARGIN -= 2;
  BAR_WIDTH -= 2;
  graph.redraw();
}

function nextSize() {
  BAR_MARGIN += 2;
  BAR_WIDTH += 2;
  graph.redraw();
}

function find_diagonal_height(point_1, point_2, DIAGONAL_WIDTH) {
  let h = Math.abs(point_1.y - point_2.y);
  let w = Math.abs(point_1.x - point_2.x);
  let tg = Math.tan(h/w);
  let DIAGONAL_WIDTH_1 = DIAGONAL_WIDTH - point_1.x;
  let result_h_1 = DIAGONAL_WIDTH_1 * tg;
  return {
    point_1: {x: point_1.x, y: point_1.y},
    point_2: {
      x: DIAGONAL_WIDTH,
      y: point_1.y + result_h_1
    }
  }
}
