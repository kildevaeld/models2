
import { Item, BaseVisitor } from '../visitor';
import { Type, Modifier } from '../tokens'
import { Description, Result } from '../meta'

export class JsonVisitor extends BaseVisitor {

    visitPackage(item: Item): any {
        return {
            package: item[1],
            records: this.visit(item[2])
        }
    }
    visitRecord(item: Item): any {
        return {
            name: item[1],
            props: this.visit(item[2])
        }
    }
    visitProperty(item: Item): any {
        return {
            type: this.visit(item[2]),
            name: item[1],
            modifiers: this.visit(item[2][2])
        }
    }
    visitAnnotation(item: Item): any {
        return this.visit(item[2]);
    }

    visitBuildinType(item: Item): any {
        return Type[item[1]];
    }
    visitImportType(item: Item): any {
        return item[1][1];
    }

    visitImport(item: Item): any {
        return this.visit(item[2]);
    }

    visitModifier(item: Item): any {
        return Modifier[item[1]];
    }

}

export const Meta: Description = {
    name: "Json",
    extname: ".json",
    run: (item: Item): Promise<Result[]> => {
        let visitor = new JsonVisitor();
        let json = visitor.parse(item);

        return null;
    }
}