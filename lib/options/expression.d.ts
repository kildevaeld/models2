import { ExpressionPosition } from '../expressions';
export declare enum NodeType {
    Argument = 1,
    PrimitiveType = 2,
    ArrayType = 3,
    ObjectType = 4,
    TypedObjectType = 5,
}
export declare enum PrimitiveType {
    String = 1,
    Number = 2,
    Boolean = 3,
}
export declare abstract class Expression {
    abstract nodeType: NodeType;
    toJSON(): {};
    static createArgument(location: ExpressionPosition, args: any[]): ArgumentExpression;
    static createPrimitive(location: ExpressionPosition, args: any[]): PrimitiveTypeExpression;
    static createArray(location: ExpressionPosition, args: any[]): ArrayTypeExpression;
    static createObject(location: ExpressionPosition, args: any[]): ObjectTypeExpression;
    static createTypedObject(location: ExpressionPosition, args: any[]): TypedObjectTypeExpression;
}
export declare class ArgumentExpression extends Expression {
    location: ExpressionPosition;
    types: Expression[];
    nodeType: NodeType;
    constructor(location: ExpressionPosition, types: Expression[]);
}
export declare class PrimitiveTypeExpression extends Expression {
    location: ExpressionPosition;
    type: PrimitiveType;
    nodeType: NodeType;
    constructor(location: ExpressionPosition, type: PrimitiveType);
}
export declare class ArrayTypeExpression extends Expression {
    location: ExpressionPosition;
    types: Expression[];
    nodeType: NodeType;
    constructor(location: ExpressionPosition, types: Expression[]);
}
export declare class ObjectTypeExpression extends Expression {
    location: ExpressionPosition;
    types: ArgumentExpression;
    nodeType: NodeType;
    constructor(location: ExpressionPosition, types: ArgumentExpression);
}
export declare class TypedObjectTypeExpression extends Expression {
    location: ExpressionPosition;
    properties: {
        name: string;
        type: Expression;
    };
    nodeType: NodeType;
    constructor(location: ExpressionPosition, properties: {
        name: string;
        type: Expression;
    });
}
export declare function createExpression(type: NodeType, location: ExpressionPosition, ...args: any[]): Expression;
