import { LoxClass } from "./lox-class";

export class LoxInstance {
    private _class: LoxClass;

    public constructor(_class: LoxClass) {
        this._class = _class;
    }

    public toString() {
        return this._class.name + " instance";
    }
}