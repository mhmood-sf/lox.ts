import { Token } from './token';
import { Stmt, Print, Expression, Var, Block, If, While, Func } from './stmt';
import { TokenTypes as T, TokenType } from './token-type';
import { Expr, Binary, Unary, Literal, Grouping, Variable, Assign, Logical, Call } from './expr';
import { Lox } from './lox';

export class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse() {
        try {
            const statements: Stmt[] = [];

            while (!this.isAtEnd()) {
                statements.push(this.declaration());
            }
            return statements;

        } catch (err) {
            return null;
        }
    }

    private statement(): Stmt {
        if (this.match(T.PRINT)) return this.printStatement();
        if (this.match(T.WHILE)) return this.whileStatement();
        if (this.match(T.LEFT_BRACE)) return new Block(this.block());
        if (this.match(T.IF)) return this.ifStatement();
        if (this.match(T.FOR)) return this.forStatement();

        return this.expressionStatement();
    }

    private forStatement() {
        this.consume(T.LEFT_PAREN, "Expect '(' after 'for'.");

        let initializer: Stmt | null = null;
        if (this.match(T.SEMICOLON)) {
            initializer = null;
        } else if (this.match(T.VAR)) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expressionStatement();
        }

        let condition: Expr | null = null;
        if (!this.check(T.SEMICOLON)) {
            condition = this.expression();
        }
        this.consume(T.SEMICOLON, "Expect ';' after loop condition.");

        // The last clause, doesn't need to be an increment but that's what's in the book :/
        let increment: Expr | null = null;
        if (!this.check(T.RIGHT_PAREN)) {
            increment = this.expression();
        }

        this.consume(T.RIGHT_PAREN, "Expect ')' after for clauses.");

        let body = this.statement();
        if (increment != null) {
            body = new Block([body, new Expression(increment)]);
        }

        if (condition == null) condition = new Literal(true);
        body = new While(condition, body);

        if (initializer != null) {
            body = new Block([initializer, body]);
        }

        return body;
    }

    private ifStatement() {
        this.consume(T.LEFT_PAREN, "Expect '(' after 'if'.");
        const condition = this.expression();
        this.consume(T.RIGHT_PAREN, "Expect ')' after 'if' condition.");

        const thenBranch = this.statement();
        let elseBranch: Stmt | null = null;
        if (this.match(T.ELSE)) {
            elseBranch = this.statement();
        }

        return new If(condition, thenBranch, elseBranch);
    }

    private printStatement() {
        const value = this.expression();
        this.consume(T.SEMICOLON, "Expect ';' after expression.");
        return new Print(value);
    }

    private varDeclaration() {
        const name = this.consume(T.IDENTIFIER, "Expect variable name.");

        let initializer: Expr | null = null;
        if (this.match(T.EQUAL)) {
            initializer = this.expression();
        }

        this.consume(T.SEMICOLON, "Expect ';' after variable declaration.");
        return new Var(name, initializer);
    }

    private whileStatement() {
        this.consume(T.LEFT_PAREN, "Expect '(' after 'while'.");
        const condition = this.expression();
        this.consume(T.RIGHT_PAREN, "Expect ')' after condition.");
        const body = this.statement();

        return new While(condition, body);
    }

    private expressionStatement() {
        const expr = this.expression();
        this.consume(T.SEMICOLON, "Expect ';' after expression.");
        return new Expression(expr);
    }

    private function(kind: string) {
        const name = this.consume(T.IDENTIFIER, `Expect ${kind} name.`);

        this.consume(T.LEFT_PAREN, `Expect '(' after ${kind} name.`);
        const parameters = [];

        if (!this.check(T.RIGHT_PAREN)) {
            do {
                if (parameters.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 parameters.");
                }

                parameters.push(this.consume(T.IDENTIFIER, "Expect parameter name."));
            } while (this.match(T.COMMA));
        }

        this.consume(T.RIGHT_PAREN, "Expect ')' after parameters.");
        this.consume(T.LEFT_BRACE, `Expect '{' before ${kind} body.`);

        const body = this.block();
        return new Func(name, parameters, body);
    }

    private block() {
        const statements: Stmt[] = [];

        while (!this.check(T.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }

        this.consume(T.RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    }

    private assignment(): Expr {
        const expr = this.or();

        if (this.match(T.EQUAL)) {
            const equals = this.previous();
            const value = this.assignment();

            if (expr instanceof Variable) {
                const name = expr.name;
                return new Assign(name, value);
            }

            this.error(equals, "Invalid assignment target.");
        }

        return expr;
    }

    private or() {
        let expr = this.and();

        while (this.match(T.OR)) {
            const operator = this.previous();
            const right = this.and();
            expr = new Logical(expr, operator, right);
        }

        return expr;
    }

    private and() {
        let expr = this.equality();

        while (this.match(T.AND)) {
            const operator = this.previous();
            const right = this.equality();
            expr = new Logical(expr, operator, right);
        }

        return expr;
    }

    private expression() {
        return this.assignment();
    }

    private declaration() {
        try {
            if (this.match(T.FUN)) return this.function("function");
            if (this.match(T.VAR)) return this.varDeclaration();

            return this.statement();
        } catch (err) {
            this.synchronize();
            // Stmt[] does not accept null.
            return new Expression(new Literal(null));
        }
    }

    private equality() {
        let expr = this.comparison();

        while (this.match(T.BANG_EQUAL, T.EQUAL_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private comparison() {
        let expr = this.addition();

        while (this.match(T.GREATER, T.GREATER_EQUAL, T.LESS, T.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.addition();
            expr = new Binary(expr, operator, right)
        }

        return expr;
    }

    private addition() {
        let expr = this.multiplication();

        while (this.match(T.MINUS, T.PLUS)) {
            const operator = this.previous();
            const right = this.multiplication();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private multiplication() {
        let expr = this.unary();

        while (this.match(T.SLASH, T.STAR)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    private unary(): Expr {
        if (this.match(T.BANG, T.MINUS)) {
            const operator = this.previous();
            const right = this.unary();
            return new Unary(operator, right);
        }

        return this.call();
    }

    private call() {
        let expr: Expr = this.primary();

        while (true) {
            if (this.match(T.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            } else {
                break;
            }
        }

        return expr;
    }

    private finishCall(callee: Expr) {
        const args = [];

        if (!this.check(T.RIGHT_PAREN)) {
            do {
                if (args.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 arguments.");
                }
                args.push(this.expression());
            } while (this.match(T.COMMA));
        }

        const paren = this.consume(T.RIGHT_PAREN, "Expect ')' after arguments.");

        return new Call(callee, paren, args);
    }

    private primary() {
        if (this.match(T.FALSE)) return new Literal(false);
        if (this.match(T.TRUE)) return new Literal(true);
        if (this.match(T.NIL)) return new Literal(null);

        if (this.match(T.NUMBER, T.STRING)) {
            return new Literal(this.previous().literal);
        }

        if (this.match(T.IDENTIFIER)) {
            return new Variable(this.previous());
        }

        if (this.match(T.LEFT_PAREN)) {
            const expr = this.expression();
            this.consume(T.RIGHT_PAREN, "Expect ')' after expression!");
            return new Grouping(expr);
        }

        throw this.error(this.peek(), "Expect expression!");
    }

    private consume(type: TokenType, message: string) {
        if (this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }

    private match(...types: TokenType[]) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private check(type: TokenType) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd() {
        return this.peek().type === T.EOF;
    }

    private peek() {
        return this.tokens[this.current];
    }

    private previous() {
        return this.tokens[this.current - 1];
    }

    private error(token: Token, message: string) {
        Lox.error(token, message);
        return new Error();
    }

    private synchronize() {
        this.advance();

        while (!this.isAtEnd()) {
            if (this.previous().type === T.SEMICOLON) return;

            switch (this.peek().type) {
                case T.CLASS:
                case T.FUN:
                case T.VAR:
                case T.FOR:
                case T.IF:
                case T.WHILE:
                case T.PRINT:
                case T.RETURN:
                    return;
            }

            this.advance();
        }
    }
}
