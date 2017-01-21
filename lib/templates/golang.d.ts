import { BaseVisitor, Description, Result } from '../visitor';
import { PackageExpression, RecordExpression, AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression, ExpressionPosition } from '../expressions';
export declare class GolangError extends Error {
    message: string;
    location: ExpressionPosition;
    constructor(message: string, location: ExpressionPosition);
}
export declare class GolangVisitor extends BaseVisitor {
    imports: Set<string>;
    package: string;
    gotags: string[];
    parse(expression: PackageExpression): Result[];
    private generateTags(name, exp);
    visitPackage(expression: PackageExpression): any;
    visitRecord(expression: RecordExpression): any;
    visitProperty(expression: PropertyExpression): any;
    visitType(expression: TypeExpression): any;
    visitImportType(expression: ImportTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitMapType(expression: MapTypeExpression): any;
    visitAnnotation(expression: AnnotationExpression): any;
}
export declare const Meta: Description;
