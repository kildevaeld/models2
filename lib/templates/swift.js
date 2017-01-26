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
            hbsh({ handlebars: hbs });
            let buffer = yield fs.readFile(Path.resolve(__dirname, "../../templates/swift.hbs"));
            let output = hbs.compile(buffer.toString())(result);
            return output;
        });
    }
    genInit() {
        if (this.required.length == 0 || this.isRealm)
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
        this.isRealm = !!expression.get('swiftrealm');
        this.required = [];
        let properties = expression.properties.map(m => this.visit(m));
        return {
            name: _.capitalize(_.camelCase(expression.name)),
            properties: properties,
            constructors: [this.genInit()],
            json: !!expression.get('swiftjson'),
            extends: this.isRealm ? "Object" : expression.get("swiftextends")
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
        let defaultValue = this.isRealm ? this.getDefaultForPrimitiveType(expression) : "";
        if (optional && this.isRealm) {
            defaultValue = 'nil';
        }
        return {
            property: (this.isRealm ? 'dynamic ' : '') + decl + ` ${name}: ${type}`,
            comment: comment,
            type: type.replace('?', ''),
            name: name,
            defaultValue: defaultValue
        };
    }
    getDefaultForPrimitiveType(expression) {
        console.log(expression.type);
        switch (expression.type) {
            case tokens_1.Type.String: return '""';
            case tokens_1.Type.Boolean: return "false";
            case tokens_1.Type.Bytes: return "Data()";
            case tokens_1.Type.Date: return "Date()";
            default: return "0";
        }
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
    getInner(expression) {
        switch (expression.nodeType) {
            case tokens_1.Token.PrimitiveType: return expression;
            case tokens_1.Token.OptionalType: return this.getInner(expression.type);
        }
        return expression;
    }
    visitRepeatedType(expression) {
        if (this.isRealm) {
            let inner = this.getInner(expression.type);
            if (inner.nodeType != tokens_1.Token.RecordType && inner.nodeType != tokens_1.Token.ImportType) {
                throw new Error('SwiftRealm: Repeated type must be a RecordType or a ImportType');
            }
            return `List<${this.visit(expression.type)}>`;
        }
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
        return visitor.parse(item)
            .then(json => {
            console.log(json);
            return json;
        });
        /*return Promise.resolve([{
            data: new Buffer(""),
            name: options.file
        }]);*/
    }
};
