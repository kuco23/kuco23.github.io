function getNorm(vec) {
  return Math.pow(Math.pow(vec[0], 2) + Math.pow(vec[1], 2), 0.5);
}

function vectorNorm(vec) {
  let norm = getNorm(vec);
  if (norm != 0) return [vec[0] / norm, vec[1] / norm];
  else return vec;
}

// t1 has to be the point of higher left rect and t2 the center of a circle
function checkCollision(t1, t2, width1, height1, radius2) {
  const centerX = t1[0] + width1 / 2;
  const centerY = t1[1] + height1 / 2;
  const fromT2ToT1Vec = [centerX - t2[0], centerY - t2[1]];
  const fromT1ToT2Vec = [-fromT2ToT1Vec[0], -fromT2ToT1Vec[1]];
  const norm = getNorm(fromT2ToT1Vec);

  if (norm > getNorm([width1, height1]) / 2 + radius2) return false;
  if (norm <= Math.min(width1, height1) / 2 + radius2) return true; // fromT2ToT1Vec cannot be [0, 0] from now on

  const fromT2ToT1VecNormed = [fromT2ToT1Vec[0] / norm, fromT2ToT1Vec[1] / norm];
  const fromT1ToT2VecNormed = [fromT1ToT2Vec[0] / norm, fromT1ToT2Vec[1] / norm];

  // (X2, Y2) will be the point where the vector fromT2ToT1 intersects with the circle outline
  const X2 = t2[0] + fromT2ToT1VecNormed[0] * radius2;
  const Y2 = t2[1] + fromT2ToT1VecNormed[1] * radius2;

  // (X1, Y1) will be the intersection of vector fromT1ToT2Vec with the rect side
  let alpha = null;
  if (fromT1ToT2VecNormed[0] == 0) {
    alpha = (fromT1ToT2VecNormed[1] > 0) ? Math.PI / 2 : 3 / 2 * Math.PI;
  } else if (fromT1ToT2VecNormed[1] == 0) {
    alpha = (fromT1ToT2VecNormed[0] > 0) ? 0 :  Math.PI;
  } else if (fromT1ToT2VecNormed[1] > 0) { // get alpha from (0, pi)
    alpha = Math.acos(-fromT1ToT2VecNormed[0]) + Math.PI;
  } else if (fromT1ToT2VecNormed[1] < 0) { // get alpha from (pi, 2 * pi)
    alpha = Math.acos(fromT1ToT2VecNormed[0]);
  }
  // this is sourced from cos(angle) = kateta1 / hypothenuse, where c = hypothenuse and a = kateta1
  const getLength = function(a, angle) {
    let c = a / Math.cos(angle);
    return Math.pow(Math.pow(c, 2) - Math.pow(a, 2), 0.5)
  };
  const phi = Math.acos(width1 / getNorm([width1, height1]));
  let X1 = centerX;
  let Y1 = centerY;
  if (2 * Math.PI - phi <= alpha && alpha <= 2 * Math.PI || 0 <= alpha && alpha <= phi) {
    let angle = (fromT1ToT2VecNormed[1] < 0) ? alpha : -(alpha - 2 * Math.PI);
    let length = (width1 / 2) / Math.cos(angle);
    X1 += fromT1ToT2VecNormed[0] * length;
    Y1 += fromT1ToT2VecNormed[1] * length;
  } else if (phi <= alpha && alpha <= Math.PI - phi) {
    let angle = (fromT1ToT2VecNormed[0] > 0) ? Math.PI / 2 - alpha : alpha - Math.PI / 2;
    let length = (height1 / 2) / Math.cos(angle);
    X1 += fromT1ToT2VecNormed[0] * length;
    Y1 += fromT1ToT2VecNormed[1] * length;
  } else if (Math.PI - phi <= alpha && alpha <= Math.PI + phi) {
    let angle = (fromT1ToT2VecNormed[1] < 0) ? Math.PI - alpha : alpha - Math.PI;
    let length = (width1 / 2) / Math.cos(angle);
    X1 += fromT1ToT2VecNormed[0] * length;
    Y1 += fromT1ToT2VecNormed[1] * length;
  } else if (Math.PI + phi <= alpha && alpha <= 2 * Math.PI - phi) {
    let angle = (fromT1ToT2VecNormed[0] < 0) ? 3 / 2 * Math.PI - alpha : alpha - 3 / 2 * Math.PI;
    let length = (height1 / 2) / Math.cos(angle);
    X1 += fromT1ToT2VecNormed[0] * length;
    Y1 += fromT1ToT2VecNormed[1] * length;
  }
  // checks if (X1, Y1) in the circle or (X2, Y2) in the rect or (centerX, centerY) in circle or (t2[0], t2[1]) in rect
  return (X1 >= t2[0] - radius2 && X1 <= t2[0] + radius2 && Y1 >= t2[1] - radius2 && Y1 <= t2[1] + radius2 ||
    X2 >= t1[0] && X2 <= t1[0] + width1 && Y2 >= t1[1] && Y2 <= t1[1] + height1 ||
    centerX >= t2[0] - radius2 && centerX <= t2[0] + radius2 && centerY >= t2[1] - radius2 && centerY <= t2[1] + radius2 ||
    t2[0] >= t1[0] && t2[0] <= t1[0] + width1 && t2[1] >= t1[1] && t2[1] <= t1[1] + height1);
}
