
import {Description, VisitorOptions, Item, Result, BaseVisitor } from '../visitor';
import {Type, Token, Modifier} from '../tokens';
import * as hbs from 'handlebars';
import * as hbsh from 'handlebars-helpers';

import * as fs from 'mz/fs';
import * as Path from 'path';

class SwiftVisitor extends BaseVisitor {

    required: string[][];
    isRealm: boolean;
    async parse(item: Item) {
        let result = super.parse(item).filter(m => m != null);

        hbsh({handlebars:hbs});

        let buffer = await fs.readFile(Path.resolve(__dirname, "../../templates/swift.hbs"));

        let output = hbs.compile(buffer.toString())({records:result});

        console.log(output)
        return result;
    }

    visitImport(item: Item): any {
        // Swift does not need to import source files
        return null
    }

    visitPackage(item: Item): any {
        // Skip packages
        return this.visit(item[2])
    }

    genInit() {

        if (this.required.length == 0) return '  init() {}'

        let args = this.required.map(m => {
            return m[0] + ": " + m[1];
        }).join(', ');

        let init = this.required.map(m => {
            return `self.${m[0]} = ${m[0]}`;
        })

        //return `  init(${args}) {\n${init}\n  }`;
        return {
            arguments: args,
            initializers: init
        }
    }

    visitRecord(item: Item): any {
        this.required = [];
        
        let modifiers = this.visit(item[2].filter(m => m[0] == Token.Modifier))
        let annotations = modifiers.filter(m => typeof m === 'object');
        
        this.isRealm = !!annotations.find(m => m.name === 'realm')

        let props = this.visit(item[2].filter(m => m[0] == Token.Property))
        

        let init = this.genInit();

        //return `class ${ucFirst(item[1])} {\n${props}\n\n${init}\n}`
    
        return {
            name: item[1],
            properties: props,
            constructors: [init],
            extends: this.isRealm ? 'Object' : ''
        }
    }

    visitProperty(item: Item): any {
        let type = this.visit(item[2]);
        let modifiers = this.visit(item[2][2]);
        
        let isOptional = modifiers.find(m => m === Modifier.Optional) === Modifier.Optional
        let isRepeated = modifiers.find(m => m === Modifier.Repeated) === Modifier.Repeated

        let o = (isRepeated ? '[' : ''), c = (isRepeated ? ']' : '')
        let typeStr = o + type + c
        if (!isOptional) this.required.push([item[1], typeStr]);


        let annotations = modifiers.filter(m => typeof m === 'object')||[];
        let swift = annotations.find(m => m.name == 'swift');
        let name = swift ? swift.value : item[1];
        let decl = annotations.find(m => m.name == 'constant') ? 'let' : 'var'
        let doc = annotations.find(m => m.name == 'doc')
        
        return {
            property: `${decl} ${name}: ` + o + type + c + (isOptional ? '?' : ''),
            comment: doc ? doc.value : void 0
        }

    }

    visitBuildinType(item: Item): any {
        switch (item[1]) {
            case Type.Bytes: return "Data";
            default: return Type[item[1]]
        }
    }

    visitImportType(item: Item): any {
        return item[1][1];
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
    name: "Swift",
    extname: ".swift",
    run: (item: Item, options: VisitorOptions): Promise<Result[]> => {
        let visitor = new SwiftVisitor(options);
        let json = visitor.parse(item);

        return Promise.resolve([{
            data: new Buffer(""),
            name: options.file
        }]);
    }
}