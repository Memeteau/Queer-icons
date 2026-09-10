(() => {
  'use strict';
  const style=document.createElement('style');
  style.textContent=`
    #victoryBurst{position:fixed;inset:0;z-index:99999;pointer-events:none;overflow:hidden}
    .victoryToast{position:absolute;left:50%;top:max(18px,env(safe-area-inset-top));max-width:min(88vw,520px);padding:12px 20px;border:2px solid #f1cf54;border-radius:999px;background:#24102ee8;box-shadow:0 8px 30px #0008,0 0 22px #f1cf5455;color:#fff;font:900 clamp(18px,5vw,30px)/1.05 Georgia,serif;text-align:center;opacity:0;transform:translate(-50%,-18px) scale(.92);transition:opacity .16s ease,transform .22s ease;white-space:nowrap}
    #victoryBurst.show .victoryToast{opacity:1;transform:translate(-50%,0) scale(1)}
    .partyBit{position:absolute;left:0;top:0;pointer-events:none;will-change:transform,opacity;font-size:clamp(14px,3vw,25px);animation:partyBurst var(--d) cubic-bezier(.08,.72,.22,1) forwards}
    @keyframes partyBurst{0%{transform:translate3d(var(--ox),var(--oy),0) scale(.25);opacity:0}12%{opacity:1}100%{transform:translate3d(var(--ex),var(--ey),0) scale(.75) rotate(var(--r));opacity:0}}
    @media(prefers-reduced-motion:reduce){.partyBit{display:none}.victoryToast{transition:none}}

    /* Drama Queen result overlay: results are one white typographic block;
       the humorous reaction is visually separated and keeps its win/loss color. */
    .dqResultCat,.dqScores,.dqVerdict{
      color:#fff!important;
      font-family:Georgia,"Times New Roman",serif!important;
      text-shadow:none!important;
    }
    .dqResultCat{font-weight:800!important}
    .dqScores{font-weight:900!important}
    .dqVerdict{font-weight:900!important}
    .dqReaction{margin-top:42px!important;padding-top:4px}
    .dqReaction.win{color:#ffe889!important;text-shadow:0 0 7px #fff3a6,0 0 18px #ffc928!important}
    .dqReaction.lose{color:#e7a8ff!important;text-shadow:0 0 8px #f0c4ff,0 0 24px #9d45c9,0 0 48px #6a2888!important}
  `;
  document.head.appendChild(style);
  const layer=document.createElement('div');
  layer.id='victoryBurst';
  layer.setAttribute('aria-live','polite');
  layer.innerHTML='<div class="victoryToast"></div>';
  document.body.appendChild(layer);
  const palette=['#ff4fa3','#ffd84d','#4de1ff','#9d6cff','#62f59a','#ff704d','#ffffff'];
  let lastText='',lastLeader=null,hideTimer=null;
  function leader(){return typeof S!=='undefined'&&Number.isInteger(S.leader)?S.leader:null;}
  function playerName(i){const names=window.QI_MULTIPLAYER?.names;return names?.[i]||`J${i+1}`;}
  function winnerIndexFrom(text){
    const m=text.match(/J(\d+)\s+gagne la manche/i)||text.match(/Joueur\s+(\d+)\s+remporte la partie/i);
    return m?Number(m[1])-1:null;
  }
  function visibleToPlayer(winner){const multi=window.QI_MULTIPLAYER;return !multi?.active||winner===multi.seat;}
  function particle(originX,originY){
    const p=document.createElement('i'),angle=Math.random()*Math.PI*2,dist=90+Math.random()*230;
    p.className='partyBit';p.textContent=['◆','●','■','✦','★','♥','🌈'][Math.floor(Math.random()*7)];p.style.color=palette[Math.floor(Math.random()*palette.length)];
    p.style.setProperty('--ox',originX+'px');p.style.setProperty('--oy',originY+'px');p.style.setProperty('--ex',originX+Math.cos(angle)*dist+'px');p.style.setProperty('--ey',originY+Math.sin(angle)*dist+35+'px');p.style.setProperty('--r',(-360+Math.random()*720)+'deg');p.style.setProperty('--d',(2.8+Math.random()*.55)+'s');
    layer.appendChild(p);setTimeout(()=>p.remove(),3600);
  }
  function show(message,withParticles){
    clearTimeout(hideTimer);layer.querySelector('.victoryToast').textContent=message;layer.classList.add('show');
    if(withParticles){const x=innerWidth/2,y=Math.min(90,innerHeight*.16);for(let i=0;i<36;i++)particle(x,y);}
    hideTimer=setTimeout(()=>layer.classList.remove('show'),3500);
  }
  function watch(){
    const r=document.getElementById('result');if(!r)return;
    const currentLeader=leader(),visible=!r.classList.contains('hidden')&&r.textContent.trim();
    if(!visible){lastText='';lastLeader=currentLeader;return;}
    const text=r.textContent;if(text===lastText)return;lastText=text;
    const winner=winnerIndexFrom(text);if(winner===null||!visibleToPlayer(winner))return;
    const isRound=/gagne la manche/i.test(text),takesLead=isRound&&lastLeader!==null&&winner!==lastLeader;
    show(isRound?(takesLead?`${playerName(winner)} reprend la main !`:`${playerName(winner)} garde la main`):`${playerName(winner)} remporte la partie !`,takesLead);
    lastLeader=currentLeader;
  }
  new MutationObserver(watch).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
})();
