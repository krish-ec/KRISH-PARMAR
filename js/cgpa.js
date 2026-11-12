(function(){
  var card=document.querySelector('.cg');
  if(!card)return;
  var VAL='7.56',MAX=10,P=7.56/MAX,L=Math.PI*160,
      numEl=card.querySelector('.cg-num'),arc=card.querySelector('.cg-arc'),
      mascot=card.querySelector('.cg-mascot'),cap=card.querySelector('.cg-cap-g'),
      bar=card.querySelector('.cg-bar i'),conf=card.querySelector('.cg-conf'),
      reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,strips=[];
  // odometer digits: 30 numerals so each reel spins twice before landing
  numEl.setAttribute('aria-label','CGPA '+VAL);numEl.textContent='';
  VAL.split('').forEach(function(ch){
    if(ch==='.'){var d=document.createElement('span');d.className='cg-dot';d.textContent='.';d.setAttribute('aria-hidden','true');numEl.appendChild(d);return}
    var w=document.createElement('span'),s=document.createElement('span');w.className='cg-d';s.className='cg-strip';w.setAttribute('aria-hidden','true');
    for(var k=0;k<30;k++){var i=document.createElement('i');i.textContent=k%10;s.appendChild(i)}
    w.appendChild(s);numEl.appendChild(w);strips.push({el:s,end:-(20+(+ch))/30*100});
  });
  function place(p){
    arc.style.strokeDashoffset=L*(1-p);
    var a=Math.PI*p,x=200-160*Math.cos(a),y=200-160*Math.sin(a);
    mascot.setAttribute('transform','translate('+x.toFixed(1)+' '+y.toFixed(1)+')');
  }
  function confetti(){
    var cr=card.getBoundingClientRect(),mr=mascot.getBoundingClientRect(),
        ox=mr.left+mr.width/2-cr.left,oy=mr.top+mr.height/2-cr.top,cols=['#2a2cff','#ffb59e','#b9a8ff','#ff5d8f','#fff'];
    conf.style.left=ox+'px';conf.style.top=oy+'px';
    for(var k=0;k<34;k++){
      var b=document.createElement('b');b.style.background=cols[k%5];
      if(k%3===0)b.style.borderRadius='50%';
      conf.appendChild(b);
      var dx=gsap.utils.random(-260,260),up=gsap.utils.random(120,300);
      var removePiece=(function(piece){return function(){piece.remove()}})(b);
      gsap.timeline({onComplete:removePiece})
        .to(b,{x:dx,y:-up,rotation:gsap.utils.random(-540,540),duration:.7,ease:'power2.out'})
        .to(b,{y:200,x:dx*1.2,opacity:0,duration:1.1,ease:'power1.in'});
    }
  }
  function toss(){
    gsap.timeline().to(cap,{y:-70,rotation:360,duration:.45,ease:'power2.out'})
      .to(cap,{y:0,rotation:720,duration:.55,ease:'bounce.out'});
    gsap.fromTo(mascot.querySelector('.cg-body'),{scaleY:.8,scaleX:1.15},{scaleY:1,scaleX:1,duration:.8,ease:'elastic.out(1,.35)',transformOrigin:'50% 100%'});
  }
  if(reduce||!window.gsap||!window.ScrollTrigger){
    strips.forEach(function(s){s.el.style.transform='translateY('+s.end+'%)'});place(P);bar.style.width=P*100+'%';return;
  }
  gsap.registerPlugin(ScrollTrigger);
  place(0);bar.style.width='0%';
  gsap.set(card,{scale:.8,opacity:0,rotate:-3});
  gsap.set('.cg-deco',{scale:0});
  ScrollTrigger.create({trigger:card,start:'top 78%',once:true,onEnter:function(){
    var o={p:0},tl=gsap.timeline();
    tl.to(card,{scale:1,opacity:1,rotate:0,duration:1,ease:'elastic.out(1,.55)'})
      .to('.cg-deco',{scale:1,stagger:.12,duration:.9,ease:'elastic.out(1,.4)'},.2)
      .to(o,{p:P,duration:2.4,ease:'power3.out',onUpdate:function(){
        place(o.p);mascot.querySelector('.cg-body').style.transform='rotate('+(Math.sin(o.p*60)*6)+'deg)';
      }},.5)
      .to(bar,{width:P*100+'%',duration:2.4,ease:'power3.out'},.5);
    strips.forEach(function(s,i){
      tl.fromTo(s.el,{yPercent:0},{yPercent:s.end,duration:2.2+i*.45,ease:'back.out(1.1)'},.5);
    });
    tl.add(function(){toss();confetti()},2.9);
  }});
  mascot.addEventListener('click',function(){toss();confetti()});
})();
