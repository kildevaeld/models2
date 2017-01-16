
import { Description, Result } from './meta';
import { Preprocessor } from './visitor'
import * as Parser from './models';

import * as Path from 'path';
import * as fs from 'mz/fs';

function isDescription(a: any): a is Description {
    return typeof a.name === 'string'
        && typeof a.extname === 'string'
        && typeof a.run === 'function'
}

interface Options {
    output: string
}

export class Generator {

    buildins: Description[] = [];
    preprocessor = new Preprocessor();
    async loadBuildins() {

        let path = Path.join(__dirname, "buildins");

        let files = await fs.readdir(path)

        for (let file of files) {
            let extname = Path.extname(file);
            if (extname != '.js') continue;

            var mod = require(Path.join(path, file));

            if (!mod.hasOwnProperty('Meta') || !isDescription(mod.Meta)) continue

            this.buildins.push(mod.Meta);
        }

    }

    async generate(generator: string, options: Options, files: string[]) {
        let desc = this.buildins.find(m => m.name == generator);
        if (!desc) throw new Error('generator not found');

        let data = await Promise.all(files.map(file => fs.readFile(file)));

        let map = data.map((buf, i) => {
            return { name: files[i], data: buf };
        });

        let out: Result[] = []

        for (let entry of map) {
            let ast = Parser.parse(entry.data.toString());
            ast = await this.preprocessor.parse(ast);

            let result = await desc.run(ast, { split: false, file: entry.name.replace('.model', desc.extname) });

            out.push(...result)

        }

        try {
            await fs.stat(options.output)
        } catch (e) {
            await fs.mkdir(options.output);
        }

        for (let entry of out) {
            let file = Path.join(options.output, entry.name);
            await fs.writeFile(file, entry.data);
        }

    }

}