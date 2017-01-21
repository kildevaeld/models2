
import { BaseVisitor, Description, VisitorOptions, Result } from '../visitor';
import { Type, Token } from '../tokens';
import { isString, isStringArray, arrayToSet } from '../utils';
import {
    Expression, PackageExpression, RecordExpression,
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression,
    RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression, ExpressionPosition
} from '../expressions';
import * as _ from 'lodash';
import * as fs from 'mz/fs';
import * as Path from 'path';
import * as hbs from 'handlebars';



interface ParseResult {
    namespace: string;
    imports: string[];
    records: any[];
    filename: string;
}

function recordToString(input, sourceTemplate: HandlebarsTemplateDelegate, headerTemplate: HandlebarsTemplateDelegate) {
    input.imports.sort((a,b) => {
        let ab = a[0] == '<', bb =  b[0] == "<", e = ab === bb;
        return e ? ab[1] > bb[1] : ab < bb;
    })
    
    let header = headerTemplate(input),
        source = sourceTemplate(input);

    return [
        { name: input.filename + '.cpp', data: new Buffer(source) },
        { name: input.filename + '.h', data: new Buffer(header) }
    ]

}

export class CppVisitor extends BaseVisitor {
    imports: Set<string>;
    package: string;
    gotags: string[]
    pointer: boolean;
    getAnnotation(exp: AnnotationExpression[], name: string) {
        let annotation = exp.find(m => m.name === name);
        return annotation ? (annotation.args != null ? annotation.args : true) : null;
    }

    async parse(expression: PackageExpression): Promise<Result[]> {
        let result: ParseResult = this.visit(expression);
        //console.log(JSON.stringify(result, null,2));

        let sourceBuf = await fs.readFile(Path.resolve(__dirname, "../../templates/cpp.c.hbs"));
        let headerBuf = await fs.readFile(Path.resolve(__dirname, "../../templates/cpp.h.hbs"));
        let docBuf = await fs.readFile(Path.resolve(__dirname, "../../templates/cpp.doc.hbs"));
        
        hbs.registerPartial('Document', docBuf.toString());
        let sourceTemplate = hbs.compile(sourceBuf.toString()),
            headerTemplate = hbs.compile(headerBuf.toString());

        let output: Result[];
        if (this.options.split) {
            let records = result.records.map(m => {
                return {
                    name: m.name,
                    filename: m.filename,
                    namespace: m.namespace,
                    records: [m],
                    imports: m.imports
                }
            })

            output = _.flatten(records.map(m => recordToString(m, sourceTemplate, headerTemplate)));
        } else {
            result.imports = [...arrayToSet(...result.records.map(m => m.imports))];
            output = recordToString(result, sourceTemplate, headerTemplate);

        }
        return output
    }


    visitPackage(expression: PackageExpression): any {

        this.package = expression.name;
        let records = expression.children
            .filter(m => m.nodeType == Token.Record).map(m => this.visit(m));

        return {
            namespace: this.package,
            imports: [],
            records: records,
            filename: this.options.file.replace('.cpp', '')
        }
    }

    visitRecord(expression: RecordExpression): any {
        this.imports = new Set();
        return {
            name: expression.name,
            pod: false,
            comment: this.getAnnotation(expression.annotations, 'doc'),
            properties: expression.properties.map(m => this.visit(m)),
            imports: [...this.imports],
            filename: expression.name.toLowerCase(),
            namespace: this.package,
        }

    }
    visitProperty(expression: PropertyExpression): any {
        this.pointer = !!this.getAnnotation(expression.annotations, 'cpppointer')

        let type = this.visit(expression.type)
        type.pointer = this.pointer;
        if (this.pointer) {
            //type.type += '*';
            type.ref = false;
            this.imports.add('<memory>')
        }

        return _.extend({
            name: expression.name,
            comment: expression.get('doc')
        }, type);
    }

    visitType(expression: TypeExpression): any {
        switch (expression.type) {
            case Type.String:
                this.imports.add('<string>');
                return { type: "std::string", ref: true };
            case Type.Boolean: return { type: "bool", ref: false };
            case Type.Bytes:
                this.imports.add('<string>');
                return { type: "std::string", ref: true };
            case Type.Float:
            case Type.Double:
            case Type.Int:
                return { type: Type[expression.type].toLowerCase(), ref: false };
            case Type.Uint:
                return { type: 'unsigned int', ref: false };
            case Type.Date:
                this.imports.add('<ctime>');
                return { type: 'time_t', ref: false };
            default: return { type: "unimplemented", ref: false };
        }
    }

    visitImportType(expression: ImportTypeExpression): any {
        let file = (this.options.split ? expression.name.toLowerCase() + '.h' : expression.packageName + '.h');
        this.imports.add(`"${file}"`);

        return { type: expression.name, ref: true };
    }

    visitOptionalType(expression: OptionalTypeExpression): any {
        return this.visit(expression.type);
    }

    visitRepeatedType(expression: RepeatedTypeExpression): any {
        this.imports.add("<vector>");
        return { type: `std::vector<${this.visit(expression.type).type}>`, ref: true };
    }

    visitMapType(expression: MapTypeExpression): any {
        let key = this.visit(expression.key).type;
        let value = this.visit(expression.value).type;
        this.imports.add('<map>');
        return {
            type: `map<${key},${value}>`,
            ref: true
        }
    }

    visitAnnotation(expression: AnnotationExpression): any {
        return expression;
    }

}

export const Meta: Description = {
    name: "C++",
    extname: ".cpp",
    annotations: {
        records: {
            pod: {
                arguments: 'boolean'
            },
            doc: {
                arguments: "string"
            }
        },
        properties: {
            cpppointer: {
                arguments: "boolean"
            },
            doc: {
                arguments: "string"
            }
        }
    },
    run: async (item: Expression, options: VisitorOptions): Promise<Result[]> => {
        let visitor = new CppVisitor(options);
        let json = await visitor.parse(item as PackageExpression);

        return Promise.resolve(json);
    }
}
