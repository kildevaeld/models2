import { Item, BaseVisitor, Description, GenerateOptions } from '../visitor';
export interface JsonPackage {
    package: string;
    children: JsonRecord[];
}
export interface JsonRecord {
    name: string;
}
export declare class JsonVisitor extends BaseVisitor {
    options: GenerateOptions;
    constructor(options: GenerateOptions);
    visitPackage(item: Item): any;
    visitRecord(item: Item): any;
    visitProperty(item: Item): any;
    visitAnnotation(item: Item): any;
    visitBuildinType(item: Item): any;
    visitImportType(item: Item): any;
    visitImport(item: Item): any;
    visitModifier(item: Item): any;
}
export declare const Meta: Description;
