// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class RuntimeError extends Error {
    token;
    constructor(token, msg){
        super(msg);
        this.token = token;
    }
}
class LoxInstance {
    _class;
    fields = new Map();
    constructor(_class){
        this._class = _class;
    }
    get(name) {
        if (this.fields.has(name.lexeme)) {
            const val = this.fields.get(name.lexeme);
            return val === undefined ? null : val;
        }
        const method = this._class.findMethod(name.lexeme);
        if (method !== null) return method.bind(this);
        throw new RuntimeError(name, `Undefined property ${name.lexeme}.`);
    }
    set(name, val) {
        this.fields.set(name.lexeme, val);
    }
    toString() {
        return this._class.name + " instance";
    }
}
class LoxClass {
    name;
    methods;
    superclass;
    constructor(name, superclass, methods){
        this.name = name;
        this.methods = methods;
        this.superclass = superclass;
    }
    findMethod(name) {
        if (this.methods.has(name)) {
            const method = this.methods.get(name);
            return method === undefined ? null : method;
        }
        if (this.superclass !== null) {
            return this.superclass.findMethod(name);
        }
        return null;
    }
    call(interpreter, args) {
        const instance = new LoxInstance(this);
        const initializer = this.findMethod("init");
        if (initializer !== null) {
            initializer.bind(instance).call(interpreter, args);
        }
        return instance;
    }
    toString() {
        return this.name;
    }
    arity() {
        const initializer = this.findMethod("init");
        if (initializer === null) return 0;
        return initializer.arity();
    }
}
class Environment {
    values = new Map();
    enclosing;
    constructor(enclosing){
        if (enclosing) this.enclosing = enclosing;
    }
    define(name, value) {
        this.values.set(name, value);
    }
    get(name) {
        const value = this.values.has(name.lexeme) ? this.values.get(name.lexeme) : undefined;
        if (value !== undefined) return value;
        else if (this.enclosing) return this.enclosing.get(name);
        else throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }
    getAt(distance, name) {
        const ancestor = this.ancestor(distance);
        if (ancestor) {
            const val = ancestor.values.get(name);
            return val === undefined ? null : val;
        } else {
            throw new Error(`Cannot access unresolved variable '${name}'.`);
        }
    }
    ancestor(distance) {
        let environment = this;
        for(let i = 0; i < distance; i++){
            environment = environment && environment.enclosing;
        }
        return environment;
    }
    assign(name, value) {
        if (this.values.has(name.lexeme)) this.values.set(name.lexeme, value);
        else if (this.enclosing) this.enclosing.assign(name, value);
        else throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }
    assignAt(distance, name, value) {
        const ancestor = this.ancestor(distance);
        if (ancestor) {
            ancestor.values.set(name.lexeme, value);
        } else {
            throw new Error(`Cannot access unresolved variable '${name.lexeme}'.`);
        }
    }
}
class ReturnException {
    value;
    constructor(value){
        this.value = value;
    }
}
class LoxFunction {
    declaration;
    closure;
    isInitializer;
    constructor(declaration, closure, isInitializer){
        this.declaration = declaration;
        this.closure = closure;
        this.isInitializer = isInitializer;
    }
    bind(instance) {
        const environment = new Environment(this.closure);
        environment.define("this", instance);
        return new LoxFunction(this.declaration, environment, this.isInitializer);
    }
    arity() {
        return this.declaration.params.length;
    }
    call(interpreter, args) {
        const environment = new Environment(this.closure);
        for(let x = 0; x < this.declaration.params.length; x++){
            environment.define(this.declaration.params[x].lexeme, args[x]);
        }
        try {
            interpreter.executeBlock(this.declaration.body, environment);
        } catch (err) {
            if (this.isInitializer) {
                return this.closure.getAt(0, "this");
            }
            if (err instanceof ReturnException) {
                return err.value;
            }
        }
        if (this.isInitializer) return this.closure.getAt(0, "this");
        return null;
    }
    toString() {
        return `<fn ${this.declaration.name.lexeme}>`;
    }
}
class Block {
    statements;
    constructor(statements){
        this.statements = statements;
    }
    accept(visitor) {
        return visitor.visitBlockStmt(this);
    }
}
class Class {
    name;
    superclass;
    methods;
    constructor(name, superclass, methods){
        this.name = name;
        this.superclass = superclass;
        this.methods = methods;
    }
    accept(visitor) {
        return visitor.visitClassStmt(this);
    }
}
class Expression {
    expression;
    constructor(expression){
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitExpressionStmt(this);
    }
}
class Func {
    name;
    params;
    body;
    constructor(name, params, body){
        this.name = name;
        this.params = params;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visitFuncStmt(this);
    }
}
class If {
    condition;
    thenBranch;
    elseBranch;
    constructor(condition, thenBranch, elseBranch){
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
    accept(visitor) {
        return visitor.visitIfStmt(this);
    }
}
class Print {
    expression;
    constructor(expression){
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitPrintStmt(this);
    }
}
class Return {
    keyword;
    value;
    constructor(keyword, value){
        this.keyword = keyword;
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitReturnStmt(this);
    }
}
class Var {
    name;
    initializer;
    constructor(name, initializer){
        this.name = name;
        this.initializer = initializer;
    }
    accept(visitor) {
        return visitor.visitVarStmt(this);
    }
}
class While {
    condition;
    body;
    constructor(condition, body){
        this.condition = condition;
        this.body = body;
    }
    accept(visitor) {
        return visitor.visitWhileStmt(this);
    }
}
class Assign {
    name;
    value;
    constructor(name, value){
        this.name = name;
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitAssignExpr(this);
    }
}
class Binary {
    left;
    operator;
    right;
    constructor(left, operator, right){
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}
class Call {
    callee;
    paren;
    args;
    constructor(callee, paren, args){
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }
    accept(visitor) {
        return visitor.visitCallExpr(this);
    }
}
class Getter {
    obj;
    name;
    constructor(obj, name){
        this.obj = obj;
        this.name = name;
    }
    accept(visitor) {
        return visitor.visitGetterExpr(this);
    }
}
class Grouping {
    expression;
    constructor(expression){
        this.expression = expression;
    }
    accept(visitor) {
        return visitor.visitGroupingExpr(this);
    }
}
class Literal {
    value;
    constructor(value){
        this.value = value;
    }
    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}
class Logical {
    left;
    operator;
    right;
    constructor(left, operator, right){
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitLogicalExpr(this);
    }
}
class Setter {
    obj;
    name;
    val;
    constructor(obj, name, val){
        this.obj = obj;
        this.name = name;
        this.val = val;
    }
    accept(visitor) {
        return visitor.visitSetterExpr(this);
    }
}
class Super {
    keyword;
    method;
    constructor(keyword, method){
        this.keyword = keyword;
        this.method = method;
    }
    accept(visitor) {
        return visitor.visitSuperExpr(this);
    }
}
class This {
    keyword;
    constructor(keyword){
        this.keyword = keyword;
    }
    accept(visitor) {
        return visitor.visitThisExpr(this);
    }
}
class Unary {
    operator;
    right;
    constructor(operator, right){
        this.operator = operator;
        this.right = right;
    }
    accept(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}
class Variable {
    name;
    constructor(name){
        this.name = name;
    }
    accept(visitor) {
        return visitor.visitVariableExpr(this);
    }
}
const Keywords = {
    and: "AND",
    class: "CLASS",
    else: "ELSE",
    false: "FALSE",
    fun: "FUN",
    for: "FOR",
    if: "IF",
    nil: "NIL",
    or: "OR",
    print: "PRINT",
    return: "RETURN",
    super: "SUPER",
    this: "THIS",
    true: "TRUE",
    var: "VAR",
    while: "WHILE"
};
class Token {
    type;
    lexeme;
    literal;
    line;
    constructor(type, lexeme, literal, line){
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    toString() {
        return `(Type: ${this.type} | Lexeme: ${this.lexeme})`;
    }
}
class Interpreter {
    globals;
    environment;
    locals = new Map();
    constructor(){
        this.globals = new Environment();
        this.environment = this.globals;
        this.globals.define("clock", {
            arity () {
                return 0;
            },
            call () {
                return Date.now();
            },
            toString () {
                return "<native fn>";
            }
        });
    }
    interpret(statements) {
        try {
            for (const statement of statements){
                this.execute(statement);
            }
        } catch (err) {
            Lox.runtimeError(err);
        }
    }
    visitLiteralExpr(expr) {
        return expr.value;
    }
    visitLogicalExpr(expr) {
        const left = this.evaluate(expr.left);
        if (expr.operator.type === "OR") {
            if (this.isTruthy(left)) return left;
        } else {
            if (!this.isTruthy(left)) return left;
        }
        return this.evaluate(expr.right);
    }
    visitSetterExpr(expr) {
        const obj = this.evaluate(expr.obj);
        if (!(obj instanceof LoxInstance)) {
            throw new RuntimeError(expr.name, "Only instances have fields.");
        }
        const val = this.evaluate(expr.val);
        obj.set(expr.name, val);
        return val;
    }
    visitSuperExpr(expr) {
        const distance = this.locals.get(expr);
        if (distance) {
            const superclass = this.environment.getAt(distance, "super");
            if (superclass instanceof LoxClass) {
                const obj = this.environment.getAt(distance - 1, "this");
                const method = superclass.findMethod(expr.method.lexeme);
                if (method !== null) {
                    if (obj instanceof LoxInstance) {
                        return method.bind(obj);
                    } else {
                        throw new RuntimeError(expr.keyword, "'this' does not point to a LoxInstance in the superclass.");
                    }
                } else {
                    throw new RuntimeError(expr.method, `Undefined property '${expr.method.lexeme}'.`);
                }
            } else {
                throw new RuntimeError(expr.keyword, "'super' does not point to a class.");
            }
        } else {
            throw new RuntimeError(expr.keyword, "Unresolved super expression.");
        }
    }
    visitThisExpr(expr) {
        return this.lookupVariable(expr.keyword, expr);
    }
    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression);
    }
    visitUnaryExpr(expr) {
        const rightRaw = this.evaluate(expr.right);
        const rightStr = rightRaw !== null ? rightRaw.toString() : "null";
        switch(expr.operator.type){
            case "MINUS":
                this.checkNumberOperands(expr.operator, rightRaw);
                return -parseFloat(rightStr);
            case "BANG":
                return !this.isTruthy(rightRaw);
        }
        return null;
    }
    visitVariableExpr(expr) {
        return this.lookupVariable(expr.name, expr);
    }
    lookupVariable(name, expr) {
        const distance = this.locals.get(expr);
        if (distance !== undefined) {
            return this.environment.getAt(distance, name.lexeme);
        } else {
            return this.globals.get(name);
        }
    }
    visitBinaryExpr(expr) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);
        switch(expr.operator.type){
            case "GREATER":
                this.checkNumberOperands(expr.operator, left, right);
                return left > right;
            case "GREATER_EQUAL":
                this.checkNumberOperands(expr.operator, left, right);
                return left >= right;
            case "LESS":
                this.checkNumberOperands(expr.operator, left, right);
                return left < right;
            case "LESS_EQUAL":
                this.checkNumberOperands(expr.operator, left, right);
                return left <= right;
            case "BANG_EQUAL":
                this.checkNumberOperands(expr.operator, left, right);
                return !this.isEqual(left, right);
            case "EQUAL_EQUAL":
                this.checkNumberOperands(expr.operator, left, right);
                return this.isEqual(left, right);
            case "MINUS":
                this.checkNumberOperands(expr.operator, left, right);
                return left - right;
            case "PLUS":
                if (typeof left === "number" && typeof right === "number") {
                    return left + right;
                }
                if (typeof left === "string" && typeof right === "string") {
                    return left + right;
                }
                throw new RuntimeError(expr.operator, "Operands must be strings or numbers");
            case "SLASH":
                this.checkNumberOperands(expr.operator, left, right);
                return left / right;
            case "STAR":
                this.checkNumberOperands(expr.operator, left, right);
                return left * right;
        }
        return null;
    }
    visitCallExpr(expr) {
        const callee = this.evaluate(expr.callee);
        const args = [];
        for (const arg of expr.args){
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
    visitGetterExpr(expr) {
        const obj = this.evaluate(expr.obj);
        if (obj instanceof LoxInstance) {
            return obj.get(expr.name);
        }
        throw new RuntimeError(expr.name, "Only instances have properties.");
    }
    checkNumberOperands(operator, ...operands) {
        for (const operand of operands){
            if (typeof operand !== "number") {
                throw new RuntimeError(operator, "Operands must be numbers!");
            }
        }
    }
    evaluate(expr) {
        return expr.accept(this);
    }
    execute(stmt) {
        stmt.accept(this);
    }
    resolve(expr, depth) {
        this.locals.set(expr, depth);
    }
    executeBlock(statements, environment) {
        const { environment: previous  } = this;
        try {
            this.environment = environment;
            for (const statement of statements){
                this.execute(statement);
            }
        } finally{
            this.environment = previous;
        }
    }
    visitBlockStmt(stmt) {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }
    visitClassStmt(stmt) {
        let superclass = null;
        if (stmt.superclass !== null) {
            superclass = this.evaluate(stmt.superclass);
            if (!(superclass instanceof LoxClass)) {
                throw new RuntimeError(stmt.superclass.name, "Superclass must be a class.");
            }
        }
        this.environment.define(stmt.name.lexeme, null);
        if (stmt.superclass !== null) {
            this.environment = new Environment(this.environment);
            this.environment.define("super", superclass);
        }
        const methods = new Map();
        for (const method of stmt.methods){
            const func = new LoxFunction(method, this.environment, method.name.lexeme === "init");
            methods.set(method.name.lexeme, func);
        }
        const _class = new LoxClass(stmt.name.lexeme, superclass, methods);
        if (superclass !== null) {
            this.environment = this.environment.enclosing ? this.environment.enclosing : this.environment;
        }
        this.environment.assign(stmt.name, _class);
    }
    visitExpressionStmt(stmt) {
        this.evaluate(stmt.expression);
    }
    visitFuncStmt(stmt) {
        const func = new LoxFunction(stmt, this.environment, false);
        this.environment.define(stmt.name.lexeme, func);
    }
    visitIfStmt(stmt) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        } else if (stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }
        return null;
    }
    visitPrintStmt(stmt) {
        const value = this.evaluate(stmt.expression);
        console.log(value !== null ? value.toString() : "nil");
    }
    visitReturnStmt(stmt) {
        let value = null;
        if (stmt.value != null) {
            value = this.evaluate(stmt.value);
        }
        throw new ReturnException(value);
    }
    visitVarStmt(stmt) {
        let value = null;
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer);
        }
        this.environment.define(stmt.name.lexeme, value);
    }
    visitWhileStmt(stmt) {
        while(this.isTruthy(this.evaluate(stmt.condition))){
            this.execute(stmt.body);
        }
    }
    visitAssignExpr(expr) {
        const value = this.evaluate(expr.value);
        const distance = this.locals.get(expr);
        if (distance !== undefined) {
            this.environment.assignAt(distance, expr.name, value);
        } else {
            this.globals.assign(expr.name, value);
        }
        return value;
    }
    isTruthy(val) {
        if (val === null) return false;
        if (window.toString.call(val) === "[object Boolean]") {
            return !!val.valueOf();
        }
        return true;
    }
    isEqual(a, b) {
        return a === b;
    }
}
class Lox {
    static interpreter = new Interpreter();
    static hadError = false;
    static hadRuntimeError = false;
    static runFile(path) {
        try {
            const source = Deno.readTextFileSync(path);
            if (source) this.run(source);
            if (this.hadError) Deno.exit(64);
            if (this.hadRuntimeError) Deno.exit(70);
        } catch (err) {
            console.error(`Error:\n\t${err.message}`);
            Deno.exit(64);
        }
    }
    static runPrompt() {
        console.log("lox.ts REPL. Press Ctrl + C to exit.");
        while(true){
            const text = prompt("::");
            const source = text ? text.trim() : "";
            this.run(source);
            this.hadError = false;
        }
    }
    static run(source) {
        const scanner = new Scanner(source);
        const tokens = scanner.scanTokens();
        const parser = new Parser(tokens);
        const statements = parser.parse();
        if (this.hadError) return;
        if (statements === null) {
            console.log("Program terminated due to error!");
        } else {
            const resolver = new Resolver(this.interpreter);
            resolver.resolve(...statements);
            if (this.hadError) return;
            this.interpreter.interpret(statements);
        }
    }
    static error(token, message) {
        if (typeof token === "number") {
            this.report(token, "", message);
        } else {
            if (token.type === "EOF") {
                this.report(token.line, " at end", message);
            } else {
                this.report(token.line, ` at '${token.lexeme}'`, message);
            }
        }
    }
    static runtimeError(err) {
        this.report(err.token.line, "", err.message);
        this.hadRuntimeError = true;
    }
    static report(line, where, message) {
        const msg = `[line ${line}] Error${where}: ${message}`;
        console.error(msg);
        this.hadError = true;
    }
}
class Scanner {
    source;
    tokens = [];
    start = 0;
    current = 0;
    line = 1;
    constructor(source){
        this.source = source;
    }
    scanTokens() {
        while(!this.isAtEnd()){
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token("EOF", "[EOF]", null, this.line));
        return this.tokens;
    }
    scanToken() {
        const c = this.advance();
        switch(c){
            case "(":
                this.addToken("LEFT_PAREN");
                break;
            case ")":
                this.addToken("RIGHT_PAREN");
                break;
            case "{":
                this.addToken("LEFT_BRACE");
                break;
            case "}":
                this.addToken("RIGHT_BRACE");
                break;
            case ",":
                this.addToken("COMMA");
                break;
            case ".":
                this.addToken("DOT");
                break;
            case "-":
                this.addToken("MINUS");
                break;
            case "+":
                this.addToken("PLUS");
                break;
            case ";":
                this.addToken("SEMICOLON");
                break;
            case "*":
                this.addToken("STAR");
                break;
            case "!":
                this.addToken(this.match("=") ? "BANG_EQUAL" : "BANG");
                break;
            case "=":
                this.addToken(this.match("=") ? "EQUAL_EQUAL" : "EQUAL");
                break;
            case "<":
                this.addToken(this.match("=") ? "LESS_EQUAL" : "LESS");
                break;
            case ">":
                this.addToken(this.match("=") ? "GREATER_EQUAL" : "GREATER");
                break;
            case "/":
                if (this.match("/")) {
                    while(this.peek() != "\n" && !this.isAtEnd()){
                        this.advance();
                    }
                } else {
                    this.addToken("SLASH");
                }
                break;
            case " ":
            case "\r":
            case "\t":
                break;
            case "\n":
                this.line++;
                break;
            case '"':
                this.handleString();
                break;
            default:
                if (this.isDigit(c)) {
                    this.handleNumber();
                } else if (this.isAlpha(c)) {
                    this.handleIdentifier();
                } else {
                    Lox.error(this.line, `Unexpected character: ${c}`);
                }
                break;
        }
    }
    handleIdentifier() {
        while(this.isAlphaNumeric(this.peek())){
            this.advance();
        }
        const lexeme = this.source.substring(this.start, this.current);
        const type = Keywords[lexeme] || "IDENTIFIER";
        this.addToken(type);
    }
    handleNumber() {
        while(this.isDigit(this.peek())){
            this.advance();
        }
        if (this.peek() === "." && this.isDigit(this.peekNext())) {
            this.advance();
            while(this.isDigit(this.peek())){
                this.advance();
            }
        }
        const val = parseFloat(this.source.substring(this.start, this.current));
        this.addToken("NUMBER", val);
    }
    handleString() {
        while(this.peek() != '"' && !this.isAtEnd()){
            if (this.peek() === "\n") this.line++;
            this.advance();
        }
        if (this.isAtEnd()) {
            Lox.error(this.line, "Unterminated string!");
        } else {
            this.advance();
            const val = this.source.substring(this.start + 1, this.current - 1);
            this.addToken("STRING", val);
        }
    }
    addToken(type, literal) {
        literal = literal === undefined ? null : literal;
        const lexeme = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, lexeme, literal, this.line));
    }
    advance() {
        this.current++;
        return this.source[this.current - 1];
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    match(expected) {
        if (this.isAtEnd()) return false;
        if (this.source[this.current] !== expected) return false;
        this.current++;
        return true;
    }
    peek() {
        if (this.isAtEnd()) return "\0";
        return this.source[this.current];
    }
    peekNext() {
        if (this.current + 1 >= this.source.length) return "\0";
        return this.source[this.current + 1];
    }
    isDigit(c) {
        return /\d/.test(c);
    }
    isAlpha(c) {
        return /[A-Za-z_]/.test(c);
    }
    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
}
class Parser {
    tokens;
    current = 0;
    constructor(tokens){
        this.tokens = tokens;
    }
    parse() {
        try {
            const statements = [];
            while(!this.isAtEnd()){
                statements.push(this.declaration());
            }
            return statements;
        } catch (err) {
            return null;
        }
    }
    statement() {
        if (this.match("PRINT")) return this.printStatement();
        if (this.match("RETURN")) return this.returnStatement();
        if (this.match("WHILE")) return this.whileStatement();
        if (this.match("LEFT_BRACE")) return new Block(this.block());
        if (this.match("IF")) return this.ifStatement();
        if (this.match("FOR")) return this.forStatement();
        return this.expressionStatement();
    }
    forStatement() {
        this.consume("LEFT_PAREN", "Expect '(' after 'for'.");
        let initializer = null;
        if (this.match("SEMICOLON")) {
            initializer = null;
        } else if (this.match("VAR")) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expressionStatement();
        }
        let condition = null;
        if (!this.check("SEMICOLON")) {
            condition = this.expression();
        }
        this.consume("SEMICOLON", "Expect ';' after loop condition.");
        let increment = null;
        if (!this.check("RIGHT_PAREN")) {
            increment = this.expression();
        }
        this.consume("RIGHT_PAREN", "Expect ')' after for clauses.");
        let body = this.statement();
        if (increment != null) {
            body = new Block([
                body,
                new Expression(increment)
            ]);
        }
        if (condition == null) condition = new Literal(true);
        body = new While(condition, body);
        if (initializer != null) {
            body = new Block([
                initializer,
                body
            ]);
        }
        return body;
    }
    ifStatement() {
        this.consume("LEFT_PAREN", "Expect '(' after 'if'.");
        const condition = this.expression();
        this.consume("RIGHT_PAREN", "Expect ')' after 'if' condition.");
        const thenBranch = this.statement();
        let elseBranch = null;
        if (this.match("ELSE")) {
            elseBranch = this.statement();
        }
        return new If(condition, thenBranch, elseBranch);
    }
    printStatement() {
        const value = this.expression();
        this.consume("SEMICOLON", "Expect ';' after expression.");
        return new Print(value);
    }
    returnStatement() {
        const keyword = this.previous();
        let value = null;
        if (!this.check("SEMICOLON")) {
            value = this.expression();
        }
        this.consume("SEMICOLON", "Expect ';' after return value.");
        return new Return(keyword, value);
    }
    varDeclaration() {
        const name = this.consume("IDENTIFIER", "Expect variable name.");
        let initializer = null;
        if (this.match("EQUAL")) {
            initializer = this.expression();
        }
        this.consume("SEMICOLON", "Expect ';' after variable declaration.");
        return new Var(name, initializer);
    }
    whileStatement() {
        this.consume("LEFT_PAREN", "Expect '(' after 'while'.");
        const condition = this.expression();
        this.consume("RIGHT_PAREN", "Expect ')' after condition.");
        const body = this.statement();
        return new While(condition, body);
    }
    expressionStatement() {
        const expr = this.expression();
        this.consume("SEMICOLON", "Expect ';' after expression.");
        return new Expression(expr);
    }
    function(kind) {
        const name = this.consume("IDENTIFIER", `Expect ${kind} name.`);
        this.consume("LEFT_PAREN", `Expect '(' after ${kind} name.`);
        const parameters = [];
        if (!this.check("RIGHT_PAREN")) {
            do {
                if (parameters.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 parameters.");
                }
                parameters.push(this.consume("IDENTIFIER", "Expect parameter name."));
            }while (this.match("COMMA"))
        }
        this.consume("RIGHT_PAREN", "Expect ')' after parameters.");
        this.consume("LEFT_BRACE", `Expect '{' before ${kind} body.`);
        const body = this.block();
        return new Func(name, parameters, body);
    }
    block() {
        const statements = [];
        while(!this.check("RIGHT_BRACE") && !this.isAtEnd()){
            statements.push(this.declaration());
        }
        this.consume("RIGHT_BRACE", "Expect '}' after block.");
        return statements;
    }
    assignment() {
        const expr = this.or();
        if (this.match("EQUAL")) {
            const equals = this.previous();
            const value = this.assignment();
            if (expr instanceof Variable) {
                const name = expr.name;
                return new Assign(name, value);
            } else if (expr instanceof Getter) {
                const get = expr;
                return new Setter(get.obj, get.name, value);
            }
            this.error(equals, "Invalid assignment target.");
        }
        return expr;
    }
    or() {
        let expr = this.and();
        while(this.match("OR")){
            const operator = this.previous();
            const right = this.and();
            expr = new Logical(expr, operator, right);
        }
        return expr;
    }
    and() {
        let expr = this.equality();
        while(this.match("AND")){
            const operator = this.previous();
            const right = this.equality();
            expr = new Logical(expr, operator, right);
        }
        return expr;
    }
    expression() {
        return this.assignment();
    }
    declaration() {
        try {
            if (this.match("CLASS")) return this.classDeclaration();
            if (this.match("FUN")) return this.function("function");
            if (this.match("VAR")) return this.varDeclaration();
            return this.statement();
        } catch (err) {
            this.synchronize();
            return new Expression(new Literal(null));
        }
    }
    classDeclaration() {
        const name = this.consume("IDENTIFIER", "Expect class name.");
        let superclass = null;
        if (this.match("LESS")) {
            this.consume("IDENTIFIER", "Expect superclass name.");
            superclass = new Variable(this.previous());
        }
        this.consume("LEFT_BRACE", "Expect '{' before class body.");
        const methods = [];
        while(!this.check("RIGHT_BRACE") && !this.isAtEnd()){
            methods.push(this.function("method"));
        }
        this.consume("RIGHT_BRACE", "Expect '}' after class body.");
        return new Class(name, superclass, methods);
    }
    equality() {
        let expr = this.comparison();
        while(this.match("BANG_EQUAL", "EQUAL_EQUAL")){
            const operator = this.previous();
            const right = this.comparison();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    comparison() {
        let expr = this.addition();
        while(this.match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")){
            const operator = this.previous();
            const right = this.addition();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    addition() {
        let expr = this.multiplication();
        while(this.match("MINUS", "PLUS")){
            const operator = this.previous();
            const right = this.multiplication();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    multiplication() {
        let expr = this.unary();
        while(this.match("SLASH", "STAR")){
            const operator = this.previous();
            const right = this.unary();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }
    unary() {
        if (this.match("BANG", "MINUS")) {
            const operator = this.previous();
            const right = this.unary();
            return new Unary(operator, right);
        }
        return this.call();
    }
    call() {
        let expr = this.primary();
        while(true){
            if (this.match("LEFT_PAREN")) {
                expr = this.finishCall(expr);
            } else if (this.match("DOT")) {
                const name = this.consume("IDENTIFIER", "Expect property name after '.'.");
                expr = new Getter(expr, name);
            } else {
                break;
            }
        }
        return expr;
    }
    finishCall(callee) {
        const args = [];
        if (!this.check("RIGHT_PAREN")) {
            do {
                if (args.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 arguments.");
                }
                args.push(this.expression());
            }while (this.match("COMMA"))
        }
        const paren = this.consume("RIGHT_PAREN", "Expect ')' after arguments.");
        return new Call(callee, paren, args);
    }
    primary() {
        if (this.match("FALSE")) return new Literal(false);
        if (this.match("TRUE")) return new Literal(true);
        if (this.match("NIL")) return new Literal(null);
        if (this.match("NUMBER", "STRING")) {
            return new Literal(this.previous().literal);
        }
        if (this.match("SUPER")) {
            const keyword = this.previous();
            this.consume("DOT", "Expect '.' after super.");
            const method = this.consume("IDENTIFIER", "Expect superclass method name.");
            return new Super(keyword, method);
        }
        if (this.match("THIS")) {
            return new This(this.previous());
        }
        if (this.match("IDENTIFIER")) {
            return new Variable(this.previous());
        }
        if (this.match("LEFT_PAREN")) {
            const expr = this.expression();
            this.consume("RIGHT_PAREN", "Expect ')' after expression!");
            return new Grouping(expr);
        }
        throw this.error(this.peek(), "Expect expression!");
    }
    consume(type, message) {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), message);
    }
    match(...types) {
        for (const type of types){
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === "EOF";
    }
    peek() {
        return this.tokens[this.current];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    error(token, message) {
        Lox.error(token, message);
        return new Error();
    }
    synchronize() {
        this.advance();
        while(!this.isAtEnd()){
            if (this.previous().type === "SEMICOLON") return;
            switch(this.peek().type){
                case "CLASS":
                case "FUN":
                case "VAR":
                case "FOR":
                case "IF":
                case "WHILE":
                case "PRINT":
                case "RETURN":
                    return;
            }
            this.advance();
        }
    }
}
function isLoxCallable(callee) {
    return callee.call && typeof callee.call === "function" && callee.arity && typeof callee.arity === "function" && callee.toString && typeof callee.toString === "function";
}
class Resolver {
    interpreter;
    scopes = [];
    currentFunction = "NONE";
    currentClass = "NONE";
    constructor(interpreter){
        this.interpreter = interpreter;
    }
    visitBlockStmt(stmt) {
        this.beginScope();
        this.resolve(...stmt.statements);
        this.endScope();
    }
    visitClassStmt(stmt) {
        const enclosingClass = this.currentClass;
        this.currentClass = "CLASS";
        this.declare(stmt.name);
        this.define(stmt.name);
        if (stmt.superclass !== null && stmt.name.lexeme === stmt.superclass.name.lexeme) {
            Lox.error(stmt.superclass.name, "A class cannot inherit from itself.");
        }
        if (stmt.superclass !== null) {
            this.currentClass = "SUBCLASS";
            this.resolve(stmt.superclass);
        }
        if (stmt.superclass !== null) {
            this.beginScope();
            this.scopes[this.scopes.length - 1].set("super", true);
        }
        this.beginScope();
        this.scopes[this.scopes.length - 1].set("this", true);
        for (const method of stmt.methods){
            let declaration = "METHOD";
            if (method.name.lexeme === "init") {
                declaration = "INITIALIZER";
            }
            this.resolveFunction(method, declaration);
        }
        this.endScope();
        if (stmt.superclass !== null) {
            this.endScope();
        }
        this.currentClass = enclosingClass;
    }
    visitExpressionStmt(stmt) {
        this.resolve(stmt.expression);
    }
    visitIfStmt(stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.thenBranch);
        if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
    }
    visitPrintStmt(stmt) {
        this.resolve(stmt.expression);
    }
    visitReturnStmt(stmt) {
        if (this.currentFunction === "NONE") {
            Lox.error(stmt.keyword, "Cannot return from top-level code.");
        }
        if (stmt.value != null) {
            if (this.currentFunction === "INITIALIZER") {
                Lox.error(stmt.keyword, "Cannot return a value from an initializer.");
            }
            this.resolve(stmt.value);
        }
    }
    visitWhileStmt(stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
    }
    visitBinaryExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }
    visitCallExpr(expr) {
        this.resolve(expr.callee);
        for (const arg of expr.args){
            this.resolve(arg);
        }
    }
    visitGetterExpr(expr) {
        this.resolve(expr.obj);
    }
    visitGroupingExpr(expr) {
        this.resolve(expr.expression);
    }
    visitLiteralExpr() {}
    visitLogicalExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }
    visitSetterExpr(expr) {
        this.resolve(expr.val);
        this.resolve(expr.obj);
    }
    visitSuperExpr(expr) {
        if (this.currentClass === "NONE") {
            Lox.error(expr.keyword, "Cannot use 'super' outside of a class.");
        } else if (this.currentClass !== "SUBCLASS") {
            Lox.error(expr.keyword, "Cannot use 'super' in a class with no superclass.");
        }
        this.resolveLocal(expr, expr.keyword);
    }
    visitThisExpr(expr) {
        if (this.currentClass === "NONE") {
            Lox.error(expr.keyword, "Cannot use 'this' outside of a class.");
            return;
        }
        this.resolveLocal(expr, expr.keyword);
    }
    visitUnaryExpr(expr) {
        this.resolve(expr.right);
    }
    visitFuncStmt(stmt) {
        this.declare(stmt.name);
        this.define(stmt.name);
        this.resolveFunction(stmt, "FUNCTION");
    }
    visitVarStmt(stmt) {
        this.declare(stmt.name);
        if (stmt.initializer != null) {
            this.resolve(stmt.initializer);
        }
        this.define(stmt.name);
    }
    visitAssignExpr(expr) {
        this.resolve(expr.value);
        this.resolveLocal(expr, expr.name);
    }
    visitVariableExpr(expr) {
        const ln = this.scopes.length;
        const cond = ln !== 0 && this.scopes[ln - 1].get(expr.name.lexeme) === false;
        if (cond) {
            Lox.error(expr.name, "Cannot read local variable in its own initializer.");
        }
        this.resolveLocal(expr, expr.name);
    }
    resolve(...args) {
        for (const arg of args){
            arg.accept(this);
        }
    }
    resolveFunction(func, type) {
        const enclosingFunction = this.currentFunction;
        this.currentFunction = type;
        this.beginScope();
        for (const param of func.params){
            this.declare(param);
            this.define(param);
        }
        this.resolve(...func.body);
        this.endScope();
        this.currentFunction = enclosingFunction;
    }
    beginScope() {
        this.scopes.push(new Map());
    }
    endScope() {
        this.scopes.pop();
    }
    declare(name) {
        if (this.scopes.length === 0) return;
        const scope = this.scopes[this.scopes.length - 1];
        if (scope.has(name.lexeme)) {
            Lox.error(name, "Variable with this name already declared in this scope.");
        }
        scope.set(name.lexeme, false);
    }
    define(name) {
        if (this.scopes.length === 0) return;
        this.scopes[this.scopes.length - 1].set(name.lexeme, true);
    }
    resolveLocal(expr, name) {
        for(let i = this.scopes.length - 1; i >= 0; i--){
            if (this.scopes[i].has(name.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i);
                return;
            }
        }
    }
}
const runBtn = document.getElementById("run");
const clearBtn = document.getElementById("clear");
document.getElementById("open-repl");
const codePane = document.getElementById("code-pane");
const outputPane = document.getElementById("output-pane");
runBtn.addEventListener("click", (e)=>{
    const source = codePane.value;
    const { log  } = console;
    const output = [];
    console.log = (str)=>output.push(str);
    Lox.run(source);
    outputPane.innerText = output.join("\n");
    console.log = log;
});
clearBtn.addEventListener("click", (e)=>{
    codePane.value = "";
});
