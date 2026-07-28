// ---------- Storage ----------
const STORAGE_KEY = 'cabinet-lecture-books-v1';
const REMINDER_KEY = 'cabinet-lecture-reminders-v1';

function loadBooks(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch{ return []; }
}
function saveBooks(books){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
let books = loadBooks();

function uid(){ return Math.random().toString(36).slice(2,10); }

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('view-'+btn.dataset.view).classList.add('active');
    if(btn.dataset.view==='quiz') refreshSelect('quiz-book-select');
    if(btn.dataset.view==='debate') refreshSelect('debate-book-select');
  });
});

// ---------- Modals ----------
document.querySelectorAll('[data-close]').forEach(el=>{
  el.addEventListener('click', ()=>{
    document.getElementById(el.dataset.close).classList.remove('active');
  });
});

// ---------- Shelf rendering ----------
function renderShelf(){
  const shelf = document.getElementById('shelf');
  shelf.innerHTML = '';
  books.forEach(b=>{
    const el = document.createElement('div');
    el.className = 'spine';
    el.innerHTML = `<div class="title">${escapeHtml(b.title)}</div>
      <div class="meta">${b.extracts.length} extrait${b.extracts.length>1?'s':''}</div>`;
    el.addEventListener('click', ()=>openBook(b.id));
    shelf.appendChild(el);
  });
  const addEl = document.createElement('div');
  addEl.className = 'spine add';
  addEl.innerHTML = '+<br>Ajouter un livre';
  addEl.addEventListener('click', ()=>{
    document.getElementById('new-book-title').value='';
    document.getElementById('manual-text').value='';
    document.getElementById('pdf-input').value='';
    document.getElementById('pdf-status').textContent='';
    document.getElementById('book-author').value='';
    document.getElementById('by-title-status').textContent='';
    pendingByTitleExtracts = null;
    document.getElementById('add-book-modal').classList.add('active');
  });
  shelf.appendChild(addEl);
}

function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------- Add book ----------
let pendingPdfText = '';
document.getElementById('pdf-input').addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const statusEl = document.getElementById('pdf-status');
  statusEl.innerHTML = '<span class="loader"></span> Lecture du PDF...';
  try{
    pendingPdfText = await extractPdfText(file);
    statusEl.textContent = `PDF lu (${pendingPdfText.length.toLocaleString('fr-FR')} caractères).`;
  }catch(err){
    statusEl.textContent = "Impossible de lire ce PDF.";
    console.error(err);
  }
});

async function extractPdfText(file){
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({data:buf}).promise;
  let text = '';
  const maxPages = Math.min(pdf.numPages, 60); // limite raisonnable
  for(let i=1;i<=maxPages;i++){
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it=>it.str).join(' ') + '\n';
  }
  return text;
}

