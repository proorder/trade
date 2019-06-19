let COOKIE = {};
let split_cookie = document.cookie.split(';');
for (let i in split_cookie) {
  let cook = split_cookie[i].trim().split('=');
  COOKIE[cook[0]] = cook[1];
}
const csrftoken = COOKIE['csrftoken'];

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


function post (url, options) {
  const defaults = {
    method: 'POST',
    credentials: 'include',
    headers: new Headers({
      'X-CSRFToken': csrftoken,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(options)
  }
  // const merged = merge(options, defaults)
  return fetch(url, defaults);
}
