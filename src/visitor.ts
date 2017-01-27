import * as fs from 'mz/fs';
import * as Path from 'path';
import * as _ from 'lodash';

import { Token } from './tokens';
import * as Parser from './models';

import {
    Expression, PackageExpression, ImportExpression, RecordExpression,
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression,
    RepeatedTypeExpression, OptionalTypeExpression,
    MapTypeExpression, ExpressionPosition, ImportedPackageExpression, RecordTypeExpression,
    ServiceExpression, MethodExpression, AnonymousRecordExpression
} from './expressions';


import { Validator } from './options'

export interface VisitorOptions {
    split: boolean;
    file: string;
}

export interface Result {
    name: string;
    data: Buffer;
}

export interface AnnotationDescriptions {
    records?: { [key: string]: AnnotationDescription };
    properties?: { [key: string]: AnnotationDescription };
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
    constructor(public message: string, public errors: any = []) {
        super(message);
        this.name = 'ValidationError';
    }

    toJSON() {

        return {
            name: this.name,
            message: this.message,
            errors: this.errors.map(e => {
                if (e && typeof e.toJSON === 'function') {
                    return e.toJSON();
                }
                return { message: e.message, name: e.name }
            })
        };

    }
}

export interface IVisitor {
    visit(expression: Expression): any;
    //visitImport(expression: ImportExpression): any;
    visitPackage(expression: PackageExpression): any;
    visitRecordType(expression: RecordTypeExpression): any
    visitRecord(expression: RecordExpression): any;
    visitProperty(expression: PropertyExpression): any;
    visitType(expression: TypeExpression): any;
    visitImportType(expression: ImportTypeExpression): any;
    visitOptionalType(expression: OptionalTypeExpression): any;
    visitRepeatedType(expression: RepeatedTypeExpression): any;
    visitMapType(expression: MapTypeExpression): any;
    visitAnnotation(expression: AnnotationExpression): any

    visitService(expression: ServiceExpression): any;
    visitMethod(expression: MethodExpression): any;
    visitAnonymousRecord(expression: AnonymousRecordExpression): any;
}

export abstract class BaseVisitor implements IVisitor {

    constructor(public options?: VisitorOptions) { }


    visit(expression: Expression): any {

        switch (expression.nodeType) {
            case Token.Package: return this.visitPackage(expression as PackageExpression);
            case Token.Record: return this.visitRecord(expression as RecordExpression);
            case Token.Property: return this.visitProperty(expression as PropertyExpression);
            //case Token.Import: return this.visitImport(expression as ImportExpression);
            case Token.RecordType: return this.visitRecordType(expression as RecordTypeExpression);
            case Token.PrimitiveType: return this.visitType(expression as TypeExpression);
            case Token.ImportType: return this.visitImportType(expression as ImportTypeExpression);
            case Token.OptionalType: return this.visitOptionalType(expression as OptionalTypeExpression);
            case Token.RepeatedType: return this.visitRepeatedType(expression as RepeatedTypeExpression);
            case Token.MapType: return this.visitMapType(expression as MapTypeExpression);
            case Token.Annotation: return this.visitAnnotation(expression as AnnotationExpression);

            case Token.Service: return this.visitService(expression as ServiceExpression);
            case Token.Method: return this.visitMethod(expression as MethodExpression);
            case Token.AnonymousRecord: return this.visitAnonymousRecord(expression as AnonymousRecordExpression);
        }

    }

    visitRecordType(expression: RecordTypeExpression): any {
        return expression.name;
    }

    //abstract visitImport(expression: ImportExpression): any;
    abstract visitPackage(expression: PackageExpression): any;
    abstract visitRecord(expression: RecordExpression): any;
    abstract visitProperty(expression: PropertyExpression): any;
    abstract visitType(expression: TypeExpression): any;
    abstract visitImportType(expression: ImportTypeExpression): any;
    abstract visitOptionalType(expression: OptionalTypeExpression): any;
    abstract visitRepeatedType(expression: RepeatedTypeExpression): any;
    abstract visitMapType(expression: MapTypeExpression): any;
    abstract visitAnnotation(expression: AnnotationExpression): any

    visitService(_: ServiceExpression): any {

    }

    visitMethod(_: MethodExpression): any {

    }

    visitAnonymousRecord(_: AnonymousRecordExpression): any {

    }

}


export class AnnotationValidationError extends Error {
    constructor(public message: string, public location: ExpressionPosition, public expected: string, public found: string) {
        super(message);
        this.name = 'AnnotationValidationError';
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            location: this.location,
            found: this.found,
            expected: this.expected
        };
    }
}