let pendingByTitleExtracts = null;
document.getElementById('gen-by-title-btn').addEventListener('click', async ()=>{
  const title = document.getElementById('new-book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const statusEl = document.getElementById('by-title-status');
  if(!title){ alert('Renseigne le titre en haut du formulaire d\'abord.'); return; }
  statusEl.innerHTML = '<span class="loader"></span> Génération à partir du titre...';
  try{
    const data = await callAnalyze('byTitle', { title, author });
    pendingByTitleExtracts = data.extracts || [];
    statusEl.textContent = `${pendingByTitleExtracts.length} points clés générés (résumé IA, pas des extraits exacts).`;
  }catch(err){
    statusEl.textContent = "Échec de la génération. Vérifie la clé API.";
    console.error(err);
  }
});

document.getElementById('confirm-add-book').addEventListener('click', async ()=>{
  const title = document.getElementById('new-book-title').value.trim();
  const manual = document.getElementById('manual-text').value.trim();
  if(!title){ alert('Donne un titre au livre.'); return; }

  const book = { id: uid(), title, extracts: [] };

  if(manual){
    book.extracts.push({ id: uid(), text: manual, source: 'manuel' });
  }

  if(pendingByTitleExtracts && pendingByTitleExtracts.length){
    pendingByTitleExtracts.forEach(t=>{
      book.extracts.push({ id: uid(), text: t, source: 'resume-ia' });
    });
  }

  if(pendingPdfText){
    const btn = document.getElementById('confirm-add-book');
    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span> Extraction en cours...';
    try{
      const autoExtracts = await callAnalyze('extract', { title, content: pendingPdfText.slice(0, 60000) });
      (autoExtracts.extracts || []).forEach(t=>{
        book.extracts.push({ id: uid(), text: t, source: 'auto' });
      });
    }catch(err){
      alert("L'extraction automatique a échoué (fonction IA indisponible). Le livre est créé quand même, tu pourras ajouter des extraits à la main.");
      console.error(err);
    }
    btn.disabled = false;
    btn.innerHTML = 'Créer le livre';
  }

  books.push(book);
  saveBooks(books);
  pendingPdfText = '';
  pendingByTitleExtracts = null;
  document.getElementById('add-book-modal').classList.remove('active');
  renderShelf();
});

// ---------- Book detail ----------
let currentBookId = null;
function openBook(id){
  currentBookId = id;
  document.getElementById('shelf').parentElement.querySelector('#book-detail').style.display='block';
  document.querySelector('.grid-shelf').style.display='none';
  document.querySelector('#view-library .section-label').style.display='none';
  renderBookDetail();
}
document.getElementById('back-to-shelf').addEventListener('click', ()=>{
  currentBookId = null;
  document.getElementById('book-detail').style.display='none';
  document.querySelector('.grid-shelf').style.display='grid';
  document.querySelector('#view-library .section-label').style.display='block';
});

function renderBookDetail(){
  const book = books.find(b=>b.id===currentBookId);
  if(!book) return;
  document.getElementById('detail-title').textContent = book.title;
  const wrap = document.getElementById('detail-extracts');
  wrap.innerHTML='';
  if(book.extracts.length===0){
    wrap.innerHTML = '<div class="empty">Aucun extrait pour l\'instant.</div>';
  }
  book.extracts.forEach(ex=>{
    const el = document.createElement('div');
    el.className='extract-card';
    const tagLabel = ex.source==='auto' ? 'Extraction auto (PDF)' : ex.source==='resume-ia' ? 'Résumé IA (par titre)' : 'Ajouté par toi';
    el.innerHTML = `<div class="txt">${escapeHtml(ex.text)}</div><div class="tag">${tagLabel}</div>`;
    wrap.appendChild(el);
  });
}

document.getElementById('add-manual-extract').addEventListener('click', ()=>{
  document.getElementById('manual-extract-text').value='';
  document.getElementById('manual-extract-modal').classList.add('active');
});
document.getElementById('confirm-add-extract').addEventListener('click', ()=>{
  const txt = document.getElementById('manual-extract-text').value.trim();
  if(!txt) return;
  const book = books.find(b=>b.id===currentBookId);
  book.extracts.push({ id: uid(), text: txt, source:'manuel' });
  saveBooks(books);
  document.getElementById('manual-extract-modal').classList.remove('active');
  renderBookDetail();
  renderShelf();
});

// ---------- AI calls ----------
async function callAnalyze(mode, payload){
  const res = await fetch('/.netlify/functions/analyze', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ mode, ...payload })
  });
  if(!res.ok) throw new Error('Analyze call failed: '+res.status);
  return res.json();
}

// ---------- Quiz ----------
function refreshSelect(id){
  const sel = document.getElementById(id);
  sel.innerHTML = books.map(b=>`<option value="${b.id}">${escapeHtml(b.title)}</option>`).join('') || '<option value="">Aucun livre</option>';
}

document.getElementById('gen-quiz-btn').addEventListener('click', async ()=>{
  const bookId = document.getElementById('quiz-book-select').value;
  const book = books.find(b=>b.id===bookId);
  const area = document.getElementById('quiz-area');
  if(!book || book.extracts.length===0){
    area.innerHTML = '<div class="empty">Ce livre n\'a pas encore d\'extraits.</div>';
    return;
  }
  area.innerHTML = '<div class="empty"><span class="loader"></span> Génération du quiz...</div>';
  try{
    const data = await callAnalyze('quiz', { title: book.title, extracts: book.extracts.map(e=>e.text) });
    renderQuiz(data.questions || []);
  }catch(err){
    area.innerHTML = '<div class="empty">La génération a échoué. Vérifie que la clé API est bien configurée.</div>';
    console.error(err);
  }
});

