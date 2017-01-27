

import { Preprocessor, Description, Result, PreprocessOptions, AnnotationDescription, AnnotationDescriptions } from './visitor'
import { Validator } from './options';
import * as Parser from './models';
import { EventEmitter } from 'events';

import * as Path from 'path';
import * as fs from 'mz/fs';
import * as _ from 'lodash';

function isDescription(a: any): a is Description {
    return typeof a.name === 'string'
        && typeof a.extname === 'string'
        && typeof a.run === 'function'
}

interface Options {
    output: string;
    split: boolean;
}

function getAnnotationValidations(desc: Description): PreprocessOptions {

    if (!desc.annotations) return null;

    let out: PreprocessOptions = { records: {}, properties: {} }
    for (let key of ['properties', 'records']) {
        let an: AnnotationDescriptions = desc.annotations[key];

        for (let k in an) {
            let a: AnnotationDescription = an[k];
            out[key][k] = Validator.create(a.arguments);
        }

    }


    return out;
}

interface Entry extends Description {
    options: PreprocessOptions;
}

export class Generator extends EventEmitter {

    buildins: Entry[] = [];
    preprocessor = new Preprocessor();
    async loadBuildins() {

        let path = Path.join(__dirname, "templates");

        let files = await fs.readdir(path)

        for (let file of files) {
            let extname = Path.extname(file);
            if (extname != '.js') continue;

            var mod = require(Path.join(path, file));

            if (!mod.hasOwnProperty('Meta') || !isDescription(mod.Meta)) continue

            this.buildins.push(_.extend(mod.Meta, { options: getAnnotationValidations(mod.Meta) }));
        }

    }

    async ast(files: string[]) {
        let data = await Promise.all(files.map(file => fs.readFile(file)));

        let m = data.map((file, i) => {
            let ast = Parser.parse(file.toString());
            return this.preprocessor.parse(ast, { fileName: files[i] });
        })
        return await Promise.all(m);
    }

    private async ensureOutputPath(path: string) {
        try {
            await fs.stat(path)
        } catch (e) {
            await fs.mkdir(path);
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
            ast = await this.preprocessor.parse(ast, Object.assign({ fileName: entry.name }, desc.options));

            let result = await desc.run(ast, { split: options.split, file: entry.name.replace('.record', desc.extname) });

            out.push(...result)
            this.emit("parse:file", entry.name);
        }

        if (options.output) await this.ensureOutputPath(options.output);

        for (let entry of out) {
            if (options.output) {
                let file = Path.join(options.output, entry.name);
                await fs.writeFile(file, entry.data);
                this.emit('write:file', file);
            } else {
                console.log(entry.data.toString());
            }

        }

    }

}
