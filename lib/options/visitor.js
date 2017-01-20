"use strict";
const expression_1 = require("./expression");
function isString(a) {
    return typeof a === 'string';
}
function isBoolean(a) {
    return typeof a === 'boolean';
}
function isNumber(a) {
    return typeof a === 'number';
}
function checkArgument() {
    var slice = Array.prototype.slice;
    var args = slice.call(arguments);
    return function (arg) {
        for (var i = 0, len = args.length; i < len; i++) {
            if (args[i](arg))
                return true;
        }
        return false;
    };
}
class Visitor {
    parse(exp) {
        return new Function(`return ${this.visit(exp)}`);
    }
    visit(exp) {
        switch (exp.nodeType) {
            case expression_1.NodeType.Argument: return this.visitArgument(exp);
            case expression_1.NodeType.PrimitiveType: return this.visitPrimitive(exp);
            case expression_1.NodeType.ArrayType: return this.visitArray(exp);
            case expression_1.NodeType.ObjectType: return this.visitObject(exp);
            case expression_1.NodeType.TypedObjectType: return this.visitTypedObject(exp);
        }
    }
    visitArgument(exp) {
        let checkers = exp.types.map(m => this.visit(m));
        return `(${checkArgument.toString()})(${checkers.join(', ')});`;
    }
    visitPrimitive(exp) {
        switch (exp.type) {
            case expression_1.PrimitiveType.String: return isString.toString();
            case expression_1.PrimitiveType.Number: return isNumber.toString();
            case expression_1.PrimitiveType.Boolean: return isBoolean.toString();
        }
    }
    visitArray(exp) {
        return "";
    }
    visitObject(exp) {
        return "";
    }
    visitTypedObject(exp) {
        return "";
    }
}
exports.Visitor = Visitor;
