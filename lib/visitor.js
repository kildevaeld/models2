"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require("mz/fs");
const Path = require("path");
const _ = require("lodash");
const tokens_1 = require("./tokens");
const Parser = require("./models");
const expressions_1 = require("./expressions");
class ValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.message = message;
        this.errors = errors;
        this.name = 'ValidationError';
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            errors: this.errors.map(e => {
                if (e && typeof e.toJSON === 'function') {
                    return e.toJSON();
                }
                return { message: e.message, name: e.name };
            })
        };
    }
}
exports.ValidationError = ValidationError;
class BaseVisitor {
    constructor(options) {
        this.options = options;
    }
    visit(expression) {
        switch (expression.nodeType) {
            case tokens_1.Token.Package: return this.visitPackage(expression);
            case tokens_1.Token.Record: return this.visitRecord(expression);
            case tokens_1.Token.Property: return this.visitProperty(expression);
            //case Token.Import: return this.visitImport(expression as ImportExpression);
            case tokens_1.Token.RecordType: return this.visitRecordType(expression);
            case tokens_1.Token.PrimitiveType: return this.visitType(expression);
            case tokens_1.Token.ImportType: return this.visitImportType(expression);
            case tokens_1.Token.OptionalType: return this.visitOptionalType(expression);
            case tokens_1.Token.RepeatedType: return this.visitRepeatedType(expression);
            case tokens_1.Token.MapType: return this.visitMapType(expression);
            case tokens_1.Token.Annotation: return this.visitAnnotation(expression);
            case tokens_1.Token.Service: return this.visitService(expression);
            case tokens_1.Token.Method: return this.visitMethod(expression);
            case tokens_1.Token.AnonymousRecord: return this.visitAnonymousRecord(expression);
        }
    }
    visitRecordType(expression) {
        return expression.name;
    }
    visitService(_) {
    }
    visitMethod(_) {
    }
    visitAnonymousRecord(_) {
    }
}
exports.BaseVisitor = BaseVisitor;
class AnnotationValidationError extends Error {
    constructor(message, location, expected, found) {
        super(message);
        this.message = message;
        this.location = location;
        this.expected = expected;
        this.found = found;
        this.name = 'AnnotationValidationError';
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            location: this.location,
            found: this.found,
            expected: this.expected
        };
    }
}
exports.AnnotationValidationError = AnnotationValidationError;
// Validate Record types
// Validate Services
class Preprocessor {
    parse(item, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let e = yield this.process(item, options);
            //this.validateImportTypes(e);
            this.validate(e, options);
            return e;
        });
    }
    process(item, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item)
                return null;
            if (item.nodeType !== tokens_1.Token.Package) {
                throw new Error('Expression not a package');
            }
            let e = item;
            e.imports = [];
            let children = [];
            for (let i = 0, len = e.children.length; i < len; i++) {
                let child = e.children[i];
                if (child.nodeType !== tokens_1.Token.Import) {
                    children.push(child);
                    continue;
                }
                e.imports.push(yield this.import(child, options));
            }
            e.children = children;
            e.fileName = options.fileName;
            return e;
        });
    }
    detectCircularDependencies(path) {
        if (this.previousParent == path) {
            let e = `circle dependencies detected: ${Path.basename(path)} and ${Path.basename(this.parent)} depends on eachother`;
            throw new Error(e);
        }
        this.previousParent = this.parent;
        this.parent = path;
    }
    import(item, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let dirName = Path.dirname(options.fileName);
            let path = Path.resolve(dirName, item.path + ".record");
            this.detectCircularDependencies(path);
            let data = yield fs.readFile(path);
            let ast = Parser.parse(data.toString());
            if (!(ast instanceof expressions_1.PackageExpression)) {
                throw Error('ERROR');
            }
            let o = Object.assign({}, options, {
                fileName: path
            });
            let p = yield this.parse(ast, o);
            return p;
        });
    }
    getInner(exp) {
        switch (exp.type.nodeType) {
            case tokens_1.Token.ImportType:
            case tokens_1.Token.MapType:
            case tokens_1.Token.RecordType:
            case tokens_1.Token.PrimitiveType: return exp.type;
            default: return this.getInner(exp.type);
        }
    }
    validate(item, options) {
        let imports = this.getImports(item);
        let models = this.getModels(item);
        let errors = [];
        for (let model of models) {
            errors.push(...this.validateModel(model, imports, options));
        }
        if (errors.length) {
            throw new ValidationError("errors", errors);
        }
    }
    validateModel(record, imports, options) {
        let errors = [];
        if (options) {
            let e = this.validateAnnotations(record, options);
            if (e.length)
                errors.push(...e);
        }
        for (let prop of record.properties) {
            if (options) {
                errors.push(...this.validateAnnotations(prop, options));
            }
            errors.push(...this.validateImport(prop, imports));
        }
        return errors;
    }
    validateAnnotations(item, options) {
        let annotations = item.annotations;
        let isRecord = item.nodeType === tokens_1.Token.Record;
        let checkers = (isRecord ? options.records : options.properties) || {};
        let errors = [];
        for (let a of annotations) {
            if (!checkers[a.name]) {
                continue;
            }
            if (!checkers[a.name].validate(a.args)) {
                errors.push(new AnnotationValidationError(`Invalid annotation argument for ${a.name} on ${item.name}`, a.position, checkers[a.name].input, typeof a.args));
            }
        }
        return errors;
    }
    validateImport(item, imports) {
        let type = this.getInner(item);
        if (type.nodeType !== tokens_1.Token.ImportType)
            return [];
        let found = !!imports.find(m => m[0] == type.packageName && m[1] == type.name);
        if (!found) {
            return [new ValidationError("sted", {
                    property: item.name,
                    type: type.name,
                    position: type.position
                })];
        }
        return [];
    }
    getModels(item) {
        return item.children.filter(m => m.nodeType == tokens_1.Token.Record);
    }
    getImports(item) {
        let imports = item.imports.map(m => {
            return m.children.filter(mm => mm.nodeType == tokens_1.Token.Record).map(mm => [m.name, mm.name]);
        });
        return _.flatten(imports);
    }
}
exports.Preprocessor = Preprocessor;
