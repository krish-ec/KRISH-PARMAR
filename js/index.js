(function(){
gsap.registerPlugin(ScrollTrigger);
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
var fine=matchMedia('(hover:hover)').matches;
var mx=innerWidth/2,my=innerHeight/2;

// smooth scroll
if(window.Lenis&&!reduce){var lenis=new Lenis({lerp:.09});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);
document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();lenis.scrollTo(t)}})})}

// split hero title
var chars=[];
document.querySelectorAll('#title .ln').forEach(function(l){var s=l.textContent;l.textContent='';s.split('').forEach(function(c){var e=document.createElement('span');e.className='ch';e.textContent=c;l.appendChild(e);chars.push(e)})});
// marquee
var mq=document.getElementById('mq'),words='Design with intent ✦ Engineer with care ✦ Make it feel alive ✦ ';
mq.innerHTML=('<span>'+words+'</span>').repeat(4);
// split story
var st=document.getElementById('story');
st.innerHTML=st.textContent.split(' ').map(function(w){return '<span class="w">'+w+'</span>'}).join(' ');

// loader
var cnt=document.getElementById('count'),o={v:0};
gsap.set(chars,{yPercent:115,rotate:6});
var tl=gsap.timeline();
tl.to(o,{v:100,duration:reduce?.3:2,ease:'power2.inOut',onUpdate:function(){cnt.textContent=Math.round(o.v)}})
  .to('#loader',{yPercent:-100,duration:1,ease:'power4.inOut'})
  .to(chars,{yPercent:0,rotate:0,duration:1.2,ease:'expo.out',stagger:.04},'-=.4')
  .from('.hero .meta',{opacity:0,y:30,duration:1,ease:'power3.out'},'-=.8')
  .set('#loader',{display:'none'});

// hero letters react to cursor (variable font weight + lift)
function letters(){
  chars.forEach(function(c){var r=c.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,d=Math.hypot(mx-cx,my-cy),k=Math.max(0,1-d/380);
    c.style.fontVariationSettings="'wght' "+Math.round(300+k*500)});
}

// particles
var cv=document.getElementById('fx'),cx=cv.getContext('2d'),P=[],W,H,dpr=Math.min(devicePixelRatio||1,2);
function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  P=[];var n=Math.min(120,Math.floor(W*H/9000));for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+1})}
size();addEventListener('resize',size);
function draw(){
  cx.clearRect(0,0,W,H);var rect=cv.getBoundingClientRect(),px=mx-rect.left,py=my-rect.top;
  for(var i=0;i<P.length;i++){var p=P[i],dx=p.x-px,dy=p.y-py,d=Math.hypot(dx,dy);
    if(d<170&&d>0){var f=(170-d)/170;p.vx+=dx/d*f*.6;p.vy+=dy/d*f*.6}
    p.vx*=.96;p.vy*=.96;p.x+=p.vx+.1;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    cx.fillStyle='rgba(255,181,158,.9)';cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fill();
    for(var j=i+1;j<P.length;j++){var q=P[j],a=p.x-q.x,b=p.y-q.y,dd=a*a+b*b;if(dd<9000){cx.strokeStyle='rgba(185,168,255,'+(1-dd/9000)*.5+')';cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke()}}}
}
// cursor
var cur=document.getElementById('cur'),cxp=mx,cyp=my;
addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY});
document.querySelectorAll('[data-cursor]').forEach(function(el){el.addEventListener('mouseenter',function(){cur.classList.add('big');cur.textContent=el.dataset.mag!==undefined?'':'View'});el.addEventListener('mouseleave',function(){cur.classList.remove('big')})});
gsap.ticker.add(function(){cxp+=(mx-cxp)*.2;cyp+=(my-cyp)*.2;cur.style.transform='translate('+cxp+'px,'+cyp+'px)';
  if(scrollY<innerHeight*1.2&&!reduce){draw();if(fine)letters()}});

// magnetic button
document.querySelectorAll('[data-mag]').forEach(function(el){
  el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.45,y:(e.clientY-r.top-r.height/2)*.45,duration:.4})});
  el.addEventListener('mouseleave',function(){gsap.to(el,{x:0,y:0,duration:.9,ease:'elastic.out(1,.4)'})})});

// card tilt
document.querySelectorAll('.card').forEach(function(c){var a=c.querySelector('.art');
  c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;a.style.transform='rotateY('+x*14+'deg) rotateX('+-y*14+'deg)'});
  c.addEventListener('mouseleave',function(){a.style.transform=''})});


