import { LoxLiteral, Token } from './token';
import { LoxClass } from './lox-class';
import { RuntimeError } from './runtime-error';
import { Environment } from './environment';
import { LoxCallable } from './lox-callable';
import { LoxFunction } from './lox-function';
import { ReturnException } from './return-exception';
import { Lox } from './lox';
import {
    Visitor as ExprVisitor,
    Literal,
    Grouping,
    Expr,
    Unary,
    Binary,
    Variable,
    Assign,
    Logical,
    Call,
    Getter,
    Setter,
    This
} from './expr';
import {
    Visitor as StmtVisitor,
    Expression,
    Print,
    Stmt,
    Var,
    Block,
    If,
    While,
    Func,
    Return,
    Class
} from './stmt';
import { LoxInstance } from './lox-instance';

function isLoxCallable(callee: any): callee is LoxCallable {
    return callee.call &&
    (typeof callee.call === 'function') &&
    callee.arity &&
    (typeof callee.arity === 'function') &&
    callee.toString &&
    (typeof callee.toString === 'function');
}

export class Interpreter implements ExprVisitor<LoxLiteral>, StmtVisitor<void> {
    public globals: Environment;
    private environment: Environment;
    private locals: Map<Expr, number> = new Map();

    public constructor() {
        this.globals = new Environment();
        this.environment = this.globals;

        this.globals.define("clock", {
            arity(): number {
                return 0;
            },

            call(): LoxLiteral {
                return Date.now();
            },

            toString() {
                return "<native fn>";
            }
        });
    }

