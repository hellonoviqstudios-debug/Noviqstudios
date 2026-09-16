(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(pointer:fine)').matches;
  var $=function(id){return document.getElementById(id)};

  /* page transitions: enter wipe, leave wipe on internal links */
  var veil=$('veil');
  if(veil&&!reduce){
    document.body.classList.add('entering');
    requestAnimationFrame(function(){requestAnimationFrame(function(){document.body.classList.remove('entering')})});
    document.addEventListener('click',function(e){
      var a=e.target.closest('a[href]');if(!a)return;
      var href=a.getAttribute('href');
      if(!href||href.charAt(0)==='#'||/^(mailto:|tel:|https?:)/.test(href)||a.target==='_blank'||e.metaKey||e.ctrlKey)return;
      e.preventDefault();document.body.classList.add('leaving');
      setTimeout(function(){window.location.href=href},420);
    });
    window.addEventListener('pageshow',function(ev){if(ev.persisted)document.body.classList.remove('leaving')});
  }

  /* header */
  var top=$('top-bar');
  if(top){var ticking=false;function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(function(){top.classList.toggle('solid',window.scrollY>30);ticking=false})}
    window.addEventListener('scroll',onScroll,{passive:true});onScroll()}

  /* menu */
  var burger=$('burger'),menu=$('menu');
  if(burger&&menu){burger.addEventListener('click',function(){var o=!menu.classList.contains('open');menu.classList.toggle('open',o);document.body.classList.toggle('menu-open',o);burger.setAttribute('aria-expanded',String(o))});
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');document.body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false')})})}

  /* reveal (only below the fold) */
  var els=Array.prototype.slice.call(document.querySelectorAll('.r'));
  if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.remove('r')})}
  else{var vh=window.innerHeight;els.forEach(function(e){if(e.getBoundingClientRect().top<vh*0.9)e.classList.add('in')});
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.05});
    els.forEach(function(e){if(!e.classList.contains('in'))io.observe(e)})}

  /* hero canvas: dot field that reacts to the pointer (home only) */
  var cv=$('bg'),hero=$('hero');
  if(cv&&hero){
    var ctx=cv.getContext('2d');
    var W,H,dots=[],mx=-9999,my=-9999,tx=-9999,ty=-9999,t=0,DPR=Math.min(1.5,window.devicePixelRatio||1);
    function size(){W=hero.clientWidth;H=hero.clientHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);
      dots=[];var gap=Math.max(34,Math.min(52,W/28));for(var y=gap/2;y<H;y+=gap)for(var x=gap/2;x<W;x+=gap)dots.push({x:x,y:y,ox:x,oy:y,s:Math.random()*Math.PI*2})}
    function draw(){t+=0.006;mx+=(tx-mx)*0.12;my+=(ty-my)*0.12;ctx.clearRect(0,0,W,H);
      for(var i=0;i<dots.length;i++){var d=dots[i];var dx=d.ox-mx,dy=d.oy-my,dist=Math.sqrt(dx*dx+dy*dy);var pull=Math.max(0,1-dist/260);
        var wx=Math.sin(t+d.s)*1.5,wy=Math.cos(t*1.3+d.s)*1.5;
        d.x+=((d.ox+wx-dx*pull*0.25)-d.x)*0.08;d.y+=((d.oy+wy-dy*pull*0.25)-d.y)*0.08;
        var a=0.08+pull*0.6+(Math.sin(t*2+d.s)+1)*0.03;var r=0.9+pull*1.6;
        ctx.beginPath();ctx.arc(d.x,d.y,r,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.fill();}
      if(!reduce)requestAnimationFrame(draw)}
    size();window.addEventListener('resize',size);
    hero.addEventListener('pointermove',function(e){var b=hero.getBoundingClientRect();tx=e.clientX-b.left;ty=e.clientY-b.top;if(mx<-999){mx=tx;my=ty}hero.style.setProperty('--mx',tx+'px');hero.style.setProperty('--my',ty+'px')});
    hero.addEventListener('pointerleave',function(){tx=-9999;ty=-9999;mx=-9999;my=-9999});
    draw();
  }

  /* custom cursor + magnetic buttons */
  if(fine&&!reduce&&$('cur')){
    var cur=$('cur'),ring=$('curring'),cx=0,cy=0,rx=0,ry=0;
    window.addEventListener('pointermove',function(e){cx=e.clientX;cy=e.clientY;cur.style.transform='translate('+cx+'px,'+cy+'px) translate(-50%,-50%)'});
    (function loop(){rx+=(cx-rx)*0.25;ry+=(cy-ry)*0.25;ring.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';requestAnimationFrame(loop)})();
    document.querySelectorAll('a,button,summary,.card,.chk').forEach(function(el){el.addEventListener('pointerenter',function(){document.body.classList.add('cur-hover')});el.addEventListener('pointerleave',function(){document.body.classList.remove('cur-hover')})});
    document.querySelectorAll('[data-magnet]').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();var x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform='translate('+x*0.18+'px,'+y*0.28+'px)';b.style.setProperty('--bx',(e.clientX-r.left)+'px');b.style.setProperty('--by',(e.clientY-r.top)+'px')});
      b.addEventListener('pointerleave',function(){b.style.transform=''});
    });
  }

  /* spotlight cards + expandable service cards */
  document.querySelectorAll('.card').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--x',(e.clientX-r.left)+'px');c.style.setProperty('--y',(e.clientY-r.top)+'px')})});
  document.querySelectorAll('.card.x').forEach(function(c){
    function toggle(){var o=!c.classList.contains('open');c.classList.toggle('open',o);c.setAttribute('aria-expanded',String(o))}
    c.addEventListener('click',toggle);
    c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
  });

  /* case study: tilt + scroll parallax, all lerped in one animation loop */
  var stage=$('stage'),device=$('device'),shot=$('shot-img'),phone=$('phone'),bigword=$('bigword');
  var T={rx:0,ry:0,py:0,ph:0,fy:0},C={rx:0,ry:0,py:0,ph:0,fy:0},dirty=true;
  if(stage&&fine&&!reduce){stage.addEventListener('pointermove',function(e){var r=stage.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;T.ry=x*9;T.rx=-y*7;dirty=true});stage.addEventListener('pointerleave',function(){T.ry=0;T.rx=0;dirty=true})}
  function measure(){
    if(stage){var r=stage.getBoundingClientRect();var p=(window.innerHeight-r.top)/(window.innerHeight+r.height);p=Math.max(0,Math.min(1,p));var over=shot.clientHeight-device.querySelector('.shot').clientHeight;T.py=-p*Math.max(0,over);T.ph=(0.5-p)*50}
    if(bigword){var fr=bigword.getBoundingClientRect();var fp=Math.max(0,Math.min(1,(window.innerHeight-fr.top)/window.innerHeight));T.fy=(1-fp)*50;if(fp>0.35)bigword.classList.add('lit')}
    dirty=true}
  function animate(){var k=0.1,moved=false;for(var key in T){var d=T[key]-C[key];if(Math.abs(d)>0.01){C[key]+=d*k;moved=true}else C[key]=T[key]}
    if(moved||dirty){if(stage){device.style.setProperty('--rx',C.rx+'deg');device.style.setProperty('--ry',C.ry+'deg');shot.style.setProperty('--py',C.py+'px');phone.style.setProperty('--ph',C.ph+'px')}if(bigword)bigword.style.setProperty('--fy',C.fy+'px');dirty=false}
    requestAnimationFrame(animate)}
  if(reduce){measure();if(bigword)bigword.classList.add('lit')}else{window.addEventListener('scroll',measure,{passive:true});window.addEventListener('resize',measure);measure();requestAnimationFrame(animate)}

  /* counters */
  var counters=document.querySelectorAll('[data-count]');
  function countUp(el){var target=Number(el.dataset.count),t0=performance.now(),dur=1400;function tick(now){var p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=Math.round(target*e);if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)}
  if(counters.length&&!reduce&&'IntersectionObserver' in window){var cio=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){countUp(x.target);cio.unobserve(x.target)}})},{threshold:.6});counters.forEach(function(c){c.textContent='0';cio.observe(c)})}

  /* process line, week bar, vertical steps */
  ['process-grid','week','steps-v'].forEach(function(id){var el=$(id);if(!el)return;
    if('IntersectionObserver' in window&&!reduce){var o=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){el.classList.add('in');o.disconnect()}})},{threshold:.3});o.observe(el)}else el.classList.add('in')});

  /* proposal stepper */
  var pform=$('pform');
  if(pform){
    var step=1,panes=pform.querySelectorAll('.pane'),bar=$('pbar'),prev=$('pprev'),next=$('pnext'),hint=$('phint'),list=$('step-list'),toast=$('toast'),review=$('review');
    function show(n){step=n;panes.forEach(function(p){p.classList.toggle('on',Number(p.dataset.step)===n)});
      bar.style.width=(n>=4?100:n*33.3)+'%';
      list.querySelectorAll('li').forEach(function(li,i){li.classList.toggle('cur',i+1===n);li.classList.toggle('done',i+1<n)});
      prev.style.visibility=(n===1||n===4)?'hidden':'visible';
      if(n===4){next.style.display='none';hint.textContent='Sent'}else{next.style.display='';hint.textContent='Step '+n+' of 3';next.querySelector('span').textContent=n===3?'Send request':'Continue'}
      toast.classList.remove('show');
      if(n===3)fillReview();
      pform.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
      var first=panes[n-1].querySelector('input,select,textarea');if(first&&n<4)setTimeout(function(){first.focus()},350);
    }
    function needs(){return Array.prototype.slice.call(pform.querySelectorAll('input[name=need]:checked')).map(function(c){return c.value}).join(', ')||'Not specified'}
    function fillReview(){var f=pform;var rows=[['Name',f.name.value],['Email',f.email.value],['Business',f.business.value||'—'],['Website',f.website.value||'—'],['Needs',needs()],['Pages',f.pages.value],['Launch',f.timeline.value],['Meeting',f.meet.value]];
      review.innerHTML=rows.map(function(r){return '<dt>'+r[0]+'</dt><dd>'+String(r[1]).replace(/</g,'&lt;')+'</dd>'}).join('')}
    function warn(m,el){toast.textContent=m;toast.classList.add('show');if(el)el.focus()}
    next.addEventListener('click',function(){
      if(step===1){var n=pform.name.value.trim(),em=pform.email.value.trim();if(!n)return warn('Please add your name.',pform.name);if(!em||em.indexOf('@')<0)return warn('Please add a working email address so we can send the proposal.',pform.email);show(2)}
      else if(step===2){show(3)}
      else if(step===3){var f=pform;if(!f.consent.checked)return warn('Please tick the consent checkbox so we can use your details to prepare the proposal.',f.consent);
        var body='Name: '+f.name.value+'\nEmail: '+f.email.value+'\nBusiness: '+f.business.value+'\nCurrent website: '+f.website.value+'\nNeeds: '+needs()+'\nPages: '+f.pages.value+'\nLaunch: '+f.timeline.value+'\nMeeting: '+f.meet.value+'\n\n'+f.message.value;
        window.location.href='mailto:hello@noviqstudios.nl?subject='+encodeURIComponent('Proposal request — '+(f.business.value||f.name.value))+'&body='+encodeURIComponent(body);show(4)}
    });
    prev.addEventListener('click',function(){if(step>1)show(step-1)});
    pform.addEventListener('submit',function(e){e.preventDefault();next.click()});
    show(1);
  }

  /* ---------- chat agent ---------- */
  (function(){
    var KB='You are the assistant on the website of Noviq Studios, a small web design studio in the Netherlands (noviqstudios.nl, hello@noviqstudios.nl, Mon–Fri 9:00–18:00 CET, works with clients anywhere in English or Dutch). Tagline: Websites that work.\n'
    +'SERVICES (only these): website design; website build (hand-coded HTML/CSS/JS static sites, no page builders, source kept in the client\'s own GitHub repository); landing pages; redesigns of existing sites (rebuilt around real content and photos, old page addresses kept so Google rankings are not lost); copy & content (plain-language copy, page structure, search titles); hosting & updates (published on GitHub Pages with the client\'s own domain and free SSL; every change is a commit with full history; updates on request). Noviq does NOT build web shops, booking systems, payment flows, member areas or anything needing a server/database — say so politely if asked and suggest a landing page or static site with a link to an external tool instead.\n'
    +'PROCESS (one week): 1 Meet & plan — we meet online or in person, discuss the goals and changes; within 2 working days the client receives a sample format (first design on their content). 2 Build & test — full build and test runs together, 1–2 business days, on a private preview link. 3 Connect & launch — domain connected, published from the client\'s GitHub repo with SSL, 1 business day. In one week the website is reborn.\n'
    +'STANDARDS every site ships with: Lighthouse performance 95+, first content painted under 2 seconds on 4G, WCAG 2.2 AA accessibility, 100% yours (domain, GitHub repo, source files — leave any time).\n'
    +'PRICING: there is no price list. Each project gets a written proposal with a fixed price within two working days after the client fills in the proposal form on the site (page proposal.html, three short steps). Never invent prices or amounts.\n'
    +'FAQ: clients do not need to write their own text (Noviq drafts it from whatever they have). Updates after launch: send the change and Noviq publishes it; every version is kept. To start: fill in the proposal form, then a meeting online or in person, plus logo and photos. Pages on the site: Services, Work, Process, FAQ, Request a proposal.\n'
    +'WORK: one concept project is shown, Haven Physio (a physiotherapy clinic concept with an online booking form on the first screen). Client names on the site are illustrative; ask for the current portfolio via the form.\n'
    +'STYLE: reply in the language the visitor writes in (English or Dutch). Be warm, concise (2–5 sentences, no headings, no markdown lists, no bold), specific, honest. If something is not covered above, say you are not sure and point to the proposal form or hello@noviqstudios.nl. Never claim to be human. Do not discuss anything unrelated to Noviq Studios or websites.';
    var fab=document.getElementById('chat-fab'),panel=document.getElementById('chat'),body=document.getElementById('chat-body'),formC=document.getElementById('chat-form'),input=document.getElementById('chat-input'),send=document.getElementById('chat-send'),chips=document.getElementById('chat-chips'),note=document.getElementById('chat-note'),status=document.getElementById('chat-status');
    var closeBtn=document.getElementById('chat-close');
    var turns=[],busy=false,sampleFn=undefined,ctl=null;
    function open(){document.body.classList.add('chat-open');panel.setAttribute('aria-hidden','false');fab.setAttribute('aria-expanded','true');setTimeout(function(){input.focus()},350)}
    function close(){document.body.classList.remove('chat-open');panel.setAttribute('aria-hidden','true');fab.setAttribute('aria-expanded','false');fab.focus()}
    fab.addEventListener('click',open);closeBtn.addEventListener('click',close);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('chat-open'))close()});
    function add(cls,text){var d=document.createElement('div');d.className='msg '+cls;d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;return d}
    function linkify(el){el.innerHTML=el.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/(hello@noviqstudios\.nl)/g,'<a href="mailto:$1">$1</a>').replace(/\b(proposal form)\b/gi,'<a href="proposal.html">$1</a>')}
    function thinking(){var d=document.createElement('div');d.className='msg bot think';d.innerHTML='<i></i><i></i><i></i>';body.appendChild(d);body.scrollTop=body.scrollHeight;return d}
    /* built-in answers, used when live Claude is not available on this host */
    var LOCAL=[
      [/pric|cost|how much|tarief|prijs|kost|budget/i,'There\'s no fixed price list — every project is different. Fill in the proposal form on this page and you\'ll get a written proposal with a fixed price within two working days, no obligation.'],
      [/how long|timeline|weeks|duur|lang|snel/i,'About one week. We meet and agree the aim, you get a sample format within two working days, build and test runs take one to two business days, and connecting and launching takes one business day.'],
      [/what do you (build|do|make)|services|diensten|wat doen/i,'We design and build hand-coded websites and landing pages, rebuild existing sites, write the copy, and host on GitHub Pages with your own domain. We don\'t build web shops, booking systems or anything that needs a server.'],
      [/already have|existing|redesign|bestaande|huidige/i,'Good — we rebuild it around your real content and photography rather than patching it, and we keep every page address that already ranks on Google so you don\'t lose traffic. Share your current site in the proposal form.'],
      [/shop|e-?commerce|webshop|booking|payment|betal|reserver/i,'We keep to static sites, so we don\'t build web shops, booking systems or payment flows ourselves. We can build a fast site or landing page that links to an external booking or shop tool. Tell us what you need in the proposal form and we\'ll say honestly what fits.'],
      [/host|github|domain|domein|ssl/i,'Sites are published on GitHub Pages under your own domain with free SSL. The source lives in your own GitHub repository, every change is a commit with full history, and you can leave any time.'],
      [/update|change|edit|wijzig|aanpass/i,'After launch you send us the change — new text, photos, opening hours — and we publish it. Because the site lives in your GitHub repository, every version is kept and anything can be rolled back.'],
      [/text|copy|content|tekst|schrijf/i,'You don\'t need to write your own text. Send whatever you have — an old brochure, a paragraph in an email, your current site — and we draft the copy for you to correct.'],
      [/start|begin|need from me|proposal|offerte|voorstel/i,'To start, fill in the proposal form (Request a proposal in the menu). You\'ll get a written proposal within two working days, then we meet — online or in person — and collect your logo and any photos.'],
      [/fast|speed|lighthouse|accessib|toegank/i,'Every site ships with a Lighthouse performance score of 95+, first content painted in under two seconds on 4G, and WCAG 2.2 AA accessibility — measured before launch.'],
      [/where|based|netherlands|amsterdam|dutch|nederland|waar/i,'We\'re based in the Netherlands and work with clients anywhere, in English or Dutch. Most of the work happens over shared links and short calls.'],
      [/contact|email|mail|phone|bel/i,'You can reach us at hello@noviqstudios.nl, Monday to Friday 9:00–18:00 CET — or use the proposal form on this page.'],
      [/^(hi|hello|hey|hallo|hoi|goedemiddag|goedemorgen)\b/i,'Hello! Ask me anything about what we build, how a project runs, or what you\'d need to get started.']
    ];
    function localAnswer(q){for(var i=0;i<LOCAL.length;i++){if(LOCAL[i][0].test(q))return LOCAL[i][1]}return 'I\'m not sure about that one. The quickest way to get a proper answer is the proposal form on this page, or email hello@noviqstudios.nl — we reply within one working day.'}
    function setBusy(b){busy=b;send.disabled=b;input.disabled=b}
    async function ask(q){
      q=(q||'').trim();if(!q||busy)return;
      add('me',q);turns.push({role:'user',content:q});input.value='';chips.style.display='none';setBusy(true);
      var t=thinking();
      if(sampleFn===undefined){try{sampleFn=await (window.claude&&window.claude.use?window.claude.use('sample'):Promise.resolve(null))}catch(e){sampleFn=null}}
      if(sampleFn){
        ctl=new AbortController();var bubble=null;
        try{
          var res=await sampleFn([{role:'user',content:KB}].concat(turns.slice(-12)),{cache:false,modelTier:'quick',signal:ctl.signal,onText:function(ev){if(!bubble){t.remove();bubble=add('bot','')}bubble.textContent=ev.text;body.scrollTop=body.scrollHeight}});
          if(!bubble){t.remove();bubble=add('bot','')}bubble.textContent=res.text;linkify(bubble);turns.push({role:'assistant',content:res.text});
        }catch(e){
          if(bubble){bubble.textContent=e.text||bubble.textContent}else t.remove();
          if(e&&(e.code==='not_granted'||e.code==='rate_limited')){note.textContent='Live answers unavailable right now — using built-in answers.';status.innerHTML='<i></i>Online · built-in answers';sampleFn=null}
          var a=localAnswer(q);var b2=add('bot',a);linkify(b2);turns.push({role:'assistant',content:a});
        }
      }else{
        await new Promise(function(r){setTimeout(r,500+Math.min(900,q.length*15))});t.remove();
        var a2=localAnswer(q);var b3=add('bot',a2);linkify(b3);turns.push({role:'assistant',content:a2});
        status.innerHTML='<i></i>Online · built-in answers';
      }
      setBusy(false);input.focus();
    }
    formC.addEventListener('submit',function(e){e.preventDefault();ask(input.value)});
    chips.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){ask(b.textContent)})});
  })();


  var yr=document.getElementById('yr');if(yr)yr.textContent=new Date().getFullYear();

  /* ---------- analytics consent banner (dormant) ----------
     This site loads no analytics or marketing scripts today, so this banner
     stays off. When you add one (Google Analytics, Meta Pixel, etc.):
       1. flip NOVIQ_ANALYTICS_ENABLED to true below
       2. put the analytics snippet inside loadAnalytics()
       3. update cookies.html to describe the specific tool
     The banner then shows once per visitor; the analytics script only loads
     after they accept, and their choice is remembered in localStorage. */
  (function(){
    var NOVIQ_ANALYTICS_ENABLED=false;
    if(!NOVIQ_ANALYTICS_ENABLED)return;
    function loadAnalytics(){ /* inject your analytics <script> here */ }
    var KEY='noviq-consent',saved=null;
    try{saved=localStorage.getItem(KEY)}catch(e){}
    if(saved==='granted'){loadAnalytics();return}
    if(saved==='denied')return;
    var bar=document.createElement('div');
    bar.className='consent-banner';bar.setAttribute('role','region');bar.setAttribute('aria-label','Cookie consent');
    bar.innerHTML='<p>We\'d like to use analytics cookies to understand how visitors use this site. <a href="cookies.html">Cookie Policy</a></p>'
      +'<div class="consent-actions"><button type="button" class="btn ghost" data-c="denied"><span>Decline</span></button><button type="button" class="btn" data-c="granted"><span>Accept</span></button></div>';
    document.body.appendChild(bar);
    bar.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){
      var v=b.dataset.c;try{localStorage.setItem(KEY,v)}catch(e){}bar.remove();if(v==='granted')loadAnalytics();
    })});
  })();
})();
