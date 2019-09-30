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
    Unary,
    Getter,
    Setter,
    This
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
    While,
    Class
} from "./stmt";

type visitable = { accept: (visitor: any) => any; }

type FunctionType = 'NONE' | 'FUNCTION' | 'METHOD';
type ClassType = 'NONE' | 'CLASS';

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
    private interpreter: Interpreter;
    private scopes: Array<Map<string, boolean>> = [];
    private currentFunction: FunctionType = 'NONE';
    private currentClass: ClassType = 'NONE';

    public constructor(interpreter: Interpreter) {
        this.interpreter = interpreter;
    }

    public visitBlockStmt(stmt: Block) {
        this.beginScope();
        this.resolve(...stmt.statements);
        this.endScope();
    }

    public visitClassStmt(stmt: Class) {
        const enclosingClass = this.currentClass;
        this.currentClass = 'CLASS';

        this.declare(stmt.name);
        this.define(stmt.name);

        this.beginScope();
        this.scopes[this.scopes.length - 1].set("this", true);

        for (const method of stmt.methods) {
            const declaration: FunctionType = 'METHOD';
            this.resolveFunction(method, declaration);
        }

        this.endScope();
        this.currentClass = enclosingClass;
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
        if (this.currentFunction === 'NONE') {
            Lox.error(stmt.keyword, "Cannot return from top-level code.");
        }
        
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

    public visitGetterExpr(expr: Getter) {
        this.resolve(expr.obj);
    }

    public visitGroupingExpr(expr: Grouping) {
        this.resolve(expr.expression);
    }

    public visitLiteralExpr() {}

    public visitLogicalExpr(expr: Logical) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }

    public visitSetterExpr(expr: Setter) {
        this.resolve(expr.val);
        this.resolve(expr.obj);
    }

    public visitThisExpr(expr: This) {
        if (this.currentClass === 'NONE') {
            Lox.error(expr.keyword, "Cannot use 'this' outside of a class.");
            return;
        }

        this.resolveLocal(expr, expr.keyword);
    }

    public visitUnaryExpr(expr: Unary) {
        this.resolve(expr.right);
    }

    public visitFuncStmt(stmt: Func) {
        this.declare(stmt.name);
        this.define(stmt.name);

        this.resolveFunction(stmt, 'FUNCTION');
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
        const ln = this.scopes.length;
        const cond = (ln !== 0) && this.scopes[ln - 1].get(expr.name.lexeme) === false;
        if (cond) {
            Lox.error(expr.name, "Cannot read local variable in its own initializer.");
        }

        this.resolveLocal(expr, expr.name);
    }

    public resolve(...args: Array<visitable>) {
        for (const arg of args) {
             arg.accept(this);
        }
    }

    private resolveFunction(func: Func, type: FunctionType) {
        const enclosingFunction = this.currentFunction;
        this.currentFunction = type;

        this.beginScope();
        for (const param of func.params) {
            this.declare(param);
            this.define(param);
        }
        this.resolve(...func.body);
        this.endScope();

        this.currentFunction = enclosingFunction;
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
        if (scope.has(name.lexeme)) {
            Lox.error(name, "Variable with this name already declared in this scope.");
        }

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