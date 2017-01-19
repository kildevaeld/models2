"use strict";
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
const utils_1 = require("../utils");
class GolangError extends Error {
    constructor(message, location) {
        super(message);
        this.message = message;
        this.location = location;
    }
}
exports.GolangError = GolangError;
function ucFirst(name) {
    return name[0].toUpperCase() + name.substr(1);
}
function setToArray(set) {
    let out = [];
    for (let str of set) {
        out.push(str);
    }
    return out;
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
    generateTags(name, annotations) {
        let gotags = this.gotags;
        let gotagsAnnotation = annotations.find(m => m.name == 'gotags');
        if (gotagsAnnotation) {
            gotags = gotagsAnnotation.args;
        }
        let tagStr = '';
        if (gotags) {
            if (utils_1.isStringArray(gotags)) {
                gotags = gotags.map(m => `${m}:"${name.toLowerCase()},omitempty"`);
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
    validateRecordTags(gotags) {
        if (!utils_1.isStringArray(gotags.args) && !utils_1.isString(gotags.args)) {
            throw new GolangError("gotags annotation on a record must be an array of string or a string", gotags.position);
        }
        else if (utils_1.isString(gotags.args)) {
            return [gotags.args];
        }
        return gotags.args;
    }
    visitPackage(expression) {
        let out = [];
        this.package = expression.name;
        for (let child of expression.children) {
            out.push(this.visit(child));
        }
        return out;
    }
    visitRecord(expression) {
        this.gotags = [];
        this.imports = new Set();
        let annotations = expression.annotations;
        let gotags = annotations.find(m => m.name == 'gotags');
        if (gotags) {
            this.gotags = this.validateRecordTags(gotags);
        }
        let comment = annotations.find(m => m.name == 'doc');
        comment = comment ? '// ' + comment.args + '\n' : '';
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
            name: expression.name,
            body: builder,
            imports: setToArray(this.imports)
        };
    }
    visitProperty(expression) {
        let annotations = expression.annotations;
        let name = expression.name;
        let tags = this.generateTags(name, annotations);
        let type = this.visit(expression.type);
        let isPointer = !!annotations.find(m => m.name == 'gopointer');
        let comment = annotations.find(m => m.name == 'doc');
        comment = comment ? '// ' + comment.args + '\n' + Indention : '';
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
    visitAnnotation(expression) {
        return expression;
    }
}
exports.GolangVisitor = GolangVisitor;
exports.Meta = {
    name: "Golang",
    extname: ".go",
    annotations: {
        records: {
            gotags: {
                arguments: '[string]|string'
            },
            doc: {
                arguments: "string"
            }
        },
        properties: {
            gotags: {
                arguments: '[string]|{key:string}'
            },
            gopointer: {
                arguments: "void"
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