function renderQuiz(questions){
  const area = document.getElementById('quiz-area');
  area.innerHTML='';
  if(questions.length===0){ area.innerHTML = '<div class="empty">Pas de question générée.</div>'; return; }
  questions.forEach((q,i)=>{
    const qEl = document.createElement('div');
    qEl.className='quiz-q';
    qEl.innerHTML = `<div class="qtxt">${i+1}. ${escapeHtml(q.question)}</div>`;
    q.options.forEach((opt,oi)=>{
      const optEl = document.createElement('div');
      optEl.className='quiz-opt';
      optEl.textContent = opt;
      optEl.addEventListener('click', ()=>{
        qEl.querySelectorAll('.quiz-opt').forEach((o,idx)=>{
          if(idx===q.correct) o.classList.add('correct');
        });
        if(oi!==q.correct) optEl.classList.add('wrong');
      });
      qEl.appendChild(optEl);
    });
    area.appendChild(qEl);
  });
}

// ---------- Debate / Reflection ----------
let debateHistory = [];
let debateBookId = null;

document.getElementById('gen-debate-btn').addEventListener('click', async ()=>{
  const bookId = document.getElementById('debate-book-select').value;
  const book = books.find(b=>b.id===bookId);
  const area = document.getElementById('debate-area');
  if(!book || book.extracts.length===0){
    area.innerHTML = '<div class="empty">Ce livre n\'a pas encore d\'extraits.</div>';
    return;
  }
  debateBookId = bookId;
  debateHistory = [];
  area.innerHTML = '<div class="empty"><span class="loader"></span> Préparation de la question...</div>';
  try{
    const data = await callAnalyze('debate', { title: book.title, extracts: book.extracts.map(e=>e.text), history: [] });
    debateHistory.push({ role:'assistant', text:data.message });
    renderDebate();
    document.getElementById('debate-reply-row').style.display='flex';
  }catch(err){
    area.innerHTML = '<div class="empty">Échec de la génération. Vérifie la clé API.</div>';
    console.error(err);
  }
});

document.getElementById('send-debate-reply').addEventListener('click', async ()=>{
  const txt = document.getElementById('debate-reply').value.trim();
  if(!txt || !debateBookId) return;
  debateHistory.push({ role:'user', text:txt });
  renderDebate();
  document.getElementById('debate-reply').value='';
  const book = books.find(b=>b.id===debateBookId);
  const area = document.getElementById('debate-area');
  const loadingEl = document.createElement('div');
  loadingEl.className='empty';
  loadingEl.innerHTML = '<span class="loader"></span> ...';
  area.appendChild(loadingEl);
  try{
    const data = await callAnalyze('debate', { title: book.title, extracts: book.extracts.map(e=>e.text), history: debateHistory });
    debateHistory.push({ role:'assistant', text:data.message });
    renderDebate();
  }catch(err){
    loadingEl.textContent = 'Échec de la réponse.';
    console.error(err);
  }
});

function renderDebate(){
  const area = document.getElementById('debate-area');
  area.innerHTML='';
  debateHistory.forEach(turn=>{
    const el = document.createElement('div');
    el.className = 'debate-turn' + (turn.role==='user' ? ' mine' : '');
    el.innerHTML = `<div class="who">${turn.role==='user'?'Toi':'Question'}</div><div class="body">${escapeHtml(turn.text)}</div>`;
    area.appendChild(el);
  });
}

// ---------- Notifications ----------
document.getElementById('ask-permission-btn').addEventListener('click', ()=>{
  Notification.requestPermission().then(perm=>{
    alert(perm==='granted' ? 'Notifications autorisées.' : "Notifications refusées ou ignorées.");
  });
});

const REMINDER_HOURS = [9,13,19];
document.getElementById('reminder-times-label').textContent = REMINDER_HOURS.map(h=>h+'h').join(' · ');

function loadReminderState(){
  return localStorage.getItem(REMINDER_KEY) === 'on';
}
function setReminderState(on){
  localStorage.setItem(REMINDER_KEY, on ? 'on' : 'off');
  document.getElementById('reminder-switch').classList.toggle('on', on);
}
document.getElementById('reminder-switch').addEventListener('click', ()=>{
  const on = !loadReminderState();
  setReminderState(on);
});
setReminderState(loadReminderState());

