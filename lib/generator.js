"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const visitor_1 = require("./visitor");
const options_1 = require("./options");
const Parser = require("./models");
const events_1 = require("events");
const Path = require("path");
const fs = require("mz/fs");
const _ = require("lodash");
function isDescription(a) {
    return typeof a.name === 'string'
        && typeof a.extname === 'string'
        && typeof a.run === 'function';
}
function getAnnotationValidations(desc) {
    let out = { records: {}, properties: {} };
    for (let key of ['properties', 'records']) {
        let an = desc.annotations[key];
        for (let k in an) {
            let a = an[k];
            out[key][k] = options_1.Validator.create(a.arguments);
        }
    }
    return out;
}
class Generator extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.buildins = [];
        this.preprocessor = new visitor_1.Preprocessor();
    }
    loadBuildins() {
        return __awaiter(this, void 0, void 0, function* () {
            let path = Path.join(__dirname, "templates");
            let files = yield fs.readdir(path);
            for (let file of files) {
                let extname = Path.extname(file);
                if (extname != '.js')
                    continue;
                var mod = require(Path.join(path, file));
                if (!mod.hasOwnProperty('Meta') || !isDescription(mod.Meta))
                    continue;
                this.buildins.push(_.extend(mod.Meta, { options: getAnnotationValidations(mod.Meta) }));
            }
        });
    }
    ast(files) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield Promise.all(files.map(file => fs.readFile(file)));
            let m = data.map(file => {
                let ast = Parser.parse(file.toString());
                return this.preprocessor.parse(ast);
            });
            return yield Promise.all(m);
        });
    }
    ensureOutputPath(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.stat(path);
            }
            catch (e) {
                yield fs.mkdir(path);
            }
        });
    }
    generate(generator, options, files) {
        return __awaiter(this, void 0, void 0, function* () {
            let desc = this.buildins.find(m => m.name == generator);
            if (!desc)
                throw new Error('generator not found');
            let data = yield Promise.all(files.map(file => fs.readFile(file)));
            let map = data.map((buf, i) => {
                return { name: files[i], data: buf };
            });
            let out = [];
            for (let entry of map) {
                let ast = Parser.parse(entry.data.toString());
                ast = yield this.preprocessor.parse(ast, desc.options);
                let result = yield desc.run(ast, { split: options.split, file: entry.name.replace('.record', desc.extname) });
                out.push(...result);
                this.emit("parse:file", entry.name);
            }
            if (options.output)
                yield this.ensureOutputPath(options.output);
            for (let entry of out) {
                if (options.output) {
                    let file = Path.join(options.output, entry.name);
                    yield fs.writeFile(file, entry.data);
                    this.emit('write:file', file);
                }
                else {
                    console.log(entry.data.toString());
                }
            }
        });
    }
}
exports.Generator = Generator;
