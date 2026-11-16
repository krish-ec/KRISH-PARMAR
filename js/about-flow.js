/* ABOUT — dot zooms open as you scroll, then text flows sideways */
(function(){
  var root=document.getElementById('about');
  if(!root||!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);

  if(matchMedia('(prefers-reduced-motion: reduce)').matches){root.classList.add('ax-reduce');return;}
  root.classList.add('ax-js');

  var $=function(s){return root.querySelector(s)},$$=function(s){return [].slice.call(root.querySelectorAll(s))};
  var stage=$('.ax-stage'),dark=$('.ax-dark'),zoom=$('.ax-zoom'),track=$('.ax-track'),ghost=$('.ax-ghost'),
      lightIn=$('.ax-light-in'),rw=$('.ax-rw'),hud=$('.ax-hud'),fill=$('.ax-prog i'),cnt=$('.ax-count b'),
      reveals=$$('[data-rv]'),panels=$$('[data-step]'),counters=$$('[data-count]'),bars=$$('.ax-bar');

  var clamp=function(v,a,b){return Math.min(b==null?1:b,Math.max(a==null?0:a,v))};
  var sm=function(t){return t*t*(3-2*t)};
  var R0=8,vw,vh,R,max,irisLen,total,offs=[],pOffs=[],cOffs=[],bOffs=[],done={};

  function measure(){
    vw=innerWidth;vh=innerHeight;R=Math.hypot(vw,vh)/2+30;
    zoom.style.transform='none';track.style.transform='none';
    reveals.forEach(function(e){e.style.transform='none'});
    max=Math.max(0,track.offsetWidth-vw);
    var tl=track.getBoundingClientRect().left;
    var L=function(e){return e.getBoundingClientRect().left-tl};
    offs=reveals.map(L);pOffs=panels.map(L);cOffs=counters.map(L);bOffs=bars.map(L);
    irisLen=vh*1.15;total=irisLen+max;
    cur=-1;
  }

  var target=0,cur=-1;
  function render(p,d){
    var px=p*total,ip=clamp(px/irisLen),tp=max?clamp((px-irisLen)/max):0,x=tp*max;

    // the dot: geometric growth feels like a real zoom
    var r=R0*Math.pow(R/R0,ip);
    dark.style.clipPath='circle('+r.toFixed(1)+'px at 50% 50%)';
    zoom.style.transform='scale('+(0.88+0.12*sm(ip)).toFixed(4)+')';
    lightIn.style.opacity=1-clamp(ip*3);
    rw.style.opacity=1-clamp(ip*6);
    hud.style.opacity=clamp((ip-.85)*6.6);

    // horizontal flow
    track.style.transform='translate3d('+(-x).toFixed(1)+'px,0,0)';
    ghost.style.transform='translate3d('+(-x*.35).toFixed(1)+'px,0,0) skewX('+clamp(-d*total*.012,-6,6).toFixed(2)+'deg)';

    // text slides in from the right as it enters the screen
    for(var i=0;i<reveals.length;i++){
      var left=offs[i]-x,t=sm(clamp((vw*1.0-left)/(vw*.32)));
      reveals[i].style.opacity=t.toFixed(3);
      reveals[i].style.transform='translate3d('+((1-t)*110).toFixed(1)+'px,0,0)';
    }

    // counters + bars fire once when they enter
    counters.forEach(function(el,i){
      if(!done['c'+i]&&ip>.95&&cOffs[i]-x<vw*.85){
        done['c'+i]=1;var v=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,o={n:0};
        gsap.to(o,{n:v,duration:1.8,ease:'power3.out',onUpdate:function(){el.textContent=o.n.toFixed(dec)}});
      }
    });
    bars.forEach(function(el,i){if(bOffs[i]-x<vw*.8&&ip>.95)el.classList.add('on')});

    // progress + step counter
    fill.style.transform='scaleX('+clamp(px/total).toFixed(4)+')';
    var s=0;for(var k=0;k<pOffs.length;k++){if(pOffs[k]-x<vw*.55)s=k}
    cnt.textContent=String(s+1).padStart(2,'0');
  }

  ScrollTrigger.create({
    trigger:root,pin:stage,start:'top top',
    end:function(){measure();return '+='+total},
    invalidateOnRefresh:true,
    onUpdate:function(self){target=self.progress},
    onRefresh:function(self){target=self.progress;cur=-1}
  });

  gsap.ticker.add(function(){
    if(cur<0){cur=target;render(cur,0);return}
    var d=target-cur;
    if(Math.abs(d)<1e-5){if(d!==0){cur=target;render(cur,0)}return}
    cur+=d*.14;render(cur,d);
  });

  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){ScrollTrigger.refresh()});
  addEventListener('load',function(){ScrollTrigger.refresh()});
})();
