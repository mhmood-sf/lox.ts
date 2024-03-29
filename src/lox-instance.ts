import { LoxClass } from "./lox-class.ts";
import { LoxLiteral, Token } from "./token.ts";
import { RuntimeError } from "./runtime-error.ts";

export class LoxInstance {
  private _class: LoxClass;
  private fields: Map<string, LoxLiteral> = new Map();

  public constructor(_class: LoxClass) {
    this._class = _class;
  }

  public get(name: Token): LoxLiteral {
    if (this.fields.has(name.lexeme)) {
      const val = this.fields.get(name.lexeme);
      return val === undefined ? null : val;
    }

    const method = this._class.findMethod(name.lexeme);
    if (method !== null) return method.bind(this);

    throw new RuntimeError(name, `Undefined property ${name.lexeme}.`);
  }

  public set(name: Token, val: LoxLiteral) {
    this.fields.set(name.lexeme, val);
  }

  public toString() {
    return this._class.name + " instance";
  }
}
