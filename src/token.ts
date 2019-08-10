import { TokenType } from "./token-type";

export type TokenLiteral = string | number | boolean | null;

export class Token {
    public type: TokenType;
    public lexeme: string;
    public literal: TokenLiteral;
    public line: number;

    constructor(type: TokenType, lexeme: string, literal: TokenLiteral, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    public toString(): string {
        return `(Type: ${this.type} | Lexeme: ${this.lexeme})`;
    }
}

