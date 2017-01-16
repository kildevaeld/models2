import { Token } from './tokens';
export declare type Item = [Token, string, any];
export declare type Package = [Token, string, Item[]];
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
    visitAnnotation(item: Item): any;
    visitModifier(item: Item): any;
}
export declare abstract class BaseVisitor implements IVisitor {
    parse(item: Item): any;
    visit(item: Item): any;
    abstract visitImport(item: Item): any;
    abstract visitPackage(item: Item): any;
    abstract visitRecord(item: Item): any;
    abstract visitProperty(item: Item): any;
    abstract visitAnnotation(item: Item): any;
    abstract visitBuildinType(item: Item): any;
    abstract visitImportType(item: Item): any;
    abstract visitModifier(item: Item): any;
}
export declare class Preprocessor {
    parse(item: Item): Promise<[Token, string, any]>;
    private process(item);
    private import(item);
    private validateImportTypes(item);
    private getModels(item);
    private getImports(item);
}
