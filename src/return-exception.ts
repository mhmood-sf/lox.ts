import { LoxLiteral } from "./token.ts";

export class ReturnException {
  public value: LoxLiteral;

  public constructor(value: LoxLiteral) {
    this.value = value;
  }
}
