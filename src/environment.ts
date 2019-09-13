import { LoxValue, Token } from './token';
import { RuntimeError } from './runtime-error';

export class Environment {
    private values: Map<string, LoxValue> = new Map();
    private enclosing?: Environment;

    public constructor(enclosing?: Environment) {
        if (enclosing) {
            this.enclosing = enclosing;
        }
    }

    public define(name: string, value: LoxValue) {
        this.values.set(name, value);
    }

    public get(name: Token): LoxValue {
        const value = this.values.has(name.lexeme) ? this.values.get(name.lexeme) : undefined;

        if (value !== undefined) return value;

        else if (this.enclosing) return this.enclosing.get(name);

        else throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }

    public assign(name: Token, value: LoxValue) {
        if (this.values.has(name.lexeme)) this.values.set(name.lexeme, value);

        else if (this.enclosing) this.enclosing.assign(name, value);

        else throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }
}
