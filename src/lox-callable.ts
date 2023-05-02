import { Interpreter } from "./interpreter.ts";
import { LoxLiteral } from "./token.ts";

export interface LoxCallable {
  arity: () => number;
  call: (interpreter: Interpreter, args: LoxLiteral[]) => LoxLiteral;
  toString: () => string;
}
