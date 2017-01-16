import { Item, BaseVisitor } from './visitor';
export declare class JsonVisitor extends BaseVisitor {
    visitPackage(item: Item): any;
    visitRecord(item: Item): any;
    visitProperty(item: Item): any;
    visitAnnotation(item: Item): any;
}
