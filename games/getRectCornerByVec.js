function getRectPos(t1, t2, width1, height1, radius2) {
   const fromT2ToT1Vec = vectorNorm([t1[0] - t2[0], t1[1] - t2[1]]);

   const X2 = t2[0] + fromT2ToT1Vec[0] * radius2;
   const Y2 = t2[1] + fromT2ToT1Vec[1] * radius2;

   const alpha = Math.acos(2 / (2 * getNorm([width1, height1])))
   const phi = Math.acos(fromT2ToT1Vec[0] / getNorm(fromT2ToT1Vec));
   // get border of the rect corner that crosses with fromT2ToT1Vec vector
   let X1 = t1[0] + width1 / 2;
   let Y1 = t1[1] + height1 / 2;
   if (0 <= phi <= alpha || 2 * Math.PI - alpha <= phi <= 2 * Math.PI) {
     Y1 += Math.tan(phi) * width1 / 2;
     X1 += width1 / 2;
   } else if (alpha <= phi <= 2 * Math.PI - alpha) {
     Y1 += height1 / 2;
     X1 += height1 / (2 * Math.tan(phi));
   } else if (Math.PI - alpha <= phi <= Math.PI + alpha) {
     Y1 += -width1 * Math.tan(phi) / 2;
     X1 += -width1 / 2;
   } else if (Math.PI + alpha <= phi <= 2 * Math.PI - alpha) {
     Y1 += -height1 / 2;
     X1 += -height1 / (2 * Math.tan(phi));
   }
   return [X1, Y1];