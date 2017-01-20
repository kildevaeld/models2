import { Expression, PrimitiveTypeExpression, ArrayTypeExpression, ObjectTypeExpression, TypedObjectTypeExpression, ArgumentExpression } from './expression';
export declare class Visitor {
    parse(exp: Expression): Function;
    visit(exp: Expression): any;
    visitArgument(exp: ArgumentExpression): any;
    visitPrimitive(exp: PrimitiveTypeExpression): string;
    visitArray(exp: ArrayTypeExpression): string;
    visitObject(exp: ObjectTypeExpression): string;
    visitTypedObject(exp: TypedObjectTypeExpression): string;
}
