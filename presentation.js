(() => {
  'use strict';
  const body = document.body;
  const shell = document.getElementById('presentationShell');
  if (!shell) return;
  const scenes = [...shell.querySelectorAll('.pres-scene')];
  const progress = document.getElementById('presProgressFill');
  const sceneLabel = document.getElementById('presSceneLabel');
  const timerLabel = document.getElementById('presTimer');
  let index = 0;
  let startedAt = null;
  let timerHandle = null;

  const TEAM = {
    detective: { name: 'Aadhar Gupta', work: 'Managing the team; worked on the model; website making.' },
    cleaner: { name: 'Kashvi Gupta', work: 'Understanding the business question; data understanding; PPT making.' },
    trainer: { name: 'Shreshth Behal', work: 'Missing values; data cleaning and the encoding pipeline; training the model.' },
    judge: { name: 'Ayush Kakkar', work: 'Making the website; model comparison and hyperparameter tuning.' },
    storyteller: { name: 'Aaryan Prakash', work: 'Initial model setup and GitHub implementation.' }
  };

  function fmtTime(ms){
    const s = Math.max(0, Math.floor(ms/1000));
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }
  function startTimer(){
    if (startedAt) return;
    startedAt = performance.now();
    timerHandle = setInterval(()=>{timerLabel.textContent = `${fmtTime(performance.now()-startedAt)} / 08:00`;},250);
  }
  function resetTimer(){ startedAt = performance.now(); timerLabel.textContent='00:00 / 08:00'; }
  function show(i){
    i = Math.max(0,Math.min(scenes.length-1,i));
    scenes.forEach((s,k)=>{ s.classList.toggle('active',k===i); s.classList.toggle('exit-left',k<i); });
    index=i; progress.style.width=((i+1)/scenes.length*100)+'%'; sceneLabel.textContent=`SCENE ${i+1} / ${scenes.length}`;
    startTimer();
    if (scenes[i].dataset.scene==='hook') animateDots();
  }
  function refreshTeamNames(){
    shell.querySelectorAll('.team-pres-name').forEach(el=>{
      const member = TEAM[el.dataset.teamKey];
      if (!member) return;
      el.textContent = member.name;
      const card = el.closest('.pres-card');
      const desc = card?.querySelector('p');
      if (desc) desc.textContent = member.work;
      localStorage.setItem('g9-' + el.dataset.teamKey, member.name);
    });
  }
  function enter(){ refreshTeamNames(); body.classList.add('presentation-active'); show(index); shell.focus(); }
  function exit(){ body.classList.remove('presentation-active'); }
  function next(){ show(index+1); }
  function prev(){ show(index-1); }

  document.getElementById('presNext').addEventListener('click',next);
  document.getElementById('presPrev').addEventListener('click',prev);
  document.getElementById('presExit').addEventListener('click',exit);
  document.getElementById('presEnter').addEventListener('click',enter);
  document.getElementById('presReset').addEventListener('click',resetTimer);
  document.getElementById('exploreBtn').addEventListener('click',()=>{exit();location.hash='#question';});

  document.addEventListener('keydown',e=>{
    if(!body.classList.contains('presentation-active')){
      if(e.key.toLowerCase()==='p') enter();
      return;
    }
    if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();next();}
    else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();prev();}
    else if(e.key==='Escape'){exit();}
    else if(e.key.toLowerCase()==='r'){resetTimer();}
    else if(e.key.toLowerCase()==='d'){show(Math.max(0,scenes.findIndex(s=>s.dataset.scene==='demo')));}
    else if(e.key.toLowerCase()==='f'){document.documentElement.requestFullscreen?.();}
  });

  function animateDots(){
    const grid=document.getElementById('presDots'); if(!grid || grid.dataset.ready) return;
    grid.dataset.ready='1';
    for(let i=0;i<100;i++){
      const d=document.createElement('span'); d.className='pres-dot'+(i<25?' hot':''); d.style.animationDelay=(i*8)+'ms'; grid.appendChild(d);
    }
  }

  // Live model demo. If the backend is unavailable, the UI uses an explicitly labelled fallback preview.
  const form=document.getElementById('liveDemoForm');
  const gauge=document.getElementById('demoGauge');
  const score=document.getElementById('demoScore');
  const risk=document.getElementById('demoRisk');
  const status=document.getElementById('demoStatus');
  const signals=document.getElementById('demoSignals');

  function collect(){
    const fd=new FormData(form); const o={};
    for(const [k,v] of fd.entries()) o[k]=v===''?null:v;
    ['city_development_index','training_hours'].forEach(k=>{ if(o[k]!=null) o[k]=Number(o[k]); });
    return o;
  }
  function cues(x){
    const out=[];
    if(Number(x.city_development_index)<0.7) out.push('lower city development index');
    if(!x.company_type || !x.company_size) out.push('missing employer information');
    if(['<1','1','2','3'].includes(x.experience)) out.push('early-career profile');
    if(x.relevent_experience==='No relevent experience') out.push('no relevant experience recorded');
    return out.slice(0,3);
  }
  function renderPrediction(p, source){
    const pct=Math.max(0,Math.min(100,p*100));
    gauge.style.setProperty('--p',pct.toFixed(1));
    score.textContent=pct.toFixed(1)+'%';
    const label=p>=0.65?'HIGH':p>=0.43?'MEDIUM':'LOW';
    risk.textContent=`${label} OUTREACH PRIORITY`;
    const x=collect(); signals.innerHTML=cues(x).map(t=>`<span>${t}</span>`).join('') || '<span>mixed profile signals</span>';
    status.textContent=source;
    gauge.classList.remove('pres-flash'); void gauge.offsetWidth; gauge.classList.add('pres-flash');
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault(); status.textContent='Running 3-model CatBoost ensemble…';
    try{
      const res=await fetch('/api/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(collect())});
      if(!res.ok) throw new Error('API unavailable');
      const out=await res.json(); renderPrediction(out.job_change_probability,'LIVE MODEL · 3-seed CatBoost ensemble');
    }catch(err){
      const x=collect();
      // deterministic presentation fallback only; not represented as a real model prediction.
      let p=.24 + (0.82-Number(x.city_development_index||.8))*.65 + (!x.company_type?.trim() ? .12:0) + (['<1','1','2','3'].includes(x.experience)? .08:0);
      p=Math.max(.05,Math.min(.92,p)); renderPrediction(p,'DEMO FALLBACK · backend offline (not a model result)');
    }
  });
  document.getElementById('demoPresetHigh').addEventListener('click',()=>{
    form.city.value='city_21'; form.city_development_index.value='0.624'; form.experience.value='<1'; form.company_size.value=''; form.company_type.value=''; form.education_level.value='Graduate'; form.relevent_experience.value='No relevent experience'; form.training_hours.value='120'; form.requestSubmit();
  });
  document.getElementById('demoPresetLow').addEventListener('click',()=>{
    form.city.value='city_103'; form.city_development_index.value='0.92'; form.experience.value='>20'; form.company_size.value='10000+'; form.company_type.value='Pvt Ltd'; form.education_level.value='Graduate'; form.relevent_experience.value='Has relevent experience'; form.training_hours.value='42'; form.requestSubmit();
  });

  enter();
})();
