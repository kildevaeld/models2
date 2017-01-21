
const p = require('./annotation')
const fs = require('fs')
const Visitor = require('../lib/options/visitor').Visitor;
/*let path = process.argv[2];
console.log(path)
fs.readFile(path, (err, data) => {
  if (err) return console.dir(err);
  var result;
  try {
      result = p.parse(data.toString());
  } catch (e) {
    console.log(e)
  }

  let visitor = new Visitor();

  let rapp = visitor.parse(result)
  console.log(rapp)
  //console.log(JSON.stringify(result,null,2));
})*/

const visitor = new Visitor();

function testString() {

  let v = p.parse('string|number');

  let validator = visitor.parse(v);

  console.log(validator('test mig i øret'))
  console.log(validator(2003))
  console.log(validator(false))
}

testString();
