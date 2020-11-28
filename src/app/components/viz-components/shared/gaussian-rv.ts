export function gaussianRV(mean: number, stdev: number): number {
  let y1;
  let x1;
  let x2;
  let w;

  do {
    x1 = 2.0 * Math.random() - 1.0;
    x2 = 2.0 * Math.random() - 1.0;
    w  = x1 * x1 + x2 * x2;
  } while (w >= 1.0);

  w = Math.sqrt((-2.0 * Math.log(w)) / w);
  y1 = x1 * w;

  const draw = mean + stdev * y1;

  if (draw > 0) {
   return draw;
  }

  return -draw;
}
