
import * as Path from 'path'
import { Item, BaseVisitor } from '../visitor';
import { Type, Modifier } from '../tokens';

export class TypescriptVisitor extends BaseVisitor {
    imports: string[][] = [];

    parse(item: Item) {
        let out = super.parse(item);
        let i = this.imports.map(m => {
            return `import * as ${m[0]} from './${m[1]}'`;
        }).join('\n');
        return i + "\n" + out;
    }

    visitImport(item: Item): any {
        this.imports.push([item[1][0], Path.basename(item[1][1], '.model')]);
    }


    visitPackage(item: Item): any {
        return `// ${item[1]}${this.visit(item[2]).join('\n\n')}\n`;
    }
    visitRecord(item: Item): any {
        return `interface ${item[1]} {\n${this.visit(item[2]).join('\n')}\n}`;
    }
    visitProperty(item: Item): any {
        let t = item[2];
        let type = this.visit(t);
        let mod = this.visit(t[2]);
        return `  ${item[1]}` + (mod == Modifier.Optional ? '?' : '') + ": " + type + ';'
    }
    visitAnnotation(item: Item): any {
        return this.visit(item[2]);
    }

    visitBuildinType(item: Item): any {
        let type = <Type>item[1]
        switch (type) {
            case Type.Boolean: return "boolean";
            case Type.String: return "string";
            case Type.Date: return "Date";
            default: return "number";
        }

    }
    visitImportType(item: Item): any {
        return item[1].join('.');
    }



    visitModifier(item: Item): any {
        return item[1];
    }

}