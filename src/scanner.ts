import { TokenType, Keywords } from "./token-type";
import { Token, LoxLiteral } from "./token";
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

        this.tokens.push(new Token('EOF', "[EOF]", null, this.line));

        return this.tokens;
    }

    private scanToken() {
        const c = this.advance();

        switch (c) {
            // Single char tokens
            case '(': this.addToken('LEFT_PAREN'); break;
            case ')': this.addToken('RIGHT_PAREN'); break;
            case '{': this.addToken('LEFT_BRACE'); break;
            case '}': this.addToken('RIGHT_BRACE'); break;
            case ',': this.addToken('COMMA'); break;
            case '.': this.addToken('DOT'); break;
            case '-': this.addToken('MINUS'); break;
            case '+': this.addToken('PLUS'); break;
            case ';': this.addToken('SEMICOLON'); break;
            case '*': this.addToken('STAR'); break;

            // Single or double char tokens
            case '!':
                this.addToken(this.match('=') ? 'BANG_EQUAL' : 'BANG');
                break;
            case '=':
                this.addToken(this.match('=') ? 'EQUAL_EQUAL' : 'EQUAL');
                break;
            case '<':
                this.addToken(this.match('=') ? 'LESS_EQUAL' : 'LESS');
                break;
            case '>':
                this.addToken(this.match('=') ? 'GREATER_EQUAL' : 'GREATER');
                break;
            case '/':
                if (this.match('/')) {
                    while (this.peek() != '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                } else {
                    this.addToken('SLASH');
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

        const type: TokenType = Keywords[lexeme] || 'IDENTIFIER';
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
        this.addToken('NUMBER', val);
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
            this.addToken('STRING', val);
        }
    }

    private addToken(type: TokenType, literal?: LoxLiteral) {
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
