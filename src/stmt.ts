import { Expr } from "./expr";
import { Token } from "./token";

export interface Visitor<T> {
    visitBlockStmt: (stmt: Block) => T;
    visitExpressionStmt: (stmt: Expression) => T;
    visitIfStmt: (stmt: If) => T;
    visitPrintStmt: (stmt: Print) => T;
    visitVarStmt: (stmt: Var) => T;
    visitWhileStmt: (stmt: While) => T;
}

export type Stmt = Block | Expression | If | Print | Var | While;

export class Block {
    public statements: Stmt[];

    public constructor(statements: Stmt[]) {
        this.statements = statements;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBlockStmt(this);
    }
}

export class Expression {
    public expression: Expr;

    public constructor(expression: Expr) {
        this.expression = expression;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpressionStmt(this);
    }
}

export class If {
    public condition: Expr;
    public thenBranch: Stmt;
    public elseBranch: Stmt | null;

    public constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIfStmt(this);
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

export class While {
    public condition: Expr;
    public body: Stmt;

    public constructor(condition: Expr, body: Stmt) {
        this.condition = condition;
        this.body = body;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitWhileStmt(this);
    }
}

