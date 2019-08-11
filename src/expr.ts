import { Token, LoxValue } from "./token";

export interface Visitor<T> {
    visitBinaryExpr: (expr: Binary) => T;
    visitGroupingExpr: (expr: Grouping) => T;
    visitLiteralExpr: (expr: Literal) => T;
    visitUnaryExpr: (expr: Unary) => T;
}

export type Expr = Binary | Grouping | Literal | Unary;

export class Binary {
    public left: Expr;
    public operator: Token;
    public right: Expr;

    public constructor(left: Expr, operator: Token, right: Expr) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBinaryExpr(this);
    }
}

export class Grouping {
    public expression: Expr;

    public constructor(expression: Expr) {
        this.expression = expression;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitGroupingExpr(this);
    }
}

export class Literal {
    public value: LoxValue;

    public constructor(value: LoxValue) {
        this.value = value;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLiteralExpr(this);
    }
}

export class Unary {
    public operator: Token;
    public right: Expr;

    public constructor(operator: Token, right: Expr) {
        this.operator = operator;
        this.right = right;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitUnaryExpr(this);
    }
}

