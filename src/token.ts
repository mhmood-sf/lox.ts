import { TokenType } from "./token-type";

export type Literal = string | number | null;

export class Token {
    public type: TokenType;
    public lexeme: string;
    public literal: Literal;
    public line: number;

    constructor(type: TokenType, lexeme: string, literal: Literal, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    public toString(): string {
        return `(Type: ${this.type} | Lexeme: ${this.lexeme})`;
    }
}

