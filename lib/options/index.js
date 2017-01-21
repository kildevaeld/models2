"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require("./expression"));
const visitor_1 = require("./visitor");
const Parser = require("./parser");
class Validator {
    constructor(input, checker) {
        this.input = input;
        this.checker = checker;
    }
    validate(input) {
        return this.checker(input);
    }
    static create(input) {
        let visitor = new visitor_1.Visitor();
        let exp = Parser.parse(input);
        return new Validator(input, visitor.parse(exp));
    }
}
exports.Validator = Validator;
