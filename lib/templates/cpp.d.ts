import { BaseVisitor, Description, Result } from '../visitor';
import { PackageExpression, RecordExpression, AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression } from '../expressions';
export declare class CppVisitor extends BaseVisitor {
    imports: Set<string>;
    package: string;
    gotags: string[];
    pointer: boolean;
    getAnnotation(exp: AnnotationExpression[], name: string): any;
    parse(expression: PackageExpression): Promise<Result[]>;
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
