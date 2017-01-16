"use strict";
const visitor_1 = require("./visitor");
class TypescriptVisitor extends visitor_1.BaseVisitor {
    constructor() {
        super(...arguments);
        this.imports = [];
    }
    parse(item) {
        let out = super.parse(item);
        let i = this.imports.map(m => {
            return `import * as ${m} from './${m}'`;
        }).join('\n');
        return i + "\n\n" + out;
    }
    visitImport(item) {
        this.imports.push(item[1]);
    }
    visitPackage(item) {
        console.log('visit package %s', item[1]);
        return `// ${item[1]}\n${this.visit(item[2]).join('\n\n')}\n`;
    }
    visitRecord(item) {
        console.log('visit record %s', item[1]);
        return `class ${item[1]} {\n${this.visit(item[2]).join('\n')}\n}`;
    }
    visitProperty(item) {
        let t = item[2];
        return `  ${item[1]}` + (t.optional ? '?' : '') + ": " + t.type + ';';
    }
    visitAnnotation(item) {
        return this.visit(item[2]);
    }
}
exports.TypescriptVisitor = TypescriptVisitor;
