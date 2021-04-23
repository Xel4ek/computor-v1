export enum Operators {
  exp = '^',
  plus = '+',
  minus = '-',
  equal = '=',
  multiply = '*',
}
export enum Tokens {
  operator = 'operator',
  variable = 'variable',
  digit = 'digit',
  space = ' ',
}
export interface Token {
  type: Tokens;
  value: number | Operators | string;
}
