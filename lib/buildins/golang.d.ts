import { Item, BaseVisitor, Description } from '../visitor';
export declare class GolangVisitor extends BaseVisitor {
    imports: string[][];
    parse(item: Item): string;
    visitImport(item: Item): any;
    visitPackage(item: Item): any;
    visitRecord(item: Item): any;
    visitProperty(item: Item): any;
    visitAnnotation(item: Item): any;
    visitBuildinType(item: Item): any;
    visitImportType(item: Item): any;
    visitModifier(item: Item): any;
}
export declare const Meta: Description;
