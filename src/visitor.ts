import * as fs from 'mz/fs';
import * as Path from 'path';
import * as _ from 'lodash';

import { Token } from './tokens';
import * as Parser from './models';
import {Expression, PackageExpression, ImportExpression, RecordExpression, 
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression, 
    RepeatedTypeExpression, OptionalTypeExpression } from './expressions';



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
    run(item: Expression, options: VisitorOptions): Promise<Result[]>
}

export class ValidationError extends Error {
    constructor(public message: string, public errors: any) {
        super(message);
    }
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
    visitAnnotation(expression: AnnotationExpression): any 
}

export abstract class BaseVisitor implements IVisitor {

    constructor(public options?: VisitorOptions) { }

   
    visit(expression: Expression): any {

        switch(expression.nodeType) {
            case Token.Package: return this.visitPackage(expression as PackageExpression);
            case Token.Record: return this.visitRecord(expression as RecordExpression);
            case Token.Property: return this.visitProperty(expression as PropertyExpression);
            case Token.Import: return this.visitImport(expression as ImportExpression);
            case Token.BuildinType: return this.visitType(expression as TypeExpression);
            case Token.ImportType: return this.visitImportType(expression as ImportTypeExpression);
            case Token.OptionalType: return this.visitOptionalType(expression as OptionalTypeExpression);
            case Token.RepeatedType: return this.visitRepeatedType(expression as RepeatedTypeExpression);
            case Token.Annotation: return this.visitAnnotation(expression as AnnotationExpression);
        }

    }

    abstract visitImport(expression: ImportExpression): any;
    abstract visitPackage(expression: PackageExpression): any;
    abstract visitRecord(expression: RecordExpression): any;
    abstract visitProperty(expression: PropertyExpression): any;
    abstract visitType(expression: TypeExpression): any;
    abstract visitImportType(expression: ImportTypeExpression): any;
    abstract visitOptionalType(expression: OptionalTypeExpression): any;
    abstract visitRepeatedType(expression: RepeatedTypeExpression): any;
    abstract visitAnnotation(expression: AnnotationExpression): any

}


export class Preprocessor {

    async parse(item: Expression) {
        item = await this.process(item)
        this.validateImportTypes(item);
        return item;
    }

    private async process(item: Expression) {
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

    private async import(item: Expression) {

        let path = Path.resolve(item[1] + ".record");

        let data = await fs.readFile(item[1] + ".record");
        let ast = Parser.parse(data.toString());

        let out = await this.parse(ast);
        let i = [Token.Import, [out[1], path]];
        i[2] = out[2];
        return i;
    }

    private async validateImportTypes(item: Expression) {

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

    private getModels(item: Expression) {
        let children = item[2];
        let models = children.filter(m => {
            return m[0] == Token.Record;
        })
        return models;
    }

    private getImports(item: Expression) {
        let children = item[2];
        let imports = children.filter(m => {
            return m[0] == Token.Import;
        }).map(m => {
            return m[2].filter(mm => mm[0] == Token.Record).map(mm => [m[1][0], mm[1]]);
        });
        return _.flatten(imports);
    }

}