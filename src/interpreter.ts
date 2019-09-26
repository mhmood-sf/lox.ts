import { Visitor as ExprVisitor, Literal, Grouping, Expr, Unary, Binary, Variable, Assign, Logical, Call } from './expr';
import { Visitor as StmtVisitor, Expression, Print, Stmt, Var, Block, If, While } from './stmt';
import { LoxLiteral, Token } from './token';
import { TokenTypes as T } from './token-type';
import { RuntimeError } from './runtime-error';
import { Environment } from './environment';
import { Lox } from './lox';
import { LoxCallable } from './lox-callable';

function isLoxCallable(callee: any): callee is LoxCallable {
    return callee.call &&
    (typeof callee.call === 'function') &&
    callee.arity &&
    (typeof callee.arity === 'function');
}

export class Interpreter implements ExprVisitor<LoxLiteral>, StmtVisitor<void> {
    private environment: Environment = new Environment();

    public interpret(statements: Stmt[]) {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        } catch (err) {
            Lox.runtimeError(err);
        }
    }

    public visitLiteralExpr(expr: Literal) {
        return expr.value;
    }

    public visitLogicalExpr(expr: Logical) {
        const left = this.evaluate(expr.left);

        if (expr.operator.type === T.OR) {
            if (this.isTruthy(left)) return left;
        } else {
            if (!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
    }

    public visitGroupingExpr(expr: Grouping) {
        return this.evaluate(expr.expression);
    }

    public visitUnaryExpr(expr: Unary) {
        const rightRaw = this.evaluate(expr.right);
        const rightStr = rightRaw !== null ? rightRaw.toString() : "null";

        switch (expr.operator.type) {
            case T.MINUS:
                this.checkNumberOperands(expr.operator, rightRaw);
                return -(parseFloat(rightStr));
            case T.BANG:
                return !(this.isTruthy(rightRaw));
        }

        return null;
    }

    public visitVariableExpr(expr: Variable) {
        return this.environment.get(expr.name);
    }

    public visitBinaryExpr(expr: Binary) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case T.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return left! > right!;
            case T.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left! >= right!;
            case T.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return left! < right!;
            case T.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left! <= right!;
            case T.BANG_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return !this.isEqual(left, right);
            case T.EQUAL_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return this.isEqual(left, right)
            case T.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as any) - (right as any);
            case T.PLUS:
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }

                if (typeof left === 'string' && typeof right === 'string') {
                    return left + right;
                }

                throw new RuntimeError(expr.operator, "Operands must be strings or numbers");
            case T.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as any) / (right as any);
            case T.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return (left as any) * (right as any);
        }

        return null;
    }

    public visitCallExpr(expr: Call) {
        const callee = this.evaluate(expr.callee);

        const args = [];
        for (const arg of expr.args) {
            args.push(this.evaluate(arg));
        }

        if (!isLoxCallable(callee)) {
            throw new RuntimeError(expr.paren, "Can only call functions and classes.");
        }

        const fn = callee;
        if (args.length != fn.arity()) {
            throw new RuntimeError(expr.paren, `Expected ${fn.arity()} arguments but got ${args.length}.`);
        }

        return fn.call(this, args);
    }

    private checkNumberOperands(operator: Token, ...operands: LoxLiteral[]) {
        for (const operand of operands) {
            if (typeof operand !== 'number') {
                throw new RuntimeError(operator, "Operands must be numbers!");
            }
        }
    }

    private evaluate(expr: Expr): LoxLiteral {
        return expr.accept<LoxLiteral>(this);
    }

    private execute(stmt: Stmt) {
        stmt.accept(this);
    }

    private executeBlock(statements: Stmt[], environment: Environment) {
        const { environment: previous } = this;

        try {
            this.environment = environment;

            for (const statement of statements) {
                this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
    }

    public visitBlockStmt(stmt: Block) {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }

    public visitExpressionStmt(stmt: Expression) {
        this.evaluate(stmt.expression);
    }

    public visitIfStmt(stmt: If) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }
        return null;
    }

    public visitPrintStmt(stmt: Print) {
        const value = this.evaluate(stmt.expression);
        console.log(value !== null ? value.toString() : 'nil');
    }

    public visitVarStmt(stmt: Var) {
        let value: LoxLiteral = null;

        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);

    }

    public visitWhileStmt(stmt: While) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
    }

    public visitAssignExpr(expr: Assign) {
        const value = this.evaluate(expr.value);

        this.environment.assign(expr.name, value);
        return value;
    }

    private isTruthy(val: any) {
        if (val === null) return false;
        if (toString.call(val) === '[object Boolean]') return !!val.valueOf();

        return true;
    }

    private isEqual(a: LoxLiteral, b: LoxLiteral) {
        return a === b;
    }
}
