const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/victory.js','utf8');
test('la célébration légère reste non bloquante et sans contenu externe',()=>{
 new vm.Script(source,{filename:'victory.js'});
 assert.match(source,/#victoryBurst\{[^}]*pointer-events:none/);
 assert.doesNotMatch(source,/<iframe|giphy|tenor|loading="eager"/i);
 assert.match(source,/for\(let i=0;i<36;i\+\+\)particle/);
 assert.match(source,/takesLead=isRound&&lastLeader!==null&&winner!==lastLeader/);
});
test('le cache du navigateur pointe vers la nouvelle animation',()=>{
 const html=fs.readFileSync(__dirname+'/index.html','utf8');
 assert.match(html,/victory\.js\?v=20260906-1/);
});
