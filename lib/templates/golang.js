"use strict";
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
const utils_1 = require("../utils");
const _ = require("lodash");
class GolangError extends Error {
    constructor(message, location) {
        super(message);
        this.message = message;
        this.location = location;
    }
}
exports.GolangError = GolangError;
function ucFirst(name) {
    return _.upperFirst(_.camelCase(name));
}
function arrayToSet(...arrays) {
    let out = new Set();
    for (let array of arrays) {
        for (let item of array) {
            out.add(item);
        }
    }
    return out;
}
function toString(input) {
    let result = [];
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
            data: new Buffer(builder + "\n" + o.body)
        });
    }
    return result;
}
const Indention = '  ';
class GolangVisitor extends visitor_1.BaseVisitor {
    parse(expression) {
        let out = this.visit(expression);
        if (!this.options.split) {
            out = [{
                    imports: arrayToSet(...out.map(m => m.imports)),
                    body: out.map(m => m.body).join('\n\n'),
                    name: this.options.file,
                    package: this.package
                }];
        }
        return toString(out);
    }
    generateTags(name, exp) {
        let gotags = exp.get('gotags') || this.gotags;
        let tagStr = '';
        if (gotags) {
            if (utils_1.isStringArray(gotags)) {
                gotags = gotags.map(m => `${m}:"${name},omitempty"`);
            }
            else if (typeof gotags === 'object') {
                let tmp = [];
                for (let key in gotags) {
                    tmp.push(`${key}:"${gotags[key]}"`);
                }
                gotags = tmp;
            }
            if (gotags.length)
                tagStr = "`" + gotags.join(' ') + "`";
        }
        return tagStr;
    }
    visitPackage(expression) {
        this.package = expression.name;
        /*for (let child of expression.children) {
            out.push(this.visit(child));
        }*/
        let out = expression.children.filter(m => m.nodeType === tokens_1.Token.Record)
            .map(m => this.visit(m));
        return out;
    }
    visitRecord(expression) {
        this.gotags = [];
        this.imports = new Set();
        let gotags = expression.get('gotags');
        if (gotags) {
            this.gotags = Array.isArray(gotags) ? gotags : [gotags];
        }
        let comment = expression.get('doc');
        comment = comment ? '// ' + comment + '\n' : '';
        let properties = [];
        for (let property of expression.properties) {
            properties.push(this.visit(property));
        }
        let builder = comment + `type ${ucFirst(expression.name)} struct {\n`;
        for (let p of properties) {
            builder += Indention + p + '\n';
        }
        builder += '}';
        return {
            package: this.package,
            name: expression.name.toLowerCase() + '.go',
            body: builder,
            imports: [...this.imports]
        };
    }
    visitProperty(expression) {
        let name = expression.name;
        let tags = this.generateTags(name, expression);
        let type = this.visit(expression.type);
        let isPointer = !!expression.get("gopointer");
        type = expression.get('gotype') || type;
        let comment = expression.get('doc');
        comment = comment ? '// ' + comment + '\n' + Indention : '';
        return `${comment}${ucFirst(name)} `
            + (isPointer ? '*' : '') + type + " " + tags;
    }
    visitType(expression) {
        switch (expression.type) {
            case tokens_1.Type.Date:
                this.imports.add('time');
                return "time.Time";
            case tokens_1.Type.Boolean: return "bool";
            case tokens_1.Type.Bytes: return "[]byte";
            case tokens_1.Type.Double: return "float64";
            case tokens_1.Type.Float: return "float32";
            default: return tokens_1.Type[expression.type].toLowerCase();
        }
    }
    visitImportType(expression) {
        return expression.name;
    }
    visitOptionalType(expression) {
        return this.visit(expression.type);
    }
    visitRepeatedType(expression) {
        return "[]" + this.visit(expression.type);
    }
    visitMapType(expression) {
        let key = this.visit(expression.key);
        let value = this.visit(expression.value);
        return `map[${key}]${value}`;
    }
    visitAnnotation(expression) {
        return expression;
    }
    visitService(_) {
    }
    visitMethod(_) {
    }
    visitAnonymousRecord(_) {
    }
}
exports.GolangVisitor = GolangVisitor;
exports.Meta = {
    name: "Golang",
    extname: ".go",
    annotations: {
        records: {
            gotags: {
                arguments: '[string]|string',
                description: "Generate struct tags on all fields"
            },
            doc: {
                arguments: "string",
                description: "Generate documenting comments"
            }
        },
        properties: {
            gotags: {
                arguments: '[string]|{string}'
            },
            gopointer: {
                arguments: "boolean",
                description: "Declare the field as a pointer"
            },
            gotype: {
                arguments: 'string',
                description: "Override Go type"
            },
            doc: {
                arguments: "string"
            }
        }
    },
    run: (item, options) => {
        let visitor = new GolangVisitor(options);
        let json = visitor.parse(item);
        return Promise.resolve(json);
    }
};
