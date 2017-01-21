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
const utils_1 = require("../utils");
const _ = require("lodash");
const fs = require("mz/fs");
const Path = require("path");
const hbs = require("handlebars");
function recordToString(input, sourceTemplate, headerTemplate) {
    input.imports.sort((a, b) => {
        let ab = a[0] == '<', bb = b[0] == "<", e = ab === bb;
        return e ? ab[1] > bb[1] : ab < bb;
    });
    let header = headerTemplate(input), source = sourceTemplate(input);
    return [
        { name: input.filename + '.cpp', data: new Buffer(source) },
        { name: input.filename + '.h', data: new Buffer(header) }
    ];
}
class CppVisitor extends visitor_1.BaseVisitor {
    getAnnotation(exp, name) {
        let annotation = exp.find(m => m.name === name);
        return annotation ? (annotation.args != null ? annotation.args : true) : null;
    }
    parse(expression) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = this.visit(expression);
            //console.log(JSON.stringify(result, null,2));
            let sourceBuf = yield fs.readFile(Path.resolve(__dirname, "../../templates/cpp.c.hbs"));
            let headerBuf = yield fs.readFile(Path.resolve(__dirname, "../../templates/cpp.h.hbs"));
            let docBuf = yield fs.readFile(Path.resolve(__dirname, "../../templates/cpp.doc.hbs"));
            hbs.registerPartial('Document', docBuf.toString());
            let sourceTemplate = hbs.compile(sourceBuf.toString()), headerTemplate = hbs.compile(headerBuf.toString());
            let output;
            if (this.options.split) {
                let records = result.records.map(m => {
                    return {
                        name: m.name,
                        filename: m.filename,
                        namespace: m.namespace,
                        records: [m],
                        imports: m.imports
                    };
                });
                output = _.flatten(records.map(m => recordToString(m, sourceTemplate, headerTemplate)));
            }
            else {
                result.imports = [...utils_1.arrayToSet(...result.records.map(m => m.imports))];
                output = recordToString(result, sourceTemplate, headerTemplate);
            }
            return output;
        });
    }
    visitPackage(expression) {
        this.package = expression.name;
        let records = expression.children
            .filter(m => m.nodeType == tokens_1.Token.Record).map(m => this.visit(m));
        return {
            namespace: this.package,
            imports: [],
            records: records,
            filename: this.options.file.replace('.cpp', '')
        };
    }
    visitRecord(expression) {
        this.imports = new Set();
        return {
            name: expression.name,
            pod: false,
            comment: this.getAnnotation(expression.annotations, 'doc'),
            properties: expression.properties.map(m => this.visit(m)),
            imports: [...this.imports],
            filename: expression.name.toLowerCase(),
            namespace: this.package,
        };
    }
    visitProperty(expression) {
        this.pointer = !!this.getAnnotation(expression.annotations, 'cpppointer');
        let type = this.visit(expression.type);
        type.pointer = this.pointer;
        if (this.pointer) {
            //type.type += '*';
            type.ref = false;
            this.imports.add('<memory>');
        }
        return _.extend({
            name: expression.name,
            comment: expression.get('doc')
        }, type);
    }
    visitType(expression) {
        switch (expression.type) {
            case tokens_1.Type.String:
                this.imports.add('<string>');
                return { type: "std::string", ref: true };
            case tokens_1.Type.Boolean: return { type: "bool", ref: false };
            case tokens_1.Type.Bytes:
                this.imports.add('<string>');
                return { type: "std::string", ref: true };
            case tokens_1.Type.Float:
            case tokens_1.Type.Double:
            case tokens_1.Type.Int:
                return { type: tokens_1.Type[expression.type].toLowerCase(), ref: false };
            case tokens_1.Type.Uint:
                return { type: 'unsigned int', ref: false };
            case tokens_1.Type.Date:
                this.imports.add('<ctime>');
                return { type: 'time_t', ref: false };
            default: return { type: "unimplemented", ref: false };
        }
    }
    visitImportType(expression) {
        let file = (this.options.split ? expression.name.toLowerCase() + '.h' : expression.packageName + '.h');
        this.imports.add(`"${file}"`);
        return { type: expression.name, ref: true };
    }
    visitOptionalType(expression) {
        return this.visit(expression.type);
    }
    visitRepeatedType(expression) {
        this.imports.add("<vector>");
        return { type: `std::vector<${this.visit(expression.type).type}>`, ref: true };
    }
    visitMapType(expression) {
        let key = this.visit(expression.key).type;
        let value = this.visit(expression.value).type;
        this.imports.add('<map>');
        return {
            type: `map<${key},${value}>`,
            ref: true
        };
    }
    visitAnnotation(expression) {
        return expression;
    }
}
exports.CppVisitor = CppVisitor;
exports.Meta = {
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
    run: (item, options) => __awaiter(this, void 0, void 0, function* () {
        let visitor = new CppVisitor(options);
        let json = yield visitor.parse(item);
        return Promise.resolve(json);
    })
};
