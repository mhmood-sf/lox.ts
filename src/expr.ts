import { Token, LoxValue } from "./token";

export interface Visitor<T> {
    visitAssignExpr: (expr: Assign) => T;
    visitBinaryExpr: (expr: Binary) => T;
    visitGroupingExpr: (expr: Grouping) => T;
    visitLiteralExpr: (expr: Literal) => T;
    visitLogicalExpr: (expr: Logical) => T;
    visitUnaryExpr: (expr: Unary) => T;
    visitVariableExpr: (expr: Variable) => T;
}

export type Expr = Assign | Binary | Grouping | Literal | Logical | Unary | Variable;

export class Assign {
    public name: Token;
    public value: Expr;

    public constructor(name: Token, value: Expr) {
        this.name = name;
        this.value = value;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitAssignExpr(this);
    }
}

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

export class Logical {
    public left: Expr;
    public operator: Token;
    public right: Expr;

    public constructor(left: Expr, operator: Token, right: Expr) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLogicalExpr(this);
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

export class Variable {
    public name: Token;

    public constructor(name: Token) {
        this.name = name;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVariableExpr(this);
    }
}