// ---- design process: scroll-scrubbed Figma-style session
(function(){
var NS='http://www.w3.org/2000/svg',mpOk=!!window.MotionPathPlugin;if(mpOk)gsap.registerPlugin(MotionPathPlugin);
var $=function(i){return document.getElementById(i)},sec=$('process'),bd=$('bd'),fr=$('fr'),hd=$('hd'),bt=$('bt'),cl=$('cl'),cxs=$('cx'),T=null,lastW=0;
function pos(el,root){var x=0,y=0,e=el;while(e&&e!==root){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent}return{x:x,y:y,w:el.offsetWidth,h:el.offsetHeight}}
function ctr(p){return{x:p.x+p.w/2,y:p.y+p.h/2}}
function mk(n,c,tc){var d=document.createElement('div');d.className='fc';d.innerHTML='<svg width="22" height="24" viewBox="0 0 14 20"><path d="M1 1v15l4-3.6 3 6.6 2.4-1.1-3-6.4H13z" fill="'+c+'" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg><i style="background:'+c+';color:'+(tc||'#0b0c3a')+'">'+n+'</i>';cl.appendChild(d);return d}
function sel(c,p,t,tc){var f=document.createElement('div');f.className='sel';f.style.cssText='color:'+c+';left:'+(p.x-6)+'px;top:'+(p.y-6)+'px;width:'+(p.w+12)+'px;height:'+(p.h+12)+'px';f.innerHTML='<s></s><s></s><s></s><s></s><em style="background:'+c+';color:'+(tc||'#0b0c3a')+'">'+t+'</em>';cl.appendChild(f);return f}
function put(c,p){c._p=p;gsap.set(c,{x:p.x,y:p.y,opacity:0})}
function walk(tl,c,pts,at,d){var a=[c._p].concat(pts);c._p=a[a.length-1];tl.to(c,mpOk?{motionPath:{path:a,curviness:1.4},duration:d,ease:'none'}:{x:c._p.x,y:c._p.y,duration:d,ease:'none'},at)}
function line(a,b){var p=document.createElementNS(NS,'path');p.setAttribute('d','M'+a.x+' '+a.y+'C'+(a.x+70)+' '+a.y+' '+(b.x-70)+' '+b.y+' '+b.x+' '+b.y);p.setAttribute('pathLength',1);p.setAttribute('fill','none');p.setAttribute('stroke','#b9a8ff');p.setAttribute('stroke-width',2);p.setAttribute('stroke-linecap','round');cxs.appendChild(p);gsap.set(p,{strokeDasharray:1,strokeDashoffset:1});return p}

function bProc(){
  if(T){if(T.scrollTrigger)T.scrollTrigger.kill(true);T.kill()}
  cl.innerHTML='';cxs.innerHTML='';
  gsap.set('#bd,#fr,#hd,#bt,#gr,#g1,#g2,#sw,#cmt,#ntf,#cap,.pt,.fl,.tb,.nv b,.nv span,.cd,.ps',{clearProps:'all'});
  var W=bd.offsetWidth,Hh=bd.offsetHeight;bd.style.setProperty('--u',W/100+'px');hd.textContent='';gsap.set(fr,{transformOrigin:'0 0'});
  var fp=pos(fr,bd),hp=pos(hd,bd),bp=pos(bt,bd),lp=ctr(pos(document.querySelector('.nv b'),bd)),np=pos($('nv'),bd),
      cards=gsap.utils.toArray('.cd'),cp=cards.map(function(c){return pos(c,bd)}),step=cp[1].x-cp[0].x,ps=gsap.utils.toArray('.ps');
  $('g1').style.left=cp[0].x+'px';$('g2').style.top=cp[0].y+'px';
  var swp={x:fp.x+fp.w*.76,y:fp.y+fp.h*.26};$('sw').style.left=swp.x+'px';$('sw').style.top=swp.y+'px';
  var cmp={x:fp.x+fp.w*.74,y:hp.y+hp.h*.55};$('cmt').style.left=cmp.x+'px';$('cmt').style.top=cmp.y+'px';
  var M=mk('Maya','#ffb59e'),K=mk('Kai','#b9a8ff'),S=mk('Sam','#ff5d8f','#fff');
  put(M,{x:fp.x-70,y:fp.y-50});put(K,{x:W*.55,y:-70});put(S,{x:W+60,y:Hh*.85});
  var s1=sel('#ff5d8f',hp,'Heading','#fff'),s2=sel('#ffb59e',cp[1],'Card');gsap.set([s1,s2],{opacity:0});
  var L1=line(lp,{x:hp.x,y:hp.y+hp.h*.2}),L2=line({x:hp.x+20,y:hp.y+hp.h},{x:bp.x,y:bp.y+bp.h/2}),L3=line({x:bp.x+bp.w,y:bp.y+bp.h/2},{x:cp[1].x+cp[1].w/2,y:cp[1].y});
  var D=document.createElementNS(NS,'circle');D.setAttribute('r',5);D.setAttribute('fill','#fff');cxs.appendChild(D);gsap.set(D,{opacity:0});
  var tl=gsap.timeline({defaults:{ease:'none'},paused:reduce,scrollTrigger:reduce?null:{trigger:sec,start:'top top',end:'+=320%',pin:true,scrub:.8,invalidateOnRefresh:false,refreshPriority:2}});T=tl;
  // 01 the idea
  tl.from(fr,{scaleX:0,scaleY:0,duration:1.4},.4).from('.fl',{opacity:0,duration:.3},1.2)
    .to(M,{opacity:1,duration:.2},0);walk(tl,M,[{x:fp.x,y:fp.y},{x:fp.x+fp.w,y:fp.y+fp.h}],0,1.8);
  tl.from('.nv b',{scale:0,duration:.3},1.9).from('.nv span',{scaleX:0,transformOrigin:'0 50%',stagger:.12,duration:.3},2)
    .to(K,{opacity:1,duration:.2},1.2);walk(tl,K,[{x:lp.x,y:lp.y-60},lp,{x:np.x+np.w*.9,y:lp.y}],1.2,1.6);
  var txt='I build digital worlds with purpose.',ob={n:0};
  tl.to(S,{opacity:1,duration:.2},1.7);walk(tl,S,[{x:hp.x+hp.w*.8,y:hp.y+hp.h*.2},{x:hp.x+hp.w*.9,y:hp.y+hp.h*.9}],1.7,1.7);
  tl.to(ob,{n:txt.length,duration:1.4,onUpdate:function(){hd.textContent=txt.slice(0,Math.round(ob.n))}},2)
    .to(L1,{strokeDashoffset:0,duration:.6},2.6).to(L2,{strokeDashoffset:0,duration:.6},3);
  // 02 design begins
  tl.fromTo('#gr',{opacity:0},{opacity:.6,duration:.5},2.4)
    .from(cards,{opacity:0,y:50,x:function(i){return[-step*.35,step*.3,-step*.2][i]},rotation:function(i){return[-6,5,-4][i]},stagger:.15,duration:.9,ease:'power2.out'},3)
    .from(bt,{opacity:0,scale:.4,duration:.4,ease:'back.out(2)'},3.4)
    .fromTo('#g1',{opacity:0},{opacity:1,duration:.15},3.9).to('#g1',{opacity:0,duration:.25},4.6)
    .fromTo('#g2',{opacity:0},{opacity:1,duration:.15},4).to('#g2',{opacity:0,duration:.25},4.7).to(L3,{strokeDashoffset:0,duration:.6},4.4);
  walk(tl,M,[ctr(cp[0]),ctr(cp[1]),ctr(cp[2])],2.9,2);walk(tl,K,[ctr(bp)],3,.9);
  // 03 collaboration
  walk(tl,K,[{x:swp.x+30,y:swp.y+20}],5,.8);
  tl.fromTo('#sw',{opacity:0,scale:.3,transformOrigin:'0 0'},{opacity:1,scale:1,duration:.3},5)
    .to(fr,{backgroundColor:'#2a2cff',duration:1},5.8).to(hd,{color:'#f3f1ff',duration:1},5.8)
    .to('.nv b',{backgroundColor:'#ffb59e',duration:1},5.8).to('.nv span',{backgroundColor:'#f3f1ff',duration:1},5.8)
    .to(bt,{backgroundColor:'#ffb59e',color:'#0b0c3a',duration:1},5.8).to('#sw',{opacity:0,duration:.3},7);
  walk(tl,S,[{x:hp.x+hp.w+8,y:hp.y+hp.h+8}],5,.6);
  tl.to(s1,{opacity:1,duration:.2},5.2).to(hd,{fontWeight:800,letterSpacing:'-.055em',duration:1.2},5.4).to(s1,{opacity:0,duration:.2},7)
    .fromTo('#ntf',{opacity:0,y:-12},{opacity:1,y:0,duration:.3},5.3).to('#ntf',{opacity:0,duration:.3},6.8);
  walk(tl,M,[ctr(cp[1])],5,.5);walk(tl,M,[{x:ctr(cp[1]).x+step,y:ctr(cp[1]).y}],5.6,1);
  tl.to(s2,{opacity:1,duration:.2},5.5).to(s2,{x:step,duration:1,ease:'power2.inOut'},5.6).to(cards[1],{x:step,duration:1,ease:'power2.inOut'},5.6).to(cards[2],{x:-step,duration:1,ease:'power2.inOut'},5.6).to(s2,{opacity:0,duration:.2},7)
    .fromTo('#cmt',{opacity:0,scale:0,transformOrigin:'0 100%'},{opacity:1,scale:1,duration:.35,ease:'back.out(2)'},6.4);
  if(mpOk)tl.fromTo(D,{opacity:0},{opacity:1,duration:.1},5.4).to(D,{motionPath:{path:L3,align:L3,alignOrigin:[.5,.5]},duration:1.2},5.4).to(D,{opacity:0,duration:.1},6.6);
  // 04 transformation
  tl.to('#cx,#gr,.fl,#cmt,#ntf',{opacity:0,duration:.4},7.4).to([M,K,S],{opacity:0,duration:.4},7.4).to('.pt',{opacity:0,y:-20,duration:.4},7.4)
    .fromTo('.tb',{opacity:0},{opacity:1,duration:.4},7.6)
    .to(bd,{rotationX:14,rotationY:-16,scale:1.1,z:40,duration:1.8,ease:'power2.inOut'},7.6)
    .to(fr,{boxShadow:'0 50px 90px rgba(0,0,0,.55)',duration:1.8},7.6)
  // 05 the result
    .to(bd,{rotationX:8,rotationY:-10,scale:1.2,yPercent:-4,duration:1,ease:'power2.inOut'},9.4)
    .fromTo('#cap',{opacity:0,y:30},{opacity:1,y:0,duration:.8,ease:'power3.out'},9.5);
  var at=[0,2.4,5,7.5,9.5];gsap.set(ps,{opacity:0});
  ps.forEach(function(p,i){tl.fromTo(p,{opacity:i?0:1},{opacity:1,duration:.3},i?at[i]:0);if(i<4)tl.to(p,{opacity:0,duration:.3},at[i+1]-.1)});
  if(reduce)tl.progress(1);
}
// particles
var pc=$('pc'),px=pc.getContext('2d'),pp=[],pv=true;
function psz(){pc.width=sec.offsetWidth;pc.height=sec.offsetHeight;pp=[];for(var i=0;i<46;i++)pp.push({x:Math.random()*pc.width,y:Math.random()*pc.height,r:Math.random()*1.6+.4,s:Math.random()*.3+.1})}
gsap.ticker.add(function(){if(!pv||reduce)return;px.clearRect(0,0,pc.width,pc.height);px.fillStyle='rgba(185,168,255,.6)';pp.forEach(function(p){p.y-=p.s;if(p.y<0)p.y=pc.height;px.beginPath();px.arc(p.x,p.y,p.r,0,6.283);px.fill()})});
psz();bProc();lastW=innerWidth;
ScrollTrigger.create({trigger:sec,start:'top bottom',end:'bottom top',onToggle:function(s){pv=s.isActive}});
var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){if(innerWidth===lastW)return;lastW=innerWidth;psz();bProc();ScrollTrigger.refresh()},300)});
})();

if(!reduce){
  // marquee speeds up with scroll
  var mqt=gsap.getProperty('#mq','x');
  ScrollTrigger.create({onUpdate:function(s){gsap.to('#mq',{skewX:Math.max(-12,Math.min(12,s.getVelocity()/-120)),duration:.3,overwrite:true})}});
  // horizontal scroll
  var tr=document.getElementById('track');
  gsap.to(tr,{x:function(){return -(tr.scrollWidth-innerWidth)},ease:'none',scrollTrigger:{trigger:'#work',pin:true,scrub:1,end:function(){return '+='+(tr.scrollWidth-innerWidth)},invalidateOnRefresh:true}});
  // text reveal
  gsap.to('.about .w',{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:'#story',start:'top 80%',end:'bottom 45%',scrub:true}});
  gsap.from('.skills span',{y:40,opacity:0,stagger:.08,duration:.8,ease:'power3.out',scrollTrigger:{trigger:'.skills',start:'top 90%'}});
  // contact headline slides in
  gsap.from('.contact h2',{yPercent:30,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:'.contact',start:'top 60%'}});
}else{document.querySelectorAll('.about .w').forEach(function(w){w.style.opacity=1})}
})();