    public interpret(statements: Stmt[]) {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        } catch (err) {
            Lox.runtimeError(err);
        }
    }

    public visitLiteralExpr(expr: Literal) {
        return expr.value;
    }

    public visitLogicalExpr(expr: Logical) {
        const left = this.evaluate(expr.left);

        if (expr.operator.type === 'OR') {
            if (this.isTruthy(left)) return left;
        } else {
            if (!this.isTruthy(left)) return left;
        }

        return this.evaluate(expr.right);
    }

    public visitSetterExpr(expr: Setter) {
        const obj = this.evaluate(expr.obj);

        if (!(obj instanceof LoxInstance)) {
            throw new RuntimeError(expr.name, "Only instances have fields.");
        }

        const val = this.evaluate(expr.val);
        obj.set(expr.name, val);
        return val;
    }

    public visitThisExpr(expr: This) {
        return this.lookupVariable(expr.keyword, expr);
    }

    public visitGroupingExpr(expr: Grouping) {
        return this.evaluate(expr.expression);
    }

    public visitUnaryExpr(expr: Unary) {
        const rightRaw = this.evaluate(expr.right);
        const rightStr = rightRaw !== null ? rightRaw.toString() : "null";

        switch (expr.operator.type) {
            case 'MINUS':
                this.checkNumberOperands(expr.operator, rightRaw);
                return -(parseFloat(rightStr));
            case 'BANG':
                return !(this.isTruthy(rightRaw));
        }

        return null;
    }

    public visitVariableExpr(expr: Variable) {
        return this.lookupVariable(expr.name, expr);
    }

    private lookupVariable(name: Token, expr: Expr) {
        const distance = this.locals.get(expr);
        if (distance !== undefined) {
            return this.environment.getAt(distance, name.lexeme);
        } else {
            return this.globals.get(name);
        }
    }

    public visitBinaryExpr(expr: Binary) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case 'GREATER':
                this.checkNumberOperands(expr.operator, left, right);
                return left! > right!;
            case 'GREATER_EQUAL':
                this.checkNumberOperands(expr.operator, left, right);
                return left! >= right!;
            case 'LESS':
                this.checkNumberOperands(expr.operator, left, right);
                return left! < right!;
            case 'LESS_EQUAL':
                this.checkNumberOperands(expr.operator, left, right);
                return left! <= right!;
            case 'BANG_EQUAL':
                this.checkNumberOperands(expr.operator, left, right);
                return !this.isEqual(left, right);
            case 'EQUAL_EQUAL':
                this.checkNumberOperands(expr.operator, left, right);
                return this.isEqual(left, right)
            case 'MINUS':
                this.checkNumberOperands(expr.operator, left, right);
                return (left as any) - (right as any);
            case 'PLUS':
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }

                if (typeof left === 'string' && typeof right === 'string') {
                    return left + right;
                }

                throw new RuntimeError(expr.operator, "Operands must be strings or numbers");
            case 'SLASH':
                this.checkNumberOperands(expr.operator, left, right);
                return (left as any) / (right as any);
            case 'STAR':
                this.checkNumberOperands(expr.operator, left, right);
                return (left as any) * (right as any);
        }

        return null;
    }

    public visitCallExpr(expr: Call) {
        const callee = this.evaluate(expr.callee);

        const args = [];
        for (const arg of expr.args) {
            args.push(this.evaluate(arg));
        }

        if (!isLoxCallable(callee)) {
            throw new RuntimeError(expr.paren, "Can only call functions and classes.");
        }

        const fn = callee;
        if (args.length != fn.arity()) {
            throw new RuntimeError(expr.paren, `Expected ${fn.arity()} arguments but got ${args.length}.`);
        }

        return fn.call(this, args);
    }

    public visitGetterExpr(expr: Getter) {
        const obj = this.evaluate(expr.obj);

        if (obj instanceof LoxInstance) {
            return obj.get(expr.name);
        }

        throw new RuntimeError(expr.name, "Only instances have properties.");
    }

    private checkNumberOperands(operator: Token, ...operands: LoxLiteral[]) {
        for (const operand of operands) {
            if (typeof operand !== 'number') {
                throw new RuntimeError(operator, "Operands must be numbers!");
            }
        }
    }

    private evaluate(expr: Expr): LoxLiteral {
        return expr.accept<LoxLiteral>(this);
    }

    private execute(stmt: Stmt) {
        stmt.accept(this);
    }

    public resolve(expr: Expr, depth: number) {
        this.locals.set(expr, depth);
    }

    public executeBlock(statements: Stmt[], environment: Environment) {
        const { environment: previous } = this;

        try {
            this.environment = environment;

            for (const statement of statements) {
                this.execute(statement);
            }
        } finally {
            this.environment = previous;
        }
    }

    public visitBlockStmt(stmt: Block) {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }

    public visitClassStmt(stmt: Class) {
        this.environment.define(stmt.name.lexeme, null);

        const methods: Map<string, LoxFunction> = new Map();
        for (const method of stmt.methods) {
            const func = new LoxFunction(method, this.environment, method.name.lexeme === "init");
            methods.set(method.name.lexeme, func);
        }

        const _class = new LoxClass(stmt.name.lexeme, methods);
        this.environment.assign(stmt.name, _class);
    }

    public visitExpressionStmt(stmt: Expression) {
        this.evaluate(stmt.expression);
    }

    public visitFuncStmt(stmt: Func) {
        const func = new LoxFunction(stmt, this.environment, false);
        this.environment.define(stmt.name.lexeme, func);
    }

    public visitIfStmt(stmt: If) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }
        return null;
    }

    public visitPrintStmt(stmt: Print) {
        const value = this.evaluate(stmt.expression);
        console.log(value !== null ? value.toString() : 'nil');
    }

    public visitReturnStmt(stmt: Return) {
        let value: LoxLiteral = null;
        if (stmt.value != null) {
            value = this.evaluate(stmt.value);
        }

        throw new ReturnException(value);
    }

    public visitVarStmt(stmt: Var) {
        let value: LoxLiteral = null;

        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);

    }

    public visitWhileStmt(stmt: While) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
    }

    public visitAssignExpr(expr: Assign) {
        const value = this.evaluate(expr.value);

        const distance = this.locals.get(expr);
        if (distance !== undefined) {
            this.environment.assignAt(distance, expr.name, value);
        } else {
            this.globals.assign(expr.name, value);
        }

        return value;
    }

    private isTruthy(val: any) {
        if (val === null) return false;
        if (toString.call(val) === '[object Boolean]') return !!val.valueOf();

        return true;
    }

    private isEqual(a: LoxLiteral, b: LoxLiteral) {
        return a === b;
    }
}
