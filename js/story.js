(function(){
  if(!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.utils.toArray('.story .ch').forEach(function(ch,i){
    var d=i%2?1:-1,ph=ch.querySelector('.ph'),tx=ch.querySelector('.tx'),st=ch.querySelector('.sticker');
    gsap.timeline({scrollTrigger:{trigger:ch,start:'top 78%'}})
      .from(ph,{x:d*160,rotate:d*10,opacity:0,duration:1.1,ease:'back.out(1.3)'})
      .from(tx.children,{y:50,opacity:0,stagger:.09,duration:.8,ease:'power3.out'},'-=.7')
      .from(st,{scale:0,rotate:-50,duration:1.3,ease:'elastic.out(1,.45)'},'-=.6');
    gsap.to(ch.querySelector('.frame'),{yPercent:-7,ease:'none',scrollTrigger:{trigger:ch,scrub:true}});
    gsap.to(ch.querySelector('.no'),{y:-120,ease:'none',scrollTrigger:{trigger:ch,scrub:true}});
    ch.querySelectorAll('[data-count]').forEach(function(el){
      var end=parseFloat(el.dataset.count),o={v:0};
      ScrollTrigger.create({trigger:el,start:'top 85%',once:true,onEnter:function(){
        gsap.to(o,{v:end,duration:2,ease:'power2.out',onUpdate:function(){el.textContent=o.v.toFixed(end%1?1:0)}});
      }});
    });
  });
  gsap.from('.st-head h2',{y:80,opacity:0,duration:1,ease:'power4.out',scrollTrigger:{trigger:'.st-head',start:'top 80%'}});
  document.querySelectorAll('.story .sticker').forEach(function(s){
    s.addEventListener('click',function(e){
      gsap.fromTo(s,{scale:.8},{scale:1,duration:.9,ease:'elastic.out(1,.3)'});
      var em=['✨','⭐','💜','🔥','💪'];
      for(var k=0;k<9;k++){
        var n=document.createElement('span');n.className='burst';n.textContent=em[k%em.length];
        n.style.left=e.clientX+'px';n.style.top=e.clientY+'px';document.body.appendChild(n);
        var a=k/9*Math.PI*2;
        gsap.to(n,{x:Math.cos(a)*90,y:Math.sin(a)*90-30,opacity:0,rotate:gsap.utils.random(-90,90),duration:1,ease:'power2.out',onComplete:function(){this.targets()[0].remove()}});
      }
    });
  });
})();
