"use strict";
const Path = require("path");
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
function ucFirst(name) {
    return name[0].toUpperCase() + name.substr(1);
}
class GolangVisitor extends visitor_1.BaseVisitor {
    constructor() {
        super(...arguments);
        this.imports = [];
    }
    parse(item) {
        let out = super.parse(item);
        let i = this.imports.map(m => {
            return `import * as ${m[0]} from './${m[1]}'`;
        }).join('\n');
        return i + "\n" + out;
    }
    visitImport(item) {
        this.imports.push([item[1][0], Path.basename(item[1][1], '.model')]);
    }
    visitPackage(item) {
        return `package ${item[1]}\n${this.visit(item[2]).join('\n\n')}\n`;
    }
    visitRecord(item) {
        let props = this.visit(item[2].filter(m => m[0] == tokens_1.Token.Property))
            .join('\n');
        let a = this.visit(item[2].filter(m => m[0] == tokens_1.Token.Modifier && m[1] == tokens_1.Modifier.Annotation));
        let c = !!a.find(a => a.name == 'class');
        return `type ${ucFirst(item[1])} struct {\n${props}\n}`;
    }
    visitProperty(item) {
        let type = this.visit(item[2]);
        let modifiers = this.visit(item[2][2]);
        let isOptional = modifiers.find(m => m === tokens_1.Modifier.Optional) === tokens_1.Modifier.Optional;
        let isRepeated = modifiers.find(m => m === tokens_1.Modifier.Repeated) === tokens_1.Modifier.Repeated;
        return `  ${ucFirst(item[1])} ` + (isRepeated ? '[]' : '') + type;
    }
    visitAnnotation(item) {
        return this.visit(item[2]);
    }
    visitBuildinType(item) {
        let type = item[1];
        switch (type) {
            case tokens_1.Type.Boolean: return "bool";
            case tokens_1.Type.String: return "string";
            case tokens_1.Type.Date: return "time.Time";
            case tokens_1.Type.Bytes: return "[]byte";
            default:
                return tokens_1.Type[type].toLowerCase();
        }
    }
    visitImportType(item) {
        return item[1].join('.');
    }
    visitModifier(item) {
        if (item[1] == tokens_1.Modifier.Annotation) {
            return {
                name: item[2],
                value: item[3]
            };
        }
        return item[1];
    }
}
exports.GolangVisitor = GolangVisitor;
exports.Meta = {
    name: "Golang",
    extname: ".go",
    run: (item, options) => {
        let visitor = new GolangVisitor(options);
        let json = visitor.parse(item);
        return Promise.resolve([{
                data: new Buffer(json),
                name: options.file
            }]);
    }
};
