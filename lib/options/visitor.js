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
            if (args[i](arg) === true)
                return true;
        }
        return false;
    };
}
function check(checkers, a) {
    for (let check of checkers) {
        if (check(a))
            return true;
    }
    return false;
}
function checkArray() {
    var slice = Array.prototype.slice;
    var checkers = slice.call(arguments);
    return function (args) {
        if (!Array.isArray(args))
            return false;
        for (let a of args) {
            if (!check(checkers, a))
                return false;
        }
        return true;
    };
}
function checkTypedObject(a) {
    var slice = Array.prototype.slice;
    return function (args) {
        if (typeof args !== 'object')
            return false;
    };
}
function checkObject(...checkers) {
    return function (args) {
        if (typeof args !== 'object')
            return false;
        for (let key in args) {
            if (!check(checkers, args[key]))
                return false;
        }
        return true;
    };
}
class Visitor {
    parse(exp) {
        let out = new Function('o', `return ${this.visit(exp)}`)({
            checkArgument, checkArray, checkObject, checkTypedObject,
            isString, isNumber, isBoolean
        });
        return out;
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
        return `o.checkArgument(${checkers.join(',')})`;
        //return `(${checkArgument.toString()})(${checkers.join(',')})`
    }
    visitPrimitive(exp) {
        switch (exp.type) {
            /*case PrimitiveType.String: return isString.toString();
            case PrimitiveType.Number: return isNumber.toString();
            case PrimitiveType.Boolean: return isBoolean.toString();*/
            case expression_1.PrimitiveType.String: return 'o.isString'; //.toString();
            case expression_1.PrimitiveType.Number: return 'o.isNumber'; //.toString();
            case expression_1.PrimitiveType.Boolean: return 'o.isBoolean'; //.toString();
        }
    }
    visitArray(exp) {
        let checkers = exp.types.map(m => this.visit(m));
        return `o.checkArray(${checkers.join(',')})`;
        //    return `${checkArray.toString()}(${checkers.join(',')})`
    }
    visitObject(exp) {
        let checkers = exp.types.types.map(m => this.visit(m));
        return `o.checkObject(${checkers.join(',')})`;
        //return `${checkArray.toString()}(${checkers.join(',')})`
    }
    visitTypedObject(exp) {
        return `checkTypedObject(${exp.properties})`;
        //return `${checkObject.toString()}(${exp.properties})`;
    }
}
exports.Visitor = Visitor;
