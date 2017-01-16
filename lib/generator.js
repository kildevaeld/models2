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
const Parser = require("./models");
const Path = require("path");
const fs = require("mz/fs");
function isDescription(a) {
    return typeof a.name === 'string'
        && typeof a.extname === 'string'
        && typeof a.run === 'function';
}
class Generator {
    constructor() {
        this.buildins = [];
        this.preprocessor = new visitor_1.Preprocessor();
    }
    loadBuildins() {
        return __awaiter(this, void 0, void 0, function* () {
            let path = Path.join(__dirname, "buildins");
            let files = yield fs.readdir(path);
            for (let file of files) {
                let extname = Path.extname(file);
                if (extname != '.js')
                    continue;
                var mod = require(Path.join(path, file));
                if (!mod.hasOwnProperty('Meta') || !isDescription(mod.Meta))
                    continue;
                this.buildins.push(mod.Meta);
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
                ast = yield this.preprocessor.parse(ast);
                let result = yield desc.run(ast, { split: false, file: entry.name.replace('.model', desc.extname) });
                out.push(...result);
            }
            try {
                yield fs.stat(options.output);
            }
            catch (e) {
                yield fs.mkdir(options.output);
            }
            for (let entry of out) {
                let file = Path.join(options.output, entry.name);
                yield fs.writeFile(file, entry.data);
            }
        });
    }
}
exports.Generator = Generator;