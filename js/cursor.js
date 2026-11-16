(function(){
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;

  var cursor=document.createElement('div');
  cursor.className='site-cursor';
  cursor.setAttribute('aria-hidden','true');
  cursor.innerHTML='<svg class="site-cursor__arrow" viewBox="0 0 14 20" aria-hidden="true"><path d="M1 1v15l4-3.6 3 6.6 2.4-1.1-3-6.4H13z" fill="#0b0c3a" stroke="#0b0c3a" stroke-width="2.4" stroke-linejoin="round"/><path d="M1 1v15l4-3.6 3 6.6 2.4-1.1-3-6.4H13z" transform="translate(.35 .35)" fill="var(--cursor-color)" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg><span class="site-cursor__label"></span>';
  document.body.appendChild(cursor);
  document.documentElement.classList.add('custom-cursor-ready');

  var label=cursor.querySelector('.site-cursor__label');
  var visitorName=document.documentElement.dataset.visitorName||'';
  if(!visitorName&&document.documentElement.dataset.visitorNameStorageUnavailable!=='true'){
    try{
      visitorName=window.localStorage.getItem('portfolio-visitor-name')||'';
    }catch(error){
      console.error('Unable to read the visitor name for the cursor.',error);
    }
  }

  function setVisitorName(name){
    visitorName=typeof name==='string'?name.trim():'';
    label.textContent=visitorName;
    cursor.classList.toggle('has-name',Boolean(visitorName));
  }

  function setTheme(target){
    var themedElement=target&&target.closest('[data-cursor-theme]');
    if(themedElement)cursor.setAttribute('data-cursor-theme',themedElement.dataset.cursorTheme);
    else cursor.removeAttribute('data-cursor-theme');
  }

  setVisitorName(visitorName);
  document.addEventListener('portfolio:name-ready',function(event){
    if(event.detail&&typeof event.detail.name==='string')setVisitorName(event.detail.name);
  });

  document.addEventListener('pointermove',function(event){
    cursor.style.transform='translate3d('+event.clientX+'px,'+event.clientY+'px,0)';
    cursor.classList.add('is-visible');
  },{passive:true});
  document.addEventListener('pointerleave',function(){
    cursor.classList.remove('is-visible');
  });
  document.addEventListener('pointerover',function(event){
    var target=event.target.closest('a,button,[role="button"],[data-cursor]');
    if(!target)return;
    setTheme(target);
    label.textContent=visitorName|| (target.hasAttribute('data-mag')?'Say hi':target.hasAttribute('data-cursor')?'View':'Open');
    cursor.classList.add('is-hovering');
  });
  document.addEventListener('pointerout',function(event){
    var target=event.target.closest('a,button,[role="button"],[data-cursor]');
    if(!target||(event.relatedTarget instanceof Node&&target.contains(event.relatedTarget)))return;
    setTheme(null);
    label.textContent=visitorName;
    cursor.classList.remove('is-hovering');
  });
})();
