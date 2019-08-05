import { TokenType } from "./token-type";
import { Token, Literal } from "./token";
import { Lox } from "./index";

export class Scanner {
    private source: string;
    private tokens: Token[];
    private start: number;
    private current: number;
    private line: number;

    constructor(source: string) {
        this.source = source;
        this.tokens = [];

        this.start = 0;
        this.current = 0;
        this.line = 1;
    }

    public scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));

        return this.tokens;
    }

    private scanToken() {
        const c = this.advance();
        const T = TokenType;

        switch (c) {
            case '(': this.addToken(T.LEFT_PAREN); break;
            case ')': this.addToken(T.RIGHT_PAREN); break;
            case '{': this.addToken(T.LEFT_BRACE); break;
            case '}': this.addToken(T.RIGHT_BRACE); break;
            case ',': this.addToken(T.COMMA); break;
            case '.': this.addToken(T.DOT); break;
            case '-': this.addToken(T.MINUS); break;
            case '+': this.addToken(T.PLUS); break;
            case ';': this.addToken(T.SEMICOLON); break;
            case '*': this.addToken(T.STAR); break;
            case '!':
                this.addToken(this.match('=') ? T.BANG_EQUAL : T.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? T.EQUAL_EQUAL : T.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? T.LESS_EQUAL : T.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? T.GREATER_EQUAL : T.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    while (this.peek() != '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                } else {
                    this.addToken(T.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                break;
            default:
                Lox.error(this.line, "Unexpected character!");
                break;
        }
    }

    private addToken(type: TokenType, literal?: Literal) {
        literal = literal === undefined ? null : literal;
        const lexeme = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, lexeme, literal, this.line));
    }

    private advance() {
        this.current++;
        return this.source[this.current - 1];
    }

    private isAtEnd() {
        return this.current >= this.source.length;
    }

    private match(expected: string) {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] !== expected) return false;

        this.current++;
        return true;
    }

    private peek() {
        if (this.isAtEnd()) return '\0';
        return this.source[this.current];
    }
}
