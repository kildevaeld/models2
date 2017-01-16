

import { Item, BaseVisitor } from './visitor';

export class TypescriptVisitor extends BaseVisitor {
    imports: string[] = [];

    parse(item: Item) {
        let out = super.parse(item);
        let i = this.imports.map(m => {
            return `import * as ${m} from './${m}'`;
        }).join('\n');
        return i + "\n\n" + out;
    }

    visitImport(item: Item): any {
        this.imports.push(item[1]);
    }


    visitPackage(item: Item): any {
        console.log('visit package %s', item[1]);
        return `// ${item[1]}\n${this.visit(item[2]).join('\n\n')}\n`;
    }
    visitRecord(item: Item): any {
        console.log('visit record %s', item[1]);
        return `class ${item[1]} {\n${this.visit(item[2]).join('\n')}\n}`;
    }
    visitProperty(item: Item): any {
        let t = item[2];
        return `  ${item[1]}` + (t.optional ? '?' : '') + ": " + t.type + ';'
    }
    visitAnnotation(item: Item): any {
        return this.visit(item[2]);
    }

}