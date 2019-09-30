import { LoxCallable } from "./lox-callable";
import { LoxInstance } from './lox-instance';
import { LoxFunction } from "./lox-function";

export class LoxClass implements LoxCallable {
    public name: string;
    private methods: Map<string, LoxFunction>;

    public constructor(name: string, methods: Map<string, LoxFunction>) {
        this.name = name;
        this.methods = methods;
    }

    public findMethod(name: string) {
        if (this.methods.has(name)) {
            const method = this.methods.get(name);
            return method === undefined ? null : method;
        }
        return null;
    }

    public call() {
        return new LoxInstance(this);
    }

    public toString() {
        return name;
    }

    public arity() {
        return 0;
    }
}
