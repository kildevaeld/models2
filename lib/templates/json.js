"use strict";
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
class JsonVisitor extends visitor_1.BaseVisitor {
    parse(item) {
        return super.parse(item);
    }
    visitPackage(item) {
        return {
            package: item[1],
            records: this.visit(item[2])
        };
    }
    visitRecord(item) {
        return {
            name: item[1],
            properties: this.visit(item[2].filter(m => m[0] === tokens_1.Token.Property)),
            annotations: this.visit(item[2].filter(m => m[0] === tokens_1.Token.Modifier))
        };
    }
    visitProperty(item) {
        return {
            type: this.visit(item[2]),
            name: item[1],
            modifiers: this.visit(item[2][2].filter(m => m[1] !== tokens_1.Modifier.Annotation)),
            annotations: this.visit(item[2][2].filter(m => m[1] === tokens_1.Modifier.Annotation))
        };
    }
    visitAnnotation(item) {
        return this.visit(item[2]);
    }
    visitBuildinType(item) {
        return tokens_1.Type[item[1]];
    }
    visitImportType(item) {
        return item[1][1];
    }
    visitImport(item) {
        return this.visit(item[2]);
    }
    visitModifier(item) {
        if (item[1] == tokens_1.Modifier.Annotation) {
            return {
                name: item[2],
                value: item[3]
            };
        }
        return tokens_1.Modifier[item[1]];
    }
}
exports.JsonVisitor = JsonVisitor;
exports.Meta = {
    name: "Json",
    extname: ".json",
    run: (item, options) => {
        let visitor = new JsonVisitor(options);
        let json = visitor.parse(item);
        return Promise.resolve([{
                data: new Buffer(JSON.stringify(json, null, 2)),
                name: options.file
            }]);
    }
};
