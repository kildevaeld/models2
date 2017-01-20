
import {ExpressionPosition} from '../expressions'
import * as _ from 'lodash';

export enum NodeType {
  Argument = 1, PrimitiveType, ArrayType, ObjectType, TypedObjectType
}

export enum PrimitiveType {
  String = 1, Number, Boolean
}

export abstract class Expression {
  abstract nodeType: NodeType;
  toJSON() {
      return _.omit(this, 'location')
  }

  static createArgument(location:ExpressionPosition, args: any[]) {
    return new ArgumentExpression(location, args[0]);
  }

  static createPrimitive(location:ExpressionPosition, args:any[]) {
    return new PrimitiveTypeExpression(location, args[0]);
  }
  static createArray(location:ExpressionPosition, args:any[]) {
    return new ArrayTypeExpression(location, args);
  }
  static createObject(location:ExpressionPosition, args:any[]) {
    return new ObjectTypeExpression(location, args[0], args[1]);
  }

  static createTypedObject(location:ExpressionPosition, args:any[]) {
    return new TypedObjectTypeExpression(location, args[0]);
  }
}

export class ArgumentExpression extends Expression {
  nodeType = NodeType.Argument;
  constructor(public location:ExpressionPosition, public types: Expression[]) {
    super();
  }
}

export class PrimitiveTypeExpression extends Expression {
  nodeType = NodeType.PrimitiveType;
  constructor(public location:ExpressionPosition, public type: PrimitiveType) {
    super();
  }
}

export class ArrayTypeExpression extends Expression {
  nodeType = NodeType.ArrayType;
  constructor(public location:ExpressionPosition, public type: Expression[]) {
    super();
  }
}

export class ObjectTypeExpression extends Expression {
  nodeType = NodeType.ObjectType;
  constructor(public location:ExpressionPosition, public key: Expression, public value:Expression[]) {
    super();
  }
}

export class TypedObjectTypeExpression extends Expression {
  nodeType = NodeType.TypedObjectType;
  constructor(public location:ExpressionPosition, public properties:Expression[]) {
    super();
  }
}

export function createExpression(type: NodeType, location: ExpressionPosition, ...args): Expression {
    switch (type) {
        case NodeType.Argument: return Expression.createArgument(location, args)
        case NodeType.PrimitiveType: return Expression.createPrimitive(location, args);
        case NodeType.ObjectType: return Expression.createObject(location, args);
        case NodeType.TypedObjectType: return Expression.createTypedObject(location, args);
        case NodeType.ArrayType: return Expression.createArray(location, args);
    }
}
