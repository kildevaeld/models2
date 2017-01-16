"use strict";
const program = require("commander");
const pkg = require('../../package.json');
function listTypes() {
}
function run() {
    program.version(pkg.version);
    program.option("-t, --template <template>", 'use templates');
    program.command("list");
    program.parse(process.argv);
}
exports.run = run;
