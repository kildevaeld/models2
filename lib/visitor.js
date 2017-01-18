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
            case tokens_1.Token.Import: return this.visitImport(expression);
            case tokens_1.Token.BuildinType: return this.visitType(expression);
            case tokens_1.Token.ImportType: return this.visitImportType(expression);
            case tokens_1.Token.OptionalType: return this.visitOptionalType(expression);
            case tokens_1.Token.RepeatedType: return this.visitRepeatedType(expression);
            case tokens_1.Token.Annotation: return this.visitAnnotation(expression);
        }
    }
}
exports.BaseVisitor = BaseVisitor;
class Preprocessor {
    parse(item) {
        return __awaiter(this, void 0, void 0, function* () {
            item = yield this.process(item);
            this.validateImportTypes(item);
            return item;
        });
    }
    process(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item)
                return null;
            switch (item[0]) {
                case tokens_1.Token.Package:
                    item[2] = yield Promise.all(item[2].map(i => this.process(i)));
                    if (item[2].length == 1 && item[2][0] == null) {
                        item[2] = [];
                    }
                    return item;
                case tokens_1.Token.Import:
                    return yield this.import(item);
                default:
                    return item;
            }
        });
    }
    import(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = Path.resolve(item[1] + ".record");
            let data = yield fs.readFile(item[1] + ".record");
            let ast = Parser.parse(data.toString());
            let out = yield this.parse(ast);
            let i = [tokens_1.Token.Import, [out[1], path]];
            i[2] = out[2];
            return i;
        });
    }
    validateImportTypes(item) {
        return __awaiter(this, void 0, void 0, function* () {
            let children = item[2];
            let imports = this.getImports(item);
            let models = this.getModels(item);
            let errors = [];
            for (let model of models) {
                let importTypes = model[2].map(m => {
                    if (m[0] == tokens_1.Token.Property)
                        return m;
                    return m[2];
                }).filter(m => m[2][0] == tokens_1.Token.ImportType);
                for (let prop of importTypes) {
                    let type = prop[2];
                    let found = imports.find(m => m[0] == type[1][0] && m[1] == type[1][1]);
                    if (!found) {
                        errors.push({
                            property: prop[1],
                            type: type[1]
                        });
                    }
                }
            }
            if (errors.length) {
                throw new ValidationError("Import error", errors);
            }
        });
    }
    getModels(item) {
        let children = item[2];
        let models = children.filter(m => {
            return m[0] == tokens_1.Token.Record;
        });
        return models;
    }
    getImports(item) {
        let children = item[2];
        let imports = children.filter(m => {
            return m[0] == tokens_1.Token.Import;
        }).map(m => {
            return m[2].filter(mm => mm[0] == tokens_1.Token.Record).map(mm => [m[1][0], mm[1]]);
        });
        return _.flatten(imports);
    }
}
exports.Preprocessor = Preprocessor;
