import * as fs from 'mz/fs';
import * as Path from 'path';

import { Token } from './tokens';
import * as Parser from './models';
export type Item = [Token, string, any];

function isArray(a: any): a is Item[] {
    return Array.isArray(a);
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
}

export abstract class BaseVisitor implements IVisitor {

    public parse(item: Item): any {
        return this.visit(item);
    }

    public visit(item: Item): any {

        switch (item[0]) {
            case Token.Package: return this.visitPackage(item);
            case Token.Record: return this.visitRecord(item);
            case Token.Property: return this.visitProperty(item);
            case Token.Annotation: return this.visitAnnotation(item);
            case Token.Import: return this.visitImport(item);
            case Token.BuildinType: return this.visitBuildinType(item);
            case Token.ImportType: return this.visitImportType(item);

            default:
                if (isArray(item)) {
                    return item.map(i => this.visit(i));
                }
                throw new Error("not a type" + item);
        }

    }

    abstract visitImport(item: Item): any;
    abstract visitPackage(item: Item): any;
    abstract visitRecord(item: Item): any;
    abstract visitProperty(item: Item): any;
    abstract visitAnnotation(item: Item): any;
    abstract visitBuildinType(item: Item): any;
    abstract visitImportType(item: Item): any;

}


export class Preprocessor {

    async process(item: Item) {
        if (!item) return null;
        switch (item[0]) {
            case Token.Package:
                item[2] = await Promise.all(item[2].map(i => this.process(i)));
                if (item[2].length == 1 && item[2][0] == null) {
                    item[2] = [];
                }
                return item;
            case Token.Import:
                return await this.import(item);
            default:
                return item;
        }

    }

    async import(item: Item) {

        let path = Path.resolve(item[1] + ".model");

        let data = await fs.readFile(item[1] + ".model");
        let ast = Parser.parse(data.toString());

        let out = await this.process(ast);
        let i = [Token.Import, [out[1], path]];
        i[2] = out[2];
        return i;
    }

}