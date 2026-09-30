(()=>{
  'use strict';
  const shell=document.getElementById('presentationShell');
  if(!shell) return;

  function addImageMeme(sceneName, cls, src, alt, caption){
    const scene=shell.querySelector(`[data-scene="${sceneName}"]`);
    if(!scene || scene.querySelector(`.${cls}`)) return;
    const fig=document.createElement('figure');
    fig.className=`ppt-meme ${cls}`;
    fig.innerHTML=`<img src="${src}" alt="${alt}"><figcaption>${caption}</figcaption>`;
    scene.appendChild(fig);
  }
  addImageMeme('business','business-meme','assets/memes/drake.webp','Drake meme comparing calling every trainee with calling the model-ranked list','From the original PPT: call all 19,158 one-by-one ❌ → start with the model-ranked list ✅');
  addImageMeme('prep','prep-meme','assets/memes/pikachu.webp','Shocked Pikachu meme about dropping rows with missing values','Us after realising that dropping missing rows would remove 53% of the data.');

  function addTextMeme(sceneName, cls, title, body){
    const scene=shell.querySelector(`[data-scene="${sceneName}"]`);
    if(!scene || scene.querySelector(`.${cls}`)) return;
    const card=document.createElement('div');
    card.className=`ppt-text-meme ${cls}`;
    card.innerHTML=`<span>${title}</span><strong>${body}</strong>`;
    scene.appendChild(card);
  }
  addTextMeme('models','same-picture-meme','THEY’RE THE SAME PICTURE','Random Forest ≈ 0.783 ROC-AUC · Logistic Regression ≈ 0.791');
  addTextMeme('results','fine-meme','THIS IS FINE 🔥','A dummy classifier can look ~75% accurate while finding essentially no job hunters. Accuracy alone can mislead.');

  const team=shell.querySelector('[data-scene="team"]');
  if(team && !team.querySelector('.team-ending-joke')){
    const joke=document.createElement('div');
    joke.className='team-ending-joke';
    joke.innerHTML='<span class="hamster-mini">🐹</span><b>Thank you!</b><small>When CatBoost works, Render is awake, and the live demo survives.</small>';
    team.appendChild(joke);
  }
})();
