function fromatob(a, b) {
  return [b[0] - a[0], b[1] - a[1]];
}
function getnorm(vec) {
  return Math.pow(Math.pow(vec[0], 2) + Math.pow(vec[1], 2), 0.5);
}
function normed(vec) {
  let norm = getnorm(vec);
  return [vec[0] / norm, vec[1] / norm];
}
function addvecs(...vecs) {
  let ret_vec = [0, 0];
  for (let i = 0; i < vecs.length; i++) {
    ret_vec[0] += vecs[i][0];
    ret_vec[1] += vecs[i][1];
  }
  return ret_vec;
}
function stretch(vec, d) {
  return [vec[0] * d, vec[1] * d];
}
function scalarprod(vec1, vec2) {
  return vec1[0] * vec2[0] + vec1[1] * vec2[1]
}
