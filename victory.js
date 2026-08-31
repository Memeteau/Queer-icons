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
  #victoryBurst.show{opacity:1;pointer-events:auto}.victoryFrame{width:min(78vw,520px);aspect-ratio:4/3;border:4px solid #f1cf54;border-radius:28px;overflow:hidden;background:#130b19;box-shadow:0 20px 90px #000c,0 0 50px #f1cf5466;transform:scale(.82) rotate(-1deg);animation:vPop .32s cubic-bezier(.2,1.5,.4,1) forwards}.victoryFrame iframe{width:100%;height:100%;border:0;display:block}.victoryTitle{position:absolute;top:max(18px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);font:900 clamp(26px,7vw,54px)/.9 Georgia,serif;color:#fff;text-shadow:0 3px 0 #7b4aa2,0 6px 18px #000;white-space:nowrap;z-index:3}.partyBit{position:absolute;font-size:clamp(16px,4vw,34px);animation:partyBlast var(--d) cubic-bezier(.12,.72,.25,1) forwards;z-index:2;will-change:transform,opacity}.partyStar{position:absolute;font-size:clamp(15px,3vw,28px);animation:starPop 1.45s ease-out forwards;z-index:2}.partyRainbow{position:absolute;font-size:clamp(18px,4vw,36px);animation:rainbowPop 1.7s ease-out forwards;z-index:2}
  @keyframes vPop{to{transform:scale(1) rotate(0)}}
  @keyframes partyBlast{0%{transform:translate(0,0) scale(.55) rotate(0);opacity:0}8%{opacity:1}100%{transform:translate(var(--x),var(--y)) scale(1.08) rotate(var(--r));opacity:0}}
  @keyframes starPop{0%{transform:scale(.1) rotate(0);opacity:0}30%{transform:scale(1.55) rotate(20deg);opacity:1}100%{transform:scale(.25) translate(var(--sx),var(--sy)) rotate(160deg);opacity:0}}
  @keyframes rainbowPop{0%{transform:scale(.15) rotate(-20deg);opacity:0}25%{transform:scale(1.35) rotate(8deg);opacity:1}100%{transform:scale(.45) translate(var(--rx),var(--ry)) rotate(40deg);opacity:0}}
  @media(max-width:600px){.victoryFrame{width:90vw;aspect-ratio:1/1}.victoryTitle{top:max(12px,env(safe-area-inset-top));font-size:30px}}
  `;document.head.appendChild(style);
  const layer=document.createElement('div');layer.id='victoryBurst';layer.innerHTML='<div class="victoryTitle">WINNER! ✨</div><div class="victoryFrame"></div>';document.body.appendChild(layer);
  let showing=false,lastText='';
  function party(){
    const palette=['#ff4fa3','#ffd84d','#4de1ff','#9d6cff','#62f59a','#ff704d','#ffffff'];
    const glyphs=['◆','●','■','✦','★','♥','✧'];
    const origins=[[50,50],[8,50],[92,50],[50,8],[50,92],[8,12],[92,12],[8,88],[92,88]];
    for(let i=0;i<95;i++){
      const b=document.createElement('i');b.className='partyBit';b.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
      const [ox,oy]=origins[Math.floor(Math.random()*origins.length)];b.style.left=ox+'vw';b.style.top=oy+'vh';b.style.color=palette[Math.floor(Math.random()*palette.length)];
      const angle=Math.random()*Math.PI*2,dist=90+Math.random()*520;b.style.setProperty('--x',(Math.cos(angle)*dist)+'px');b.style.setProperty('--y',(Math.sin(angle)*dist)+'px');b.style.setProperty('--r',(-720+Math.random()*1440)+'deg');b.style.setProperty('--d',(1.8+Math.random()*2.2)+'s');layer.appendChild(b);setTimeout(()=>b.remove(),4300)
    }
    for(let i=0;i<28;i++){
      const s=document.createElement('i');s.className='partyStar';s.textContent=['✦','★','✧'][Math.floor(Math.random()*3)];s.style.left=(5+Math.random()*90)+'vw';s.style.top=(7+Math.random()*84)+'vh';s.style.color=['#fff','#ffd84d','#ff8ed0','#80eaff'][Math.floor(Math.random()*4)];s.style.animationDelay=(Math.random()*1.3)+'s';s.style.setProperty('--sx',(-60+Math.random()*120)+'px');s.style.setProperty('--sy',(-80+Math.random()*160)+'px');layer.appendChild(s);setTimeout(()=>s.remove(),3100)
    }
    for(let i=0;i<16;i++){
      const r=document.createElement('i');r.className='partyRainbow';r.textContent='🌈';r.style.left=(3+Math.random()*94)+'vw';r.style.top=(6+Math.random()*84)+'vh';r.style.animationDelay=(Math.random()*1.4)+'s';r.style.setProperty('--rx',(-80+Math.random()*160)+'px');r.style.setProperty('--ry',(-90+Math.random()*180)+'px');layer.appendChild(r);setTimeout(()=>r.remove(),3400)
    }
    setTimeout(()=>{if(layer.classList.contains('show'))partyWave()},2100);
  }
  function partyWave(){
    const palette=['#ff4fa3','#ffd84d','#4de1ff','#9d6cff','#62f59a','#ff704d','#ffffff'];
    for(let i=0;i<45;i++){
      const b=document.createElement('i');b.className='partyBit';b.textContent=['◆','●','■','✦','★','🌈'][Math.floor(Math.random()*6)];b.style.left='50vw';b.style.top='50vh';b.style.color=palette[Math.floor(Math.random()*palette.length)];const angle=Math.random()*Math.PI*2,dist=100+Math.random()*460;b.style.setProperty('--x',(Math.cos(angle)*dist)+'px');b.style.setProperty('--y',(Math.sin(angle)*dist)+'px');b.style.setProperty('--r',(-540+Math.random()*1080)+'deg');b.style.setProperty('--d',(1.7+Math.random()*1.7)+'s');layer.appendChild(b);setTimeout(()=>b.remove(),3700)
    }
  }
  function show(){if(showing)return;showing=true;const [kind,id]=reactions[Math.floor(Math.random()*reactions.length)];const frame=layer.querySelector('.victoryFrame');const src=kind==='giphy'?`https://giphy.com/embed/${id}`:`https://tenor.com/embed/${id}`;frame.innerHTML=`<iframe src="${src}" allow="autoplay; fullscreen" loading="eager"></iframe>`;layer.classList.add('show');party();setTimeout(()=>{layer.classList.remove('show');setTimeout(()=>{frame.innerHTML='';showing=false},250)},5000)}
  function watch(){const r=document.getElementById('result');if(!r)return;const visible=!r.classList.contains('hidden')&&r.textContent.trim();if(visible&&r.textContent!==lastText){lastText=r.textContent;show()}if(!visible)lastText=''}
  new MutationObserver(watch).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
})();
