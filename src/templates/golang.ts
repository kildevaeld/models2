
import * as Path from 'path'
import { BaseVisitor, Description, VisitorOptions, Result } from '../visitor';
import { Type , Token} from '../tokens';
import { isString, isStringArray } from '../utils';
import {
    Expression, PackageExpression, RecordExpression,
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression,
    RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression, 
    ExpressionPosition, AnnotatedExpression
} from '../expressions';

import * as _ from 'lodash'

export class GolangError extends Error {
    constructor(public message: string, public location: ExpressionPosition) {
        super(message);
    }
}

function ucFirst(name: string) {
    return _.upperFirst(_.camelCase(name))
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

function toString(input) {

    let result: Result[] = []

    for (let o of input) {
        let i = [];
        for (let ip of o.imports) {
            i.push(`  "${ip}"`);
        }

        let builder = "package " + o.package + '\n';

        if (i.length) {
            builder += `\nimport (\n${i.join('\n')}\n)\n`;
        }

        result.push({
            name: o.name,
            data: new Buffer(builder + "\n" + o.body)
        })
    }

    return result;
}

const Indention = '  ';


export class GolangVisitor extends BaseVisitor {
    imports: Set<string>;
    package: string;
    gotags: string[]


    parse(expression: PackageExpression): Result[] {
        let out = this.visit(expression);
        if (!this.options.split) {
            out = [{
                imports: arrayToSet(...out.map(m => m.imports)),
                body: out.map(m => m.body).join('\n\n'),
                name: this.options.file,
                package: this.package
            }]
        }

        return toString(out)
    }

    private generateTags(name: string, exp: AnnotatedExpression) {
        let gotags: any = exp.get('gotags')||this.gotags;
        
        let tagStr = '';
        if (gotags) {
            if (isStringArray(gotags)) {
                gotags = gotags.map(m => `${m}:"${name},omitempty"`);
            } else if (typeof gotags === 'object') {
                let tmp = [];
                for (let key in gotags) {
                    tmp.push(`${key}:"${gotags[key]}"`);
                }
                gotags = tmp;
            }

            if (gotags.length)
                tagStr = "`" + gotags.join(' ') + "`"
        }

        return tagStr;
    }


    visitPackage(expression: PackageExpression): any {
       
        this.package = expression.name;
        /*for (let child of expression.children) {
            out.push(this.visit(child));
        }*/
        let out = expression.children.filter(m => m.nodeType === Token.Record)
        .map(m => this.visit(m));

        return out;
    }

    visitRecord(expression: RecordExpression): any {

        this.gotags = [];
        this.imports = new Set();
        

        let gotags = expression.get('gotags')
        if (gotags) {
            this.gotags = Array.isArray(gotags) ? gotags : [gotags];
        }

        let comment: any = expression.get('doc');
        comment = comment ? '// ' + comment + '\n' : ''

        let properties = [];
        for (let property of expression.properties) {
            properties.push(this.visit(property));
        }

        let builder = comment + `type ${ucFirst(expression.name)} struct {\n`;
        for (let p of properties) {
            builder += Indention + p + '\n'
        }
        builder += '}'

        return {
            package: this.package,
            name: expression.name.toLowerCase() + '.go',
            body: builder,
            imports: [...this.imports]
        };

    }
    visitProperty(expression: PropertyExpression): any {
        
        let name = expression.name;
        let tags = this.generateTags(name, expression);
        let type = this.visit(expression.type);
        let isPointer = !!expression.get("gopointer")
        let comment: any = expression.get('doc');
        comment = comment ? '// ' + comment + '\n' + Indention : ''


        return `${comment}${ucFirst(name)} `
            + (isPointer ? '*' : '') + type + " " + tags
    }

    visitType(expression: TypeExpression): any {
        switch (expression.type) {
            case Type.Date:
                this.imports.add('time')
                return "time.Time"
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

    visitMapType(expression: MapTypeExpression): any {
        let key = this.visit(expression.key);
        let value = this.visit(expression.value);
        return `map[${key}]${value}`;
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
                arguments: '[string]|string',
                description: "Generate struct tags on all fields"
            },
            doc: {
                arguments: "string",
                description: "Generate documenting comments"
            }
        },
        properties: {
            gotags: {
                arguments: '[string]|{string}'
            },
            gopointer: {
                arguments: "boolean"
            },
            doc: {
                arguments: "string"
            }
        }
    },
    run: (item: Expression, options: VisitorOptions): Promise<Result[]> => {
        let visitor = new GolangVisitor(options);
        let json = visitor.parse(item as PackageExpression);

        return Promise.resolve(json);
    }
}
