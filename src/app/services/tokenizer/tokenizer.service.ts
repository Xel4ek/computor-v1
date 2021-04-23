import { Injectable } from '@angular/core';
import { Operators, Token, Tokens } from '@services/tokenizer/token';

@Injectable({
  providedIn: 'root',
})
export class TokenizerService {
  source?: string;
  constructor() {}

  private static getDigit(source: string): number {
    const digit = parseFloat(source);
    return digit ? digit : 0;
  }

  private static isSpace(source: string): boolean {
    return /\s/.test(source);
  }

  private static isOperator(source: string): boolean {
    return /[+\-=^*]/.test(source);
  }

  private static isVariable(source: string): boolean {
    return /x/.test(source);
  }

  private static isDigit(source: string): boolean {
    return /[\d.]/.test(source);
  }

  private static getOperator(source: string): Operators {
    if (source === '+') {
      return Operators.plus;
    }
    if (source === '-') {
      return Operators.minus;
    }
    if (source === '*') {
      return Operators.multiply;
    }
    if (source === '^') {
      return Operators.exp;
    }
    if (source === '=') {
      return Operators.equal;
    }
    throw new Error('Unknown operator ' + source);
  }

  private static getToken(source: string): Token {
    if (TokenizerService.isOperator(source)) {
      return {
        type: Tokens.operator,
        value: TokenizerService.getOperator(source),
      };
    }
    if (TokenizerService.isVariable(source)) {
      return {
        type: Tokens.variable,
        value: source,
      };
    }
    if (TokenizerService.isDigit(source)) {
      return {
        type: Tokens.digit,
        value: source,
      };
    }
    if (TokenizerService.isSpace(source)) {
      return {
        type: Tokens.space,
        value: source,
      };
    }
    throw new Error(
      'Syntax error: Unsupported character found: "' + source + '"'
    );
  }

  tokenize(source?: string): Token[] {
    this.source = source;
    if (!source) {
      return [];
    }
    const cut = source.trim().split('');
    const result: Token[] = [];
    let digitBuffer = '';
    let wasDot = false;
    for (const letter of cut) {
      const token = TokenizerService.getToken(letter.toLowerCase());
      if (token.type === Tokens.digit) {
        digitBuffer += token.value;
        if (token.value === '.') {
          if (wasDot) {
            throw new Error(
              'Syntax error: Number cannot contain more than one separator character'
            );
          }
          wasDot = true;
        }
      } else {
        wasDot = false;
        if (digitBuffer) {
          result.push({
            type: Tokens.digit,
            value: TokenizerService.getDigit(digitBuffer),
          });
          digitBuffer = '';
        }
        if (token.type !== Tokens.space) {
          result.push(token);
        }
      }
    }
    if (digitBuffer) {
      result.push({
        type: Tokens.digit,
        value: TokenizerService.getDigit(digitBuffer),
      });
    }
    return result;
  }
}
