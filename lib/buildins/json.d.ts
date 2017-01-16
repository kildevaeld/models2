import { Item, BaseVisitor } from '../visitor';
import { Description } from '../meta';
export declare class JsonVisitor extends BaseVisitor {
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
