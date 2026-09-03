/* Shared, DOM-free Drama Queen rules. Base card scores are never mutated. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DramaQueen=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const CATEGORIES=['Courage','Martyrologie','Miracle','Drag potential','Empreinte culturelle','Extravagance sexuelle','Coming out','Fait avancer la cause','Flamboyance des tenues'];
  const POWERS={
    'philippe-ier-dorleans':{id:'bottom',name:'Agressive bottom',text:'Le perdant remporte le pli.'},
    'henri-iii':{id:'top',name:'Top dom',text:'+5 à tous les scores de tes cartes pour ce pli.'},
    'rimbaud':{id:'gaydar',name:'Gaydar',text:'Pendant 3 plis, tu bats automatiquement les cartes CONSERVATIVE.'},
    'robert-de-montesquiou':{id:'lobby',name:'Lobby gay',text:'Vole 2 cartes au hasard à un adversaire.',target:true},
    'guy-hocquenghem':{id:'twitter',name:'Polémique Twitter',text:'Annule le choix en cours et reprends la main, sans déplacer les cartes.'},
    'natalie-clifford-barney':{id:'gala',name:'Gala de charité',text:'Chacun engage 4 cartes. On additionne leurs 9 scores.'},
    'louise-michel':{id:'side',name:'Side',text:'Décale tes scores d’une ligne vers le bas pour ce pli ; la dernière revient en haut.'},
    'maurice-sachs':{id:'random',name:'Plan d’un soir random',text:'Tout le monde change de carte au hasard. La catégorie est conservée.'},
    'marquis-de-sade':{id:'lavement',name:'Expert du lavement',text:'Les 3 premières cartes d’un adversaire sortent définitivement du jeu.',target:true},
    'francois-villon':{id:'accident',name:'Accident',text:'Égalité forcée, cartes à la cagnotte. Le prochain pli se joue sur Courage.'},
    'mlle-de-maupin':{id:'theater',name:'Theater camp',text:'Victoire automatique si ta carte porte le badge Théâtre.'},
    'marie-antoinette':{id:'born',name:'Born ready',text:'Victoire automatique si tu possèdes une des cartes Royauté.'},
    'verlaine':{id:'chemsex',name:'Chemsex party',text:'Deux plis automatiquement gagnés, puis un automatiquement perdu.'},
    'abel-bonnard':{id:'shady',name:'Shady Little B***',text:'Pendant 3 plis, les scores affichés du leader sont faux. Les vrais scores décident.'},
    'roland-barthes':{id:'poppers',name:'Une odeur de poppers',text:'Les 2 prochains plis se jouent sur Extravagance sexuelle.'},
    'jenny-salvette-de-lange':{id:'delulu',name:'Delulu',text:'Pendant 2 plis, les scores des non-leaders sont réellement tirés au hasard.'},
    'la-boetie':{id:'zap',name:'Zap',text:'Les cartes perdantes sont mises de côté pour 2 plis, puis rendues à leurs propriétaires.'},
    'charles-trenet':{id:'popstar',name:'Coming back de la Popstar',text:'Pendant 2 plis, les perdants conservent leurs cartes, sous leur pile.'},
    'violette-leduc':{id:'scissors',name:'Scissor Sisters',text:'Ajoute le score de ta carte suivante. Seule la première carte est engagée.'},
    'louis-nicolas-millet':{id:'province',name:'Petit pédé de province',text:'Pendant 2 plis, le plus haut des minima remporte le pli.'},
    'violette-morris':{id:'velvet',name:'Velvet rage',text:'Pendant 3 plis, le choix est limité à 2 catégories aléatoires.'}
  };
  // Includes future cards, without adding them to the current deck.
  const WOKE_ULTIMATE=['coccinelle','jean-genet','claude-cahun','simone-de-beauvoir','louise-michel','guy-hocquenghem','jean-cocteau','jean-diot-et-bruno-lenoir','la-boetie','rimbaud','andre-gide'];
  const CONSERVATIVE_ULTIMATE=['marie-antoinette','chevalier-deon','pierre-loti','francois-timoleon-de-choisy','suzy-solidor','cambaceres','jacques-dadelsward-fersen','sophie-arnould','maurice-sachs','henri-iii','violette-morris','louis-aragon','philippe-ier-dorleans','marquis-de-sade','marie-jeanne-lheritier'];
  const RECHARGERS=['panama-al-brown','jean-moulin','marcel-proust','herculine-barbin','michel-foucault','les-femmes-pantheres','reine-margot','marie-antoinette-lix'];
  const THEATER=['suzy-solidor','coccinelle','sophie-arnould','louis-aragon','jean-cocteau','jean-genet','simone-de-beauvoir','marcel-proust','roland-barthes','andre-gide','henri-lambert-de-thibouville','philippe-ier-dorleans','mlle-de-maupin','natalie-clifford-barney','marquis-de-sade','robert-de-montesquiou','george-sand'];
  const ROYAL=['marie-antoinette','henri-iii','philippe-ier-dorleans','reine-margot'];
  const family=c=>!c?'':c.id==='jeanne-darc'?'NEUTRE':c.modifier;
  const power=c=>c?POWERS[c.id]||null:null;
  const ultimate=c=>!!c&&(family(c)==='WOKE'?WOKE_ULTIMATE.includes(c.id):family(c)==='CONSERVATIVE'&&CONSERVATIVE_ULTIMATE.includes(c.id));
  const alive=s=>s.hands.map((h,i)=>h.length?i:-1).filter(i=>i>=0);
  const clone=x=>JSON.parse(JSON.stringify(x));
  const shuffled=(items,rng)=>{const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function init(s,rng=Math.random){
    s.dq={version:1,revision:0,turn:0,unlock:10+1+Math.floor(rng()*10),charges:s.hands.map(()=>3),effects:[],discard:[],reserve:[],pending:null,ready:{},used:{},entered:{},random:{},fake:{},reveal:[],last:null,notice:'Trois atouts chacun. La boule disco s’éveille après 10 plis.'};
    s.leader=Math.floor(rng()*s.hands.length);s.locked=false;s.ended=false;prepare(s,rng);return s;
  }
  const active=(s,kind,owner)=>s.dq.effects.filter(e=>e.kind===kind&&e.until>s.dq.turn&&(owner===undefined||e.owner===owner));
  const has=(s,kind,owner)=>active(s,kind,owner).length>0;
  function add(s,kind,owner,duration=1){s.dq.effects.push({kind,owner,from:s.dq.turn,until:s.dq.turn+duration});}
  function allCount(s){return s.hands.reduce((n,h)=>n+h.length,0)+s.pot.length+s.dq.reserve.length+s.dq.discard.length;}
  function finish(s,w,message){s.ended=true;s.locked=true;s.dq.last={...(s.dq.last||{}),winner:w,message};}
  function settle(s){
    let a=alive(s);
    // Do not eliminate a player whose cards are only temporarily absent.
    if(a.length<2&&s.dq.reserve.length){for(const r of s.dq.reserve)s.hands[r.owner].push(r.card);s.dq.reserve=[];a=alive(s);}
    if(a.length===0&&s.pot.length){s.hands[s.leader].push(...s.pot);s.pot=[];a=alive(s);}
    if(a.length===1){s.hands[a[0]].push(...s.pot);s.pot=[];finish(s,a[0],`Joueur ${a[0]+1} remporte la partie : les autres n’ont plus de cartes.`);}
    if(!a.length&&!s.ended)finish(s,null,'Partie terminée sans vainqueur.');
    if(a.length&&!s.hands[s.leader]?.length)s.leader=a[0];
  }
  function prepare(s,rng){
    const d=s.dq;d.effects=d.effects.filter(e=>e.until>d.turn);
    const due=d.reserve.filter(r=>r.at<=d.turn);d.reserve=d.reserve.filter(r=>r.at>d.turn);
    for(const r of due)s.hands[r.owner].push(r.card);
    settle(s);if(s.ended)return;
    for(const i of alive(s)){
      const c=s.hands[i][0],entry=`${d.turn}:${c.id}`;
      if(d.entered[i]!==entry){d.entered[i]=entry;if(RECHARGERS.includes(c.id))d.charges[i]=Math.min(3,d.charges[i]+1);}
      if(has(s,'delulu')&&i!==s.leader){const key=`${i}:${c.id}`;if(!d.random[key])d.random[key]=Object.fromEntries(CATEGORIES.map(k=>[k,Math.floor(rng()*101)]));}
      if(has(s,'shady')&&i===s.leader){const key=`${i}:${c.id}`;if(!d.fake[key])d.fake[key]=Object.fromEntries(CATEGORIES.map(k=>[k,Math.floor(rng()*101)]));}
    }
    if(has(s,'velvet')&&!d.two)d.two=shuffled(CATEGORIES,rng).slice(0,2);
    if(d.pending&&d.pending!=='gala'){
      const cats=allowed(s);if(!cats.includes(d.pending))d.pending=cats.length===1?cats[0]:null;
    }
  }
  function allowed(s){
    if(has(s,'gala'))return [];
    if(has(s,'courage'))return ['Courage'];
    if(has(s,'poppers'))return ['Extravagance sexuelle'];
    if(has(s,'province'))return ['Minimum'];
    if(has(s,'velvet'))return s.dq.two||[];
    return CATEGORIES.slice();
  }
  function scores(s,i,c,display=false){
    let v={...c.scores};const key=`${i}:${c.id}`;
    if(has(s,'delulu')&&i!==s.leader&&s.dq.random[key])v={...s.dq.random[key]};
    if(has(s,'side',i)&&s.hands[i][0]?.id===c.id)v=Object.fromEntries(CATEGORIES.map((k,j)=>[k,v[CATEGORIES[(j+8)%9]]]));
    if(has(s,'top',i))v=Object.fromEntries(CATEGORIES.map(k=>[k,v[k]+5]));
    if(display&&i===s.leader&&has(s,'shady')&&s.dq.fake[key])v={...s.dq.fake[key]};
    return v;
  }
  function canPower(s,i){
    if(s.ended||s.locked||!s.hands[i]?.length)return 'Aucun atout disponible maintenant.';
    if(i===s.leader)return 'Tu as la main : seuls les autres joueurs peuvent activer un atout.';
    if(!power(s.hands[i][0]))return 'Cette carte n’a pas d’atout.';
    if(!s.dq.charges[i])return 'Tu n’as plus de charge.';
    if(s.dq.used[i])return 'Un seul atout par joueur et par pli.';
    if(s.dq.ready[i])return 'Tu as déjà validé ce pli.';
    return '';
  }
  function activate(s,i,target,rng){
    const error=canPower(s,i);if(error)throw Error(error);
    const p=power(s.hands[i][0]),d=s.dq,a=alive(s);
    if(p.target&&(!Number.isInteger(target)||target===i||!a.includes(target)))throw Error('Choisis un adversaire encore en jeu.');
    if(p.id==='gala'&&a.some(j=>s.hands[j].length<4))throw Error('Gala demande au moins 4 cartes à chaque joueur.');
    if(p.id==='random'&&a.some(j=>s.hands[j].length<2))throw Error('Chaque joueur doit avoir au moins 2 cartes pour changer.');
    if(p.id==='scissors'&&s.hands[i].length<2)throw Error('Il te faut une deuxième carte.');
    d.charges[i]--;d.used[i]=true;d.notice=`J${i+1} active « ${p.name} ».`;
    switch(p.id){
      case 'lobby':{for(let k=0;k<2&&s.hands[target].length;k++){const j=Math.floor(rng()*s.hands[target].length);s.hands[i].push(...s.hands[target].splice(j,1));}break;}
      case 'lavement':d.discard.push(...s.hands[target].splice(0,3));break;
      case 'twitter':s.leader=i;d.pending=null;d.ready={};d.effects=d.effects.filter(e=>e.kind!=='gala');d.notice+=' Choix annulé : tu reprends la main.';break;
      case 'random':for(const j of a){const old=s.hands[j].shift(),idx=Math.floor(rng()*s.hands[j].length),next=s.hands[j].splice(idx,1)[0];s.hands[j].unshift(next);s.hands[j].push(old);}break;
      case 'gala':add(s,p.id,i);d.pending='gala';d.ready={};break;
      default:add(s,p.id,i,['gaydar','chemsex','shady','velvet'].includes(p.id)?3:['poppers','delulu','province','popstar'].includes(p.id)?2:1);
    }
    prepare(s,rng);
    // A power is a response. Earlier uses remain spent if Twitter reopens the choice.
    if(d.pending)d.ready[i]=true;
  }
  function compare(s,x,y){
    const cx=active(s,'chemsex',x.i)[0],cy=active(s,'chemsex',y.i)[0];
    const lowX=!!(cx&&s.dq.turn-cx.from===2),lowY=!!(cy&&s.dq.turn-cy.from===2);
    let result=0;
    if(lowX!==lowY)result=lowX?-1:1;
    else{
      const win=(p,chem,opp)=>!!(chem&&s.dq.turn-chem.from<2)||has(s,'theater',p.i)&&THEATER.includes(p.card.id)||has(s,'born',p.i)&&s.hands[p.i].some(c=>ROYAL.includes(c.id))||has(s,'gaydar',p.i)&&family(opp.card)==='CONSERVATIVE';
      const wx=win(x,cx,y),wy=win(y,cy,x);
      result=wx!==wy?(wx?1:-1):wx?0:Math.sign(x.value-y.value);
    }
    return has(s,'bottom')?-result:result;
  }
  function resolve(s,rng){
    const d=s.dq,cat=d.pending,a=alive(s);if(!cat||a.some(i=>!d.ready[i]))return;
    const gala=has(s,'gala'),count=gala?4:1;
    // A steal or discard may have made an already-announced Gala impossible.
    if(gala&&a.some(i=>s.hands[i].length<4)){
      d.effects=d.effects.filter(e=>e.kind!=='gala');d.pending=null;d.ready={};d.notice='Gala annulé : un joueur a moins de 4 cartes. Choisissez une catégorie.';return;
    }
    const entries=a.map(i=>{
      const card=s.hands[i][0],v=scores(s,i,card);
      let value=gala?s.hands[i].slice(0,4).reduce((n,c)=>n+Object.values(scores(s,i,c)).reduce((a,b)=>a+b,0),0):cat==='Minimum'?Math.min(...CATEGORIES.map(k=>v[k])):v[cat];
      if(!gala&&has(s,'scissors',i)&&s.hands[i][1]){const second=scores(s,i,s.hands[i][1]);value+=cat==='Minimum'?Math.min(...Object.values(second)):second[cat];}
      return {i,card:clone(card),value,cardCount:count};
    });
    // Pairwise automatic wins support Gaydar against only conservative opponents.
    const wins=has(s,'accident')?[]:entries.filter(x=>entries.every(y=>x.i===y.i||compare(s,x,y)>0));
    const w=wins.length===1?wins[0].i:null,accident=has(s,'accident'),popstar=has(s,'popstar'),zap=has(s,'zap');
    const played=entries.map(x=>({i:x.i,cards:s.hands[x.i].splice(0,count)}));
    if(w===null){for(const p of played)s.pot.push(...p.cards);}
    else{
      const prize=s.pot.splice(0);
      for(const p of played){
        if(p.i!==w&&popstar)s.hands[p.i].push(...p.cards);
        else if(p.i!==w&&zap)for(const card of p.cards)d.reserve.push({owner:p.i,card,at:d.turn+3});
        else prize.push(...p.cards);
      }
      s.hands[w].push(...prize);s.leader=w;
    }
    d.reveal=entries;d.last={winner:w,category:cat,message:w===null?'ÉGALITÉ — les cartes rejoignent la cagnotte.':`J${w+1} gagne la manche sur « ${gala?'Gala de charité':cat} ».`};
    d.turn++;s.locked=true;
    if(accident)add(s,'courage',s.leader,1);
    settle(s);
  }
  function canUltimate(s,i){
    if(s.ended||s.locked||s.dq.pending)return 'Termine le pli en cours.';
    if(i!==s.leader)return 'Il faut avoir la main.';
    if(s.dq.turn<s.dq.unlock)return 'La boule disco n’a pas encore explosé.';
    if(s.pot.length)return 'La cagnotte doit d’abord être remportée.';
    if(!ultimate(s.hands[i]?.[0]))return 'Cette carte ne peut pas déclencher l’action ultime.';
    return '';
  }
  function endUltimate(s,i,category){
    const error=canUltimate(s,i);if(error)throw Error(error);
    if(!CATEGORIES.includes(category))throw Error('Choisis une des neuf catégories.');
    const f=family(s.hands[i][0]);
    const totals=s.hands.map((h,j)=>({i:j,value:h.filter(c=>family(c)===f).reduce((n,c)=>n+scores(s,j,c)[category],0)}));
    const best=Math.max(...totals.map(x=>x.value)),winners=totals.filter(x=>x.value===best).map(x=>x.i);
    s.dq.ultimate={family:f,category,totals,winners};
    finish(s,winners.length===1?winners[0]:null,`${winners.map(j=>'Joueur '+(j+1)).join(' et ')} ${winners.length===1?'remporte':'remportent'} la partie — ${best} points en ${category} (${f}).`);
  }
  function applyAction(s,i,action,payload={},rng=Math.random){
    if(s.mode!=='drama'||!s.dq)throw Error('Le mode Drama Queen n’est pas actif.');
    if(!Number.isInteger(i)||i<0||i>=s.hands.length)throw Error('Joueur invalide.');
    if(payload.revision!==undefined&&payload.revision!==s.dq.revision)throw Error('La partie a avancé. Réessaie.');
    if(s.ended)throw Error('La partie est terminée.');
    // Validate on a copy: rejected actions cannot partly consume charges/cards.
    const t=clone(s),d=t.dq;
    if(action==='next'){
      if(!t.locked||(i!==t.leader&&i!==0))throw Error('Seul le leader ou l’hôte peut continuer.');
      t.locked=false;t.round++;d.pending=null;d.ready={};d.used={};d.random={};d.fake={};d.two=null;d.reveal=[];d.notice='Le leader choisit la catégorie ; seuls les autres joueurs peuvent activer un atout. Chacun valide le pli.';prepare(t,rng);
    }else{
      if(t.locked||!t.hands[i].length)throw Error('Action indisponible.');
      if(action==='power')activate(t,i,payload.target,rng);
      else if(action==='choose'){
        if(i!==t.leader||d.pending)throw Error('Seul le leader choisit une catégorie.');
        if(!allowed(t).includes(payload.category))throw Error('Cette catégorie n’est pas disponible.');
        d.pending=payload.category;d.ready={};
      }else if(action==='pass'){
        if(!d.pending||d.ready[i])throw Error('Aucun choix à valider.');d.ready[i]=true;
      }else if(action==='ultimate')endUltimate(t,i,payload.category);
      else throw Error('Action inconnue.');
      if(!t.ended)resolve(t,rng);
    }
    d.revision++;if(allCount(t)!==allCount(s))throw Error('Erreur de conservation des cartes.');Object.assign(s,t);return s;
  }
  function info(s,i){const c=s.hands[i]?.[0];return {family:family(c),power:power(c),ultimate:ultimate(c),recharge:!!c&&RECHARGERS.includes(c.id),theater:!!c&&THEATER.includes(c.id),royal:!!c&&ROYAL.includes(c.id),charges:s.dq?.charges[i]??0};}
  return {CATEGORIES,POWERS,WOKE_ULTIMATE,CONSERVATIVE_ULTIMATE,RECHARGERS,THEATER,ROYAL,init,applyAction,allowed,scores,info,canPower,canUltimate,family,ultimate,allCount};
});
