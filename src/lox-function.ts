import { LoxCallable } from './lox-callable';
import { Func } from './stmt';
import { Interpreter } from './interpreter';
import { Environment } from './environment';

export class LoxFunction implements LoxCallable {
    private declaration: Func;

    public constructor(declaration: Func) {
        this.declaration = declaration;
    }

    public arity() {
        return this.declaration.params.length;
    }

    public call(interpreter: Interpreter, args: any[]) {
        const environment = new Environment(interpreter.globals);
        
        for (let x = 0; x < this.declaration.params.length; x++) {
            environment.define(this.declaration.params[x].lexeme, args[x]);
        }

        interpreter.executeBlock(this.declaration.body, environment);
        return null;
    }

    public toString() {
        return `<fn ${this.declaration.name.lexeme}>`;
    }
}