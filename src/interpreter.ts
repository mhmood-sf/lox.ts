import { Visitor, Literal, Grouping, Expr, Unary, Binary } from './expr';
import { LoxValue } from './token';
import { TokenTypes as T } from './token-type';

export class Interpreter implements Visitor<LoxValue> {
    public visitLiteralExpr(expr: Literal) {
        return expr.value;
    }

    public visitGroupingExpr(expr: Grouping) {
        return this.evaluate(expr.expression);
    }

    public visitUnaryExpr(expr: Unary) {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case T.MINUS:
                return -(parseFloat(right.toString()));
            case T.BANG:
                return !(this.isTruthy(right));
        }

        return null;
    }

    public visitBinaryExpr(expr: Binary) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case T.GREATER:
                return parseFloat(left.toString()) > parseFloat(right.toString());
            case T.GREATER_EQUAL:
                return parseFloat(left.toString()) >= parseFloat(right.toString());
            case T.LESS:
                return parseFloat(left.toString()) < parseFloat(right.toString());
            case T.LESS_EQUAL:
                return parseFloat(left.toString()) <= parseFloat(right.toString());
            case T.BANG_EQUAL:
                return !this.isEqual(left, right);
            case T.EQUAL_EQUAL:
                return this.isEqual(left, right);
            case T.MINUS:
                return parseFloat(left.toString()) - parseFloat(right.toString());
            case T.PLUS:
                if (typeof left === 'number' && typeof right === 'number') {
                    return parseFloat(left.toString()) + parseFloat(right.toString());
                }

                if (typeof left === 'string' && typeof right === 'string') {
                    return left.toString() + right.toString();
                }
            case T.SLASH:
                return parseFloat(left.toString()) / parseFloat(right.toString());
            case T.STAR:
                return parseFloat(left.toString()) * parseFloat(right.toString());
        }

        return null;
    }

    private evaluate(expr: Expr): LoxValue {
        return expr.accept<LoxValue>(this);
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