let lastFiredHour = null;
function checkReminders(){
  if(!loadReminderState()) return;
  if(Notification.permission !== 'granted') return;
  const now = new Date();
  const h = now.getHours();
  if(REMINDER_HOURS.includes(h) && lastFiredHour !== h){
    lastFiredHour = h;
    const randomBook = books[Math.floor(Math.random()*books.length)];
    const randomExtract = randomBook && randomBook.extracts[Math.floor(Math.random()*randomBook.extracts.length)];
    const body = randomExtract ? `"${randomExtract.text.slice(0,100)}..." — ${randomBook.title}` : "Ouvre ton cabinet de lecture pour un extrait ou une question.";
    new Notification('Un instant de lecture', { body });
  }
}
setInterval(checkReminders, 60000);

// ---------- Seed library (livres pré-remplis, résumés écrits directement ici) ----------
const SEED_BOOKS = [
  {
    title: "L'Argent partout et toujours (Coach Patrick Armand Pognon, éd. Africoachs)",
    points: [
      "Le rapport à l'argent est d'abord une question de mentalité avant d'être une question de niveau de revenu.",
      "Beaucoup de blocages financiers viennent de croyances limitantes héritées de l'éducation ou de la culture.",
      "La discipline d'épargne régulière, même modeste, compte plus que le montant du revenu lui-même.",
      "Diversifier ses sources de revenus protège contre les aléas économiques.",
      "Le financement (crédit, tontines, partenaires) doit être utilisé avec prudence et un plan de remboursement clair.",
      "Se former en continu sur la gestion financière est un investissement, pas une dépense."
    ]
  },
  {
    title: "Les politiques publiques (Pierre Muller, coll. Que sais-je ?)",
    points: [
      "Une politique publique se définit comme un ensemble d'actions coordonnées par des acteurs publics pour traiter un problème reconnu comme collectif.",
      "L'analyse des politiques publiques distingue plusieurs phases : mise à l'agenda, formulation, mise en œuvre, évaluation.",
      "La mise à l'agenda politique dépend de la façon dont un problème social est construit et médiatisé, pas seulement de sa gravité objective.",
      "Les politiques publiques mobilisent des référentiels : des représentations globales de la société qui orientent les choix des décideurs.",
      "La mise en œuvre transforme souvent l'intention initiale du fait des marges d'interprétation des acteurs de terrain.",
      "L'évaluation permet de mesurer les effets réels d'une politique, souvent différents des objectifs annoncés au départ."
    ]
  },
  {
    title: "Comment parler en public",
    points: [
      "La confiance en public se construit par la préparation et la répétition, pas par un don inné.",
      "Bien connaître son sujet réduit la nervosité plus efficacement que n'importe quelle technique respiratoire.",
      "Un discours efficace suit une structure simple : une idée forte, développée par des exemples, puis résumée.",
      "Capter l'attention dès les premières phrases avec une anecdote, une question ou un fait marquant.",
      "Des exemples concrets et vécus touchent davantage l'auditoire que des idées abstraites.",
      "Le trac ne disparaît jamais complètement, même chez les orateurs expérimentés : il se maîtrise, il ne s'élimine pas.",
      "Le contact visuel et une élocution naturelle renforcent la crédibilité plus qu'un texte mémorisé mot à mot."
    ]
  },
  {
    title: "Créer votre propre entreprise (Office Consultant, version 2009)",
    points: [
      "Valider son idée d'entreprise en vérifiant qu'une vraie demande existe avant d'investir.",
      "Rédiger un plan d'affaires clair : produit, marché cible, concurrence, financement.",
      "Choisir la structure juridique adaptée (entreprise individuelle, société) selon les responsabilités et la fiscalité.",
      "Établir un budget de démarrage réaliste incluant une marge de sécurité pour les imprévus.",
      "Identifier les sources de financement disponibles : fonds propres, prêts, subventions, investisseurs.",
      "Mettre en place une comptabilité rigoureuse dès le premier jour d'activité.",
      "Prévoir un plan marketing pour se faire connaître avant même le lancement."
    ]
  },
  {
    title: "Trading the Line — How to Use Trendlines to Spot Reversals and Ride Trends",
    points: [
      "Les lignes de tendance relient les sommets ou les creux significatifs d'un graphique ; leur cassure est souvent un signal précoce de retournement.",
      "On distingue les lignes internes (qui traversent le prix) des lignes externes (qui l'enveloppent) ; la pente reflète la force du momentum.",
      "Combiner les lignes de tendance avec un comptage de vagues renforce la fiabilité du signal de retournement.",
      "Une cassure de ligne ne veut pas automatiquement dire retournement : il faut la confirmer avec d'autres signaux techniques.",
      "Des lignes tracées sur différentes unités de temps peuvent se contredire ; l'alignement multi-temporel renforce le signal.",
      "La discipline consiste à définir le niveau d'invalidation d'une ligne avant même d'entrer en position."
    ]
  },
  {
    title: "Devenir riche, ça s'apprend ! En 7 étapes",
    points: [
      "La richesse commence par un changement d'état d'esprit sur l'argent, pas seulement par le niveau de revenu.",
      "Maîtriser et suivre ses dépenses est un préalable avant de chercher à investir.",
      "Se constituer une épargne de précaution avant de prendre des risques financiers.",
      "Se payer soi-même en premier : automatiser l'épargne dès que le revenu arrive.",
      "Diversifier ses sources de revenus plutôt que dépendre uniquement d'un salaire.",
      "Investir avec une vision long terme plutôt que de chercher des gains rapides.",
      "L'éducation financière est un processus continu, pas un objectif ponctuel."
    ]
  },
  {
    title: "L'art de négocier avec la méthode Harvard",
    points: [
      "Séparer les personnes du problème : négocier sur le fond, pas sur le conflit personnel.",
      "Se concentrer sur les intérêts réels de chaque partie plutôt que sur des positions figées.",
      "Générer plusieurs options de gain mutuel avant de arrêter une décision.",
      "S'appuyer sur des critères objectifs et légitimes pour trancher les désaccords.",
      "Connaître sa meilleure solution de rechange (MESORE/BATNA) pour négocier en position de force.",
      "L'écoute active et la reformulation instaurent la confiance et évitent les malentendus."
    ]
  },
  {
    title: "Construire son réseau d'entreprise",
    points: [
      "Choisir un accès Internet adapté aux besoins réels de l'entreprise (débit, redondance).",
      "Concevoir un réseau local cohérent : architecture Ethernet et plan d'adressage IP.",
      "Un câblage aux normes évite des problèmes d'infrastructure coûteux par la suite.",
      "Dimensionner et configurer les équipements réseau selon le trafic attendu et la croissance future.",
      "Interconnecter des sites distants suppose de choisir la bonne technologie de transport (liaison spécialisée, Frame Relay, ATM).",
      "La voix et la vidéo sur IP demandent une gestion de la qualité de service différente du simple transport de données.",
      "L'administration et la supervision continues du réseau IP sont essentielles à sa fiabilité."
    ]
  },
  {
    title: "Le Personal MBA",
    points: [
      "Toute entreprise repose sur cinq processus fondamentaux : créer de la valeur, la faire connaître, vendre, la délivrer, et gérer les finances.",
      "Les principes essentiels du business peuvent s'apprendre seul, sans diplôme d'MBA.",
      "Se concentrer sur la résolution de vrais problèmes clients plutôt que suivre la théorie pour elle-même.",
      "La discipline de trésorerie compte davantage que le profit comptable pour la survie d'une entreprise.",
      "Emprunter des modèles mentaux à plusieurs disciplines (économie, psychologie, pensée systémique) affine le jugement en affaires.",
      "Tester et itérer rapidement bat une planification lourde en avance dans un environnement incertain."
    ]
  },
  {
    title: "Manipulation : ne vous laissez plus faire !",
    points: [
      "Les manipulateurs exploitent souvent la culpabilité, la peur ou le désir de plaire pour prendre le contrôle.",
      "Les tactiques courantes incluent la culpabilisation, la fausse urgence, la flatterie suivie d'une demande, et le déplacement constant des attentes.",
      "Poser des limites claires et savoir dire non sans se justifier à l'excès est une défense centrale.",
      "Le malaise ressenti dans une interaction est souvent un signal fiable que quelque chose ne va pas.",
      "Reconstruire sa confiance en soi réduit la vulnérabilité à la manipulation sur la durée.",
      "La communication assertive (exprimer ses besoins calmement et clairement) est plus efficace que l'agressivité ou la passivité."
    ]
  }
];

function seedLibraryIfEmpty(){
  if(books.length > 0) return;
  books = SEED_BOOKS.map(sb => ({
    id: uid(),
    title: sb.title,
    extracts: sb.points.map(p => ({ id: uid(), text: p, source: 'resume-ia' }))
  }));
  saveBooks(books);
}
seedLibraryIfEmpty();

// ---------- Init ----------
renderShelf();
refreshSelect('quiz-book-select');
refreshSelect('debate-book-select');
