import { TokenType } from "./token-type";

// Representing a Lox value in TS code. This is the same as
// the use of `Object` in the java implementation.
export type LoxValue = string | number | boolean | null;

export class Token {
    public type: TokenType;
    public lexeme: string;
    public literal: LoxValue;
    public line: number;

    constructor(type: TokenType, lexeme: string, literal: LoxValue, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    public toString(): string {
        return `(Type: ${this.type} | Lexeme: ${this.lexeme})`;
    }
}

