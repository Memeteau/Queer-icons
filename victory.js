(() => {
  const reactions = [
    ['giphy','l0HlTdKkHtlAQJJWE'],['giphy','l3vR9kTvuSMTIkm5O'],['giphy','YrtYdOglTvUtNvfusl'],
    ['giphy','f069uQFFv99PYnhyQm'],['giphy','l41lUu4B3s5FwBxmM'],['giphy','l4FAVlSanae4EyRMs'],
    ['giphy','l3q2ZPnyGbwuaJcAw'],['giphy','3oEdv9VWbSWAJKHlw4'],['giphy','3o85xuidIp8EWDv8DS'],
    ['giphy','l0HlM2CoG0NmkWq2I'],['giphy','3o6Zt1yHptc5KrHCeI'],['giphy','26mkhPoyX6SD6f3Tq'],
    ['giphy','3oKHWalGcgCRqvL4uQ'],['giphy','LwyautDbKoE5Qz7kQo'],['giphy','Ahwyp632q9LS1n5FEO'],
    ['tenor','8448053'],['tenor','5822648'],['tenor','4783886'],['tenor','6083940'],
    ['tenor','5888142'],['tenor','15894512']
  ];
  const style=document.createElement('style');
  style.textContent=`
  #victoryBurst{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:#10081899;backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .16s ease;overflow:hidden}
  #victoryBurst.show{opacity:1;pointer-events:auto}.victoryFrame{width:min(78vw,520px);aspect-ratio:4/3;border:4px solid #f1cf54;border-radius:28px;overflow:hidden;background:#130b19;box-shadow:0 20px 90px #000c,0 0 50px #f1cf5466;transform:scale(.82) rotate(-1deg);animation:vPop .32s cubic-bezier(.2,1.5,.4,1) forwards}.victoryFrame iframe{width:100%;height:100%;border:0;display:block}.victoryTitle{position:absolute;top:max(18px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);font:900 clamp(26px,7vw,54px)/.9 Georgia,serif;color:#fff;text-shadow:0 3px 0 #7b4aa2,0 6px 18px #000;white-space:nowrap;z-index:5}
  .partyBit,.partyStar,.partyRainbow{position:absolute;left:0;top:0;z-index:4;pointer-events:none;will-change:transform,opacity}.partyBit{font-size:clamp(16px,4vw,34px);animation:partyBlast var(--d) cubic-bezier(.08,.72,.22,1) forwards}.partyStar{font-size:clamp(15px,3vw,30px);animation:partyBlast var(--d) cubic-bezier(.08,.72,.22,1) forwards}.partyRainbow{font-size:clamp(19px,4vw,38px);animation:partyBlast var(--d) cubic-bezier(.08,.72,.22,1) forwards}
  @keyframes vPop{to{transform:scale(1) rotate(0)}}
  @keyframes partyBlast{0%{transform:translate3d(var(--ox),var(--oy),0) scale(.2) rotate(0);opacity:0}5%{opacity:1}18%{transform:translate3d(var(--mx),var(--my),0) scale(1.35) rotate(var(--r1));opacity:1}100%{transform:translate3d(var(--ex),var(--ey),0) scale(.85) rotate(var(--r2));opacity:0}}
  @media(max-width:600px){.victoryFrame{width:90vw;aspect-ratio:1/1}.victoryTitle{top:max(12px,env(safe-area-inset-top));font-size:30px}}
  `;document.head.appendChild(style);
  const layer=document.createElement('div');layer.id='victoryBurst';layer.innerHTML='<div class="victoryTitle">WINNER! ✨</div><div class="victoryFrame"></div>';document.body.appendChild(layer);
  let showing=false,lastText='';
  const palette=['#ff4fa3','#ffd84d','#4de1ff','#9d6cff','#62f59a','#ff704d','#ffffff'];
  function particle(glyph,ox,oy,angle,dist,delay=0,kind='partyBit'){
    const p=document.createElement('i');p.className=kind;p.textContent=glyph;p.style.color=palette[Math.floor(Math.random()*palette.length)];
    const mid=dist*.58,end=dist;const mx=ox+Math.cos(angle)*mid,my=oy+Math.sin(angle)*mid;const ex=ox+Math.cos(angle)*end,ey=oy+Math.sin(angle)*end+40+Math.random()*90;
    p.style.setProperty('--ox',ox+'px');p.style.setProperty('--oy',oy+'px');p.style.setProperty('--mx',mx+'px');p.style.setProperty('--my',my+'px');p.style.setProperty('--ex',ex+'px');p.style.setProperty('--ey',ey+'px');p.style.setProperty('--r1',(-180+Math.random()*360)+'deg');p.style.setProperty('--r2',(-720+Math.random()*1440)+'deg');p.style.setProperty('--d',(1.6+Math.random()*1.8)+'s');p.style.animationDelay=delay+'ms';layer.appendChild(p);setTimeout(()=>p.remove(),delay+3900)
  }
  function cannon(x,y,baseAngle,count){
    for(let i=0;i<count;i++){const a=baseAngle+(-.75+Math.random()*1.5);particle(['◆','●','■','✦','★','♥'][Math.floor(Math.random()*6)],x,y,a,260+Math.random()*520,Math.random()*160)}
    for(let i=0;i<7;i++){const a=baseAngle+(-.65+Math.random()*1.3);particle(['✦','★','✧'][Math.floor(Math.random()*3)],x,y,a,220+Math.random()*430,80+Math.random()*260,'partyStar')}
    for(let i=0;i<4;i++){const a=baseAngle+(-.55+Math.random()*1.1);particle('🌈',x,y,a,200+Math.random()*390,120+Math.random()*320,'partyRainbow')}
  }
  function party(){
    const w=innerWidth,h=innerHeight;
    cannon(12,h*.78,-Math.PI/4,28);cannon(w-12,h*.78,-3*Math.PI/4,28);
    cannon(12,h*.30,0,22);cannon(w-12,h*.30,Math.PI,22);
    cannon(w*.5,h*.55,-Math.PI/2,34);
    setTimeout(()=>{if(layer.classList.contains('show')){cannon(12,h*.60,-.25,20);cannon(w-12,h*.60,Math.PI+.25,20);cannon(w*.5,h*.58,-Math.PI/2,26)}},2100)
  }
  function show(){if(showing)return;showing=true;const [kind,id]=reactions[Math.floor(Math.random()*reactions.length)];const frame=layer.querySelector('.victoryFrame');const src=kind==='giphy'?`https://giphy.com/embed/${id}`:`https://tenor.com/embed/${id}`;frame.innerHTML=`<iframe src="${src}" allow="autoplay; fullscreen" loading="eager"></iframe>`;layer.classList.add('show');party();setTimeout(()=>{layer.classList.remove('show');setTimeout(()=>{frame.innerHTML='';showing=false},250)},5000)}
  function watch(){const r=document.getElementById('result');if(!r)return;const visible=!r.classList.contains('hidden')&&r.textContent.trim();if(visible&&r.textContent!==lastText){lastText=r.textContent;show()}if(!visible)lastText=''}
  new MutationObserver(watch).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
})();
const multiplayerLoader=document.createElement('script');multiplayerLoader.src='multiplayer.js?v=20260831-1';document.body.appendChild(multiplayerLoader);
