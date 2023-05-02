import { LoxCallable } from "./lox-callable.ts";
import { LoxInstance } from "./lox-instance.ts";
import { LoxFunction } from "./lox-function.ts";
import { Interpreter } from "./interpreter.ts";
import { LoxLiteral } from "./token.ts";

export class LoxClass implements LoxCallable {
  public name: string;
  private methods: Map<string, LoxFunction>;
  private superclass: LoxClass | null;

  public constructor(
    name: string,
    superclass: LoxClass | null,
    methods: Map<string, LoxFunction>,
  ) {
    this.name = name;
    this.methods = methods;
    this.superclass = superclass;
  }

  public findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) {
      const method = this.methods.get(name);
      return method === undefined ? null : method;
    }

    if (this.superclass !== null) {
      return this.superclass.findMethod(name);
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
    return this.name;
  }

  public arity() {
    const initializer = this.findMethod("init");
    if (initializer === null) return 0;
    return initializer.arity();
  }
}
