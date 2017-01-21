import { Expression, PrimitiveTypeExpression, ArrayTypeExpression, ObjectTypeExpression, TypedObjectTypeExpression, ArgumentExpression } from './expression';
export interface Checker {
    (a: any): boolean;
}
export declare class Visitor {
    parse(exp: Expression): Checker;
    visit(exp: Expression): any;
    visitArgument(exp: ArgumentExpression): any;
    visitPrimitive(exp: PrimitiveTypeExpression): "o.isString" | "o.isNumber" | "o.isBoolean";
    visitArray(exp: ArrayTypeExpression): any;
    visitObject(exp: ObjectTypeExpression): any;
    visitTypedObject(exp: TypedObjectTypeExpression): string;
}
