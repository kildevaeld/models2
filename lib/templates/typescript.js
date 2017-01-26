"use strict";
const Path = require("path");
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
const utils_1 = require("../utils");
class TypescriptVisitor extends visitor_1.BaseVisitor {
    constructor() {
        super(...arguments);
        this.imports = {};
    }
    parse(item) {
        let out = this.visit(item);
        let i = "";
        let imports = item.imports;
        if (Object.keys(this.imports).length) {
            let out = [];
            for (let key in this.imports) {
                let file = Path.basename(imports.find(m => m.name == key).fileName, '.record');
                let array = [...this.imports[key]];
                out.push(`import {${array.join(', ')}} from './${file}'`);
            }
            i = out.join('\n');
        }
        return i + "\n" + out;
    }
    visitPackage(item) {
        let records = item.children.filter(m => m.nodeType == tokens_1.Token.Record).map(m => this.visit(m));
        return `// ${item.name}\n${records.join('\n\n')}\n`;
    }
    visitRecord(item) {
        let props = item.properties.map(m => this.visit(m));
        let c = !!item.get('tsclass');
        return `export ${c ? 'class' : 'interface'} ${utils_1.ucFirst(item.name)} {\n${props.join('\n')}\n}`;
    }
    visitProperty(item) {
        let type = this.visit(item.type);
        let isOptional = item.type.nodeType === tokens_1.Token.OptionalType;
        return `  ${item.name}` + (isOptional ? '?' : '') + ": " + type + ';';
    }
    visitAnnotation(item) {
        return item;
    }
    visitType(item) {
        let type = item.type;
        if (type === tokens_1.Type.Bytes) {
            throw new visitor_1.ValidationError("Typescript: A field cannot be binary");
        }
        switch (type) {
            case tokens_1.Type.Boolean: return "boolean";
            case tokens_1.Type.String: return "string";
            case tokens_1.Type.Date: return "Date";
            default: return "number";
        }
    }
    visitImportType(item) {
        if (!this.imports[item.packageName])
            this.imports[item.packageName] = new Set();
        this.imports[item.packageName].add(item.name);
        return item.name;
    }
    //visitPackage(expression: PackageExpression): any;
    visitRecordType(expression) {
        return expression.name;
    }
    visitOptionalType(expression) {
        return this.visit(expression.type);
    }
    visitRepeatedType(expression) {
        let type = this.visit(expression.type);
        return type + "[]";
    }
    visitMapType(expression) {
        let key = this.visit(expression.key);
        let val = this.visit(expression.value);
        switch (expression.key.nodeType) {
            case tokens_1.Token.RepeatedType: return `Map<${key},${val}>`;
            case tokens_1.Token.MapType: return `Map<${key},${val}>`;
        }
        return `{[key:${key}]: ${val}}`;
    }
}
exports.TypescriptVisitor = TypescriptVisitor;
exports.Meta = {
    name: "Typescript",
    extname: ".ts",
    annotations: {
        records: {
            tsclass: {
                arguments: 'string',
                description: "Generate a class instead of an interface"
            }
        }
    },
    run: (item, options) => {
        let visitor = new TypescriptVisitor(options);
        let json = visitor.parse(item);
        return Promise.resolve([{
                data: new Buffer(json),
                name: options.file
            }]);
    }
};
