/** A complex-valued array stored as two parallel real/imaginary buffers,
 * rather than an array of `{re, im}` objects — keeps the FFT's inner loops
 * free of per-sample allocation. */
export type ComplexArray = {
  re: Float64Array;
  im: Float64Array;
};

export function createComplex(length: number): ComplexArray {
  return { re: new Float64Array(length), im: new Float64Array(length) };
}

export function fromReal(real: Float64Array | Float32Array): ComplexArray {
  const out = createComplex(real.length);
  out.re.set(real);
  return out;
}

export function magnitude(c: ComplexArray): Float64Array {
  const out = new Float64Array(c.re.length);
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.hypot(c.re[i], c.im[i]);
  }
  return out;
}
