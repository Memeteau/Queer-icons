/* Drama Queen adapter for the existing local and host-relayed multiplayer UI. */
(() => {
  'use strict';
  const D=window.DramaQueen;
  if(!D||window.DramaUI)return;
  let localSeat=0,selectedUltimate='Courage',error='';
  const option=document.createElement('option');option.value='drama';option.textContent='Drama Queen — atouts, recharges et boule disco';document.getElementById('gameMode').append(option);
  const style=document.createElement('style');style.textContent=`
    .dramaPanel{margin:12px 0;padding:16px;border:1px solid #e879d3;border-radius:20px;background:linear-gradient(125deg,#37163f,#171023);font-size:16px}
    .dramaPanel h3{margin:0 0 10px}.dramaBadges{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.dramaBadge{font-size:14px;border:1px solid #9a70b2;border-radius:14px;padding:5px 9px;background:#351c42}.dramaBadge.ultimate{border-color:#f1cf54;color:#ffe58a}
    .dramaLine{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.dramaLine>*{flex:1}.dramaPanel p{line-height:1.45;margin:10px 0}.dramaPanel small{font-size:14px;color:#ded0e5}.discoBall{font-size:42px;display:inline-block;flex:none}.discoWarm{animation:discoPulse 1.4s ease-in-out infinite}.discoReady{filter:drop-shadow(0 0 12px #ffd45b)}
    .dramaError{padding:10px;border:1px solid #ff94ba;border-radius:10px;color:#ffbed3}.dramaPanel select{margin-bottom:10px}.dramaPanel button{margin:5px 0}.dramaPanel button:focus-visible,.dramaPanel select:focus-visible{outline:3px solid #fff;outline-offset:3px}.dramaNotice{border-left:3px solid #f1cf54;padding-left:12px}.dramaPanel details{margin-top:12px}.dramaPanel summary{cursor:pointer;font-weight:bold}.dramaPanel li{margin-bottom:8px;font-size:14px}.dramaPanel .waitReady{font-size:14px;color:#dfc9e9}
    @keyframes discoPulse{50%{transform:rotate(9deg) scale(1.13)}}@media(prefers-reduced-motion:reduce){.discoWarm{animation:none}}
  `;document.head.append(style);
  const panel=document.createElement('section');panel.id='dramaPanel';panel.className='dramaPanel hidden';document.getElementById('players').after(panel);
  const badges=document.createElement('div');badges.className='dramaBadges';badges.id='dramaBadges';document.getElementById('modifier').after(badges);
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=id=>document.getElementById(id);
  function context(){return window.QI_MULTIPLAYER||{active:false};}
  function names(){const online=context();return S.hands.map((_,i)=>online.active&&online.names?.[i]||`J${i+1}`);}
  function actor(){return context().active?context().seat:localSeat;}
  function dispatch(action,payload={}){
    error='';
    if(context().active){window.QI_MULTIPLAYER.dramaAction?.(action,{...payload,revision:S.dq.revision});return;}
    try{D.applyAction(S,action==='next'?S.leader:actor(),action,{...payload,revision:S.dq.revision});if(action==='next')localSeat=S.leader;}catch(e){error=e.message;}
    renderDrama();
  }
  function cardView(i){
    const revealed=S.locked&&S.dq.reveal.find(x=>x.i===i);
    return revealed?.card||S.hands[i]?.[0];
  }
  function renderDrama(){
    if(S.mode!=='drama'||!S.dq){panel.classList.add('hidden');badges.innerHTML='';return;}
    if(!context().active&&!S.hands[localSeat]?.length)localSeat=S.leader;
    const i=actor(),d=S.dq,n=names(),c=cardView(i),inf=D.info(S,i);
    panel.classList.remove('hidden');$('round').textContent=S.round;$('leader').textContent=n[S.leader]||`J${S.leader+1}`;
    $('potCount').textContent=S.pot.length;$('totalCount').textContent=D.allCount(S)-d.discard.length;
    $('players').innerHTML=S.hands.map((h,j)=>`<span class="badge">${escape(n[j])} · ${h.length} cartes · ${d.charges[j]}/3 atouts${j===S.leader?' · LEADER':''}${j===i?' · TOI':''}</span>`).join('');
    $('cardName').textContent=c?.name||'Plus de carte';$('modifier').textContent=`${D.family(c)} · DRAMA QUEEN`;
    if(c){const img=$('portraitImg'),fb=$('portraitFallback');img.classList.remove('hidden');fb.classList.add('hidden');img.alt=c.name;const src=resolveImagePath(c.image);if(img.getAttribute('src')!==src)img.src=src;img.onerror=()=>{img.classList.add('hidden');fb.textContent=initials(c.name);fb.classList.remove('hidden');};}
    badges.innerHTML=[D.ultimate(c)?'<span class="dramaBadge ultimate">🪩 Action ultime</span>':'',c&&D.RECHARGERS.includes(c.id)?'<span class="dramaBadge">↻ Recharge +1</span>':'',c&&D.THEATER.includes(c.id)?'<span class="dramaBadge">Théâtre</span>':'',c&&D.ROYAL.includes(c.id)?'<span class="dramaBadge">Royauté</span>':''].join('');
    $('stats').innerHTML='';
    if(c&&!S.ended){
      const values=S.locked?c.scores:D.scores(S,i,c,true),allowed=D.allowed(S);
      for(const meta of CATEGORY_META){
        const row=document.createElement('div');row.className='stat';for(const [k,v]of Object.entries({cat:meta.color,'cat-soft':meta.soft,'cat-faint':meta.faint,'cat-dark':meta.dark}))row.style.setProperty('--'+k,v);
        row.innerHTML=`<button class="statbutton" type="button"><span class="catIcon"><img src="${escape(meta.icon)}" alt=""></span><span class="statText"><span class="statName">${escape(meta.name)}</span><span class="statComment">${escape(c.comments?.[meta.name]||'')}</span></span></button><span class="score">${values[meta.name]}</span>`;
        const b=row.querySelector('button');b.disabled=S.locked||!!d.pending||i!==S.leader||!allowed.includes(meta.name);b.onclick=()=>dispatch('choose',{category:meta.name});$('stats').append(row);
      }
    }
    const opened=d.turn>=d.unlock,warming=d.turn>=10;
    const phase=opened?'La boule disco a explosé !':warming?'La boule disco va bientôt exploser…':`La boule disco s’éveille dans ${10-d.turn} pli${10-d.turn>1?'s':''}.`;
    const pending=d.pending==='gala'?'Gala de charité — 4 cartes × 9 scores':d.pending;
    panel.innerHTML=`<div class="dramaLine"><span aria-hidden="true" class="discoBall ${opened?'discoReady':warming?'discoWarm':''}">🪩</span><div><h3>Drama Queen</h3><span role="status">${phase}</span></div><strong>${inf.charges}/3 atouts</strong></div>
      ${!context().active?`<label for="dramaSeat">Joueur sur cet appareil</label><select id="dramaSeat">${S.hands.map((h,j)=>`<option value="${j}" ${j===i?'selected':''}>${escape(n[j])}${h.length?'':' — sans carte'}</option>`).join('')}</select>`:''}
      <p class="dramaNotice">${escape(d.notice)}</p>
      ${d.effects.some(e=>e.until>d.turn)?`<p><small>Effets actifs : ${d.effects.filter(e=>e.until>d.turn).map(e=>`${escape(Object.values(D.POWERS).find(p=>p.id===e.kind)?.name||'Courage imposé')} · ${escape(n[e.owner])} · ${e.until-d.turn} pli(s)${e.kind==='chemsex'&&d.turn-e.from===2?' · DÉFAITE À VENIR':''}`).join(' ; ')}</small></p>`:''}
      ${!S.ended&&!S.locked?`<p>${pending?`Catégorie retenue : <strong>${escape(pending)}</strong>. Les joueurs sans la main peuvent activer un atout ; chacun valide le pli.`:i===S.leader?'Tu as la main : choisis une catégorie. Seuls les autres joueurs peuvent activer un atout.':`${escape(n[S.leader])} choisit la catégorie. Tu peux déjà activer ton atout.`}</p>
      ${D.allowed(S).includes('Minimum')&&!d.pending?`<button id="dramaMinimum" class="primary" ${i!==S.leader?'disabled':''}>Comparer les minima</button>`:''}
      ${inf.power?`<h3>${escape(inf.power.name)}</h3><p>${escape(inf.power.text)}</p>${inf.power.target?`<label for="dramaTarget">Adversaire</label><select id="dramaTarget">${S.hands.map((h,j)=>h.length&&j!==i?`<option value="${j}">${escape(n[j])}</option>`:'').join('')}</select>`:''}<button id="dramaPower" class="secondary" ${D.canPower(S,i)?'disabled':''}>Activer · 1 atout</button><small> ${escape(D.canPower(S,i))}</small>`:'<p>Cette carte ne possède pas d’atout activable.</p>'}
      ${d.pending?`<button id="dramaPass" class="primary" ${d.ready[i]||!S.hands[i]?.length?'disabled':''}>${d.ready[i]?'Choix validé':'Passer / valider le pli'}</button><p class="waitReady">${S.hands.map((h,j)=>h.length?`${escape(n[j])} ${d.ready[j]?'✓':'…'}`:'').filter(Boolean).join(' · ')}</p>`:''}
      ${opened&&inf.ultimate&&i===S.leader?`<div><label for="dramaUltimateCategory">Catégorie de l’action ultime</label><select id="dramaUltimateCategory">${D.CATEGORIES.map(k=>`<option ${k===selectedUltimate?'selected':''}>${escape(k)}</option>`).join('')}</select><button id="dramaUltimate" class="primary" ${D.canUltimate(S,i)?'disabled':''}>${inf.family==='WOKE'?'We are family':'Pas un sujet, pas un problème'}</button><p><small>Chacun additionne ses cartes ${escape(inf.family)} dans cette catégorie. Cela termine la partie, même si tu perds. ${escape(D.canUltimate(S,i))}</small></p></div>`:''}`:''}
      ${d.reserve.length?`<p>${d.reserve.length} carte(s) temporairement à l’écart.</p>`:''}${d.discard.length?`<p>${d.discard.length} carte(s) défaussée(s).</p>`:''}
      ${error?`<p role="alert" class="dramaError">${escape(error)}</p>`:''}
      <details><summary>Règles de Drama Queen</summary><ul><li>3 charges au départ, 3 maximum. Le pouvoir est celui de la carte jouée, pas un pouvoir stocké. Un atout par personne et par pli, uniquement sans la main. Les effets déjà activés continuent même si leur propriétaire reprend la main. L’action ultime reste réservée au leader.</li><li>Après le choix de catégorie, tous les joueurs doivent jouer leur atout ou passer. Les effets de plusieurs plis commencent sur le pli en cours.</li><li>Une carte ↻ rend une charge lorsqu’elle arrive en jeu. Son effet n’est pas multiplié par les rafraîchissements.</li><li>Après 10 plis, un délai caché de 1 à 10 plis précède l’explosion. La carte du leader fixe la famille de l’ultime. Chacun compte ses propres cartes de cette famille.</li><li>Les scores de base restent intacts. Shady trompe l’affichage ; Delulu change réellement les valeurs.</li><li>Royauté : Marie-Antoinette, Henri III, Philippe Ier d’Orléans et Reine Margot. Théâtre : la liste validée de 17 personnages.</li><li>En cas de conflit : Accident impose l’égalité ; les victoires et défaites automatiques précèdent les scores ; Agressive bottom renverse le résultat. Des victoires automatiques concurrentes font égalité.</li><li>Courage imposé par Accident prime sur Poppers, puis sur les minima et Velvet. Popstar protège avant Zap. La cagnotte doit être remportée avant l’ultime.</li><li>Gala nécessite 4 cartes par joueur. Les cartes de Zap reviennent sous la pile de leur propriétaire après 2 plis, ou plus tôt si la partie serait bloquée.</li><li>Polémique Twitter annule le choix, sans compter un pli pour la boule disco. Les charges déjà dépensées le restent.</li></ul></details>`;
    if($('dramaSeat'))$('dramaSeat').onchange=e=>{localSeat=Number(e.target.value);error='';renderDrama();};
    if($('dramaPower'))$('dramaPower').onclick=()=>dispatch('power',{target:$('dramaTarget')?Number($('dramaTarget').value):undefined});
    if($('dramaPass'))$('dramaPass').onclick=()=>dispatch('pass');
    if($('dramaMinimum'))$('dramaMinimum').onclick=()=>dispatch('choose',{category:'Minimum'});
    if($('dramaUltimateCategory'))$('dramaUltimateCategory').onchange=e=>{selectedUltimate=e.target.value;};
    if($('dramaUltimate'))$('dramaUltimate').onclick=()=>{if(window.confirm(`Terminer la partie sur « ${selectedUltimate} » en comptant les cartes ${inf.family} de chacun ?`))dispatch('ultimate',{category:selectedUltimate});};
    $('table').innerHTML='';
    if(S.locked&&d.reveal.length){for(const x of d.reveal){const el=document.createElement('div');el.className='seat'+(d.last?.winner===x.i?' winner':'');el.innerHTML=`<div class="row"><strong>${escape(n[x.i])} · ${escape(x.card.name)}</strong><strong>${x.value}</strong></div><small>${x.cardCount} carte(s) engagée(s)</small>`;$('table').append(el);}}
    else $('table').innerHTML=S.hands.map((h,j)=>`<div class="seat">${escape(n[j])} · ${h.length} carte(s)${j===S.leader?' · LEADER':''}</div>`).join('');
    $('result').classList.toggle('hidden',!S.locked&&!S.ended);
    if(S.locked||S.ended){const msg=d.last?.message||'';$('result').innerHTML=`<strong>${escape(msg)}</strong>${d.ultimate?'<br>'+d.ultimate.totals.map(x=>`${escape(n[x.i])} : ${x.value} points`).join('<br>'):''}`;}
    $('nextBtn').classList.toggle('hidden',!S.locked||S.ended||context().active&&!context().isHost);
    $('nextBtn').textContent='Manche suivante';
  }
  const oldStart=window.start,oldRender=window.render,oldFight=window.fight,oldNext=window.next,oldRestart=window.restart,oldEnd=window.end;
  window.start=function(){error='';return oldStart();};
  window.render=function(){if(S.mode==='drama'){if(!S.dq){D.init(S);localSeat=S.leader;}renderDrama();}else{panel.classList.add('hidden');badges.innerHTML='';oldRender();}};
  window.fight=function(cat){if(S.mode==='drama')dispatch('choose',{category:cat});else oldFight(cat);};
  window.next=function(){if(S.mode==='drama')dispatch('next');else oldNext();};
  window.end=function(w){if(S.mode==='drama')renderDrama();else oldEnd(w);};
  window.restart=function(){panel.classList.add('hidden');badges.innerHTML='';oldRestart();};
  window.DramaUI={render:renderDrama,showError(message){error=message;renderDrama();},apply(actor,action,payload){D.applyAction(S,actor,action,payload);error='';renderDrama();},isActive:()=>S.mode==='drama'};
})();
