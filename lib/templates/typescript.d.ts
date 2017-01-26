import { BaseVisitor, Description } from '../visitor';
import { PackageExpression, RecordExpression, AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression, RecordTypeExpression } from '../expressions';
export declare class TypescriptVisitor extends BaseVisitor {
    imports: {
        [key: string]: Set<string>;
    };
    parse(item: PackageExpression): string;
    visitPackage(item: PackageExpression): any;
    visitRecord(item: RecordExpression): any;
    visitProperty(item: PropertyExpression): any;
    visitAnnotation(item: AnnotationExpression): any;
    visitType(item: TypeExpression): any;
    visitImportType(item: ImportTypeExpression): any;
    visitRecordType(expression: RecordTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitMapType(expression: MapTypeExpression): any;
}
export declare const Meta: Description;
