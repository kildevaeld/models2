export * from './expression';
import { Checker } from './visitor';
export declare class Validator {
    input: any;
    private checker;
    constructor(input: any, checker: Checker);
    validate(input: any): boolean;
    static create(input: string): Validator;
}
