import { TokenType } from "./token-type.ts";
import { LoxCallable } from "./lox-callable.ts";
import { LoxInstance } from "./lox-instance.ts";

// Representing a Lox value in TS code. This is the same as
// the use of `Object` in the java implementation.
// Started out as just primitive types but I ended up
// adding LoxCallable/LoxInstance because I didn't know what
// else to do...
export type LoxLiteral =
  | string
  | number
  | boolean
  | null
  | LoxCallable
  | LoxInstance;

export class Token {
  public type: TokenType;
  public lexeme: string;
  public literal: LoxLiteral;
  public line: number;

  constructor(
    type: TokenType,
    lexeme: string,
    literal: LoxLiteral,
    line: number,
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  public toString(): string {
    return `(Type: ${this.type} | Lexeme: ${this.lexeme})`;
  }
}
