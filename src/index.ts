
import * as parser from './models';
import * as fs from 'mz/fs';
import { JsonVisitor } from './buildins/json'
import { TypescriptVisitor } from './ts'
import { Preprocessor } from './visitor'

async function run() {

    let data = await fs.readFile('./example.model');

    let out = parser.parse(data.toString());

    let v = new TypescriptVisitor();


    let p = new Preprocessor();

    let pp = await p.parse(out);

    let json = v.parse(pp)
    //console.log(JSON.stringify(json, null, 2))
    console.log(json)
    //for (let item of out) {
    //let o = v.visit(out);


    //}
    //console.log(o);
}

run().catch(e => {
    console.log(e)
});