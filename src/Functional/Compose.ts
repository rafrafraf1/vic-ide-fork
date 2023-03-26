function compose2<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C {
  return (a: A): C => {
    return fn2(fn1(a));
  };
}

function compose3<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (b: C) => D
): (a: A) => D {
  return (a: A): D => {
    return fn3(fn2(fn1(a)));
  };
}

function compose4<A, B, C, D, E>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (b: C) => D,
  fn4: (b: D) => E
): (a: A) => E {
  return (a: A): E => {
    return fn4(fn3(fn2(fn1(a))));
  };
}

/**
 * Functional Composition of 2 functions.
 */
export function compose<A, B, C>(
  fn1: (a: A) => B,
  fn2: (b: B) => C
): (a: A) => C;
/**
 * Functional Composition of 3 functions.
 */
export function compose<A, B, C, D>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (b: C) => D
): (a: A) => D;
/**
 * Functional Composition of 4 functions.
 */
export function compose<A, B, C, D, E>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (b: C) => D,
  fn4: (b: D) => E
): (a: A) => E;

export function compose<A, B, C, D, E>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3?: (b: C) => D,
  fn4?: (b: D) => E
): unknown {
  if (fn3 !== undefined && fn4 !== undefined) {
    return compose4(fn1, fn2, fn3, fn4);
  } else if (fn3 !== undefined) {
    return compose3(fn1, fn2, fn3);
  } else {
    return compose2(fn1, fn2);
  }
}
