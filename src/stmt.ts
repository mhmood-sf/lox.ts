import { Expr } from "./expr";
import { Token } from "./token";

export interface Visitor<T> {
    visitExpressionStmt: (stmt: Expression) => T;
    visitPrintStmt: (stmt: Print) => T;
    visitVarStmt: (stmt: Var) => T;
}

export type Stmt = Expression | Print | Var;

export class Expression {
    public expression: Expr;

    public constructor(expression: Expr) {
        this.expression = expression;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpressionStmt(this);
    }
}

export class Print {
    public expression: Expr;

    public constructor(expression: Expr) {
        this.expression = expression;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitPrintStmt(this);
    }
}

export class Var {
    public name: Token;
    public initializer: Expr | null;

    public constructor(name: Token, initializer: Expr | null) {
        this.name = name;
        this.initializer = initializer;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVarStmt(this);
    }
}

