/// <reference types="node" />
import { Expression, PackageExpression, ImportExpression, RecordExpression, AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, RepeatedTypeExpression, OptionalTypeExpression } from './expressions';
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
    constructor(message: string, errors: any);
}
export interface IVisitor {
    visit(expression: Expression): any;
    visitImport(expression: ImportExpression): any;
    visitPackage(expression: PackageExpression): any;
    visitRecord(expression: RecordExpression): any;
    visitProperty(expression: PropertyExpression): any;
    visitType(expression: TypeExpression): any;
    visitImportType(expression: ImportTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitAnnotation(expression: AnnotationExpression): any;
}
export declare abstract class BaseVisitor implements IVisitor {
    options: VisitorOptions;
    constructor(options?: VisitorOptions);
    visit(expression: Expression): any;
    abstract visitImport(expression: ImportExpression): any;
    abstract visitPackage(expression: PackageExpression): any;
    abstract visitRecord(expression: RecordExpression): any;
    abstract visitProperty(expression: PropertyExpression): any;
    abstract visitType(expression: TypeExpression): any;
    abstract visitImportType(expression: ImportTypeExpression): any;
    abstract visitOptionalType(expression: OptionalTypeExpression): any;
    abstract visitRepeatedType(expression: RepeatedTypeExpression): any;
    abstract visitAnnotation(expression: AnnotationExpression): any;
}
export declare class Preprocessor {
    parse(item: Expression): Promise<Expression>;
    private process(item);
    private import(item);
    private validateImportTypes(item);
    private getModels(item);
    private getImports(item);
}
