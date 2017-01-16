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
        return `// ${item[1]}${this.visit(item[2]).join('\n\n')}\n`;
    }
    visitRecord(item) {
        return `interface ${item[1]} {\n${this.visit(item[2]).join('\n')}\n}`;
    }
    visitProperty(item) {
        let t = item[2];
        let type = this.visit(t);
        let mod = this.visit(t[2]);
        return `  ${item[1]}` + (mod == tokens_1.Modifier.Optional ? '?' : '') + ": " + type + ';';
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
        return item[1];
    }
}
exports.TypescriptVisitor = TypescriptVisitor;