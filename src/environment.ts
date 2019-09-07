import { LoxValue, Token } from './token';
import { RuntimeError } from './runtime-error';

export class Environment {
    private values: Map<string, LoxValue> = new Map();

    public define(name: string, value: LoxValue) {
        this.values.set(name, value);
    }

    public get(name: Token) {
        const value: LoxValue | undefined = this.values.get(name.lexeme);
        if (value !== undefined) return value;

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }

    public assign(name: Token, value: LoxValue) {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
        } else {
        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
        }
    }
}
