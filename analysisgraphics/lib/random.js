function random(a, b) {
  return a + Math.random() * (b - a);
}
function randint(a, b) {
  return Math.round(random(a, b));
}
function randomchoice(...l) {
  return l[randint(0, l.length - 1)];
}
