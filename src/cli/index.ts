
import * as program from 'commander';
const pkg = require('../../package.json');


function listTypes() {

}


export function run() {
    program.version(pkg.version);

    program.option("-t, --template <template>", 'use templates')

    program.command("list")

    program.parse(process.argv);
}