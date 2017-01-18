
import * as Path from 'path'
import { BaseVisitor, Description, VisitorOptions, Result } from '../visitor';
import { Type, Modifier, Token } from '../tokens';
import { isString, isStringArray } from '../utils';
import {
    Expression, PackageExpression, ImportExpression, RecordExpression,
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression,
    RepeatedTypeExpression, OptionalTypeExpression, ExpressionPosition
} from '../expressions';


export class GolangError extends Error {
    constructor(public message: string, public location: ExpressionPosition) {
        super(message);
    }
}

function ucFirst(name: string) {
    return name[0].toUpperCase() + name.substr(1)
}



function setToArray(set: Set<String>) {
    let out = [];
    for (let str of set) {
        out.push(str);
    }
    return out;
}

function arrayToSet(...arrays: string[]) {
    let out = new Set<string>()
    for (let array of arrays) {
        for (let item of array) {
            out.add(item)
        }
    }
    return out;
}

const Indention = '  ';


export class GolangVisitor extends BaseVisitor {
    imports: Set<string>;
    package: string;
    gotags: string[]

    getAnnotations(exp: Expression[]): AnnotationExpression[] {
        let annotations: AnnotationExpression[] = [];
        for (let annotation of exp) {
            annotations.push(this.visit(annotation));
        }
        return annotations;
    }

    generateTags(name: string, annotations: AnnotationExpression[]) {
        let gotags: any = this.gotags
        let gotagsAnnotation = annotations.find(m => m.name == 'gotags');
        if (gotagsAnnotation) {
            gotags = gotagsAnnotation.args
        }

        let tagStr = "";
        if (gotags) {
            if (isStringArray(gotags)) {
                gotags = gotags.map(m => `${m}:"${name.toLowerCase()},omitempty"`);
            } else if (typeof gotags === 'object') {
                let tmp = [];
                for (let key in gotags) {
                    tmp.push(`${key}:"${gotags[key]}"`);
                }
                gotags = tmp;
            }

            tagStr = "`" + gotags.join(' ') + "`"
        }

        return tagStr;
    }

    validateRecordTags(gotags: AnnotationExpression): string[]  {
        if (!isStringArray(gotags.args) && !isString(gotags.args)) {
            throw new GolangError("gotags annotation on a record must be an array", gotags.position)
        } else if (isString(gotags.args)) {
            return [gotags.args];
        }

        return gotags.args;
    }

   
    visitPackage(expression: PackageExpression): any {
        let out = [];
        this.package = expression.name;
        for (let child of expression.children) {
            out.push(this.visit(child));
        }
    }
    visitRecord(expression: RecordExpression): any {

        this.gotags = [];

        let annotations = this.getAnnotations(expression.annotations);

        let gotags = annotations.find(m => m.name == 'gotags');
        if (gotags) {
            this.gotags = this.validateRecordTags(gotags);
        }

        let comment: any = annotations.find(m => m.name == 'doc');
        comment = comment ? '// ' + comment.args + '\n' : ''

        let properties = [];
        for (let property of expression.properties) {
            properties.push(this.visit(property));
        }

        let builder = comment + `type ${ucFirst(expression.name)} struct {\n`;
        for (let p of properties) {
            builder += Indention + p + '\n'
        }
        builder += '}'

        console.log(builder)

    }
    visitProperty(expression: PropertyExpression): any {
        let annotations = this.getAnnotations(expression.annotations);

        let name = expression.name;
        let tags = this.generateTags(name, annotations);
        let type = this.visit(expression.type);
        let isPointer = !!annotations.find(m => m.name == 'gopointer')
        let comment: any = annotations.find(m => m.name == 'doc');
        comment = comment ? '// ' + comment.args + '\n' + Indention : ''


        return `${comment}${ucFirst(name)} `
            + (isPointer ? '*' : '') + type + " " + tags
    }
    visitType(expression: TypeExpression): any {
        switch (expression.type) {
            case Type.Date: return "time.Time"
            case Type.Boolean: return "bool"
            case Type.Bytes: return "[]byte"
            default: return Type[expression.type].toLowerCase();
        }
    }
    visitImportType(expression: ImportTypeExpression): any {
        return expression.name
    }
    visitOptionalType(expression: OptionalTypeExpression): any {
        return this.visit(expression.type);
    }
    visitRepeatedType(expression: RepeatedTypeExpression): any {
        return "[]" + this.visit(expression.type);
    }
    visitAnnotation(expression: AnnotationExpression): any {
        return expression;
    }

}

export const Meta: Description = {
    name: "Golang",
    extname: ".go",
    annotations: {
        records: {
            gotags: {
                arguments: '[string]'
            },
            doc: {
                arguments: "string"
            }
        },
        properties: {
            gotags: {
                arguments: '[string] or {key:string}'
            },
            gopointer: {
                arguments: "void"
            },
            doc: {
                arguments: "string"
            }
        }
    },
    run: (item: Expression, options: VisitorOptions): Promise<Result[]> => {
        let visitor = new GolangVisitor(options);
        let json = visitor.visit(item);

        return Promise.resolve(json);
    }
}