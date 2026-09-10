/* Full-screen loser reactions for Drama Queen. */
(() => {
  'use strict';
  const LINES=['Girl please…','Not born ready','Tu retouchais ton make up pendant le jeu ?','Ne montre pas tes larmes'];
  const ICONS=['😭','🙄','😅','😟','😕','🙁','😰','😓','😥','😢','😬','😓'];
  let lastKey='';
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const style=document.createElement('style');
  style.textContent=`
    .dqLoseOverlay{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;pointer-events:none;overflow:hidden;background:radial-gradient(circle at center,#702b8750 0,#2c12345e 34%,transparent 72%)}
    .dqLoseCloud{position:absolute;width:min(120vw,900px);height:min(70vw,520px);border-radius:50%;background:radial-gradient(ellipse at 35% 48%,#be76d95c 0,transparent 42%),radial-gradient(ellipse at 68% 55%,#7d459a5c 0,transparent 45%),radial-gradient(ellipse at 50% 50%,#4f245f66 0,transparent 64%);filter:blur(30px);animation:dqCloudDrift 2.8s ease-in-out infinite alternate}
    .dqLoseCenter{position:relative;z-index:2;width:min(88vw,760px);text-align:center;padding:30px 18px}
    .dqLoseMain{font-family:Georgia,"Times New Roman",serif;font-weight:900;font-size:clamp(38px,10vw,84px);line-height:1.02;color:#efb8ff;text-shadow:0 0 7px #fff0ff,0 0 18px #d16cff,0 0 38px #8a35ad,0 0 64px #5e1f7a;animation:dqVioletShimmer .85s ease-in-out infinite alternate,dqLoseZoom .72s cubic-bezier(.2,1.25,.35,1) both}
    .dqLoseIcons{position:absolute;inset:-16vh -4vw;z-index:1}.dqLoseIcon{position:absolute;font-size:clamp(25px,6vw,50px);filter:drop-shadow(0 0 10px #b75bdd);animation:dqIconFloat 1.8s ease-in-out infinite alternate}
    @keyframes dqVioletShimmer{to{filter:brightness(1.28);text-shadow:0 0 10px #fff,0 0 25px #e393ff,0 0 48px #9c45c2,0 0 78px #61227d}}
    @keyframes dqLoseZoom{0%{transform:scale(.22);opacity:0}58%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}
    @keyframes dqCloudDrift{to{transform:translate(3vw,-1vh) scale(1.08);opacity:.78}}
    @keyframes dqIconFloat{from{transform:translateY(6px) rotate(-5deg);opacity:.7}to{transform:translateY(-8px) rotate(5deg);opacity:1}}
    @media(prefers-reduced-motion:reduce){.dqLoseCloud,.dqLoseMain,.dqLoseIcon{animation:none}}
  `;
  document.head.append(style);
  function seat(){const m=window.QI_MULTIPLAYER;return m&&m.active?m.seat:null;}
  function remove(){document.querySelector('.dqLoseOverlay')?.remove();}
  function show(){
    remove();
    const el=document.createElement('div');el.className='dqLoseOverlay';
    const icons=ICONS.map((x,i)=>{const a=(i/ICONS.length)*Math.PI*2;const rx=44,ry=38;const left=50+Math.cos(a)*rx,top=50+Math.sin(a)*ry;return `<span class="dqLoseIcon" style="left:${left}%;top:${top}%;animation-delay:${(i%4)*.13}s">${x}</span>`;}).join('');
    el.innerHTML=`<div class="dqLoseCloud"></div><div class="dqLoseCenter"><div class="dqLoseIcons">${icons}</div><div class="dqLoseMain">${pick(LINES)}</div></div>`;
    document.body.append(el);setTimeout(remove,3500);
  }
  function check(){
    try{
      if(typeof S==='undefined'||S.mode!=='drama'||!S.locked||!S.dq?.last||S.dq.last.winner==null)return;
      const me=seat();if(me==null||me===S.dq.last.winner)return;
      const key=`${S.round}:${S.dq.turn}:${S.dq.last.winner}:${me}`;
      if(key===lastKey)return;lastKey=key;show();
    }catch(_){ }
  }
  const install=()=>{
    if(!window.DramaUI)return setTimeout(install,50);
    const oldRender=window.DramaUI.render;
    window.DramaUI.render=function(...args){const r=oldRender.apply(this,args);setTimeout(check,0);return r;};
    const oldApply=window.DramaUI.apply;
    window.DramaUI.apply=function(...args){const r=oldApply.apply(this,args);setTimeout(check,0);return r;};
  };
  install();
})();