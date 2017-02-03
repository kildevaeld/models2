
import {
  NodeType, PrimitiveType, Expression,
  PrimitiveTypeExpression, ArrayTypeExpression, ObjectTypeExpression,
  TypedObjectTypeExpression, ArgumentExpression
} from './expression'


function isString(a: any): a is string {
  return typeof a === 'string';
}

function isBoolean(a: any): a is boolean {
  return typeof a === 'boolean';
}

function isNumber(a: any): a is number {
  return typeof a === 'number';
}

export interface Checker {
  (a: any): boolean;
}

function checkArgument(): (arg) => boolean {
  var slice = Array.prototype.slice;
  var args = slice.call(arguments);
  return function (arg) {

    for (var i = 0, len = args.length; i < len; i++) {
      if (args[i](arg) === true) return true;
    }
    return false;
  }
}

function check(checkers: Checker[], a: any) {
  for (let check of checkers) {
    if (check(a)) return true;
  }
  return false;
}

function checkArray() {
  var slice = Array.prototype.slice;
  var checkers = slice.call(arguments);
  return function (args) {
    if (!Array.isArray(args)) return false;
    for (let a of args) {
      if (!check(checkers, a)) return false;
    }
    return true;
  }
}

function checkTypedObject(a: { name: string; type: PropertyDescriptor[] }) {
  var slice = Array.prototype.slice;
  return function (args) {
    if (typeof args !== 'object') return false;

  }
}

function checkObject(...checkers: Checker[]) {
  return function (args) {
    if (typeof args !== 'object') return false;
    for (let key in args) {
      if (!check(checkers, args[key])) return false
    }
    return true;
  }
}

export class Visitor {

  parse(exp: Expression): Checker {
    let out = new Function('o', `return ${this.visit(exp)}`)({
      checkArgument, checkArray, checkObject, checkTypedObject,
      isString, isNumber, isBoolean
    });

    return out
  }

  visit(exp: Expression) {
    switch (exp.nodeType) {
      case NodeType.Argument: return this.visitArgument(exp as ArgumentExpression)
      case NodeType.PrimitiveType: return this.visitPrimitive(exp as PrimitiveTypeExpression);
      case NodeType.ArrayType: return this.visitArray(exp as ArrayTypeExpression);
      case NodeType.ObjectType: return this.visitObject(exp as ObjectTypeExpression);
      case NodeType.TypedObjectType: return this.visitTypedObject(exp as TypedObjectTypeExpression);
    }
  }

  visitArgument(exp: ArgumentExpression) {
    let checkers = exp.types.map(m => this.visit(m))
    return `o.checkArgument(${checkers.join(',')})`;
  }

  visitPrimitive(exp: PrimitiveTypeExpression) {
    switch (exp.type) {

      case PrimitiveType.String: return 'o.isString'
      case PrimitiveType.Number: return 'o.isNumber'
      case PrimitiveType.Boolean: return 'o.isBoolean'
    }
  }

  visitArray(exp: ArrayTypeExpression) {
    let checkers = exp.types.map(m => this.visit(m));
    return `o.checkArray(${checkers.join(',')})`;
  }

  visitObject(exp: ObjectTypeExpression) {
    let checkers = exp.types.types.map(m => this.visit(m));
    return `o.checkObject(${checkers.join(',')})`
  }

  visitTypedObject(exp: TypedObjectTypeExpression) {
    return `o.checkTypedObject(${exp.properties})`;
  }
}
