"use strict";
const visitor_1 = require("../visitor");
const tokens_1 = require("../tokens");
class JSONSchemaVisitor extends visitor_1.BaseVisitor {
    parse(expression) {
        let results = this.visit(expression);
        return results.map(m => {
            return {
                name: m.title.toLowerCase() + ".json",
                data: new Buffer(JSON.stringify(m, null, 2))
            };
        });
    }
    visitPackage(expression) {
        this.package = expression;
        let records = expression.children.filter(m => m.nodeType == tokens_1.Token.Record).map(m => this.visit(m));
        return records;
    }
    visitRecordType(expression) {
        let oldOptional = this.optional;
        let oldRequired = this.required;
        this.optional = false;
        this.required = [];
        let r = this.package.children.find(m => m.nodeType == tokens_1.Token.Record && m.name == expression.name);
        let out = this.visit(r);
        delete out['$schema'];
        this.optional = oldOptional;
        this.required = oldRequired;
        return out;
    }
    visitRecord(expression) {
        this.required = [];
        let properties = expression.properties.map(this.visit.bind(this));
        let props = {};
        for (let p of properties) {
            props[p.title] = p;
            delete props[p.title].title;
        }
        return {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "type": "object",
            "title": expression.name,
            "properties": props,
            "required": this.required,
            "description": expression.get('doc') || ""
        };
    }
    visitProperty(expression) {
        this.optional = false;
        let type = this.visit(expression.type);
        type.title = expression.name;
        let format = expression.get('schemaformat');
        if (format)
            type.format = format;
        if (!this.optional)
            this.required.push(type.title);
        let doc = expression.get('doc');
        if (doc)
            type.description = doc;
        return type;
    }
    visitType(expression) {
        let out = {};
        out.type = (function () {
            switch (expression.type) {
                case tokens_1.Type.String: return "string";
                case tokens_1.Type.Date:
                    out.format = 'date-time';
                    return 'string';
                case tokens_1.Type.Boolean: return 'boolean';
                default: return "number";
            }
        })();
        return out;
    }
    visitImportType(expression) {
        let i = this.package.imports.find(m => m.name == expression.packageName);
        let r = i.children.find(m => m.nodeType == tokens_1.Token.Record && m.name == expression.name);
        let oldOptional = this.optional;
        let oldRequired = this.required;
        this.optional = false;
        this.required = [];
        let out = this.visit(r);
        delete out['$schema'];
        this.optional = oldOptional;
        this.required = oldRequired;
        return out;
    }
    visitOptionalType(expression) {
        this.optional = true;
        return this.visit(expression.type);
    }
    visitRepeatedType(expression) {
        return { type: 'array', items: this.visit(expression.type) };
    }
    visitMapType(expression) {
        if (expression.key.type !== tokens_1.Type.String) {
            throw new Error('map key must be a string');
        }
        return { type: 'object', additionalProperties: true };
    }
    visitAnnotation(expression) {
        let formats = ['url', 'email', 'date-time'];
        if (expression.name === 'schemaformat') {
            if (formats.indexOf(expression.args) === -1)
                throw new visitor_1.ValidationError("schemaformat must be " + formats.join('|'));
        }
        return expression;
    }
}
exports.Meta = {
    name: "JSONSchema",
    extname: ".json",
    annotations: {
        /*records: {
            gotags: {
                arguments: '[string]|string',
                description: "Generate struct tags on all fields"
            },
            doc: {
                arguments: "string",
                description: "Generate documenting comments"
            }
        },*/
        properties: {
            schemaformat: {
                arguments: 'string',
                description: ""
            },
            doc: {
                arguments: "string"
            }
        }
    },
    run: (item, options) => {
        let visitor = new JSONSchemaVisitor(options);
        let json = visitor.parse(item);
        return Promise.resolve(json);
    }
};
