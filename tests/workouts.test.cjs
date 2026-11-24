const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),vm=require('node:vm');const sandbox={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../js/workouts.js'),'utf8'),sandbox);const {validate,parse}=sandbox.module.exports;
const sample={date:'2026-11-22',exercise:'Supino',sets:3,reps:10,weight:50,notes:''};
test('accepts valid workout',()=>assert.equal(validate(sample).weight,50));
test('rejects invalid load',()=>assert.throws(()=>validate({...sample,weight:-1})));
test('rejects invalid reps',()=>assert.throws(()=>validate({...sample,reps:0})));
test('rejects impossible date',()=>assert.throws(()=>validate({...sample,date:'2026-02-31'})));
test('parses stored workouts',()=>assert.equal(parse(JSON.stringify([{...sample,id:'abc'}])).length,1));
test('rejects nonarray storage',()=>assert.throws(()=>parse('{}')));
