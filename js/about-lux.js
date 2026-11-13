/* About: Kubrick-style iris (white screen -> black dot expands) into a drawn "path" timeline */
(function(){
  var S=document.getElementById('about');
  if(!S||!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,
      $=function(s,r){return(r||S).querySelector(s)},
      iris=$('.ab-iris'),dark=$('.ab-dark'),light=$('.ab-light'),box=$('.ab-path'),
      svg=$('.ab-path svg'),track=$('.ab-track'),draw=$('.ab-draw'),dot=$('.ab-dot'),
      nodeBox=$('.ab-nodes'),end=$('.ab-end'),tc=$('.ab-tc'),intro=$('.ab-dark .ab-intro');
  var DATA=[
    ['01','Computer Science & Engineering','GSFC University. CGPA 7.56 after the second semester.'],
    ['02','Event organizer','Navrachna University.'],
    ['03','Literature Club','GSFC University.'],
    ['04','Social Media Head','NeuroRob.'],
    ['05','Gujarat Keshari Powerlifting','Best deadlift in my category at 197.5 kg. Two golds, one silver.'],
    ['06','Vadodara S3 tournament','Third place, together with the team.']
  ];
  var nodes=DATA.map(function(d){
    var n=document.createElement('div');n.className='ab-node';
    n.innerHTML='<div class="ab-lb"><small>'+d[0]+'</small><strong>'+d[1]+'</strong><span>'+d[2]+'</span></div>';
    nodeBox.appendChild(n);return n;
  });
  var len=1,fr=[],prog={p:0};
  function layout(){
    var W=box.clientWidth,H=box.clientHeight,land=W>760&&W>H*1.05,n=DATA.length,P=[],i;
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    P.push(land?[W*.03,H*.5]:[W*.5,H*.04]);
    for(i=0;i<n;i++){var t=n>1?i/(n-1):0;
      P.push(land?[W*(.1+.8*t),H*(i%2?.3:.7)]:[W*(i%2?.7:.3),H*(.12+.78*t)]);}
    P.push(land?[W*.97,H*.5]:[W*.5,H*.97]);
    var d='M'+P[0][0]+' '+P[0][1],lens=[];
    for(i=0;i<P.length-1;i++){
      var a=P[Math.max(0,i-1)],b=P[i],c=P[i+1],e=P[Math.min(P.length-1,i+2)];
      d+=' C'+(b[0]+(c[0]-a[0])/6)+' '+(b[1]+(c[1]-a[1])/6)+' '+(c[0]-(e[0]-b[0])/6)+' '+(c[1]-(e[1]-b[1])/6)+' '+c[0]+' '+c[1];
      track.setAttribute('d',d);lens.push(track.getTotalLength());
    }
    draw.setAttribute('d',d);len=track.getTotalLength();
    draw.style.strokeDasharray=len;
    fr=nodes.map(function(nd,k){
      var p=P[k+1];nd.style.left=p[0]+'px';nd.style.top=p[1]+'px';
      nd.className='ab-node '+(land?(p[1]<H/2?'up':'dn'):(p[0]<W/2?'rt':'lf'))+(nd.classList.contains('on')?' on':'');
      return lens[k]/len;
    });
    drawTo();
  }
  function drawTo(){
    var p=prog.p,pt=draw.getPointAtLength(len*p);
    draw.style.strokeDashoffset=len*(1-p);
    dot.style.transform='translate('+pt.x+'px,'+pt.y+'px)';
    nodes.forEach(function(n,i){n.classList.toggle('on',p>=fr[i]-.003)});
  }
  addEventListener('resize',function(){layout()});
  if(reduce){S.classList.add('ab-static');layout();prog.p=1;drawTo();}
  else{
    layout();
    var o={r:0},R=function(){return Math.hypot(innerWidth,innerHeight)/2+40};
    function setR(){
      var full=o.r>=R()-1;
      dark.style.clipPath=full?'none':'circle('+o.r+'px at 50% 50%)';
      light.style.visibility=full?'hidden':'visible';
    }
    setR();gsap.set(end,{y:20});
    var tl=gsap.timeline({scrollTrigger:{trigger:iris,start:'top top',end:'+=430%',pin:true,scrub:.6,anticipatePin:1,invalidateOnRefresh:true,
      onUpdate:function(s){
        var f=Math.floor(s.progress*84*24),h=Math.floor(f/(24*3600)),m=Math.floor(f/(24*60))%60,sec=Math.floor(f/24)%60,fm=f%24;
        tc.textContent=[h,m,sec,fm].map(function(v){return String(v).padStart(2,'0')}).join(':');
      }}});
    tl.to(o,{r:9,duration:.6,ease:'power2.out',onUpdate:setR},1)
      .to(o,{r:function(){return R()},duration:3,ease:'power3.in',onUpdate:setR},2)
      .to(intro,{opacity:0,y:-40,duration:.6,ease:'power2.in'},5.1)
      .to(box,{opacity:1,duration:.6},5.2)
      .to(prog,{p:1,duration:4,ease:'none',onUpdate:drawTo},5.8)
      .to(end,{opacity:1,y:0,duration:.5},9.5)
      .to({},{duration:.4},9.6);
    // body
    gsap.to('#story .w',{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:'#story',start:'top 80%',end:'bottom 45%',scrub:true}});
    gsap.utils.toArray('.ab-fig').forEach(function(f){
      var img=f.querySelector('img');
      gsap.fromTo(f,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.5,ease:'expo.out',scrollTrigger:{trigger:f,start:'top 88%'}});
      gsap.fromTo(img,{scale:1.3,yPercent:-7},{scale:1,yPercent:7,ease:'none',scrollTrigger:{trigger:f,scrub:true}});
    });
    gsap.from('.ab-list li',{y:60,opacity:0,stagger:.08,duration:.9,ease:'power3.out',scrollTrigger:{trigger:'.ab-list',start:'top 85%'}});
    gsap.from('.ab-copy',{y:50,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.ab-bio',start:'top 70%'}});
    gsap.utils.toArray('.ab-meta').forEach(function(m){gsap.from(m,{y:50,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:m,start:'top 88%'}})});
    gsap.utils.toArray('[data-count]').forEach(function(el){
      var end=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,c={v:0};
      ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:function(){
        gsap.to(c,{v:end,duration:2.2,ease:'power3.out',onUpdate:function(){el.textContent=c.v.toFixed(dec)}});
        var fg=el.closest('.ab-ring');if(fg)gsap.to(fg.querySelector('.fg'),{strokeDashoffset:326.7*(1-end/10),duration:2.2,ease:'power3.out'});
      }});
    });
    addEventListener('load',function(){ScrollTrigger.refresh()});
  }
})();
