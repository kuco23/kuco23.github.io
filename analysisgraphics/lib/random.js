function random(a, b) {
  return a + Math.random() * (b - a);
}
function randint(a, b) {
  if (a > b) return randint(b, a);
  return Math.round(random(a, b));
}
function randomchoice(...l) {
  return l[randint(0, l.length - 1)];
}
