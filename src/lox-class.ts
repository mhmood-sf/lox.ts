import { LoxCallable } from "./lox-callable";
import { LoxInstance } from './lox-instance';
import { LoxFunction } from "./lox-function";
import { Interpreter } from "./interpreter";
import { LoxLiteral } from "./token";

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

    public call(interpreter: Interpreter, args: LoxLiteral[]) {
        const instance = new LoxInstance(this);

        const initializer = this.findMethod("init");
        if (initializer !== null) {
            initializer.bind(instance).call(interpreter, args);
        }

        return instance;
    }

    public toString() {
        return name;
    }

    public arity() {
        const initializer = this.findMethod("init");
        if (initializer === null) return 0;
        return initializer.arity();
    }
}
