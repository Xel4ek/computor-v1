import { Injectable } from '@angular/core';
import { Operators, Token, Tokens } from '@services/tokenizer/token';
import { HomeMadeMath } from '@vendor/home-made-math';

@Injectable({
  providedIn: 'root',
})
export class SolverService {
  private polynomial = new Map<number, number>([
    [2, 0],
    [1, 0],
    [0, 0],
  ]);
  private source: Token[] = [];
  private connector?: Token;
  private wasEqual = false;
  private discriminantVale = 0;

  constructor() {}

  private static removeX(
    block: Token[]
  ): { power: number; coefficient: Token } {
    let power = 0;
    let coefficient = 1;
    for (let i = 0; i < block.length; ++i) {
      if (block[i].value === 'x') {
        if (i + 1 < block.length && block[i + 1].value === Operators.exp) {
          const value = block[i + 2].value;
          if (typeof value === 'number') {
            power += value;
          } else {
            throw new Error(
              'Syntax error: Please respect the entry {number}*X[^{power}], where power: 0, 1 ,2'
            );
          }
          i += 2;
        } else {
          power += 1;
        }
      } else if (block[i].type === Tokens.digit) {
        const value = block[i].value;
        if (typeof value === 'number') {
          coefficient *= value;
        }
      } else if (block[i].value === Operators.minus) {
        coefficient *= -1;
      }
    }
    return {
      power,
      coefficient: { type: Tokens.digit, value: coefficient },
    };
  }

  private static getPart(coefficient: number, power: number): string {
    if (coefficient === 0) {
      return '';
    }
    let extend;
    if (power === 1) {
      extend = 'x';
    } else if (power > 1) {
      extend = 'x^' + power;
    } else {
      extend = '';
    }
    let coefficientValue;

    if (coefficient * coefficient === 1) {
      coefficientValue = extend ? '' : '1';
    } else {
      coefficientValue = coefficient.toString().replace('-', '');
    }

    const sing = coefficient < 0 ? '-' : '+';
    return sing + coefficientValue + extend;
  }

  setPolynomial(source: Token[]): void {
    this.source = source.reverse();
    this.polynomial = new Map<number, number>([
      [2, 0],
      [1, 0],
      [0, 0],
    ]);
    this.wasEqual = false;
  }

  discriminant(): string {
    const { '2': a, '1': b, '0': c } = Object.fromEntries(this.polynomial);
    this.discriminantVale =
      (this.polynomial.get(1) ?? 0) * (this.polynomial.get(1) ?? 0) -
      4 * (this.polynomial.get(2) ?? 0) * (this.polynomial.get(0) ?? 0);
    return (
      'D=b^2-4ac=(' +
      b +
      '^2) -4(' +
      a +
      ')(' +
      c +
      ')=' +
      this.discriminantVale
    );
  }

  type(): 'linear' | 'empty' | 'quadratic' {
    const { '2': a, '1': b } = Object.fromEntries(this.polynomial);
    if (a === 0 && b === 0) {
      return 'empty';
    }
    if (a === 0) {
      return 'linear';
    }
    return 'quadratic';
  }

  linear(): string {
    const { '1': b, '0': c } = Object.fromEntries(this.polynomial);
    if (b === 1) {
      return 'x=-c=' + -c;
    }
    return 'x=-c/b=' + -c + '/(' + b + ')=' + -c / b;
  }

  empty(): string {
    const { '2': a, '1': b, '0': c } = Object.fromEntries(this.polynomial);
    if (a === 0 && b === 0 && c === 0) {
      return '\\forall x \\in \\Reals';
    }
    return 'x=\\varnothing';
  }

  solution(): string[] {
    const { '2': a, '1': b } = Object.fromEntries(this.polynomial);
    if (this.discriminantVale === 0) {
      return ['x=-(b/2a)=-(' + b + '/(2\\cdot' + a + ')=' + -b / (2 * a)];
    }
    if (this.discriminantVale > 0) {
      return [
        'x_1=\\cfrac{-  b+\\sqrt{D}}{a\\cdot 2}= \\cfrac{' +
          -b +
          '+\\sqrt{' +
          this.discriminantVale +
          '}}{' +
          a +
          '\\cdot 2}=' +
          (-b + HomeMadeMath.sqrt(this.discriminantVale)) / (2 * a),
        'x_2=\\cfrac{-  b-\\sqrt{D}}{a\\cdot 2}= \\cfrac{' +
          -b +
          '-\\sqrt{' +
          this.discriminantVale +
          '}}{' +
          a +
          '\\cdot 2}=' +
          (-b - HomeMadeMath.sqrt(this.discriminantVale)) / (2 * a),
      ];
    }

    return [
      'x_1=\\cfrac{-  b+\\sqrt{D}}{a\\cdot 2}= \\cfrac{' +
        -b +
        '+\\sqrt{' +
        this.discriminantVale +
        '}}{' +
        a +
        '\\cdot 2}=' +
        -b / (2 * a) +
        '+' +
        HomeMadeMath.sqrt(-this.discriminantVale) / (2 * a) +
        'i',
      'x_2=\\cfrac{-  b-\\sqrt{D}}{a\\cdot 2}= \\cfrac{' +
        -b +
        '-\\sqrt{' +
        this.discriminantVale +
        '}}{' +
        a +
        '\\cdot 2}=' +
        -b / (2 * a) +
        '-' +
        HomeMadeMath.sqrt(-this.discriminantVale) / (2 * a) +
        'i',
    ];
  }

  simplifier(): { [key: string]: number } {
    for (let block = this.getBlock(); block.length; block = this.getBlock()) {
      const { power, coefficient: cleared } = SolverService.removeX(block);
      if (block[0] && block[0].value === Operators.equal) {
        // cleared.value = -cleared.value;
        this.wasEqual = true;
      }
      if (this.wasEqual) {
        cleared.value = -cleared.value;
      }
      this.polynomial.set(
        power,
        (this.polynomial.get(power) ?? 0) + +cleared.value
      );
    }
    if (
      [...this.polynomial].filter(
        ([key, value]) => (key > 2 || key < 0) && value
      ).length
    ) {
      throw new Error('Error: Only power between 0 && 2 supported');
    }
    return Object.fromEntries(this.polynomial);
  }

  simplified(): string {
    let result = '';
    this.polynomial.forEach((value, key) => {
      result += SolverService.getPart(value, key);
    });
    if (result.startsWith('+')) {
      result = result.slice(1);
    }
    if (!result) {
      result = '0';
    }
    return (result += '=0');
  }

  private getBlock(): Token[] {
    let result: Token[] = [];
    let token = this.source.pop();
    for (
      ;
      token &&
      token.value !== Operators.minus &&
      token.value !== Operators.plus &&
      token.value !== Operators.equal;
      token = this.source.pop()
    ) {
      result.push(token);
    }
    if (this.connector) {
      result = [this.connector, ...result];
      this.connector = undefined;
    }
    if (token) {
      this.connector = token;
    }

    return result;
  }
}
