"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
const hbs = require("handlebars");
const hbsh = require("handlebars-helpers");
const fs = require("mz/fs");
const Path = require("path");
const _ = require("lodash");
class SwiftVisitor extends visitor_1.BaseVisitor {
    parse(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = this.visit(item); //.filter(m => m != null);
            console.log(result);
            hbsh({ handlebars: hbs });
            let buffer = yield fs.readFile(Path.resolve(__dirname, "../../templates/swift.hbs"));
            let output = hbs.compile(buffer.toString())(result);
            console.log(output);
            return result;
        });
    }
    genInit() {
        if (this.required.length == 0)
            return '  init() {}';
        let args = this.required.map(m => {
            return m[0] + ": " + m[1];
        }).join(', ');
        let init = this.required.map(m => {
            return `self.${m[0]} = ${m[0]}`;
        });
        //return `  init(${args}) {\n${init}\n  }`;
        return {
            arguments: args,
            initializers: init
        };
    }
    visitPackage(expression) {
        //this.package = expression.name;
        /*for (let child of expression.children) {
            out.push(this.visit(child));
        }*/
        let out = expression.children.filter(m => m.nodeType === tokens_1.Token.Record)
            .map(m => this.visit(m));
        return {
            records: out
        };
    }
    visitRecord(expression) {
        this.required = [];
        let properties = expression.properties.map(m => this.visit(m));
        return {
            name: _.capitalize(_.camelCase(expression.name)),
            properties: properties,
            constructors: [this.genInit()],
            json: !!expression.get('swiftjson'),
            extends: expression.get("swiftextends")
        };
    }
    visitProperty(expression) {
        let name = expression.name;
        let comment = expression.get('doc'), constant = !!expression.get('swiftlet');
        let type = this.visit(expression.type);
        let decl = constant ? 'let' : 'var';
        let optional = type.indexOf('?') > -1;
        if (constant || !optional)
            this.required.push([name, type]);
        return {
            property: decl + ` ${name}: ${type}`,
            comment: comment,
            type: type.replace('?', ''),
            name: name
        };
    }
    visitType(expression) {
        switch (expression.type) {
            case tokens_1.Type.Bytes: return "Data";
            default: return tokens_1.Type[expression.type];
        }
    }
    visitImportType(expression) {
        return expression.name;
    }
    visitOptionalType(expression) {
        return this.visit(expression.type) + '?';
    }
    visitRepeatedType(expression) {
        return "[" + this.visit(expression.type) + "]";
    }
    visitMapType(expression) {
        let key = this.visit(expression.key);
        let value = this.visit(expression.value);
        return `Dictionary<${key},${value}>`;
    }
    visitAnnotation(expression) {
        return expression;
    }
}
exports.Meta = {
    name: "Swift",
    extname: ".swift",
    annotations: {
        records: {
            swiftjson: {
                arguments: 'boolean',
                description: "Generate json init"
            },
            swiftextends: {
                arguments: "string"
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
    run: (item, options) => {
        let visitor = new SwiftVisitor(options);
        let json = visitor.parse(item);
        console.log(json);
        return Promise.resolve([{
                data: new Buffer(""),
                name: options.file
            }]);
    }
};
