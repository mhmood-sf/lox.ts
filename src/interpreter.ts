import { Visitor, Literal, Grouping, Expr } from './expr';
import { LoxValue } from './token';

export class Interpreter implements Visitor<LoxValue> {
    public visitLiteralExpr(expr: Literal) {
        return expr.value;
    }

    public visitGroupingExpr(expr: Grouping) {
        return this.evaluate(expr.expression);
    }

    private evaluate(expr: Expr) {
        return expr.accept(this);
    }
}
