export class HomeMadeMath {
  static sqrt(x: number): number {
    if (x < 0) {
      return NaN;
    }
    if (x === 0) {
      return 0;
    }
    let root = 1;
    const eps = 1e-8;
    for (; HomeMadeMath.abs(root * root - x) > eps; ) {
      root = (root + x / root) / 2;
      const int = HomeMadeMath.trunc(root.toString());
      if (int * int === x) {
        root = int;
      }
    }
    return root;
  }

  static abs(x: number): number {
    if (x < 0) {
      return -x;
    }
    return x;
  }

  static trunc(x: string): number {
    return +x.split('.')[0];
  }
}
