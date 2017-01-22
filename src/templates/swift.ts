
import {Description, VisitorOptions,, Result, BaseVisitor } from '../visitor';
import {Type, Token, Modifier} from '../tokens';

import {
    Expression, PackageExpression, RecordExpression,
    AnnotationExpression, PropertyExpression, TypeExpression, ImportTypeExpression,
    RepeatedTypeExpression, MapTypeExpression, OptionalTypeExpression, 
    ExpressionPosition, AnnotatedExpression
} from '../expressions';


import * as hbs from 'handlebars';
import * as hbsh from 'handlebars-helpers';

import * as fs from 'mz/fs';
import * as Path from 'path';

import * as _ from 'lodash';

class SwiftVisitor extends BaseVisitor {

    required: string[][];
    isRealm: boolean;
    async parse(item: PackageExpression) {
        let result = this.visit(item)  //.filter(m => m != null);
        console.log(result)
        hbsh({handlebars:hbs});

        let buffer = await fs.readFile(Path.resolve(__dirname, "../../templates/swift.hbs"));

        let output = hbs.compile(buffer.toString())(result);

        console.log(output)
        return result;
    }


    genInit() {

        if (this.required.length == 0) return '  init() {}'

        let args = this.required.map(m => {
            return m[0] + ": " + m[1];
        }).join(', ');

        let init = this.required.map(m => {
            return `self.${m[0]} = ${m[0]}`;
        })

        //return `  init(${args}) {\n${init}\n  }`;
        return {
            arguments: args,
            initializers: init
        }
    }

    visitPackage(expression: PackageExpression): any {
       
        //this.package = expression.name;
        /*for (let child of expression.children) {
            out.push(this.visit(child));
        }*/
        let out = expression.children.filter(m => m.nodeType === Token.Record)
        .map(m => this.visit(m));

        return {
            records: out
        }
    }

    visitRecord(expression: RecordExpression): any {

        this.required = [];
        let properties = expression.properties.map(m => this.visit(m));
        
        return {
            name: _.capitalize(_.camelCase(expression.name)),
            properties: properties,
            constructors: [this.genInit()],
            json: !!expression.get('swiftjson')
        }
    }
    visitProperty(expression: PropertyExpression): any {
        let name = expression.name;
        let comment = expression.get('doc'),
            constant = !!expression.get('swiftlet')
    
        let type: string = this.visit(expression.type);

        let decl = constant ? 'let' : 'var';
        let optional = type.indexOf('?') > -1
        if (constant || !optional) this.required.push([name, type]);

        return {
            property: decl + ` ${name}: ${type}`,
            comment: comment,
            type: type.replace('?',''),
            name: name
        }
    }

    visitType(expression: TypeExpression): any {
        switch (expression.type) {
            case Type.Bytes: return "Data"
            default: return Type[expression.type];
        }
    }

    visitImportType(expression: ImportTypeExpression): any {
        return expression.name
    }

    visitOptionalType(expression: OptionalTypeExpression): any {
        return this.visit(expression.type) + '?';
    }

    visitRepeatedType(expression: RepeatedTypeExpression): any {
        return "[" + this.visit(expression.type) + "]";
    }

    visitMapType(expression: MapTypeExpression): any {
        let key = this.visit(expression.key);
        let value = this.visit(expression.value);
        return `Dictionary<${key},${value}>`;
    }

    visitAnnotation(expression: AnnotationExpression): any {
        return expression;
    }

}

export const Meta: Description = {
    name: "Swift",
    extname: ".swift",
    annotations: {
        records: {
            swiftjson: {
                arguments: 'boolean',
                description: "Generate json init"
            },
            doc: {
                arguments: 'string',
                description: "Document the record"
            }
        },
        properties: {
            swiftlet: {
                arguments: 'boolean',
                description: "Declare the property as a constant"
            },
            doc: {
                arguments: 'string',
                description: "Document the property"
            }
        }
    },
    run: (item: PackageExpression, options: VisitorOptions): Promise<Result[]> => {
        let visitor = new SwiftVisitor(options);
        let json = visitor.parse(item);
        console.log(json)
        return Promise.resolve([{
            data: new Buffer(""),
            name: options.file
        }]);
    }
}