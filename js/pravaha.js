(function(){
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      document.body.classList.add('motion-ready');
      var reveal=document.querySelectorAll('.hero,main > section');
      var groups=document.querySelectorAll('.hero-meta,.journey,.device-body,.manifesto');
      groups.forEach(function(group){
        group.classList.add('stagger-reveal');
        Array.prototype.forEach.call(group.children,function(child,index){
          child.classList.add('stagger-item');
          child.style.setProperty('--stagger-index',index);
        });
      });
      if(!('IntersectionObserver' in window)){
        reveal.forEach(function(el){el.classList.add('is-visible')});
        groups.forEach(function(el){el.classList.add('is-visible')});
        document.querySelectorAll('.showcase-frame').forEach(function(el){el.classList.add('is-active')});
        return;
      }
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },{threshold:.12});
      reveal.forEach(function(el){el.classList.add('reveal-on-scroll');observer.observe(el)});
      groups.forEach(function(el){observer.observe(el)});
      var showcase=document.querySelector('.showcase-frame');
      var showcaseObserver=new IntersectionObserver(function(entries){
        if(entries[0].isIntersecting){showcase.classList.add('is-active');showcaseObserver.disconnect()}
      },{threshold:.25});
      showcaseObserver.observe(showcase);
    })();
