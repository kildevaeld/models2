"use strict";
const Path = require("path");
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
class TypescriptVisitor extends visitor_1.BaseVisitor {
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
        return `// ${item[1]}\n${this.visit(item[2]).join('\n\n')}\n`;
    }
    visitRecord(item) {
        let props = this.visit(item[2].filter(m => m[0] == tokens_1.Token.Property))
            .join('\n');
        let a = this.visit(item[2].filter(m => m[0] == tokens_1.Token.Modifier && m[1] == tokens_1.Modifier.Annotation));
        let c = !!a.find(a => a.name == 'class');
        return `export ${c ? 'class' : 'interface'} ${item[1]} {\n${props}\n}`;
    }
    visitProperty(item) {
        let type = this.visit(item[2]);
        let modifiers = this.visit(item[2][2]);
        let isOptional = modifiers.find(m => m === tokens_1.Modifier.Optional) === tokens_1.Modifier.Optional;
        let isRepeated = modifiers.find(m => m === tokens_1.Modifier.Repeated) === tokens_1.Modifier.Repeated;
        return `  ${item[1]}` + (isOptional ? '?' : '') + ": " + type + (isRepeated ? '[]' : '') + ';';
    }
    visitAnnotation(item) {
        return this.visit(item[2]);
    }
    visitBuildinType(item) {
        let type = item[1];
        switch (type) {
            case tokens_1.Type.Boolean: return "boolean";
            case tokens_1.Type.String: return "string";
            case tokens_1.Type.Date: return "Date";
            default: return "number";
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
exports.TypescriptVisitor = TypescriptVisitor;
exports.Meta = {
    name: "Typescript",
    extname: ".ts",
    run: (item, options) => {
        let visitor = new TypescriptVisitor(options);
        let json = visitor.parse(item);
        return Promise.resolve([{
                data: new Buffer(json),
                name: options.file
            }]);
    }
};
