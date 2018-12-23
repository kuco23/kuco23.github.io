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
  if (x == 0) {
    for (let i = 0; i <= powlim; i++) {
      ret_list.push(0);
    }
  } else {
    let tempx = 1;
    ret_list.push(1);
    for (let i = 1; i <= powlim; i++) {
      tempx *= x;
      ret_list.push(tempx);
    }
  }
  return ret_list;
}
// O(points.length * n)
function bezierCurve(points, n=100) {
  const l = points.length;
  const ret_points = [points[0]];
  const binomials = binomialList(l);
  let t = 0; let step = 1 / n;
  const tlim = 1 - 2 * step;
  let tprod = 1;
  let tprodr = 1;
  while (t < tlim) {
    t += step;
    let pows = powList(t, l);
    let powsr = powList(1 - t, l);
    let vec = [0, 0];
    for (let i = 0; i < l; i++) {
      let mul = binomials[i] * powsr[l-i] * pows[i]
      vec[0] += mul * points[i][0];
      vec[1] += mul * points[i][1];
    }
    ret_points.push(vec);
  }
  ret_points.push(points[l-1]);
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
function redistribute(points, dist, eps) {
  const redistributed = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    let connected = fromatob(points[i], points[i+1]);
    let connorm = getnorm(connected);
    if (connorm > dist + eps) {
      let pointstofill = Math.ceil(connorm / dist);
      let step = 1 / pointstofill;
      let t = 0;
      while (t < 1) {
        t += step;
        let point = addvecs(points[i], stretch(connected, t));
        redistributed.push(point);
      }
    } else if (connorm < dist - eps) {
      redistributed.push(points[i + 1]); // later
    } else {
      redistributed.push(points[i + 1]);
    }
  }
  return redistributed;
}
