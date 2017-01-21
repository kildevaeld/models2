
export * from './expression';
import { Visitor, Checker } from './visitor'
import * as Parser from './parser'


export class Validator {

    constructor(public input, private checker: Checker) { }

    validate(input: any) {
       return this.checker(input);
    }

    static create(input: string) {
        let visitor = new Visitor();
        let exp = Parser.parse(input);
        return new Validator(input, visitor.parse(exp));
    }
}