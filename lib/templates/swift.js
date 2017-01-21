"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
const hbs = require("handlebars");
const hbsh = require("handlebars-helpers");
const fs = require("mz/fs");
const Path = require("path");
class SwiftVisitor extends visitor_1.BaseVisitor {
    parse(item) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let result = _super("parse").call(this, item).filter(m => m != null);
            hbsh({ handlebars: hbs });
            let buffer = yield fs.readFile(Path.resolve(__dirname, "../../templates/swift.hbs"));
            let output = hbs.compile(buffer.toString())({ records: result });
            console.log(output);
            return result;
        });
    }
    visitImport(item) {
        // Swift does not need to import source files
        return null;
    }
    visitPackage(item) {
        // Skip packages
        return this.visit(item[2]);
    }
    genInit() {
        if (this.required.length == 0)
            return '  init() {}';
        let args = this.required.map(m => {
            return m[0] + ": " + m[1];
        }).join(', ');
        let init = this.required.map(m => {
            return `self.${m[0]} = ${m[0]}`;
        });
        //return `  init(${args}) {\n${init}\n  }`;
        return {
            arguments: args,
            initializers: init
        };
    }
    visitRecord(item) {
        this.required = [];
        let modifiers = this.visit(item[2].filter(m => m[0] == tokens_1.Token.Modifier));
        let annotations = modifiers.filter(m => typeof m === 'object');
        this.isRealm = !!annotations.find(m => m.name === 'realm');
        let props = this.visit(item[2].filter(m => m[0] == tokens_1.Token.Property));
        let init = this.genInit();
        //return `class ${ucFirst(item[1])} {\n${props}\n\n${init}\n}`
        return {
            name: item[1],
            properties: props,
            constructors: [init],
            extends: this.isRealm ? 'Object' : ''
        };
    }
    visitProperty(item) {
        let type = this.visit(item[2]);
        let modifiers = this.visit(item[2][2]);
        let isOptional = modifiers.find(m => m === tokens_1.Modifier.Optional) === tokens_1.Modifier.Optional;
        let isRepeated = modifiers.find(m => m === tokens_1.Modifier.Repeated) === tokens_1.Modifier.Repeated;
        let o = (isRepeated ? '[' : ''), c = (isRepeated ? ']' : '');
        let typeStr = o + type + c;
        if (!isOptional)
            this.required.push([item[1], typeStr]);
        let annotations = modifiers.filter(m => typeof m === 'object') || [];
        let swift = annotations.find(m => m.name == 'swift');
        let name = swift ? swift.value : item[1];
        let decl = annotations.find(m => m.name == 'constant') ? 'let' : 'var';
        let doc = annotations.find(m => m.name == 'doc');
        return {
            property: `${decl} ${name}: ` + o + type + c + (isOptional ? '?' : ''),
            comment: doc ? doc.value : void 0
        };
    }
    visitBuildinType(item) {
        switch (item[1]) {
            case tokens_1.Type.Bytes: return "Data";
            default: return tokens_1.Type[item[1]];
        }
    }
    visitImportType(item) {
        return item[1][1];
    }
    visitModifier(item) {
        if (item[1] == tokens_1.Modifier.Annotation) {
            return {
                name: item[2],
                value: item[3]
            };
        }
        return item[1];
    }
}
/*
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
}*/ 
