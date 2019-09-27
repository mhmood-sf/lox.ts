import { LoxLiteral } from './token';

export class ReturnException {
    public value: LoxLiteral;

    public constructor(value: LoxLiteral) {
        this.value = value;
    }
}
