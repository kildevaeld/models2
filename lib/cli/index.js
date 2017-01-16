"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const program = require("commander");
const generator_1 = require("../generator");
const pkg = require('../../package.json');
function listTypes(generator) {
    let gens = generator.buildins;
    console.log('Available generators: ');
    for (let g of gens) {
        console.log(g.name);
    }
}
function generate(generator, cmd, files) {
    let template = cmd['template'];
    let output = cmd['output'];
    generator.generate(template, { output: output }, files)
        .then(() => console.log('Done'))
        .catch(e => console.error(e.message));
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        var generator = new generator_1.Generator();
        yield generator.loadBuildins();
        program.version(pkg.version);
        program.command("ls").action(() => {
            listTypes(generator);
        });
        let cmd = program
            .command('gen')
            .option("-t, --template <template>", 'use templates')
            .option("-o, --output <path>", "out", ".")
            .arguments('<files...>').action((files) => {
            generate(generator, cmd, files);
        });
        program.parse(process.argv);
    });
}
exports.run = run;