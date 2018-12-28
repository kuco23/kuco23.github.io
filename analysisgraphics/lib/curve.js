// import { random, randint, randomchoice } from './random.mjs';
// import { fromatob, getnorm, norm, addvecs, stretch, scalarprod } from './vectors.mjs';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Curve(context, x0, y0, n_points,
point_margin=5, pic_margin=10, linewidth=1.5, linecolor='lime') {
  this.context = context;
  this.width = context.canvas.width;
  this.height = context.canvas.height;
  this.source = [x0, y0];
  this.anglesource = null;
  this.point_margin = point_margin;
  this.pic_margin = pic_margin;
  this.linewidth = linewidth;
  this.linecolor = linecolor;

  function drawLine(context, a, b, width, color) {
    context.lineJoin = 'round';
    context.lineWidth = width;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(...a);
    context.lineTo(...b);
    context.stroke();
  }
  function drawDot(context, x, y, r, color='red', angle=2*Math.PI) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, angle);
    context.fill();
  }
  function drawText(context, x, y, text, color) {
    context.fillStyle = color;
    context.clearRect(x - 100, y - 10, 300, 20);
    context.fillText(text, x, y);
  }
  this.drawanglesource = function(x, y) {
    this.anglesource = [x, y];
    drawDot(this.context, ...this.anglesource, 3, 'red');
  };
  this.animateAngle = async function() {
    let phisum = 0;
    for (let i = 0; i < this.allpoints.length - 1; i++) {
      let a = normed(fromatob(this.anglesource, this.allpoints[i]));
      let b = normed(fromatob(this.anglesource, this.allpoints[i + 1]));
      let c = normed(fromatob(this.allpoints[i], this.allpoints[i + 1]));
      let phi = Math.acos(scalarprod(a, b));
      let normal = [a[1], -a[0]];
      if (Math.acos(scalarprod(normal, c)) <  Math.PI / 2) phi = -phi;
      if (isNaN(phi)) continue;
      phisum += phi;
      drawLine(this.context, this.allpoints[i], this.allpoints[i + 1],
      this.linewidth, 'red');
      drawLine(this.context, this.anglesource, this.allpoints[i],
      this.linewidth, 'rgba(140, 140, 140, .02)');
      drawText(this.context, this.width / 2, this.height - 20,
      '' + phisum / (2*Math.PI), 'red');
      await sleep(10);
    }
  };
  this.draw = function() {
    for (let i = 0; i < this.allpoints.length - 1; i++) {
      drawLine(this.context, this.allpoints[i], this.allpoints[i+1],
      this.linewidth, this.linecolor);
    }
  };
  this.delete = function() {
    this.context.clearRect(0, 0, this.width, this.height);
  };
}
