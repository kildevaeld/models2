"use strict";
const visitor_1 = require("./visitor");
class JsonVisitor extends visitor_1.BaseVisitor {
    /*visit(item: Item): any {
        switch (item[0]) {
            case Token.Package: return this.visitPackage(item);
            case Token.Record: return this.visitRecord(item);
            case Token.Property: return this.visitProperty(item);
            case Token.Annotation: return this.visitAnnotation(item);
        }
    }*/
    visitPackage(item) {
        console.log('visit package %s', item[1]);
        return {
            package: item[1],
            children: this.visit(item[2])
        };
    }
    visitRecord(item) {
        console.log('visit record %s', item[1]);
        return {
            type: 'model',
            props: this.visit(item[2])
        };
    }
    visitProperty(item) {
        console.log('visit property %s', item[1]);
        return {
            type: 'property',
            propertyType: item[2].type,
            name: item[1]
        };
    }
    visitAnnotation(item) {
        console.log('visit annotation', item[1]);
        return this.visit(item[2]);
    }
}
exports.JsonVisitor = JsonVisitor;
