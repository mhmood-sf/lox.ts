import { Token } from "./token";

export class RuntimeError extends Error {
    public token: Token;

    constructor(token: Token, msg: string) {
        super(msg);
        this.token = token;
    }
}
