import { TokenType, TokenTypes, Keywords } from "./token-type";
import { Token, TokenLiteral } from "./token";
import { Lox } from "./lox";

export class Scanner {
    private source: string;
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    constructor(source: string) {
        this.source = source;
    }

    public scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenTypes.EOF, "[EOF]", null, this.line));

        return this.tokens;
    }

    private scanToken() {
        const c = this.advance();
        const T = TokenTypes;

        switch (c) {
            // Single char tokens
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

            // Single or double char tokens
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

            // Whitespace
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                break;

            // String literals
            case '"': this.handleString(); break;
            default:
                if (this.isDigit(c)) {
                    this.handleNumber();
                } else if (this.isAlpha(c)) {
                    this.handleIdentifier();
                }
                else {
                    Lox.error(this.line, `Unexpected character: ${c}`);
                }
                break;
        }
    }

    private handleIdentifier() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        const lexeme = this.source.substring(this.start, this.current);

        const type: TokenType = Keywords[lexeme] || TokenTypes.IDENTIFIER;
        this.addToken(type);
    }

    private handleNumber() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        // Check for the '.' fractional part
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            // consume the decimal
            this.advance();

            // continue until the end
            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }

        const val = parseFloat(this.source.substring(this.start, this.current));
        this.addToken(TokenTypes.NUMBER, val);
    }

    private handleString() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            Lox.error(this.line, "Unterminated string!");

        } else {
            // The closing '"'
            this.advance();

            const val = this.source.substring(this.start + 1, this.current - 1);
            this.addToken(TokenTypes.STRING, val);
        }
    }

    private addToken(type: TokenType, literal?: TokenLiteral) {
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

    private peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source[this.current + 1];
    }

    private isDigit(c: string) {
        return /\d/.test(c);
    }

    private isAlpha(c: string) {
        return /[A-Za-z_]/.test(c);
    }

    private isAlphaNumeric(c: string) {
        return this.isAlpha(c) || this.isDigit(c);
    }
}
