/* 2D ribbon flowing through the longer story section */
(function(){
  var section=document.querySelector('.story');
  if(!section)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var cv=document.createElement('canvas');
  cv.id='ribbon';cv.className='story-ribbon';cv.setAttribute('aria-hidden','true');
  cv.style.visibility='hidden';
  section.insertBefore(cv,section.firstChild);
  var ctx=cv.getContext('2d'),W,H,dpr,INK='#0b0c3a';
  var N=64,pts=[],lead={x:0,y:0},mx=0,my=0,sparks=[],lastY=scrollY,vel=0,last=performance.now(),inited=false;
  function size(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  function resize(){size();pts.length=0;inited=false}
  size();addEventListener('resize',resize);
  addEventListener('pointermove',function(e){mx=e.clientX/W-.5;my=e.clientY/H-.5});
  function seg(){return Math.max(12,W*.0125)}
  function target(s,t){
    return{x:W*(.82-.58*s)+mx*30,y:H*(.1+.8*s)+Math.sin(s*6.5)*H*.012+Math.sin(t*1.3)*9+my*20};
  }
  function seed(s,t,sp){
    var start=target(s,t),ahead=target(Math.min(1,s+.01),t),dx=start.x-ahead.x,dy=start.y-ahead.y,len=Math.hypot(dx,dy)||1;
    lead.x=start.x;lead.y=start.y;pts.length=0;
    for(var i=0;i<N;i++)pts.push({x:start.x+dx/len*sp*i,y:start.y+dy/len*sp*i});
    inited=true;
  }
  function star(x,y,r,rot){
    ctx.beginPath();
    for(var k=0;k<8;k++){var a=rot+k*Math.PI/4,rr=k%2?r*.35:r;ctx[k?'lineTo':'moveTo'](x+Math.cos(a)*rr,y+Math.sin(a)*rr)}
    ctx.closePath();
  }
  function head(p,t,r){
    var bob=Math.sin(t*3)*3,x=p.x,y=p.y+bob;
    // antenna
    ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x,y-r+2);ctx.quadraticCurveTo(x+8,y-r-14,x+Math.sin(t*4)*8+6,y-r-22);ctx.stroke();
    ctx.fillStyle='#2a2cff';star(x+Math.sin(t*4)*8+6,y-r-24,9,t*2);ctx.fill();ctx.stroke();
    // body with hard shadow
    ctx.fillStyle=INK;ctx.beginPath();ctx.arc(x+4,y+5,r,0,7);ctx.fill();
    ctx.fillStyle='#b9a8ff';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.stroke();
    var bl=(t%4<.14)?.1:1;
    ctx.fillStyle=INK;
    ctx.beginPath();ctx.ellipse(x-r*.32,y-r*.1,r*.1,r*.16*bl,0,0,7);ctx.fill();
    ctx.beginPath();ctx.ellipse(x+r*.32,y-r*.1,r*.1,r*.16*bl,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(255,93,143,.55)';
    ctx.beginPath();ctx.arc(x-r*.58,y+r*.22,r*.14,0,7);ctx.fill();
    ctx.beginPath();ctx.arc(x+r*.58,y+r*.22,r*.14,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(x-r*.2,y+r*.25);ctx.quadraticCurveTo(x,y+r*.5,x+r*.2,y+r*.25);ctx.stroke();
  }
  function frame(now){
    requestAnimationFrame(frame);
    var t=now/1000,dt=Math.min(.05,(now-last)/1000);last=now;
    var rect=section.getBoundingClientRect(),sy=scrollY;
    if(rect.bottom<=0||rect.top>=innerHeight){cv.style.visibility='hidden';lastY=sy;return}
    cv.style.visibility='visible';
    vel+=((sy-lastY)-vel)*.15;lastY=sy;
    var sectionTop=rect.top+sy,s=Math.max(0,Math.min(1,(sy-sectionTop)/Math.max(1,section.offsetHeight-H))),tg=target(s,t),sp=seg();
    if(!inited)seed(s,t,sp);
    lead.x+=(tg.x-lead.x)*.14;lead.y+=(tg.y-lead.y)*.14;
    pts[0].x=lead.x;pts[0].y=lead.y;
    for(i=1;i<N;i++){
      var a=pts[i-1],b=pts[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
      b.x=a.x+dx/d*sp;b.y=a.y+dy/d*sp+Math.sin(t*2+i*.3)*.3;
    }
    ctx.clearRect(0,0,W,H);
    var half=Math.min(52,Math.max(24,W*.03)),ph=t*1.8+sy*.006,L=[],R=[],S=[];
    for(i=0;i<N;i++){
      var p0=pts[Math.max(0,i-1)],p1=pts[Math.min(N-1,i+1)],tx=p1.x-p0.x,ty=p1.y-p0.y,tl=Math.hypot(tx,ty)||1,nx=-ty/tl,ny=tx/tl;
      var sv=Math.sin(i*.3-ph),w=half*Math.min(1,(i+1)/7,(N-1-i)/12)*sv;
      L.push({x:pts[i].x+nx*w,y:pts[i].y+ny*w});R.push({x:pts[i].x-nx*w,y:pts[i].y-ny*w});S.push(sv);
    }
    // hard shadow
    ctx.fillStyle=INK;ctx.beginPath();
    for(i=0;i<N-1;i++){ctx.moveTo(L[i].x+5,L[i].y+6);ctx.lineTo(R[i].x+5,R[i].y+6);ctx.lineTo(R[i+1].x+5,R[i+1].y+6);ctx.lineTo(L[i+1].x+5,L[i+1].y+6);ctx.closePath()}
    ctx.fill();
    // coloured quads: peach front / blue back, with stripe bands
    for(i=0;i<N-1;i++){
      var band=(i%8)<4,front=(S[i]+S[i+1])>0;
      ctx.fillStyle=front?(band?'#ffb59e':'#ff9d86'):(band?'#2a2cff':'#4b4dff');
      ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(L[i].x,L[i].y);ctx.lineTo(R[i].x,R[i].y);ctx.lineTo(R[i+1].x,R[i+1].y);ctx.lineTo(L[i+1].x,L[i+1].y);ctx.closePath();ctx.fill();ctx.stroke();
    }
    // ink outline
    ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.lineJoin='round';
    [L,R].forEach(function(E){ctx.beginPath();for(var k=0;k<N;k++)ctx[k?'lineTo':'moveTo'](E[k].x,E[k].y);ctx.stroke()});
    head(pts[0],t,Math.max(22,half*.8));
    // sparkles
    if(sparks.length<60&&(Math.abs(vel)>1.5||Math.random()<.04)){
      var cols=['#2a2cff','#ffb59e','#b9a8ff','#ff5d8f'];
      sparks.push({x:pts[0].x+(Math.random()-.5)*40,y:pts[0].y+(Math.random()-.5)*40,vx:(Math.random()-.5)*40,vy:-10-Math.random()*40,life:1,r:5+Math.random()*9,rot:Math.random()*3,c:cols[Math.random()*4|0]});
    }
    for(i=sparks.length-1;i>=0;i--){
      var q=sparks[i];q.life-=dt*.7;if(q.life<=0){sparks.splice(i,1);continue}
      q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=dt*3;
      ctx.globalAlpha=Math.min(1,q.life*1.5);ctx.fillStyle=q.c;ctx.strokeStyle=INK;ctx.lineWidth=2;
      star(q.x,q.y,q.r*(.5+q.life*.5),q.rot);ctx.fill();ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  requestAnimationFrame(frame);
})();
