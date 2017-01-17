import * as fs from 'mz/fs';
import * as Path from 'path';
import * as _ from 'lodash';

import { Token } from './tokens';
import * as Parser from './models';

export type Item = [Token, any, any];
export type Package = [Token, string, Item[]];

export interface VisitorOptions {
    split: boolean;
    file: string;
}

export interface Result {
    name: string;
    data: Buffer;
}

export interface AnnotationDescriptions {
    records?: {[key:string]: AnnotationDescription};
    properties?: {[key:string]: AnnotationDescription};
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
    run(item: Item, options: VisitorOptions): Promise<Result[]>
}

export class ValidationError extends Error {
    constructor(public message: string, public errors: any) {
        super(message);
    }
}

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
    //visitAnnotation(item: Item): any;
    visitModifier(item: Item): any;
}

export abstract class BaseVisitor implements IVisitor {

    constructor(public options?: VisitorOptions) { }

    public parse(item: Item): any {
        return this.visit(item);
    }

    visit(item: Item): any {

        switch (item[0]) {
            case Token.Package: return this.visitPackage(item);
            case Token.Record: return this.visitRecord(item);
            case Token.Property: return this.visitProperty(item);
            //case Token.Annotation: return this.visitAnnotation(item);
            case Token.Import: return this.visitImport(item);
            case Token.BuildinType: return this.visitBuildinType(item);
            case Token.ImportType: return this.visitImportType(item);
            case Token.Modifier: return this.visitModifier(item);
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
    //abstract visitAnnotation(item: Item): any;
    abstract visitBuildinType(item: Item): any;
    abstract visitImportType(item: Item): any;
    abstract visitModifier(item: Item): any;

}


export class Preprocessor {

    async parse(item: Item) {
        item = await this.process(item)
        this.validateImportTypes(item);
        return item;
    }

    private async process(item: Item) {
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

    private async import(item: Item) {

        let path = Path.resolve(item[1] + ".record");

        let data = await fs.readFile(item[1] + ".record");
        let ast = Parser.parse(data.toString());

        let out = await this.parse(ast);
        let i = [Token.Import, [out[1], path]];
        i[2] = out[2];
        return i;
    }

    private async validateImportTypes(item: Item) {

        let children = item[2];
        let imports = this.getImports(item);
        let models = this.getModels(item);

        let errors = [];
        for (let model of models) {

            let importTypes = model[2].map(m => {
                if (m[0] == Token.Property) return m;
                return m[2];
            }).filter(m => m[2][0] == Token.ImportType);

            for (let prop of importTypes) {
                let type = prop[2];

                let found = imports.find(m => m[0] == type[1][0] && m[1] == type[1][1]);
                if (!found) {
                    errors.push({
                        property: prop[1],
                        type: type[1]
                    });
                }
            }
        }

        if (errors.length) {
            throw new ValidationError("Import error", errors);
        }

    }

    private getModels(item: Item) {
        let children = item[2];
        let models = children.filter(m => {
            return m[0] == Token.Record;
        })
        return models;
    }

    private getImports(item: Item) {
        let children = item[2];
        let imports = children.filter(m => {
            return m[0] == Token.Import;
        }).map(m => {
            return m[2].filter(mm => mm[0] == Token.Record).map(mm => [m[1][0], mm[1]]);
        });
        return _.flatten(imports);
    }

}