import { LoxCallable } from './lox-callable';
import { Func } from './stmt';
import { Interpreter } from './interpreter';
import { Environment } from './environment';
import { ReturnException } from './return-exception';
import { LoxInstance } from './lox-instance';

export class LoxFunction implements LoxCallable {
    private declaration: Func;
    private closure: Environment;
    private isInitializer: boolean;

    public constructor(declaration: Func, closure: Environment, isInitializer: boolean) {
        this.declaration = declaration;
        this.closure = closure;
        this.isInitializer = isInitializer;
    }

    public bind(instance: LoxInstance) {
        const environment = new Environment(this.closure);
        environment.define("this", instance);
        return new LoxFunction(this.declaration, environment, this.isInitializer);
    }

    public arity() {
        return this.declaration.params.length;
    }

    public call(interpreter: Interpreter, args: any[]) {
        const environment = new Environment(this.closure);
        
        for (let x = 0; x < this.declaration.params.length; x++) {
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

    public toString() {
        return `<fn ${this.declaration.name.lexeme}>`;
    }
}