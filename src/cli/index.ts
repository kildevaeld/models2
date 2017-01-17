
import * as program from 'commander';
import { Generator } from '../generator'
import * as chalk from 'chalk';
const pkg = require('../../package.json');


function listTypes(generator: Generator) {
    let gens = generator.buildins;

    console.log('Available generators: ')
    for (let g of gens) {
        console.log(g.name)
    }
}

function generate(generator: Generator, cmd: program.ICommand, files: string[]) {

    let template = cmd['template'];
    let output = cmd['output']

    console.log(chalk.bold("Using template:"), chalk.cyan(template))

    generator.on('write:file', (file) => {
        console.log('  %s %s', 'create', chalk.green(file))
    })

    generator.generate(template, { output: output }, files)
        .then(() => console.log('\nYour files has now been created!\n'))
        .catch(e => console.error(e));

}


export async function run() {

    var generator = new Generator();

    await generator.loadBuildins();

    program.version(pkg.version);

    program.command("ls").action(() => {
        listTypes(generator);
    })

    let genCmd = program
        .command('gen')
        .option("-t, --template <template>", 'use templates')
        .option("-o, --output <path>", "out", ".")
        .arguments('<files...>').action((files) => {
            generate(generator, genCmd, files);
        });


    program.command('ast <files...>')
        .action((files) => {
            generator.ast(files)
                .then(ast => {
                    console.log(JSON.stringify(ast, null, 2))
                })
        })

    program.parse(process.argv);


}