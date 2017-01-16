"use strict";
const visitor_1 = require("./visitor");
const tokens_1 = require("./tokens");
class JsonVisitor extends visitor_1.BaseVisitor {
    visitPackage(item) {
        return {
            package: item[1],
            records: this.visit(item[2])
        };
    }
    visitRecord(item) {
        return {
            name: item[1],
            props: this.visit(item[2])
        };
    }
    visitProperty(item) {
        return {
            type: this.visit(item[2]),
            name: item[1],
            modifiers: this.visit(item[2][2])
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
        return tokens_1.Modifier[item[1]];
    }
}
exports.JsonVisitor = JsonVisitor;
