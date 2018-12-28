// import { random, randint, randomchoice } from './random.mjs';
// import { fromatob, getnorm, norm, addvecs, stretch, scalarprod } from './vectors.mjs';

function binomialList(n) {
  let from0tonbin = [1];
  let lim = Math.ceil(n / 2);
  let prodn = 1;
  let prodi = 1;
  let tempn = n;
  let tempi = 1;
  while (tempi <= lim) {
    prodn *= tempn;
    prodi *= tempi;
    tempi++; tempn--;
    from0tonbin.push(Math.round(prodn / prodi));
  }
  for (let i = lim + 1; i <= n; i++) {
    from0tonbin.push(from0tonbin[n - i]);
  }
  return from0tonbin;
}
function powList(x, powlim) {
  let ret_list = [];
  let tempx = (x == 0) ? 0 : 1;
  ret_list.push(tempx);
  for (let i = 1; i <= powlim; i++) {
    tempx *= x;
    ret_list.push(tempx);
  }
  return ret_list;
}
// O(points.length * n)
function bezierCurve(points, n, endeps=0) {
  const l = points.length - 1;
  const ret_points = [points[0]];
  const binomials = binomialList(l);
  let step = 1 / n; let t = endeps * step;
  const tlim = 1 - t;
  while (t < tlim) {
    t += step;
    let pows = powList(t, l);
    let powsr = powList(1 - t, l);
    let vec = [0, 0];
    for (let i = 0; i <= l; i++) {
      let mul = binomials[i] * powsr[l-i] * pows[i]
      vec[0] += mul * points[i][0];
      vec[1] += mul * points[i][1];
    }
    ret_points.push(vec);
  }
  ret_points.push(points[l]);
  return ret_points;
}
function pointDistribution(source, n, width, height, margin) {
  startpoints = [source];
  for (let i = 0; i < n - 1; i++) {
    let p1 = randomchoice(
      randint(width - 10 * margin, width - margin),
      randint(margin, 10 * margin));
    let p2 = randomchoice(
      randint(10 * margin, height - margin));
    startpoints.push([p1, p2]);
  }
  startpoints.push(source);
  return startpoints;
}
function redistribute(points, eps) {
  const redistributed = [points[0]];
  let vec, norm, gathered;
  let dist = eps;
  for (let i = 0; i < points.length - 2; i++) {
    vec = fromatob(points[i], points[i + 1]);
    norm = getnorm(vec);
    nvec = stretch(vec, 1 / norm);
    gathered = 0;
    while (true) {
      if (eps > norm + dist) {
        dist += norm;
        break;
      } else {
        norm -= dist;
        gathered += dist;
        redistributed.push(addvecs(points[i], stretch(nvec, gathered)));
        dist = eps;
      }
    }
  }
  return redistributed;
}
function applied(points, n, peps=5) {
  let test_pnt = [randint(points[0][0], points[1][0]),
                  randint(points[0][1], points[1][1])];
  const ret_points = bezierCurve([points[0], test_pnt, points[1]], n, peps);
  let start = ret_points.splice(ret_points.length-1, 1)[0]; let end;
  for (let i = 2; i < points.length - 1; i++) {
    test_pnt = [randint(points[i][0], points[i+1][0]),
                randint(points[i][1], points[i+1][1])];
    let bzp = bezierCurve([points[i], test_pnt, points[i+1]], n, peps);
    end = bzp.splice(0, 1)[0];
    let bzf = bezierCurve([start, points[i], end], 20);
    start = bzp.splice(bzp.length-1, 1)[0];
    ret_points.push.apply(ret_points, bzf);
    ret_points.push.apply(ret_points, bzp);
  }
  return ret_points;
}
