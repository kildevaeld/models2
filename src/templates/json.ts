
import { BaseVisitor, Description, Result, VisitorOptions } from '../visitor';
import { Type, Modifier, Token } from '../tokens'


export interface JsonPackage {
    package: string;
    children: JsonRecord[];
}

export interface JsonRecord {
    name: string;
    properties: JsonProperty[]
}

export interface JsonProperty {
    name: string;
    type: string;
    modifies: JsonModifier[]
    annotations: JsonAnnotation[]
}

type JsonModifier = "Optional" | "Repeated";


export interface JsonAnnotation {
    name: string;
    value: string | boolean | number | Object | null;
}

export interface JSONVisitorOptions extends VisitorOptions {
    stringify: boolean;
}


export class JsonVisitor extends BaseVisitor {
    options: JSONVisitorOptions


    parse(item: Item): JsonPackage {
        return super.parse(item);
    }

    visitPackage(item: Item): any {
        return {
            package: item[1],
            records: this.visit(item[2])
        }
    }
    visitRecord(item: Item): any {

        return {
            name: item[1],
            properties: this.visit(item[2].filter(m => m[0] === Token.Property)),
            annotations: this.visit(item[2].filter(m => m[0] === Token.Modifier))
        }
    }
    visitProperty(item: Item): any {

        return {
            type: this.visit(item[2]),
            name: item[1],
            modifiers: this.visit(item[2][2].filter(m => m[1] !== Modifier.Annotation)),
            annotations: this.visit(item[2][2].filter(m => m[1] === Modifier.Annotation))
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
        if (item[1] == Modifier.Annotation) {
            return {
                name: item[2],
                value: item[3]
            }
        }
        return Modifier[item[1]];
    }

}

/*export const Meta: Description = {
    name: "Json",
    extname: ".json",
    run: (item: Item, options: JSONVisitorOptions): Promise<Result[]> => {
        let visitor = new JsonVisitor(options);
        let json = visitor.parse(item);

        return Promise.resolve([{
            data: new Buffer(JSON.stringify(json, null, 2)),
            name: options.file
        }]);
    }
}*/