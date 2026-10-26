(function(){
  function copyText(txt,btn){
    var o=btn.textContent;
    var done=function(){btn.textContent='הועתק';setTimeout(function(){btn.textContent=o},1600)};
    var fb=function(){try{var el=document.getElementById(btn.dataset.copy);var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='סמנו והעתיקו'}catch(e){}};
    try{navigator.clipboard.writeText(txt).then(done,fb)}catch(e){fb()}
  }
  document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){copyText(document.getElementById(b.dataset.copy).textContent,b)})});

  /* contour map that resolves into a network */
  document.querySelectorAll('canvas.map').forEach(function(cv){
    var ctx=cv.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W,H,t=0,nodes=[];
    function css(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
    function size(){var d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);
      nodes=[];var n=Math.round(W/60);for(var i=0;i<n;i++)nodes.push({x:Math.random()*W*0.42,y:Math.random()*H,p:Math.random()*6.28})}
    function draw(){
      ctx.clearRect(0,0,W,H);var c=css('--contour'),b=css('--blaze'),cx=W*0.12,cy=H*0.55,R=Math.max(W,H)/22;
      for(var k=1;k<=16;k++){var r=k*R;ctx.beginPath();
        for(var a=0;a<=6.3;a+=0.05){var w=1+0.12*Math.sin(a*3+k*0.7+t)+0.07*Math.sin(a*5-k+t*0.6);var x=cx+Math.cos(a)*r*w*1.35,y=cy+Math.sin(a)*r*w;a===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}
        ctx.strokeStyle=c;ctx.globalAlpha=0.25+0.5*(1-k/16);ctx.lineWidth=k%5===0?1.6:0.9;ctx.stroke()}
      nodes.forEach(function(n){n._y=n.y+Math.sin(t+n.p)*6});
      nodes.forEach(function(n,i){for(var j=i+1;j<nodes.length;j++){var m=nodes[j],d=Math.hypot(n.x-m.x,n._y-m._y);
        if(d<120){ctx.strokeStyle=b;ctx.globalAlpha=0.22*(1-d/120);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(n.x,n._y);ctx.lineTo(m.x,m._y);ctx.stroke()}}});
      ctx.fillStyle=b;ctx.globalAlpha=0.7;nodes.forEach(function(n){ctx.beginPath();ctx.arc(n.x,n._y,2,0,6.3);ctx.fill()});ctx.globalAlpha=1}
    function loop(){t+=0.004;draw();if(!reduce)requestAnimationFrame(loop)}
    size();addEventListener('resize',function(){size();draw()});loop();
  });
})();
(function(){
  document.querySelectorAll('form.lead-form').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var g=function(n){var el=f.elements[n];return el?el.value.trim():''};
      var out=f.querySelector('.form-msg'), wa=f.querySelector('.send-link'), btn=f.querySelector('button[type=submit]');
      if(!g('name')||!g('phone')){(f.elements[g('name')?'phone':'name']).focus();out.textContent='נא למלא שם וטלפון.';return}
      var msg='פנייה מהאתר ('+f.dataset.topic+')\nשם: '+g('name')+'\nטלפון: '+g('phone')+(g('org')?'\nמוסד: '+g('org'):'')+(g('msg')?'\n'+g('msg'):'');
      wa.href='https://wa.me/972529456936?text='+encodeURIComponent('היי אשד, '+msg);
      btn.disabled=true; out.textContent='שולח...';
      fetch('https://formsubmit.co/ajax/maslul.derech@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({_subject:'פנייה חדשה מהאתר: '+f.dataset.topic,_template:'table',_captcha:'false','נושא':f.dataset.topic,'שם':g('name'),'טלפון':g('phone'),'מוסד':g('org'),'הודעה':g('msg')})})
      .then(function(r){return r.json()}).then(function(d){
        if(d&&(d.success==='true'||d.success===true)){f.reset();out.textContent='תודה! הפנייה נשלחה, ואחזור אליך בהקדם.';wa.hidden=true}
        else throw 0;
      }).catch(function(){out.textContent='השליחה לא הצליחה. אפשר לשלוח את אותה הודעה בווטסאפ:';wa.hidden=false})
      .then(function(){btn.disabled=false});
    });
  });
})();
/* always open at the top unless a section is linked */
(function(){
  try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
  function top(){if(!location.hash)window.scrollTo(0,0)}
  top();addEventListener('load',top);addEventListener('pageshow',top);
})();
/* gentle reveal on scroll: only for items below the fold, so the first screen is always complete */
(function(){
  if(!('IntersectionObserver' in window))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var sel='section:not(.band) .sec-head, .products a, .proof div, .quote, .orgs li, .sess, .syll li, .gets li, .cv li, .bigquote, .note, .aud, .lead-form, .free, .specs div, .portrait, .about .txt';
  var els=[].slice.call(document.querySelectorAll(sel));
  var vh=innerHeight;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  els.forEach(function(el){
    var r=el.getBoundingClientRect();
    if(r.top>vh*0.9){
      var sib=el.parentElement?[].indexOf.call(el.parentElement.children,el):0;
      el.style.setProperty('--d',Math.min(sib,6)*70+'ms');
      el.classList.add('pre');io.observe(el);
    }
  });
})();
/* dropdown: announce open/closed state, close on Escape */
(function(){
  document.querySelectorAll('.dd').forEach(function(dd){
    var b=dd.querySelector('button');if(!b)return;
    var set=function(v){b.setAttribute('aria-expanded',v?'true':'false')};
    dd.addEventListener('mouseenter',function(){dd.classList.remove('closed');set(1)});dd.addEventListener('mouseleave',function(){if(!dd.contains(document.activeElement))set(0)});
    dd.addEventListener('focusin',function(){set(1)});dd.addEventListener('focusout',function(e){if(!dd.contains(e.relatedTarget)){set(0);dd.classList.remove('closed')}});
    dd.addEventListener('keydown',function(e){if(e.key==='Escape'){set(0);b.focus();dd.classList.add('closed')}});
  });
})();
