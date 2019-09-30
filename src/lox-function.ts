import { LoxCallable } from './lox-callable';
import { Func } from './stmt';
import { Interpreter } from './interpreter';
import { Environment } from './environment';
import { ReturnException } from './return-exception';
import { LoxInstance } from './lox-instance';

export class LoxFunction implements LoxCallable {
    private declaration: Func;
    private closure: Environment;

    public constructor(declaration: Func, closure: Environment) {
        this.declaration = declaration;
        this.closure = closure;
    }

    public bind(instance: LoxInstance) {
        const environment = new Environment(this.closure);
        environment.define("this", instance);
        return new LoxFunction(this.declaration, environment);
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
            if (err instanceof ReturnException) {
                return err.value;
            }
        }
        return null;
    }

    public toString() {
        return `<fn ${this.declaration.name.lexeme}>`;
    }
}