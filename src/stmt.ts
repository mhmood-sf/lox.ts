import { Expr, Variable } from "./expr";
import { Token } from "./token";

export interface Visitor<T> {
    visitBlockStmt: (stmt: Block) => T;
    visitClassStmt: (stmt: Class) => T;
    visitExpressionStmt: (stmt: Expression) => T;
    visitFuncStmt: (stmt: Func) => T;
    visitIfStmt: (stmt: If) => T;
    visitPrintStmt: (stmt: Print) => T;
    visitReturnStmt: (stmt: Return) => T;
    visitVarStmt: (stmt: Var) => T;
    visitWhileStmt: (stmt: While) => T;
}

export type Stmt = Block | Class | Expression | Func | If | Print | Return | Var | While;

export class Block {
    public statements: Stmt[];

    public constructor(statements: Stmt[]) {
        this.statements = statements;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBlockStmt(this);
    }
}

export class Class {
    public name: Token;
    public superclass: Variable | null;
    public methods: Func[];

    public constructor(name: Token, superclass: Variable | null, methods: Func[]) {
        this.name = name;
        this.superclass = superclass;
        this.methods = methods;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitClassStmt(this);
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

export class Func {
    public name: Token;
    public params: Token[];
    public body: Stmt[];

    public constructor(name: Token, params: Token[], body: Stmt[]) {
        this.name = name;
        this.params = params;
        this.body = body;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitFuncStmt(this);
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

export class Return {
    public keyword: Token;
    public value: Expr | null;

    public constructor(keyword: Token, value: Expr | null) {
        this.keyword = keyword;
        this.value = value;
    }

    public accept<T>(visitor: Visitor<T>): T {
        return visitor.visitReturnStmt(this);
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

