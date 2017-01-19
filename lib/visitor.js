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
    constructor(message, errors) {
        super(message);
        this.message = message;
        this.errors = errors;
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
            case tokens_1.Token.BuildinType: return this.visitType(expression);
            case tokens_1.Token.ImportType: return this.visitImportType(expression);
            case tokens_1.Token.OptionalType: return this.visitOptionalType(expression);
            case tokens_1.Token.RepeatedType: return this.visitRepeatedType(expression);
            case tokens_1.Token.MapType: return this.visitMapType(expression);
            case tokens_1.Token.Annotation: return this.visitAnnotation(expression);
        }
    }
}
exports.BaseVisitor = BaseVisitor;
class Preprocessor {
    parse(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let e = yield this.process(item);
            this.validateImportTypes(e);
            return e;
        });
    }
    process(item) {
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
                e.imports.push(yield this.import(child));
            }
            e.children = children;
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
    import(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = Path.resolve(item.path + ".record");
            this.detectCircularDependencies(path);
            let data = yield fs.readFile(path);
            let ast = Parser.parse(data.toString());
            if (!(ast instanceof expressions_1.PackageExpression)) {
                throw Error('ERROR');
            }
            return yield this.parse(ast);
        });
    }
    getInner(exp) {
        switch (exp.type.nodeType) {
            case tokens_1.Token.ImportType:
            case tokens_1.Token.MapType:
            case tokens_1.Token.BuildinType: return exp.type;
            default: return this.getInner(exp.type);
        }
    }
    validateImportTypes(item) {
        let imports = this.getImports(item);
        let models = this.getModels(item);
        let errors = [];
        for (let model of models) {
            let importTypes = model.properties.map(m => {
                if (m.nodeType == tokens_1.Token.Property)
                    return {
                        prop: this.getInner(m),
                        name: m.name
                    };
                return null;
            }).filter(m => m !== null && m.prop.nodeType == tokens_1.Token.ImportType);
            for (let prop of importTypes) {
                let found = !!imports.find(m => m[0] == prop.prop.packageName && m[1] == prop.prop.name);
                if (!found) {
                    errors.push({
                        property: prop.name,
                        type: prop.prop.name,
                        position: prop.prop.position
                    });
                }
            }
        }
        if (errors.length) {
            throw new ValidationError("Import error", errors);
        }
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
