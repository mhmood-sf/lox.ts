import { Token, LoxLiteral } from "./token";

export interface Visitor<T> {
    visitAssignExpr: (expr: Assign) => T;
    visitBinaryExpr: (expr: Binary) => T;
    visitCallExpr: (expr: Call) => T;
    visitGetterExpr: (expr: Getter) => T;
    visitGroupingExpr: (expr: Grouping) => T;
    visitLiteralExpr: (expr: Literal) => T;
    visitLogicalExpr: (expr: Logical) => T;
    visitSetterExpr: (expr: Setter) => T;
    visitUnaryExpr: (expr: Unary) => T;
    visitVariableExpr: (expr: Variable) => T;
}

export type Expr = Assign | Binary | Call | Getter | Grouping | Literal | Logical | Setter | Unary | Variable;

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

export class Call {
    public callee: Expr;
    public paren: Token;
    public args: Expr[];

    public constructor(callee: Expr, paren: Token, args: Expr[]) {
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitCallExpr(this);
    }
}

export class Getter {
    public obj: Expr;
    public name: Token;

    public constructor(obj: Expr, name: Token) {
        this.obj = obj;
        this.name = name;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitGetterExpr(this);
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
    public value: LoxLiteral;

    public constructor(value: LoxLiteral) {
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

export class Setter {
    public obj: Expr;
    public name: Token;
    public val: Expr;

    public constructor(obj: Expr, name: Token, val: Expr) {
        this.obj = obj;
        this.name = name;
        this.val = val;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitSetterExpr(this);
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

