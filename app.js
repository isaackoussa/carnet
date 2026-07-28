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
    const formatted = escapeHtml(turn.text).split(/\n+/).filter(p=>p.trim()).map(p=>`<p style="margin:0 0 10px">${p}</p>`).join('');
    el.innerHTML = `<div class="who">${turn.role==='user'?'Toi':'Question'}</div><div class="body">${formatted}</div>`;
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
    paragraphs: [
      "Le rapport à l'argent est d'abord une question de mentalité avant d'être une question de niveau de revenu : deux personnes avec le même salaire peuvent avoir des trajectoires financières opposées selon leurs croyances et leurs habitudes. Beaucoup de blocages viennent de croyances limitantes héritées de l'éducation ou de la culture (« l'argent corrompt », « on n'est pas fait pour être riche »), qu'il faut identifier et déconstruire avant de progresser. L'entourage joue aussi un rôle important : fréquenter des personnes disciplinées sur l'argent aide à adopter et maintenir de bonnes pratiques.",
      "Sur le plan pratique, la discipline d'épargne régulière, même modeste, compte plus que le montant du revenu lui-même : mettre de côté un petit pourcentage chaque mois, sans exception, construit une sécurité que de gros revenus irréguliers ne garantissent pas. Se payer soi-même en premier et diversifier ses sources de revenus (activité principale, activité secondaire, petits investissements) protège contre les aléas économiques. Le financement externe (crédit, tontines, partenaires) doit être utilisé avec prudence, avec un plan de remboursement clair établi avant d'emprunter — et se former en continu sur la gestion financière est présenté comme un investissement, pas une dépense accessoire.",
      "Le livre insiste enfin sur le contexte spécifique du continent africain : la pression familiale et communautaire à redistribuer ses gains, les tontines comme outil d'épargne collective mais aussi comme source de risque si mal encadrées, et la nécessité de concilier solidarité familiale et discipline financière personnelle. L'auteur encourage à fixer des règles claires avec son entourage (montant, fréquence, limites) plutôt que de laisser la pression sociale dicter les décisions financières au coup par coup, et à transmettre ces principes aux enfants dès le plus jeune âge pour rompre certains cycles hérités."
    ]
  },
  {
    title: "Les politiques publiques (Pierre Muller, coll. Que sais-je ?)",
    paragraphs: [
      "Une politique publique se définit comme un ensemble d'actions coordonnées par des acteurs publics pour traiter un problème reconnu comme collectif — ce qui suppose qu'un problème doit d'abord être construit comme public avant qu'une politique ne s'y attaque. La mise à l'agenda politique dépend ainsi de la façon dont un problème social est construit et médiatisé, pas seulement de sa gravité objective : un problème réel peut rester invisible s'il ne trouve pas de porte-parole ou de mise en scène publique. Les politiques publiques mobilisent aussi des référentiels, c'est-à-dire des représentations globales de la société (par exemple le rôle de l'État face au marché) qui orientent les choix des décideurs bien plus que la seule rationalité technique.",
      "L'analyse distingue ensuite plusieurs phases : formulation, mise en œuvre, évaluation. La mise en œuvre transforme souvent l'intention initiale du fait des marges d'interprétation des acteurs de terrain, qui réinterprètent la politique selon leurs propres contraintes. L'évaluation permet de mesurer les effets réels d'une politique, souvent différents des objectifs annoncés au départ, mais elle reste politiquement sensible car elle peut remettre en cause les choix des décideurs. Au fond, les politiques publiques ne sont jamais neutres : elles reflètent des rapports de force entre groupes d'intérêts, administrations et acteurs politiques qui négocient en permanence leur contenu.",
      "L'ouvrage souligne aussi les limites de l'analyse rationnelle des politiques publiques : les décideurs n'ont jamais une information complète, et les solutions retenues doivent souvent composer avec des contraintes budgétaires, des calendriers électoraux et des coalitions d'acteurs mouvantes. Dans des contextes comme celui de l'UEMOA, où plusieurs États coordonnent leurs politiques économiques, cette grille de lecture aide à comprendre pourquoi des réformes techniquement solides peuvent échouer si elles ignorent les référentiels et les rapports de force propres à chaque pays."
    ]
  },
  {
    title: "Comment parler en public",
    paragraphs: [
      "La confiance en public se construit par la préparation et la répétition, pas par un don inné : Dale Carnegie insiste sur le fait que la plupart des grands orateurs ont dû travailler dur pour vaincre leur timidité initiale. Bien connaître son sujet en profondeur réduit la nervosité plus efficacement que n'importe quelle technique respiratoire, car la peur vient surtout de l'incertitude sur ce qu'on va dire. Le trac ne disparaît d'ailleurs jamais complètement, même chez les orateurs expérimentés : il se maîtrise et se canalise en énergie utile, il ne s'élimine pas.",
      "Sur la forme, un discours efficace suit une structure simple — une idée forte, développée par des exemples concrets, puis résumée clairement à la fin — et capte l'attention dès les premières phrases avec une anecdote, une question ou un fait marquant. Des exemples concrets et vécus touchent davantage l'auditoire que des idées abstraites ou des statistiques désincarnées. Enfin, le contact visuel, une élocution naturelle et une gestuelle spontanée renforcent la crédibilité bien plus qu'un texte mémorisé mot à mot et récité de façon mécanique.",
      "Carnegie détaille aussi comment gérer les incidents en direct : un trou de mémoire, une question déstabilisante ou une erreur ne doivent pas être dramatisés — l'auditoire pardonne facilement un orateur qui garde son calme et rebondit avec assurance. Il recommande de préparer une ouverture et une conclusion très solides (les moments les plus mémorisés par l'auditoire), tout en laissant le milieu du discours plus flexible pour s'adapter aux réactions du public. Enfin, poser des questions à l'auditoire ou solliciter une réaction transforme un discours passif en échange, ce qui renforce l'engagement et l'attention."
    ]
  },
  {
    title: "Créer votre propre entreprise (Office Consultant, version 2009)",
    paragraphs: [
      "Avant tout investissement, il s'agit de valider son idée d'entreprise en vérifiant qu'une vraie demande existe : parler à de futurs clients potentiels avant même de produire quoi que ce soit permet d'éviter de construire un produit dont personne ne veut. Rédiger un plan d'affaires clair, couvrant le produit, le marché cible, la concurrence et le financement, sert autant à convaincre des partenaires qu'à clarifier ses propres idées. Le choix de la structure juridique (entreprise individuelle, société) a par ailleurs un impact direct sur la protection du patrimoine personnel du créateur.",
      "Sur le plan financier, établir un budget de démarrage réaliste incluant une marge de sécurité pour les imprévus évite la situation classique où l'entreprise manque de trésorerie dans les premiers mois, avant même d'être rentable. Identifier les sources de financement disponibles (fonds propres, prêts, subventions, investisseurs) permet de choisir le bon mix selon le profil de risque du projet, et mettre en place une comptabilité rigoureuse dès le premier jour facilite le pilotage. Enfin, prévoir un plan marketing avant même le lancement permet de démarrer avec une base de clients ou de prospects, plutôt que d'en chercher après coup.",
      "Le guide aborde également la phase de croissance : recruter les premières personnes en fonction des tâches réellement critiques plutôt que par anticipation excessive, formaliser progressivement des processus internes pour ne pas tout faire reposer sur une seule personne, et suivre quelques indicateurs clés (trésorerie, marge, acquisition de clients) plutôt qu'une multitude de chiffres. Il insiste sur le fait qu'une entreprise qui démarre doit rester agile et corriger rapidement ce qui ne fonctionne pas, plutôt que de s'accrocher au plan initial par principe."
    ]
  },
  {
    title: "Trading the Line — How to Use Trendlines to Spot Reversals and Ride Trends",
    paragraphs: [
      "Les lignes de tendance relient les sommets ou les creux significatifs d'un graphique, et leur cassure est souvent un signal précoce de retournement, avant que d'autres indicateurs ne le confirment. On distingue les lignes internes, qui traversent une partie du prix, des lignes externes, qui enveloppent l'ensemble des prix ; la pente de la ligne reflète la force et la vitesse du momentum sous-jacent. Combiner ces lignes avec un comptage de vagues (analyse de type Elliott) renforce la fiabilité du signal de retournement par rapport à leur usage isolé.",
      "Une cassure de ligne ne signifie cependant pas automatiquement un retournement : il faut la confirmer avec d'autres signaux techniques comme le volume ou la structure de prix, pour éviter les faux signaux. Des lignes tracées sur différentes unités de temps peuvent aussi se contredire, et l'alignement de plusieurs échelles de temps renforce la robustesse du signal. La discipline consiste enfin à définir à l'avance le niveau d'invalidation d'une ligne — le point où l'analyse serait fausse — avant même d'entrer en position, pour limiter les pertes.",
      "Le livre relie enfin l'analyse des lignes de tendance à la gestion du risque : la taille d'une position doit être définie en fonction de la distance entre le point d'entrée et le niveau d'invalidation de la ligne, pas de façon arbitraire. Il recommande aussi de ne jamais déplacer un niveau d'invalidation une fois la position ouverte pour éviter de rationaliser une perte croissante, et de tenir un journal de trading pour vérifier, sur la durée, si les lignes qu'on trace soi-même produisent statistiquement de meilleurs résultats que le hasard."
    ]
  },
  {
    title: "Devenir riche, ça s'apprend ! En 7 étapes",
    paragraphs: [
      "La richesse commence par un changement d'état d'esprit sur l'argent, pas seulement par le niveau de revenu : la façon de penser l'argent détermine largement la façon de le gérer. Maîtriser et suivre précisément ses dépenses, par catégorie et chaque mois, est un préalable indispensable avant même de songer à investir sérieusement, et se constituer une épargne de précaution couvrant plusieurs mois de charges protège contre les imprévus.",
      "Se payer soi-même en premier — automatiser un virement d'épargne dès que le revenu arrive, avant de payer les autres charges — inverse la logique classique où l'on épargne ce qu'il reste à la fin du mois. Diversifier ses sources de revenus plutôt que dépendre uniquement d'un salaire réduit la vulnérabilité financière globale, et investir avec une vision long terme, en acceptant la volatilité à court terme, est présenté comme la voie la plus fiable vers la richesse. L'éducation financière, enfin, est un processus continu tout au long de la vie, pas un objectif ponctuel qu'on atteint une fois pour toutes.",
      "L'auteure insiste enfin sur la dimension comportementale et temporelle de l'enrichissement : les résultats visibles arrivent souvent après plusieurs années de discipline répétée, ce qui décourage beaucoup de personnes avant qu'elles ne voient les effets de la capitalisation. Elle encourage à mesurer ses progrès par des indicateurs simples (taux d'épargne, valeur nette) plutôt que par comparaison avec la réussite affichée des autres, et à considérer chaque revers financier comme une occasion d'ajuster sa stratégie plutôt que comme un échec définitif."
    ]
  },
  {
    title: "L'art de négocier avec la méthode Harvard",
    paragraphs: [
      "La méthode Harvard repose d'abord sur l'idée de séparer les personnes du problème : négocier sur le fond du désaccord plutôt que sur le conflit personnel évite que les tensions relationnelles ne bloquent une solution pourtant possible sur le fond. Elle invite aussi à se concentrer sur les intérêts réels de chaque partie — pourquoi elle veut telle chose — plutôt que sur des positions figées, ce qui ouvre souvent des solutions inattendues. L'écoute active et la reformulation des propos de l'autre partie instaurent la confiance et évitent une grande partie des malentendus qui font échouer les négociations.",
      "Concrètement, il s'agit de générer plusieurs options de gain mutuel avant d'arrêter une décision, en séparant la phase de brainstorming de la phase de décision, et de s'appuyer sur des critères objectifs et légitimes (prix du marché, expertise indépendante, précédents) pour trancher les désaccords sans que la négociation ne devienne un simple rapport de force. Connaître sa meilleure solution de rechange (MESORE, ou BATNA en anglais) avant même de négocier permet de savoir jusqu'où céder et à partir de quand il vaut mieux quitter la table — l'idée générale étant de rester « dur avec le problème, doux avec les personnes ».",
      "Les auteurs traitent aussi le cas des négociations difficiles, où l'autre partie utilise des tactiques de pression (ultimatums, menaces, refus de discuter) ou dispose d'un rapport de force nettement supérieur. Dans ces situations, ils recommandent de nommer explicitement la tactique utilisée plutôt que d'y répondre en miroir, de ramener systématiquement la discussion sur les intérêts et les critères objectifs, et de ne jamais négocier sous la seule pression du temps sans avoir vérifié sa propre meilleure alternative."
    ]
  },
  {
    title: "Construire son réseau d'entreprise",
    paragraphs: [
      "La conception d'un réseau d'entreprise commence par le choix d'un accès Internet adapté aux besoins réels (débit, redondance, criticité), pour éviter de sur-investir ou, à l'inverse, de sous-dimensionner l'infrastructure de base. Concevoir ensuite un réseau local cohérent — architecture Ethernet et plan d'adressage IP réfléchi dès le départ — facilite grandement l'évolution du réseau quand l'entreprise grandit, et un câblage réalisé selon les normes en vigueur évite des problèmes d'infrastructure coûteux des années plus tard.",
      "Dimensionner les équipements réseau selon le trafic attendu et la croissance future limite les remplacements prématurés, et interconnecter des sites distants suppose de choisir la bonne technologie de transport (liaison spécialisée, Frame Relay, ATM) selon le compromis coût/fiabilité/débit recherché. La voix et la vidéo sur IP demandent une gestion de la qualité de service différente du simple transport de données, car ces flux sont beaucoup plus sensibles à la latence — et l'administration continue du réseau (surveillance, mises à jour, sécurité) est aussi importante que sa conception initiale pour garantir sa fiabilité dans la durée.",
      "L'ouvrage consacre aussi une place importante à la sécurité et à la continuité de service : prévoir des liaisons de secours pour les sites critiques, séparer les flux sensibles du reste du trafic, et documenter la configuration du réseau pour qu'elle ne dépende pas de la mémoire d'une seule personne. Il rappelle qu'un réseau mal sécurisé ou mal documenté devient un point de fragilité pour toute l'entreprise, bien au-delà du seul service informatique."
    ]
  },
  {
    title: "Le Personal MBA",
    paragraphs: [
      "Toute entreprise, quel que soit son secteur, repose sur cinq processus fondamentaux : créer de la valeur, la faire connaître, la vendre, la délivrer, et gérer les finances qui en résultent. Ces principes essentiels du business peuvent s'apprendre seul, par la lecture et la pratique, sans nécessairement passer par un diplôme d'MBA coûteux — l'important est de se concentrer sur la résolution de vrais problèmes clients, vérifiables sur le terrain, plutôt que de suivre des cadres théoriques pour eux-mêmes.",
      "Sur le plan financier, la discipline de trésorerie — avoir du cash disponible au bon moment — compte davantage que le profit comptable affiché sur le papier pour la survie à court terme d'une entreprise. Emprunter des modèles mentaux à plusieurs disciplines (économie, psychologie, pensée systémique) affine le jugement en affaires bien mieux qu'une expertise unique et étroite, et tester rapidement sur le terrain bat une planification lourde établie à l'avance, surtout dans un environnement incertain où les hypothèses de départ se révèlent souvent fausses.",
      "Kaufman développe aussi en détail les mécanismes de marketing et de vente : comprendre profondément ce qui motive réellement un client à acheter, communiquer une offre de façon simple et crédible, et bâtir la confiance avant de demander l'engagement financier. Il met en garde contre la tentation de complexifier un produit ou une offre pour paraître plus sophistiqué, alors que la clarté et la simplicité sont presque toujours ce qui convertit le mieux un prospect en client."
    ]
  },
  {
    title: "Manipulation : ne vous laissez plus faire !",
    paragraphs: [
      "Les manipulateurs exploitent souvent la culpabilité, la peur ou le désir de plaire pour prendre le contrôle d'une interaction sans que la victime s'en rende compte immédiatement. Les tactiques courantes incluent la culpabilisation, la fausse urgence, la flatterie suivie d'une demande, et le déplacement constant des attentes — la barre qui monte sans cesse une fois qu'on a cédé une première fois. Reconnaître les schémas répétitifs chez une même personne, plutôt qu'un incident isolé, aide à distinguer un simple désaccord ponctuel d'une dynamique de manipulation installée dans la durée.",
      "Face à cela, poser des limites claires et savoir dire non sans se justifier à l'excès est une défense centrale : plus on se justifie, plus on ouvre la porte à la négociation et à la culpabilisation. Le malaise ressenti dans une interaction, même difficile à formuler sur le moment, est souvent un signal fiable qu'il mérite d'être écouté plutôt qu'ignoré. Enfin, reconstruire sa confiance en soi et sa clarté sur ses propres besoins réduit la vulnérabilité à la manipulation sur la durée, bien plus que d'apprendre des répliques toutes faites — la communication assertive restant la posture la plus efficace face à une tentative de manipulation.",
      "L'auteur consacre aussi une partie aux contextes où la manipulation est particulièrement difficile à repérer, comme le cadre professionnel (pression hiérarchique, culpabilisation liée à la performance) ou les relations proches, où l'affection rend la vigilance plus difficile. Il recommande de garder une trace écrite des échanges importants dans les situations ambiguës, de solliciter un regard extérieur (ami, collègue de confiance) quand le doute persiste, et rappelle que demander du temps avant de répondre à une sollicitation reste l'une des défenses les plus simples et les plus efficaces."
    ]
  }
];

function seedLibraryIfEmpty(){
  if(books.length > 0) return;
  books = SEED_BOOKS.map(sb => ({
    id: uid(),
    title: sb.title,
    extracts: sb.paragraphs.map(p => ({ id: uid(), text: p, source: 'resume-ia' }))
  }));
  saveBooks(books);
}
seedLibraryIfEmpty();

// ---------- Init ----------
renderShelf();
refreshSelect('quiz-book-select');
refreshSelect('debate-book-select');
