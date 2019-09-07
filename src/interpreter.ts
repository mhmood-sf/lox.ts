import { Visitor as ExprVisitor, Literal, Grouping, Expr, Unary, Binary, Variable } from './expr';
import { Visitor as StmtVisitor, Expression, Print, Stmt, Var } from './stmt';
import { LoxValue, Token } from './token';
import { TokenTypes as T } from './token-type';
import { RuntimeError } from './runtime-error';
import { Environment } from './environment';
import { Lox } from './lox';

export class Interpreter implements ExprVisitor<LoxValue>, StmtVisitor<void> {
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

    private checkNumberOperands(operator: Token, ...operands: LoxValue[]) {
        for (const operand of operands) {
            if (typeof operand !== 'number') {
                throw new RuntimeError(operator, "Operands must be numbers!");
            }
        }
    }

    private evaluate(expr: Expr): LoxValue {
        return expr.accept<LoxValue>(this);
    }

    private execute(stmt: Stmt) {
        stmt.accept(this);
    }

    public visitExpressionStmt(stmt: Expression) {
        this.evaluate(stmt.expression);
    }

    public visitPrintStmt(stmt: Print) {
        const value = this.evaluate(stmt.expression);
        console.log(value !== null ? value.toString() : 'nil');
    }

    public visitVarStmt(stmt: Var) {
        let value: LoxValue = null;

        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);

    }

    private isTruthy(val: any) {
        if (val === null) return false;
        if (toString.call(val) === '[object Boolean]') return !!val.valueOf();

        return true;
    }

    private isEqual(a: LoxValue, b: LoxValue) {
        return a === b;
    }
}