export interface PreprocessOptions {
    /**
     * Annotation validators for records
     */
    records?: { [key: string]: Validator };
    /**
     * Annotation validators for properties
     */
    properties?: { [key: string]: Validator };
    /**
     * Current file path
     */
    fileName: string;
}

// Validate Record types
// Validate Services
export class Preprocessor {
    parent: string;
    previousParent: string
    async parse(item: Expression, options: PreprocessOptions) {
        let e = await this.process(item, options)
        //this.validateImportTypes(e);

        this.validate(e, options);
        return e;
    }


    private async process(item: Expression, options: PreprocessOptions): Promise<ImportedPackageExpression> {
        if (!item) return null;


        if (item.nodeType !== Token.Package) {
            throw new Error('Expression not a package');
        }

        let e = item as ImportedPackageExpression;
        e.imports = [];

        let children = [];
        for (let i = 0, len = e.children.length; i < len; i++) {
            let child = e.children[i];
            if (child.nodeType !== Token.Import) {
                children.push(child)
                continue
            }

            e.imports.push(await this.import(child as ImportExpression, options));
        }
        e.children = children;
        e.fileName = options.fileName;
        return e;
    }

    private detectCircularDependencies(path: string) {
        if (this.previousParent == path) {
            let e = `circle dependencies detected: ${Path.basename(path)} and ${Path.basename(this.parent)} depends on eachother`;
            throw new Error(e);
        }
        this.previousParent = this.parent
        this.parent = path;
    }


    private async import(item: ImportExpression, options: PreprocessOptions): Promise<ImportedPackageExpression> {
        let dirName = Path.dirname(options.fileName);
        let path = Path.resolve(dirName, item.path + ".record");

        this.detectCircularDependencies(path);

        let data = await fs.readFile(path);

        let ast: PackageExpression = Parser.parse(data.toString());
        if (!(ast instanceof PackageExpression)) {
            throw Error('ERROR');
        }

        let o = Object.assign({}, options, {
            fileName: path
        });

        let p: ImportedPackageExpression = await this.parse(ast, o);

        return p;

    }

    private getInner(exp: PropertyExpression) {
        switch (exp.type.nodeType) {
            case Token.ImportType:
            case Token.MapType:
            case Token.RecordType:
            case Token.PrimitiveType: return exp.type;
            default: return this.getInner(exp.type as PropertyExpression);
        }
    }

    private validate(item: PackageExpression, options?: PreprocessOptions) {
        let imports = this.getImports(item);
        let models = this.getModels(item);

        let errors: Error[] = [];
        for (let model of models) {
            errors.push(...this.validateModel(model, imports, options));
        }

        if (errors.length) {
            throw new ValidationError("errors", errors);
        }
    }

    private validateModel(record: RecordExpression, imports: string[][], options?: PreprocessOptions) {
        let errors: Error[] = [];
        if (options) {
            let e = this.validateAnnotations(record, options);
            if (e.length) errors.push(...e);
        }

        for (let prop of record.properties) {
            if (options) {
                errors.push(...this.validateAnnotations(prop, options))
            }

            errors.push(...this.validateImport(prop, imports));
        }

        return errors;

    }

    private validateAnnotations(item: RecordExpression | PropertyExpression, options: PreprocessOptions) {

        let annotations = item.annotations;
        let isRecord = item.nodeType === Token.Record;

        let checkers = (isRecord ? options.records : options.properties) || {};
        let errors: Error[] = [];
        for (let a of annotations) {
            if (!checkers[a.name]) {
                continue;
            }

            if (!checkers[a.name].validate(a.args)) {
                errors.push(new AnnotationValidationError(`Invalid annotation argument for ${a.name} on ${item.name}`, a.position, checkers[a.name].input, typeof a.args));
            }
        }


        return errors;
    }

    private validateImport(item: PropertyExpression, imports: string[][]) {

        let type = this.getInner(item)
        if (type.nodeType !== Token.ImportType) return [];

        let found = !!imports.find(m => m[0] == type.packageName && m[1] == type.name);
        if (!found) {
            return [new ValidationError("sted", {
                property: item.name,
                type: type.name,
                position: type.position
            })];
        }
        return [];
    }



    private getModels(item: PackageExpression) {
        return item.children.filter(m => m.nodeType == Token.Record) as RecordExpression[];
    }

    private getImports(item: PackageExpression) {
        let imports = item.imports.map(m => {
            return m.children.filter(mm => mm.nodeType == Token.Record).map(mm => [m.name, (mm as RecordExpression).name]);
        });
        return _.flatten(imports);

    }

}
