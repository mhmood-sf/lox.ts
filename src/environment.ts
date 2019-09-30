import { LoxLiteral, Token } from './token';
import { RuntimeError } from './runtime-error';
import { LoxCallable } from './lox-callable';

export class Environment {
    private values: Map<string, LoxLiteral | LoxCallable> = new Map();
    private enclosing?: Environment;

    public constructor(enclosing?: Environment) {
        if (enclosing) this.enclosing = enclosing;
    }

    public define(name: string, value: LoxLiteral | LoxCallable) {
        this.values.set(name, value);
    }

    public get(name: Token): LoxLiteral | LoxCallable {
        const value = this.values.has(name.lexeme) ? this.values.get(name.lexeme) : undefined;

        if (value !== undefined) return value;

        else if (this.enclosing) return this.enclosing.get(name);

        else throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }

    // Takes name: Token instead of name: string like in the book
    // so that I can throw a RuntimeError instead of a normal Error
    // for consistency.
    public getAt(distance: number, name: Token) {
        const ancestor = this.ancestor(distance);
        if (ancestor) {
            const val = ancestor.values.get(name.lexeme);
            return val === undefined ? null : val;
        } else {
            // Ignore this part, it'll probably never execute.
            // Probably. :v
            throw new RuntimeError(name, `Cannot access unresolved variable '${name.lexeme}'.`);
        }
    }

    private ancestor(distance: number) {
        let environment: Environment | undefined = this;
        for (let i = 0; i < distance; i++) {
            environment = environment && environment.enclosing;
        }
        return environment;
    }

    public assign(name: Token, value: LoxLiteral) {
        if (this.values.has(name.lexeme)) this.values.set(name.lexeme, value);

        else if (this.enclosing) this.enclosing.assign(name, value);

        else throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }

    public assignAt(distance: number, name: Token, value: LoxLiteral) {
        const ancestor = this.ancestor(distance);
        if (ancestor) {
            ancestor.values.set(name.lexeme, value);
        } else {
            // Again, ignore. :v
            throw new Error(`Cannot access unresolved variable '${name.lexeme}'.`);
        }
    }
}
