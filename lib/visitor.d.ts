/// <reference types="node" />
import { Expression, PackageExpression, RecordExpression, AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, RepeatedTypeExpression, OptionalTypeExpression, MapTypeExpression, ExpressionPosition, RecordTypeExpression, ServiceExpression, MethodExpression, AnonymousRecordExpression } from './expressions';
import { Validator } from './options';
export interface VisitorOptions {
    split: boolean;
    file: string;
}
export interface Result {
    name: string;
    data: Buffer;
}
export interface AnnotationDescriptions {
    records?: {
        [key: string]: AnnotationDescription;
    };
    properties?: {
        [key: string]: AnnotationDescription;
    };
}
export interface AnnotationDescription {
    arguments: string;
    description?: string;
}
export interface Description {
    name: string;
    extname: string;
    description?: string;
    annotations?: AnnotationDescriptions;
    run(item: Expression, options: VisitorOptions): Promise<Result[]>;
}
export declare class ValidationError extends Error {
    message: string;
    errors: any;
    constructor(message: string, errors?: any);
    toJSON(): {
        name: string;
        message: string;
        errors: any;
    };
}
export interface IVisitor {
    visit(expression: Expression): any;
    visitPackage(expression: PackageExpression): any;
    visitRecordType(expression: RecordTypeExpression): any;
    visitRecord(expression: RecordExpression): any;
    visitProperty(expression: PropertyExpression): any;
    visitType(expression: TypeExpression): any;
    visitImportType(expression: ImportTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitMapType(expression: MapTypeExpression): any;
    visitAnnotation(expression: AnnotationExpression): any;
    visitService(expression: ServiceExpression): any;
    visitMethod(expression: MethodExpression): any;
    visitAnonymousRecord(expression: AnonymousRecordExpression): any;
}
export declare abstract class BaseVisitor implements IVisitor {
    options: VisitorOptions;
    constructor(options?: VisitorOptions);
    visit(expression: Expression): any;
    visitRecordType(expression: RecordTypeExpression): any;
    abstract visitPackage(expression: PackageExpression): any;
    abstract visitRecord(expression: RecordExpression): any;
    abstract visitProperty(expression: PropertyExpression): any;
    abstract visitType(expression: TypeExpression): any;
    abstract visitImportType(expression: ImportTypeExpression): any;
    abstract visitOptionalType(expression: OptionalTypeExpression): any;
    abstract visitRepeatedType(expression: RepeatedTypeExpression): any;
    abstract visitMapType(expression: MapTypeExpression): any;
    abstract visitAnnotation(expression: AnnotationExpression): any;
    visitService(_: ServiceExpression): any;
    visitMethod(_: MethodExpression): any;
    visitAnonymousRecord(_: AnonymousRecordExpression): any;
}
export declare class AnnotationValidationError extends Error {
    message: string;
    location: ExpressionPosition;
    expected: string;
    found: string;
    constructor(message: string, location: ExpressionPosition, expected: string, found: string);
    toJSON(): {
        name: string;
        message: string;
        location: ExpressionPosition;
        found: string;
        expected: string;
    };
}
export interface PreprocessOptions {
    records: {
        [key: string]: Validator;
    };
    properties: {
        [key: string]: Validator;
    };
}
export declare class Preprocessor {
    parent: string;
    previousParent: string;
    parse(item: Expression, options?: PreprocessOptions): Promise<PackageExpression>;
    private process(item);
    private detectCircularDependencies(path);
    private import(item);
    private getInner(exp);
    private validate(item, options?);
    private validateModel(record, imports, options?);
    private validateAnnotations(item, options);
    private validateImport(item, imports);
    private getModels(item);
    private getImports(item);
}
