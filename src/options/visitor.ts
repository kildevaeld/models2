
import {NodeType, PrimitiveType, Expression,
  PrimitiveTypeExpression, ArrayTypeExpression, ObjectTypeExpression,
  TypedObjectTypeExpression, ArgumentExpression} from './expression'


function isString(a:any): a is string {
  return typeof a === 'string';
}

function isBoolean(a:any): a is boolean {
  return typeof a === 'boolean';
}

function isNumber(a:any): a is number {
  return typeof a === 'number';
}

interface Checker {
  (a:any): boolean;
}

function checkArgument(): (arg) => boolean {
  var slice = Array.prototype.slice;
  var args = slice.call(arguments);
  return function(arg) {
    for ( var i = 0, len = args.length; i < len; i++ ) {
      if (args[i](arg)) return true;
    }
    return false;
  }
}

function checkArray() {
  var slice = Array.prototype.slice;
  var args = slice.call(arguments);
  return function (args) {
    
  }
}

export class Visitor {

  parse(exp: Expression) {
    return new Function(`return ${this.visit(exp)}`);
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
    return `(${checkArgument.toString()})(${checkers.join(', ')});`
  }

  visitPrimitive(exp: PrimitiveTypeExpression) {
    switch (exp.type) {
      case PrimitiveType.String: return isString.toString();
      case PrimitiveType.Number: return isNumber.toString();
      case PrimitiveType.Boolean: return isBoolean.toString();
    }
  }

  visitArray(exp: ArrayTypeExpression) {
    return ""
  }

  visitObject(exp: ObjectTypeExpression) {
    return ""
  }

  visitTypedObject(exp:TypedObjectTypeExpression) {
    return "";
  }
}
