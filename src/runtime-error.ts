import { Token } from "./token.ts";

export class RuntimeError extends Error {
  public token: Token;

  constructor(token: Token, msg: string) {
    super(msg);
    this.token = token;
  }
}
