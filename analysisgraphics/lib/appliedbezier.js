function bezierCurve(a, b, cpnt, eps, points=100) {
  const return_points = [];
  let veca = fromatob(a, cpnt);
  let vecb = fromatob(cpnt, b)
  let veca_step = stretch(veca, 1 / points);
  let vecb_step = stretch(vecb, 1 / points);
  let t = 0; let stept = 1 / points;
  for (let i = 0; i < points+1; i++) {
    let path = stretch(fromatob(a, cpnt), t);
    let pnt = [a[0] + path[0], a[1] + path[1]];
    a = [a[0] + veca_step[0], a[1] + veca_step[1]];
    cpnt = [cpnt[0] + vecb_step[0], cpnt[1] + vecb_step[1]];
    t += stept;
    return_points.push(pnt);
    if (getnorm(fromatob(cpnt, b)) < eps) {
      return return_points;
    }
  }
  return return_points;
}
// two point bezier stopping in eps around point and using that point
// as a control point for bezier between the cut off points
function bezierApplied(points) {
  let newpoints = [];
  let eps = 5;
  for (let i = 1; i < points.length-1; i++) {
    let vec = fromatob(points[i - 1], points[i]);
    let normed = normed(vec);
    let normal = [normed[1], -normed[0]];
    let controlpoint = addvecs(points[i-1], stretch(vec, 0.5), stretch(normal, eps));
    let cutpoint = addvecs(points[i], stretch(vec, -eps));
  }
}
