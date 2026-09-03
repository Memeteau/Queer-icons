// Integration smoke tests in independent JS contexts, with a minimal DOM and
// the existing relay protocol. No browser or external service is required.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),cards=require('./cards.json');
const source=name=>fs.readFileSync(__dirname+'/'+name,'utf8');
function client(network=null){
 const ids=new Map();
 class Element{
  constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.value='';this.textContent='';this.attributes={};this.style={setProperty(){}};const set=new Set();this.classList={add:x=>set.add(x),remove:x=>set.delete(x),contains:x=>set.has(x),toggle:(x,on)=>{if(on===undefined)on=!set.has(x);on?set.add(x):set.delete(x);}};}
  set id(x){this._id=x;ids.set(x,this);}get id(){return this._id;}
  set innerHTML(x){this._html=x;this.children=[];for(const m of x.matchAll(/<(\w+)[^>]*\bid="([^"]+)"[^>]*>/g)){const e=new Element(m[1]);e.id=m[2];this.children.push(e);}}
  get innerHTML(){return this._html||'';}
  append(...xs){this.children.push(...xs);}appendChild(x){this.append(x);return x;}after(){}insertBefore(x){this.append(x);}remove(){}scrollIntoView(){}
  querySelector(sel){if(sel==='.multiBox')return null;if(sel==='button')return this.button||(this.button=new Element('button'));return null;}
  addEventListener(k,fn,capture){(this.listeners[k]??=[])[capture?'unshift':'push'](fn);}
  click(){let stopped=false;const e={preventDefault(){},stopImmediatePropagation(){stopped=true;}};for(const fn of this.listeners.click||[]){fn(e);if(stopped)break;}if(!stopped)this.onclick?.(e);}
  getAttribute(k){return this[k]??this.attributes[k];}setAttribute(k,v){this.attributes[k]=v;}
 }
 for(const m of html.matchAll(/\bid="([^"]+)"/g)){const el=new Element();el.id=m[1];}
 const doc={getElementById:id=>ids.get(id)||null,createElement:tag=>new Element(tag),querySelectorAll:()=>[],head:new Element(),body:new Element(),documentElement:new Element()};
 const sandbox={document:doc,console,confirm:()=>true,alert:()=>{},scrollTo(){},setTimeout:()=>0,clearTimeout(){},MutationObserver:class{observe(){}},fetch:async()=>({ok:true,json:async()=>cards}),location:{reload(){}},WebSocket:network?.Socket};sandbox.window=sandbox;const ctx=vm.createContext(sandbox);
 vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
 for(const file of ['drama-engine.js','drama-ui.js',...(network?['multiplayer.js']:[])])vm.runInContext(source(file),ctx,{filename:file});
 const run=code=>vm.runInContext(code,ctx);
 run('CARDS='+JSON.stringify(cards));ids.get('gameMode').value='drama';ids.get('playerCount').value='2';
 return {run,ids,ctx,state:()=>JSON.parse(run('JSON.stringify(S)'))};
}
function relay(){
 const queue=[],sockets=[];let room=null;
 const deliver=(s,m)=>queue.push(()=>s.onmessage?.({data:JSON.stringify(m)}));
 const broadcast=m=>room.players.forEach(p=>deliver(p.ws,m));
 class Socket{
  constructor(){this.readyState=0;this.pid='p'+sockets.length;sockets.push(this);queue.push(()=>{this.readyState=1;this.onopen?.();deliver(this,{type:'hello',id:this.pid});});}
  send(raw){const m=JSON.parse(raw);queue.push(()=>{
   if(m.type==='create'){room={code:'TESTX',hostId:this.pid,players:[{id:this.pid,name:m.name,ws:this}]};}
   if(m.type==='join')room.players.push({id:this.pid,name:m.name,ws:this});
   if(m.type==='create'||m.type==='join')broadcast({type:'room',code:room.code,hostId:room.hostId,players:room.players.map(({id,name})=>({id,name}))});
   if(m.type==='state'&&this.pid===room.hostId)broadcast({type:'state',state:m.state});
   if(m.type==='action')broadcast({type:'action',playerId:this.pid,action:m.action,payload:m.payload});
  });}
 }
 return {Socket,flush(){let count=0;while(queue.length){queue.shift()();assert(++count<1000,'relay recursion');}}};
}
test('Local: the actual start button selects Drama Queen and renders 9 rows',()=>{
 const c=client();c.ids.get('startBtn').click();assert.equal(c.state().mode,'drama');assert.equal(c.state().dq.charges.length,2);assert.equal(c.ids.get('stats').children.length,9);assert.match(c.ids.get('dramaPanel').innerHTML,/Drama Queen/);
 c.run("DramaUI.apply(S.leader,'choose',{category:'Courage',revision:S.dq.revision})");assert(c.ids.get('dramaPass'));
 c.run("DramaUI.apply(0,'pass',{});DramaUI.apply(1,'pass',{})");assert(c.state().locked);c.ids.get('nextBtn').click();assert.equal(c.state().round,2);assert.equal(c.state().locked,false);
});
test('Local: returning to classic keeps the previous normal game available',()=>{
 const c=client();c.ids.get('startBtn').click();c.ids.get('restartBtn').click();c.ids.get('gameMode').value='classic';c.ids.get('startBtn').click();assert.equal(c.state().mode,'classic');assert.equal(c.state().dq,undefined);c.run("fight('Courage')");assert.equal(c.state().locked,true);assert.equal(c.ids.get('stats').children.length,9);
});
test('Local: player labels remain available with the multiplayer adapter loaded',()=>{
 const c=client(relay());c.ids.get('startBtn').click();
 assert.match(c.ids.get('players').innerHTML,/J1/);assert.match(c.ids.get('players').innerHTML,/J2/);
 assert.doesNotMatch(c.ids.get('players').innerHTML,/undefined/);
});
test('Host and guest: relay a category and both responses, then next round',()=>{
 const net=relay(),host=client(net),guest=client(net);host.ids.get('multiName').value='Hôte';guest.ids.get('multiName').value='Invité';
 host.ids.get('createRoom').onclick();net.flush();guest.ids.get('multiCode').value='TESTX';guest.ids.get('joinRoom').onclick();net.flush();host.ids.get('onlineStart').onclick();net.flush();
 assert.equal(host.state().mode,'drama');assert.deepEqual(guest.state(),host.state());
 const leader=host.state().leader===0?host:guest;
 leader.run("QI_MULTIPLAYER.dramaAction('choose',{category:'Courage',revision:S.dq.revision})");net.flush();
 host.run("QI_MULTIPLAYER.dramaAction('pass',{revision:S.dq.revision})");net.flush();guest.run("QI_MULTIPLAYER.dramaAction('pass',{revision:S.dq.revision})");net.flush();
 assert(host.state().locked);assert.deepEqual(host.state(),guest.state());assert.match(guest.ids.get('result').innerHTML,/manche|ÉGALITÉ/);
 host.ids.get('nextBtn').click();net.flush();assert.equal(host.state().round,2);assert.deepEqual(host.state(),guest.state());
});
test('Le leader voit son atout désactivé sur un appareil partagé',()=>{
 const c=client(relay());c.ids.get('startBtn').click();
 c.run("S.hands[S.leader][0].id='henri-iii';DramaUI.render()");
 assert.match(c.ids.get('dramaPanel').innerHTML,/id="dramaPower"[^>]*disabled/);
 assert.match(c.ids.get('dramaPanel').innerHTML,/Tu as la main/);
});
test('Le relais refuse les atouts du leader, hôte ou invité, sans dépenser de charge',()=>{
 for(const leader of [0,1]){
  const net=relay(),h=client(net),g=client(net);
  h.ids.get('multiName').value='H';g.ids.get('multiName').value='G';
  h.ids.get('createRoom').onclick();net.flush();g.ids.get('multiCode').value='TESTX';g.ids.get('joinRoom').onclick();net.flush();h.ids.get('onlineStart').onclick();net.flush();
  h.run(`S.leader=${leader};S.hands[${leader}][0].id='henri-iii'`);
  const before=JSON.stringify(h.state()),c=leader===0?h:g;
  c.run("QI_MULTIPLAYER.dramaAction('power',{revision:S.dq.revision})");net.flush();
  assert.equal(JSON.stringify(h.state()),before);
  assert.match(c.ids.get('dramaPanel').innerHTML,/Tu as la main/);
 }
});
test('Guest cannot spoof another actor or replay a stale action',()=>{
 const net=relay(),h=client(net),g=client(net);h.ids.get('multiName').value='H';g.ids.get('multiName').value='G';h.ids.get('createRoom').onclick();net.flush();g.ids.get('multiCode').value='TESTX';g.ids.get('joinRoom').onclick();net.flush();h.ids.get('onlineStart').onclick();net.flush();
 h.run('S.leader=0');h.run("QI_MULTIPLAYER.dramaAction('choose',{category:'Courage',revision:S.dq.revision})");net.flush();const before=JSON.stringify(h.state());
 g.run("QI_MULTIPLAYER.dramaAction('pass',{revision:-1,actor:0})");net.flush();assert.equal(JSON.stringify(h.state()),before);assert.match(g.ids.get('dramaPanel').innerHTML,/avancé/);
});
