/// <reference types="node" />
import { Token } from './tokens';
export declare type Item = [Token, any, any];
export declare type Package = [Token, string, Item[]];
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
    run(item: Item, options: VisitorOptions): Promise<Result[]>;
}
export declare class ValidationError extends Error {
    message: string;
    errors: any;
    constructor(message: string, errors: any);
}
export interface IVisitor {
    visit(item: Item): any;
    visitImport(item: Item): any;
    visitPackage(item: Item): any;
    visitRecord(item: Item): any;
    visitProperty(item: Item): any;
    visitBuildinType(item: Item): any;
    visitImportType(item: Item): any;
    visitModifier(item: Item): any;
}
export declare abstract class BaseVisitor implements IVisitor {
    options: VisitorOptions;
    constructor(options?: VisitorOptions);
    parse(item: Item): any;
    visit(item: Item): any;
    abstract visitImport(item: Item): any;
    abstract visitPackage(item: Item): any;
    abstract visitRecord(item: Item): any;
    abstract visitProperty(item: Item): any;
    abstract visitBuildinType(item: Item): any;
    abstract visitImportType(item: Item): any;
    abstract visitModifier(item: Item): any;
}
export declare class Preprocessor {
    parse(item: Item): Promise<[Token, any, any]>;
    private process(item);
    private import(item);
    private validateImportTypes(item);
    private getModels(item);
    private getImports(item);
}
