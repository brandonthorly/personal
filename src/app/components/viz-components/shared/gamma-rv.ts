// From Python source, so I guess it's PSF Licensed
const SG_MAGICCONST = 1 + Math.log(4.5);
const LOG4 = Math.log(4.0);


export function gammaRV(shape: number, scale: number): number {
    // does not check that alpha > 0 && beta > 0
  let x;

  if (shape > 1) {
    // Uses R.C.H. Cheng, "The generation of Gamma variables with non-integral
    // shape parameters", Applied Statistics, (1977), 26, No. 1, p71-74
    const ainv = Math.sqrt(2.0 * shape - 1.0);
    const bbb = shape - LOG4;
    const ccc = shape + ainv;

    while (true) {
      const u1 = Math.random();
      if (!((1e-7 < u1) && (u1 < 0.9999999))) {
        continue;
      }
      const u2 = 1.0 - Math.random();
      const v = Math.log(u1 / (1.0 - u1)) / ainv;
      x = shape * Math.exp(v);
      const z = u1 * u1 * u2;
      const r = bbb + ccc * v - x;
      if (r + SG_MAGICCONST - 4.5 * z >= 0.0 || r >= Math.log(z)) {
        return x * scale;
      }
    }
  } else if (shape === 1.0) {
    let u = Math.random();

    while (u <= 1e-7) {
      u = Math.random();
    }

    return -Math.log(u) * scale;
  } else { // 0 < alpha < 1
    // Uses ALGORITHM GS of Statistical Computing - Kennedy & Gentle
    while (true) {
      const u3 = Math.random();
      const b = (Math.E + shape) / Math.E;
      const p = b * u3;

      if (p <= 1.0) {
        x = Math.pow(p, (1.0 / shape));
      }
      else {
        x = -Math.log((b - p) / shape);
      }

      const u4 = Math.random();
      if (p > 1.0) {
        if (u4 <= Math.pow(x, (shape - 1.0))) {
          break;
        }
      } else if (u4 <= Math.exp(-x)) {
        break;
      }
    }

    return x * scale;
  }
}
