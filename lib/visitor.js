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
const tokens_1 = require("./tokens");
const Parser = require("./models");
function isArray(a) {
    return Array.isArray(a);
}
class BaseVisitor {
    parse(item) {
        return this.visit(item);
    }
    visit(item) {
        switch (item[0]) {
            case tokens_1.Token.Package: return this.visitPackage(item);
            case tokens_1.Token.Record: return this.visitRecord(item);
            case tokens_1.Token.Property: return this.visitProperty(item);
            case tokens_1.Token.Annotation: return this.visitAnnotation(item);
            case tokens_1.Token.Import: return this.visitImport(item);
            case tokens_1.Token.BuildinType: return this.visitBuildinType(item);
            case tokens_1.Token.ImportType: return this.visitImportType(item);
            default:
                if (isArray(item)) {
                    return item.map(i => this.visit(i));
                }
                throw new Error("not a type" + item);
        }
    }
}
exports.BaseVisitor = BaseVisitor;
class Preprocessor {
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
            let path = Path.resolve(item[1] + ".model");
            let data = yield fs.readFile(item[1] + ".model");
            let ast = Parser.parse(data.toString());
            let out = yield this.process(ast);
            let i = [tokens_1.Token.Import, [out[1], path]];
            i[2] = out[2];
            return i;
        });
    }
}
exports.Preprocessor = Preprocessor;
