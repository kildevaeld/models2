import { BaseVisitor, Description } from '../visitor';
import { Expression, PackageExpression, RecordExpression, AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, RepeatedTypeExpression, OptionalTypeExpression, ExpressionPosition } from '../expressions';
export declare class GolangError extends Error {
    message: string;
    location: ExpressionPosition;
    constructor(message: string, location: ExpressionPosition);
}
export declare class GolangVisitor extends BaseVisitor {
    imports: Set<string>;
    package: string;
    gotags: string[];
    getAnnotations(exp: Expression[]): AnnotationExpression[];
    generateTags(name: string, annotations: AnnotationExpression[]): string;
    validateRecordTags(gotags: AnnotationExpression): string[];
    visitPackage(expression: PackageExpression): any;
    visitRecord(expression: RecordExpression): any;
    visitProperty(expression: PropertyExpression): any;
    visitType(expression: TypeExpression): any;
    visitImportType(expression: ImportTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitAnnotation(expression: AnnotationExpression): any;
}
export declare const Meta: Description;
