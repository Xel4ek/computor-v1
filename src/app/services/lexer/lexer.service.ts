import { Injectable } from '@angular/core';
import { Operators, Token, Tokens } from '@services/tokenizer/token';

@Injectable({
  providedIn: 'root',
})
export class LexerService {
  private tokenControl?: Token;
  constructor() {}
  validate(tokens: Token[]): Token[] {
    this.tokenControl = undefined;
    let equalControl = false;
    const result: Token[] = [];
    if (!tokens.length) {
      return result;
    }
    const expansion = this.expansion(tokens);
    for (const token of expansion) {
      if (token.type === Tokens.operator && token.value === Operators.equal) {
        if (equalControl) {
          throw new Error(
            'Syntax error: There can be only one equal sign in an equation'
          );
        }
        equalControl = true;
      }
      this.expectedToken(token);
      result.push(token);
      this.tokenControl = token;
    }
    if (result[result.length - 1].type === Tokens.operator) {
      throw new Error('Syntax error: The unexpected end of the equation');
    }
    if (!equalControl) {
      throw new Error('Syntax error: Equal sign not found');
    }
    return result;
  }
  private expansion(tokens: Token[]): Token[] {
    const result: Token[] = [];
    const cleared = tokens
      .filter(({ type }) => type !== Tokens.space)
      .reverse();
    let previousToken: Token | undefined;

    for (let token = cleared.pop(); token; token = cleared.pop()) {
      if (
        (token.value === Operators.minus || token.value === Operators.plus) &&
        (!previousToken || previousToken.type === Tokens.operator)
      ) {
        const nextToken = cleared.pop();
        if (nextToken && nextToken.type !== Tokens.operator) {
          if (token.value === Operators.minus) {
            if (nextToken.type === Tokens.digit) {
              nextToken.value = -nextToken.value;
            } else if (nextToken.type === Tokens.variable) {
              result.push(
                { type: Tokens.digit, value: -1 },
                { type: Tokens.operator, value: Operators.multiply }
              );
            }
          }
          previousToken = nextToken;
          result.push(nextToken);
        } else {
          throw new Error(
            'Syntax error: Bad operator order "' +
              token.value +
              ' ' +
              nextToken?.value +
              '"'
          );
        }
      } else {
        result.push(token);
        previousToken = token;
      }
    }
    return result;
  }
  private expectedToken(token: Token): void {
    if (this.tokenControl) {
      if (
        this.tokenControl.type === Tokens.operator &&
        token.type !== Tokens.digit &&
        token.type !== Tokens.variable
      ) {
        throw new Error(
          'Syntax error: Only a variable or a number can follow the operator: "' +
            this.tokenControl.value +
            '"'
        );
      }
      if (
        (this.tokenControl.type === Tokens.digit ||
          this.tokenControl.type === Tokens.variable) &&
        token.type !== Tokens.operator
      ) {
        throw new Error(
          'Syntax error: Only an operator can follow a ' +
            this.tokenControl.type +
            ': "' +
            this.tokenControl.value +
            '"'
        );
      }
      if (
        this.tokenControl.type === Tokens.variable &&
        token.type === Tokens.variable
      ) {
        throw new Error(
          'Syntax error: Please respect the entry {number}*X[^{power}], where power: 0, 1 ,2'
        );
      }
    }
  }
}
