
import { Description, Result } from './meta';
import * as Path from 'path';
import * as fs from 'mz/fs';

export class Generator {

    buildins: Description[]

    async loadBuildins() {

        let path = Path.join(__dirname, "buildins");

        let files = await fs.readdir(path)

        for (let file of files) {
            let extname = Path.extname(file);

        }

    }

}