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
