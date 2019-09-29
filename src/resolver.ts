import { Token } from "./token";
import { Lox } from "./lox";
import { Interpreter } from "./interpreter";
import {
    Visitor as ExprVisitor,
    Expr,
    Variable,
    Assign,
    Binary,
    Call,
    Grouping,
    Logical,
    Unary
} from "./expr";
import {
    Visitor as StmtVisitor,
    Block,
    Var,
    Func,
    Expression,
    If,
    Print,
    Return,
    While
} from "./stmt";

type visitable = {
    accept: (visitor: any) => any;
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
    private interpreter: Interpreter;
    private scopes: Array<Map<string, boolean>> = [];

    public constructor(interpreter: Interpreter) {
        this.interpreter = interpreter;
    }

    public visitBlockStmt(stmt: Block) {
        this.beginScope();
        this.resolve(...stmt.statements);
        this.endScope();
    }

    public visitExpressionStmt(stmt: Expression) {
        this.resolve(stmt.expression);
    }

    public visitIfStmt(stmt: If) {
        this.resolve(stmt.condition);
        this.resolve(stmt.thenBranch);
        if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
    }

    public visitPrintStmt(stmt: Print) {
        this.resolve(stmt.expression);
    }

    public visitReturnStmt(stmt: Return) {
        if (stmt.value != null) {
            this.resolve(stmt.value);
        }
    }

    public visitWhileStmt(stmt: While) {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
    }

    public visitBinaryExpr(expr: Binary) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }

    public visitCallExpr(expr: Call) {
        this.resolve(expr.callee);

        for (const arg of expr.args) {
            this.resolve(arg);
        }
    }

    public visitGroupingExpr(expr: Grouping) {
        this.resolve(expr.expression);
    }

    public visitLiteralExpr() {}

    public visitLogicalExpr(expr: Logical) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }

    public visitUnaryExpr(expr: Unary) {
        this.resolve(expr.right);
    }

    public visitFuncStmt(stmt: Func) {
        this.declare(stmt.name);
        this.define(stmt.name);

        this.resolveFunction(stmt);
    }

    public visitVarStmt(stmt: Var) {
        this.declare(stmt.name)
        if (stmt.initializer != null) {
            this.resolve(stmt.initializer);
        }
        this.define(stmt.name);
    }

    public visitAssignExpr(expr: Assign) {
        this.resolve(expr.value);
        this.resolveLocal(expr, expr.name);
    }

    public visitVariableExpr(expr: Variable) {
        // Don't mind this
        const a = this.scopes.length !== 0;
        const b = this.scopes[this.scopes.length - 1].get(expr.name.lexeme) === false;
        if (a && b) {
            Lox.error(expr.name, "Cannot read local variable in its own initializer.");
        }

        this.resolveLocal(expr, expr.name);
    }

    public resolve(...args: Array<visitable>) {
        for (const arg of args) {
             arg.accept(this);
        }
    }

    private resolveFunction(func: Func) {
        this.beginScope();
        for (const param of func.params) {
            this.declare(param);
            this.define(param);
        }
        this.resolve(...func.body);
        this.endScope();
    }

    private beginScope() {
        this.scopes.push(new Map<string, boolean>());
    }

    private endScope() {
        this.scopes.pop();
    }

    private declare(name: Token) {
        if (this.scopes.length === 0) return;

        const scope = this.scopes[this.scopes.length - 1];
        scope.set(name.lexeme, false);
    }

    private define(name: Token) {
        if (this.scopes.length === 0) return;
        this.scopes[this.scopes.length - 1].set(name.lexeme, true);
    }

    private resolveLocal(expr: Expr, name: Token) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i);
                return;
            }
        }

        // Not found. Assume it is global.
    }
}