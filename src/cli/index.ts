
import * as program from 'commander';
import { Generator } from '../generator'
import * as chalk from 'chalk';
const pkg = require('../../package.json');


function listTypes(generator: Generator) {
    let gens = generator.buildins;

    console.log(chalk.bold('Available generators:'))
    for (let g of gens) {
        console.log(g.name);
    }
    console.log('');
}

function generate(generator: Generator, cmd: program.ICommand, files: string[]) {

    let template = cmd['template'];
    let output = cmd['output']

    console.log(chalk.bold("Using template:"), chalk.cyan(template))

    generator.on('write:file', (file) => {
        console.log('  %s %s', 'create', chalk.green(file))
    })

    generator.generate(template, { output: output, split: !!cmd['split'] }, files)
        .then(() => console.log('\nYour files has now been created!\n'))
        .catch(e => console.error(e));

}

function generateHelp(generator: Generator, cmd: program.ICommand, template:string) {
    let t = generator.buildins.find(m => m.name == template);

    console.log(t.annotations)
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
        .option("-o, --output <path>", "out")
        .option("-s, --split", "")
        .arguments('<files...>').action((files) => {
            generate(generator, genCmd, files);
        });


    program.command('ast <files...>')
        .action((files) => {
            generator.ast(files)
                .then(ast => {
                    console.log(JSON.stringify(ast, null, 2))
                }).catch(e => console.log(e))
        })

    let helpCmd = program
        .command('help <template>')
        .action((template) => {
            generateHelp(generator, helpCmd, template);
        });

    program.parse(process.argv);

    if (!program.args.length) program.help();
}
