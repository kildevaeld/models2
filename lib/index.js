"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const parser = require("./models");
const fs = require("mz/fs");
const ts_1 = require("./ts");
const visitor_1 = require("./visitor");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield fs.readFile('./example.model');
        let out = parser.parse(data.toString());
        let v = new ts_1.TypescriptVisitor();
        let p = new visitor_1.Preprocessor();
        let pp = yield p.parse(out);
        let json = v.parse(pp);
        //console.log(JSON.stringify(json, null, 2))
        console.log(json);
        //for (let item of out) {
        //let o = v.visit(out);
        //}
        //console.log(o);
    });
}
run().catch(e => {
    console.log(e);
});
