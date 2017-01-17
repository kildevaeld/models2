
import * as Path from 'path'
import { Item, BaseVisitor, Description, VisitorOptions, Result } from '../visitor';
import { Type, Modifier, Token } from '../tokens';

function ucFirst(name: string) {
    return name[0].toUpperCase() + name.substr(1)
}

function setToArray(set: Set<String>) {
    let out = [];
    for (let str of set) {
        out.push(str);
    }
    return out;
}

function arrayToSet(...arrays: string[]) {
    let out = new Set<string>()
    for (let array of arrays) {
        for (let item of array) {
            out.add(item)
        }
    }
    return out;
}

function toString(input) {

    let result: Result[] = []

    for (let o of input) {
        let i = [];
        for (let ip of o.imports) {
            i.push(`  "${ip}"`);
        }

        let builder = "package " + o.package + '\n';

        if (i.length) {
            builder += `\nimport (\n${i.join('\n')}\n)\n`;
        }


        result.push({
            name: o.name,
            data: new Buffer(builder + "\n" + o.record)
        })
    }

    return result;
}

export class GolangVisitor extends BaseVisitor {
    imports: Set<string>;
    package: string;
    gotags: string[]
    parse(item: Item) {
        let out = super.parse(item).filter(m => m != null);

        if (!this.options.split) {
            out = [{
                imports: arrayToSet(...out.map(m => m.imports)),
                record: out.map(m => m.record).join('\n\n'),
                name: this.options.file,
                package: this.package
            }]
        }

        return toString(out);
    }

    visitImport(item: Item): any {
        if (item[1][0] !== this.package) {
            throw new Error('cannot import a record from another package!');
        }
        return null;
    }

    visitPackage(item: Item): any {
        this.package = item[1];


        return this.visit(item[2])
        //return `package ${item[1]}\n${this.visit(item[2]).join('\n\n')}\n`;
    }
    visitRecord(item: Item): any {
        this.imports = new Set();

        let modifiers = this.visit(item[2].filter(m => m[0] == Token.Modifier))
        let annotations = modifiers.filter(m => typeof m === 'object');


        let tags = annotations.find(m => m.name == 'gotags')

        if (tags && !Array.isArray(tags.value)) return new Error('record global gotags must me an array');
        this.gotags = tags ? tags.value : void 0;

        let props = this.visit(item[2].filter(m => m[0] == Token.Property))
            .join('\n');


        let comment = annotations.find(m => m.name == 'doc');
        comment = comment ? '// ' + comment.value + '\n' : ''

        let a = this.visit(item[2].filter(m => m[0] == Token.Modifier && m[1] == Modifier.Annotation))
        let c = !!a.find(a => a.name == 'class')
        return {
            record: `${comment}type ${ucFirst(item[1])} struct {\n${props}\n}`,
            name: item[1].toLowerCase() + '.go',
            imports: setToArray(this.imports),
            package: this.package
        }
    }


    visitProperty(item: Item): any {
        let type = this.visit(item[2]);
        let name = item[1];
        let modifiers = this.visit(item[2][2]);

        let annotations = modifiers.filter(m => typeof m === 'object') || [];


        let isOptional = modifiers.find(m => m === Modifier.Optional) === Modifier.Optional
        let isRepeated = modifiers.find(m => m === Modifier.Repeated) === Modifier.Repeated
        let isPointer = annotations.find(m => m.name == 'gopointer')

        let comment = annotations.find(m => m.name == 'doc');
        comment = comment ? '  // ' + comment.value + '\n' : ''

        let tags = annotations.find(m => m.name == 'gotags');
        if (!tags) {
            tags = this.gotags
        } else tags = tags.value

        let tagStr = "";
        if (tags) {
            if (Array.isArray(tags)) {
                tags = tags.map(m => `${m}:"${name.toLowerCase()},omitempty"`);
            } else if (typeof tags === 'object') {
                let tmp = [];
                for (let key in tags) {
                    tmp.push(`${key}:"${tags[key]}"`);
                }
                tags = tmp;
            }
            tagStr = "`" + tags.join(' ') + "`"
        }


        return `${comment}  ${ucFirst(name)} `
            + (isRepeated ? '[]' : '')
            + (isPointer ? '*' : '') + type + " " + tagStr
    }
    visitAnnotation(item: Item): any {
        return this.visit(item[2]);
    }

    visitBuildinType(item: Item): any {
        let type = <Type>item[1]
        switch (type) {
            case Type.Boolean: return "bool";
            case Type.String: return "string";
            case Type.Date:
                this.imports.add('time')
                return "time.Time";
            case Type.Bytes: return "[]byte";
            default:
                return Type[type].toLowerCase();

        }

    }
    visitImportType(item: Item): any {
        return this.package == item[1][0] ? item[1][1] : item[1].join('.');
    }



    visitModifier(item: Item): any {
        if (item[1] == Modifier.Annotation) {
            return {
                name: item[2],
                value: item[3]
            }
        }
        return item[1];
    }

}

export const Meta: Description = {
    name: "Golang",
    extname: ".go",
    annotations: {
        records: {
            gotags: {
                arguments: '[string]'
            },
            doc: {
                arguments: "string"
            }
        },
        properties: {
            gotags: {
                arguments: '[string] or {key:string}'
            },
            gopointer: {
                arguments: "void"
            },
            doc: {
                arguments: "string"
            }
        }
    },
    run: (item: Item, options: VisitorOptions): Promise<Result[]> => {
        let visitor = new GolangVisitor(options);
        let json = visitor.parse(item);

        return Promise.resolve(json);
    }
}