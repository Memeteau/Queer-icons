const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('./drama-engine');
const base=require('./cards.json');
let serial=0;
function card(id='test-'+(++serial),value=30,f='WOKE'){return{id,name:id,modifier:f,image:'',comments:{},scores:Object.fromEntries(D.CATEGORIES.map(k=>[k,value]))};}
function state(ids=['verlaine','plain'],n=8){const s={mode:'drama',hands:ids.map(id=>[card(id),...Array.from({length:n-1},()=>card())]),leader:0,round:1,pot:[],locked:false,ended:false};D.init(s,()=>0);return s;}
const act=(s,i,type,data={},rng=()=>.5)=>D.applyAction(s,i,type,data,rng);
function play(s,category='Courage'){
 if(!s.dq.pending)act(s,s.leader,'choose',{category});
 for(let i=0;i<s.hands.length&&!s.locked&&!s.ended;i++)if(s.hands[i].length&&!s.dq.ready[i])act(s,i,'pass');
}
const next=s=>act(s,s.leader,'next');
function unique(s){const cs=[...s.hands.flat(),...s.pot,...s.dq.discard,...s.dq.reserve.map(x=>x.card)];assert.equal(new Set(cs.map(c=>c.id)).size,cs.length);}

test('catalogues: 21 atouts, 8 recharges, 17 théâtre, 11 + 15 ultimes',()=>{
 assert.equal(Object.keys(D.POWERS).length,21);assert.equal(D.RECHARGERS.length,8);assert.equal(new Set(D.THEATER).size,17);assert.equal(D.WOKE_ULTIMATE.length,11);assert.equal(D.CONSERVATIVE_ULTIMATE.length,15);
 assert.equal(base.length,39);assert.equal(base.filter(c=>D.info({hands:[[c]],dq:{charges:[3]}},0).power).length,20);
 assert.equal(base.filter(D.ultimate).length,19);assert.equal(D.family(card('jeanne-darc')),'NEUTRE');assert.equal(D.ultimate(card('jeanne-darc')),false);
});
test('Chemsex: deux victoires puis une défaite, ensuite expiration',()=>{
 const s=state();act(s,0,'power');for(let turn=0;turn<3;turn++){play(s);assert.equal(s.dq.last.winner,turn<2?0:1);next(s);}assert.equal(s.dq.effects.filter(e=>e.kind==='chemsex').length,0);
});
test('Top dom +5 temporaire, sans muter le jeu de base',()=>{
 const s=state(['henri-iii','plain']),before=JSON.stringify(s.hands);act(s,0,'power');assert.equal(D.scores(s,0,s.hands[0][0]).Courage,35);assert.equal(D.scores(s,0,s.hands[0][1]).Courage,35);assert.equal(JSON.stringify(s.hands),before);play(s);next(s);assert.equal(D.scores(s,0,s.hands[0][0]).Courage,30);
});
test('Shady falsifie uniquement l’affichage',()=>{
 const s=state(['abel-bonnard','plain']);s.hands[0][0].scores.Courage=90;act(s,0,'power',{},()=>0);assert.equal(D.scores(s,0,s.hands[0][0],true).Courage,0);assert.equal(D.scores(s,0,s.hands[0][0]).Courage,90);play(s);assert.equal(s.dq.last.winner,0);
});
test('Delulu modifie le résultat réel des non-leaders pendant deux plis',()=>{
 const s=state(['jenny-salvette-de-lange','plain']);act(s,0,'power',{},()=>.99);assert.equal(D.scores(s,1,s.hands[1][0]).Courage,99);assert.equal(s.hands[1][0].scores.Courage,30);play(s);assert.equal(s.dq.last.winner,1);next(s);assert.equal(D.scores(s,0,s.hands[0][0]).Courage,50);play(s);next(s);assert.equal(s.dq.effects.some(e=>e.kind==='delulu'),false);
});
test('Gala: neuf scores, quatre cartes réellement engagées',()=>{
 const s=state(['natalie-clifford-barney','plain']);for(const c of s.hands[0])for(const k of D.CATEGORIES)c.scores[k]=40;
 act(s,0,'power');assert.equal(s.dq.pending,'gala');act(s,1,'pass');assert.equal(s.dq.reveal[0].value,1440);assert.equal(s.dq.reveal[1].value,1080);assert.deepEqual(s.hands.map(h=>h.length),[12,4]);unique(s);
});
test('Gala refuse moins de quatre cartes sans dépenser de charge',()=>{
 const s=state(['natalie-clifford-barney','plain'],3),before=JSON.stringify(s);assert.throws(()=>act(s,0,'power'),/4 cartes/);assert.equal(JSON.stringify(s),before);
});
test('Minimum: le plus haut des minima gagne',()=>{
 const s=state(['louis-nicolas-millet','plain']);s.hands[0][0].scores.Courage=1;s.hands[1][0].scores.Courage=20;act(s,0,'power');assert.deepEqual(D.allowed(s),['Minimum']);play(s,'Minimum');assert.equal(s.dq.last.winner,1);assert.equal(s.dq.reveal[0].value,1);
});
test('Agressive bottom renverse le gagnant',()=>{
 const s=state(['philippe-ier-dorleans','plain']);s.hands[0][0].scores.Courage=1;act(s,0,'power');play(s);assert.equal(s.dq.last.winner,0);unique(s);
});
test('Gaydar ne donne une victoire automatique que contre CONSERVATIVE',()=>{
 const s=state(['rimbaud','plain']);s.hands[0][0].scores.Courage=1;s.hands[1][0].modifier='CONSERVATIVE';act(s,0,'power');play(s);assert.equal(s.dq.last.winner,0);
 const t=state(['rimbaud','plain']);t.hands[0][0].scores.Courage=1;act(t,0,'power');play(t);assert.equal(t.dq.last.winner,1);
});
test('Lobby vole deux cartes sans créer ni perdre de carte',()=>{
 const s=state(['robert-de-montesquiou','plain']);act(s,0,'power',{target:1});assert.deepEqual(s.hands.map(h=>h.length),[10,6]);unique(s);assert.equal(s.dq.charges[0],2);
});
test('Polémique reprend la main sans avancer la boule disco',()=>{
 const s=state(['plain','guy-hocquenghem']);act(s,0,'choose',{category:'Miracle'});act(s,1,'power');assert.equal(s.leader,1);assert.equal(s.dq.pending,null);assert.equal(s.dq.turn,0);assert.equal(s.dq.charges[1],2);assert.throws(()=>act(s,1,'power'),/Un seul/);
});
test('Side décale cycliquement les lignes pour le pli',()=>{
 const s=state(['louise-michel','plain']);D.CATEGORIES.forEach((k,i)=>s.hands[0][0].scores[k]=i);act(s,0,'power');assert.deepEqual(Object.values(D.scores(s,0,s.hands[0][0])),[8,0,1,2,3,4,5,6,7]);
});
test('Plan random remplace toutes les cartes et conserve le choix',()=>{
 const s=state(['maurice-sachs','plain']),old=s.hands.map(h=>h[0].id);act(s,0,'choose',{category:'Miracle'});act(s,0,'power');assert.equal(s.dq.pending,'Miracle');s.hands.forEach((h,i)=>assert.notEqual(h[0].id,old[i]));unique(s);
});
test('Lavement défausse trois cartes et résout une élimination',()=>{
 const s=state(['marquis-de-sade','plain'],3);act(s,0,'power',{target:1});assert.equal(s.dq.discard.length,3);assert.equal(s.ended,true);assert.equal(s.dq.last.winner,0);unique(s);
});
test('Accident impose l’égalité puis Courage au prochain pli',()=>{
 const s=state(['francois-villon','plain']);s.hands[0][0].scores.Miracle=99;act(s,0,'power');play(s,'Miracle');assert.equal(s.pot.length,2);assert.equal(s.dq.last.winner,null);next(s);assert.deepEqual(D.allowed(s),['Courage']);assert.throws(()=>act(s,s.leader,'choose',{category:'Miracle'}),/disponible/);
});
test('Theater camp utilise le marqueur éditorial et Born ready la royauté possédée',()=>{
 const s=state(['mlle-de-maupin','plain']);s.hands[0][0].scores.Courage=0;act(s,0,'power');play(s);assert.equal(s.dq.last.winner,0);
 const t=state(['marie-antoinette','plain']);t.hands[0][0].scores.Courage=0;act(t,0,'power');play(t);assert.equal(t.dq.last.winner,0);assert(D.THEATER.includes('george-sand'));assert(D.THEATER.includes('roland-barthes'));
});
test('Poppers force Extravagance sexuelle pendant deux plis',()=>{
 const s=state(['roland-barthes','plain']);act(s,0,'power');for(let k=0;k<2;k++){assert.deepEqual(D.allowed(s),['Extravagance sexuelle']);play(s,'Extravagance sexuelle');next(s);}assert.equal(D.allowed(s).length,9);
});
test('Zap rend la carte après deux plis supplémentaires',()=>{
 const s=state(['la-boetie','plain']);s.hands[0][0].scores.Courage=90;const lost=s.hands[1][0].id;act(s,0,'power');play(s);assert.equal(s.dq.reserve[0].card.id,lost);next(s);assert.equal(s.dq.reserve.length,1);
 for(let k=0;k<2;k++){s.hands[0][0].scores.Courage=90;play(s);next(s);}assert.equal(s.dq.reserve.length,0);assert(s.hands[1].some(c=>c.id===lost));unique(s);
});
test('Popstar laisse les cartes perdantes à leur propriétaire pendant deux plis',()=>{
 const s=state(['charles-trenet','plain']);act(s,0,'power');for(let k=0;k<2;k++){s.hands[0][0].scores.Courage=1;play(s);assert.deepEqual(s.hands.map(h=>h.length),[8,8]);next(s);}
});
test('Scissor Sisters utilise la seconde carte sans la miser',()=>{
 const s=state(['violette-leduc','plain']),second=s.hands[0][1].id;act(s,0,'power');play(s);assert.equal(s.dq.reveal[0].value,60);assert.equal(s.hands[0][0].id,second);assert.equal(s.hands[0].length,9);unique(s);
});
test('Velvet limite à deux catégories, tirées à nouveau à chaque pli',()=>{
 const s=state(['violette-morris','plain']);act(s,0,'power');for(let k=0;k<3;k++){assert.equal(D.allowed(s).length,2);assert.equal(new Set(D.allowed(s)).size,2);play(s,D.allowed(s)[0]);next(s);}assert.equal(D.allowed(s).length,9);
});
test('Recharges plafonnées, aucune recharge sur rafraîchissement',()=>{
 const s=state(['henri-iii','plain']);s.hands[0][1]=card('panama-al-brown');act(s,0,'power');assert.equal(s.dq.charges[0],2);play(s);next(s);assert.equal(s.dq.charges[0],3);for(let k=0;k<3;k++)D.info(s,0);assert.equal(s.dq.charges[0],3);
});
test('Ultime: délai 11–20, leader autorisé, même famille chez chacun',()=>{
 const s=state(['coccinelle','plain']);assert.equal(s.dq.unlock,11);assert.throws(()=>act(s,0,'ultimate',{category:'Courage'}),/explosé/);s.dq.turn=11;
 assert.throws(()=>act(s,1,'ultimate',{category:'Courage'}),/main/);
 s.hands[1][0].modifier='CONSERVATIVE';s.hands[1][0].scores.Courage=100;
 act(s,0,'ultimate',{category:'Courage'});assert(s.ended);assert.equal(s.dq.ultimate.family,'WOKE');assert.deepEqual(s.dq.ultimate.totals.map(x=>x.value),[240,210]);assert.equal(s.dq.last.winner,0);
 const t=state(['marie-antoinette','plain']);t.hands[0][0].modifier='CONSERVATIVE';t.dq.turn=20;act(t,0,'ultimate',{category:'Miracle'});assert.equal(t.dq.ultimate.family,'CONSERVATIVE');
});
test('Ultime: égalité finale explicite, pas de vainqueur arbitraire',()=>{
 const s=state(['coccinelle','plain']);s.dq.turn=20;act(s,0,'ultimate',{category:'Courage'});assert.deepEqual(s.dq.ultimate.winners,[0,1]);assert.equal(s.dq.last.winner,null);
});
test('Validation de phase, charges, propriétaire, révision et transaction',()=>{
 const s=state(['henri-iii','plain']),before=JSON.stringify(s);assert.throws(()=>act(s,1,'choose',{category:'Courage'}));assert.throws(()=>act(s,0,'power',{revision:99}));assert.throws(()=>act(s,1,'power'));assert.equal(JSON.stringify(s),before);
 act(s,0,'power');assert.throws(()=>act(s,0,'power'));play(s);assert.throws(()=>act(s,0,'power'));next(s);s.dq.charges[0]=0;s.hands[0][0]=card('henri-iii');assert.throws(()=>act(s,0,'power'),/charge/);
});
test('Gala peut être annulé si un autre pouvoir retire les cartes nécessaires',()=>{
 const s=state(['natalie-clifford-barney','marquis-de-sade'],5);act(s,0,'power');act(s,1,'power',{target:0});assert.equal(s.dq.pending,null);assert.match(s.dq.notice,/Gala annulé/);unique(s);
});
test('Plusieurs victoires automatiques concurrentes donnent une égalité',()=>{
 const s=state(['verlaine','mlle-de-maupin']);act(s,0,'power');act(s,1,'power');play(s);assert.equal(s.dq.last.winner,null);assert.equal(s.pot.length,2);
});
test('100 parties 2–6 joueurs: cartes conservées et scores de base intacts',()=>{
 const original=JSON.stringify(base);
 for(let seed=1;seed<=100;seed++){
  let x=seed;const rng=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};
  const n=2+seed%5,deck=JSON.parse(original),s={mode:'drama',hands:Array.from({length:n},()=>[]),leader:0,round:1,pot:[],locked:false,ended:false};
  for(let k=deck.length-1;k>0;k--){const j=Math.floor(rng()*(k+1));[deck[k],deck[j]]=[deck[j],deck[k]];}deck.forEach((c,i)=>s.hands[i%n].push(c));D.init(s,rng);
  for(let k=0;k<100&&!s.ended;k++){
   if(s.locked){act(s,s.leader,'next',{},rng);continue;}
   for(let i=0;i<n&&!s.ended&&!s.locked;i++)if(!D.canPower(s,i)&&rng()<.45){const target=s.hands.findIndex((h,j)=>j!==i&&h.length);try{act(s,i,'power',{target},rng);}catch(e){assert.match(e.message,/4 cartes|2 cartes|deuxième carte/);}}
   if(!s.ended&&!s.locked){if(!s.dq.pending)act(s,s.leader,'choose',{category:D.allowed(s)[0]},rng);for(let i=0;i<n&&!s.locked&&!s.ended&&s.dq.pending;i++)if(s.hands[i].length&&!s.dq.ready[i])act(s,i,'pass',{},rng);}
   assert.equal(D.allCount(s),39);unique(s);for(const charge of s.dq.charges)assert(charge>=0&&charge<=3);
  }
 }
 assert.equal(JSON.stringify(base),original);
});
