
import * as parser from './models';
import * as fs from 'mz/fs';
import { JsonVisitor } from './json'
import { TypescriptVisitor } from './ts'
import { Preprocessor } from './visitor'
async function run() {

    let data = await fs.readFile('./example.model');

    let out = parser.parse(data.toString());

    let v = new TypescriptVisitor();


    let p = new Preprocessor();

    let pp = await p.process(out);

    //let json = v.parse(pp)
    console.log(JSON.stringify(pp, null, 2))
    //console.log(pp)
    //for (let item of out) {
    //let o = v.visit(out);


    //}
    //console.log(o);
}

run().catch(e => {
    console.log(e)
});