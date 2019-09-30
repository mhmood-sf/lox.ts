import { LoxCallable } from "./lox-callable";
import { LoxInstance } from './lox-instance';

export class LoxClass implements LoxCallable {
    public name: string;

    public constructor(name: string) {
        this.name = name;
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
