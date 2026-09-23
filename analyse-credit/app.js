// Atelier Crédit : routage, cas pratiques guidés, simulateurs, exercices, analyse de dossier.

const app = document.getElementById('app');
const E = Engine;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- Stockage local (confort : progression) ----------
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('ac-' + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('ac-' + key, JSON.stringify(value)); } catch { /* stockage indisponible */ }
  },
};
const progress = store.get('progress', { cases: {}, exo: { done: 0, correct: 0, streak: 0, best: 0 } });
const saveProgress = () => { store.set('progress', progress); schedulePush(); };
const caseProgress = id => (progress.cases[id] ||= { answered: {}, decision: null, step: 0 });

// ---------- Compte (e-mail vérifié par code) et synchronisation de la progression ----------
const API = '/.netlify/functions/ac-account';
let account = store.get('account', null); // { email, token }
let syncState = { status: account ? 'sync' : 'idle' };
let pushTimer = null;

async function api(action, { method = 'POST', body, auth = false } = {}) {
  let res;
  try {
    res = await fetch(`${API}?action=${action}`, {
      method,
      headers: { 'content-type': 'application/json', ...(auth && account ? { authorization: 'Bearer ' + account.token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Connexion impossible. Vérifiez votre accès à Internet.');
  }
  let data = {};
  try { data = await res.json(); } catch { /* réponse non JSON */ }
  if (res.status === 401 && auth) signOutLocal('Votre session a expiré. Reconnectez-vous pour synchroniser votre progression.');
  if (!res.ok) throw new Error(data.error || (res.status === 404 ? 'Le service de compte n’est disponible qu’une fois le site déployé sur Netlify.' : `Erreur ${res.status}.`));
  return data;
}

// Fusionne deux progressions (appareil et serveur) sans rien perdre : on garde le meilleur de chaque côté.
function mergeProgress(a, b) {
  const out = { cases: {}, exo: {}, cours: {}, tests: {} };
  for (const id of new Set([...Object.keys(a.cases || {}), ...Object.keys(b.cases || {})])) {
    const x = a.cases?.[id] || {}, y = b.cases?.[id] || {};
    out.cases[id] = { answered: { ...(y.answered || {}), ...(x.answered || {}) }, decision: x.decision || y.decision || null, step: Math.max(x.step || 0, y.step || 0) };
  }
  const ea = a.exo || {}, eb = b.exo || {};
  const main = (ea.done || 0) >= (eb.done || 0) ? ea : eb;
  out.exo = { done: main.done || 0, correct: main.correct || 0, streak: main.streak || 0, best: Math.max(ea.best || 0, eb.best || 0) };
  for (const id of new Set([...Object.keys(a.cours || {}), ...Object.keys(b.cours || {})])) {
    const x = a.cours?.[id], y = b.cours?.[id];
    out.cours[id] = !x ? y : !y ? x : x.score >= y.score ? x : y;
  }
  const seen = new Set();
  out.tests.history = [...(a.tests?.history || []), ...(b.tests?.history || [])]
    .filter(h => !seen.has(h.date) && seen.add(h.date))
    .sort((p, q) => p.date - q.date).slice(-20);
  out.tests.best = Math.max(a.tests?.best || 0, b.tests?.best || 0);
  return out;
}
function replaceProgress(p) {
  for (const k of Object.keys(progress)) delete progress[k];
  Object.assign(progress, p);
  store.set('progress', progress);
}

async function pushNow() {
  if (!account) return;
  const r = await api('progress', { method: 'PUT', body: { progress }, auth: true });
  syncState = { status: 'ok', at: r.updatedAt };
  updateAccountUI();
}
function schedulePush() {
  if (!account) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushNow().catch(e => { syncState = { status: 'error', error: e.message }; updateAccountUI(); }), 1500);
}
// Récupère la progression du compte, la fusionne avec celle de l'appareil, puis renvoie le résultat.
async function syncNow() {
  if (!account) return;
  syncState = { status: 'sync' };
  updateAccountUI();
  try {
    const before = JSON.stringify(progress);
    const r = await api('progress', { method: 'GET', auth: true });
    if (r.progress) replaceProgress(mergeProgress(progress, r.progress));
    await pushNow();
    if (JSON.stringify(progress) !== before && !location.hash.startsWith('#/test')) render();
  } catch (e) {
    if (account) { syncState = { status: 'error', error: e.message }; updateAccountUI(); }
  }
}
function signOutLocal(message) {
  account = null;
  store.set('account', null);
  syncState = { status: 'idle', message };
  updateAccountUI();
}
function syncText() {
  if (!account) return syncState.message || '';
  switch (syncState.status) {
    case 'sync': return 'Synchronisation en cours…';
    case 'ok': return `Progression sauvegardée sur votre compte${syncState.at ? ' à ' + new Date(syncState.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}.`;
    case 'error': return 'Synchronisation impossible : ' + syncState.error;
    default: return '';
  }
}
function updateAccountUI() {
  const btn = document.getElementById('accountBtn');
  if (btn) {
    btn.textContent = account ? account.email : 'Se connecter';
    btn.title = account ? 'Mon compte : ' + syncText() : 'Se connecter pour sauvegarder sa progression';
    btn.classList.toggle('on', !!account);
  }
  const el = document.getElementById('syncStatus');
  if (el) el.textContent = syncText();
}

// ---------- Thème ----------
(function initTheme() {
  const saved = store.get('theme', null);
  if (saved) document.documentElement.dataset.theme = saved;
  document.getElementById('themeToggle').addEventListener('click', () => {
    const dark = getComputedStyle(document.documentElement).colorScheme === 'dark';
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('theme', next);
    render();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
})();

// ---------- Graphiques ----------
let charts = [];
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
function destroyCharts() { charts.forEach(c => c.destroy()); charts = []; }

function chart(canvasId, config) {
  const el = document.getElementById(canvasId);
  if (!el || typeof Chart === 'undefined') return null;
  Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  Chart.defaults.color = css('--ink-2');
  Chart.defaults.borderColor = css('--grid');
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: css('--surface'), titleColor: css('--ink'), bodyColor: css('--ink-2'),
        borderColor: css('--border'), borderWidth: 1, padding: 10, boxPadding: 4, usePointStyle: true,
      },
    },
    scales: {
      x: { grid: { display: false }, border: { color: css('--axis') }, ticks: { color: css('--muted') } },
      y: { grid: { color: css('--grid') }, border: { display: false }, ticks: { color: css('--muted') } },
    },
  };
  const c = new Chart(el, { ...config, options: deepMerge(base, config.options || {}) });
  charts.push(c);
  return c;
}
function deepMerge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && typeof a[k] === 'object' ? deepMerge(a[k], v) : v;
  }
  return out;
}
const legend = items => `<div class="legend">${items.map(([label, color]) => `<span><i style="background:${color}"></i>${esc(label)}</span>`).join('')}</div>`;
const tipM = { callbacks: { label: ctx => ` ${ctx.dataset.label} : ${E.fmt(Array.isArray(ctx.raw) ? ctx.raw[1] - ctx.raw[0] : ctx.raw)}` } };
const barStyle = color => ({ backgroundColor: color, borderRadius: 4, borderSkipped: false, maxBarThickness: 36, borderColor: css('--surface'), borderWidth: 0 });
const lineStyle = color => ({ borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.25, pointBorderColor: css('--surface'), pointBorderWidth: 2 });

// Cascade du CA au résultat net
function waterfall(canvasId, y, m) {
  const steps = [
    ['CA', y.ca, 'total'], ['Achats', -y.achats], ['Services ext.', -y.servicesExt], ['VA', m.va, 'total'],
    ['Impôts & taxes', -y.impotsTaxes], ['Personnel', -y.chargesPersonnel], ['EBE', m.ebe, 'total'],
    ['Dotations', -y.dotations], ['Rés. financier', m.rf], ['HAO', y.hao], ['Impôt', -y.impotResultat], ['Résultat net', m.rn, 'total'],
  ].filter(s => s[2] === 'total' || s[1] !== 0);
  let run = 0;
  const bars = steps.map(([label, v, kind]) => {
    if (kind === 'total') { run = v; return { label, range: [0, v], kind, v }; }
    const start = run; run += v;
    return { label, range: [start, run], kind: v < 0 ? 'down' : 'up', v };
  });
  const colors = { total: css('--s1'), down: css('--neutral-bar'), up: css('--s3') };
  return chart(canvasId, {
    type: 'bar',
    data: {
      labels: bars.map(b => b.label),
      datasets: [{ label: 'Montant', data: bars.map(b => b.range), ...barStyle(null), backgroundColor: bars.map(b => colors[b.kind]) }],
    },
    options: {
      interaction: { mode: 'nearest', intersect: true },
      plugins: { tooltip: { callbacks: { label: ctx => ` ${E.fmt(bars[ctx.dataIndex].v)}` } } },
      scales: { x: { ticks: { maxRotation: 50, minRotation: 0, autoSkip: false, font: { size: 11 } } } },
    },
  });
}

// Bilan fonctionnel empilé : emplois (immobilisations, BFR, trésorerie) face aux ressources.
function bilanChart(canvasId, y, m) {
  const emplois = [y.immoNettes, Math.max(m.bfr, 0), y.tresoActif, 0];
  const ressources = [y.capitauxPropres, y.dettesFinancieres, Math.max(-m.bfr, 0), y.tresoPassif];
  const ds = [
    { label: 'Immobilisations / capitaux propres', data: [emplois[0], ressources[0]], color: '--s1' },
    { label: 'BFR / dettes MLT', data: [emplois[1], ressources[1]], color: '--s2' },
    { label: 'Trésorerie actif / BFR négatif', data: [emplois[2], ressources[2]], color: '--s3' },
    { label: 'Découverts', data: [emplois[3], ressources[3]], color: '--s4' },
  ];
  return chart(canvasId, {
    type: 'bar',
    data: { labels: ['Emplois', 'Ressources'], datasets: ds.map(d => ({ label: d.label, data: d.data, ...barStyle(css(d.color)), borderWidth: { top: 2 }, borderColor: css('--surface'), borderSkipped: 'bottom', borderRadius: 0, maxBarThickness: 90 })) },
    options: {
      plugins: { tooltip: { callbacks: { label: ctx => {
        const names = ctx.dataIndex === 0 ? ['Immobilisations', 'BFR', 'Trésorerie actif', '–'] : ['Capitaux propres', 'Dettes MLT', 'BFR négatif (ressource)', 'Découverts'];
        return ctx.raw ? ` ${names[ctx.datasetIndex]} : ${E.fmt(ctx.raw)}` : null;
      } } } },
      scales: { x: { stacked: true }, y: { stacked: true } },
    },
  });
}
const BILAN_LEGEND = () => legend([['Immobilisations / capitaux propres', css('--s1')], ['Exploitation (BFR) / dettes MLT', css('--s2')], ['Trésorerie', css('--s3')], ['Découverts', css('--s4')]]);

// ---------- Composants ----------
const statusChip = (s, text) => `<span class="status ${s}">${text || { good: 'Bon', warn: 'À surveiller', bad: 'Alerte' }[s]}</span>`;
const tile = (label, value, sub = '') => `<div class="tile"><div class="label">${label}</div><div class="value num">${value}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
const growthTxt = (a, b) => { const g = b / a - 1; return (g >= 0 ? '+' : '') + (g * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' % sur un an'; };

function statementsTable(c) {
  const rows = [
    ['section', 'Compte de résultat'],
    ['ca', 'Chiffre d’affaires'], ['achats', 'Achats consommés (marchandises, matières)'], ['servicesExt', 'Transports et services extérieurs'],
    ['impotsTaxes', 'Impôts et taxes'], ['chargesPersonnel', 'Charges de personnel'], ['dotations', 'Dotations aux amortissements et provisions'],
    ['produitsFinanciers', 'Produits financiers'], ['fraisFinanciers', 'Frais financiers'], ['hao', 'Résultat HAO (hors activités ordinaires)'], ['impotResultat', 'Impôt sur le résultat'],
    ['section', 'Bilan : actif'],
    ['immoNettes', 'Immobilisations nettes'], ['stocks', 'Stocks'], ['creances', 'Créances clients'], ['autresCreances', 'Autres créances'], ['tresoActif', 'Trésorerie actif (banque, caisse)'],
    ['totalActif', 'Total actif'],
    ['section', 'Bilan : passif'],
    ['capitauxPropres', 'Capitaux propres (y c. résultat)'], ['dettesFinancieres', 'Dettes financières (emprunts MLT)'], ['fournisseurs', 'Dettes fournisseurs'],
    ['dettesFiscalesSociales', 'Dettes fiscales et sociales'], ['tresoPassif', 'Trésorerie passif (découverts)'], ['totalPassif', 'Total passif'],
  ];
  const val = (y, k) => k === 'totalActif' || k === 'totalPassif' ? E.analyze(y).totalBilan : y[k];
  return `<div class="table-wrap"><table>
    <thead><tr><th>En M FCFA</th>${c.years.map(yr => `<th class="r">${yr}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([k, label]) => k === 'section'
      ? `<tr class="section"><td colspan="${c.years.length + 1}">${label}</td></tr>`
      : `<tr class="${k.startsWith('total') ? 'total' : ''}"><td>${label}</td>${c.data.map(y => `<td class="r">${val(y, k).toLocaleString('fr-FR')}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>`;
}

const parseNum = s => parseFloat(String(s).replace(/[\s  ]/g, '').replace(',', '.'));
function isClose(x, ans, tol) {
  if (!isFinite(x)) return false;
  const t = tol !== undefined ? tol : Math.max(Math.abs(ans) * 0.02, 0.5);
  return Math.abs(x - ans) <= t + 1e-9;
}

// Bloc question : saisie, indice, solution. onReveal est appelé une fois la réponse trouvée ou affichée.
function questionBlock(root, q, onReveal, alreadyDone) {
  root.innerHTML = `
    <div class="card question">
      <div class="eyebrow">À vous de calculer</div>
      <h3>${q.prompt}</h3>
      ${q.context ? `<p class="muted">${q.context}</p>` : ''}
      ${q.data ? `<div class="data-list">${q.data.map(([l, v]) => `<div><span>${l}</span><b>${typeof v === 'number' ? v.toLocaleString('fr-FR') : v}</b></div>`).join('')}</div>` : ''}
      <div class="q-input">
        <input type="text" inputmode="decimal" placeholder="Votre réponse" aria-label="Votre réponse">
        <span class="unit">${q.unit === 'M' ? 'M FCFA' : q.unit === 'j' ? 'jours' : q.unit}</span>
        <button class="btn primary" data-a="check">Vérifier</button>
        ${q.hint ? '<button class="btn ghost" data-a="hint">Indice</button>' : ''}
        <button class="btn ghost" data-a="show">Voir la solution</button>
      </div>
      <div class="fb"></div>
    </div>`;
  const input = root.querySelector('input');
  const fb = root.querySelector('.fb');
  let revealed = false;
  const reveal = (kind, msg) => {
    fb.innerHTML = `<div class="feedback ${kind}">${msg}<span class="formula">${esc(q.solution).replace(/\n/g, '<br>')}</span>${q.lesson ? `<div class="small">${q.lesson}</div>` : ''}</div>`;
    if (!revealed) { revealed = true; onReveal && onReveal(kind === 'ok'); }
  };
  root.querySelector('[data-a=check]').onclick = () => {
    const x = parseNum(input.value);
    if (!isFinite(x)) { fb.innerHTML = '<div class="feedback info">Entrez un nombre (ex. 105 ou 10,6).</div>'; return; }
    if (isClose(x, q.answer, q.tol)) reveal('ok', `<b>Exact !</b> ${fmtAns(q)}.`);
    else fb.innerHTML = `<div class="feedback ko"><b>Pas tout à fait.</b> Vérifiez vos calculs ou demandez un indice.${q.onWrong ? ' ' + q.onWrong(x) : ''}</div>`;
    if (q.onAttempt) q.onAttempt(isClose(x, q.answer, q.tol));
  };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') root.querySelector('[data-a=check]').click(); });
  const hintBtn = root.querySelector('[data-a=hint]');
  if (hintBtn) hintBtn.onclick = () => { fb.innerHTML = `<div class="feedback info"><b>Indice :</b> ${q.hint}</div>`; };
  root.querySelector('[data-a=show]').onclick = () => { if (q.onAttempt && !revealed) q.onAttempt(false); reveal('info', `<b>Solution :</b> ${fmtAns(q)}.`); };
  if (alreadyDone) reveal('ok', `<b>Déjà résolu :</b> ${fmtAns(q)}.`);
}
const fmtAns = q => `la réponse est <b>${q.answer.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${q.unit === 'M' ? 'M FCFA' : q.unit === 'j' ? 'jours' : q.unit}</b>`;

// ---------- Vues ----------
function viewHome() {
  const done = CASES.filter(c => progress.cases[c.id]?.decision).length;
  const e = progress.exo;
  app.innerHTML = `
    <section class="hero">
      <div class="eyebrow">Analyse financière et crédit : cours et pratique</div>
      <h1>Apprenez à lire des comptes comme un banquier.</h1>
      <p>Des cours courts sur chaque ratio et son interprétation, puis de vrais dossiers de crédit (fictifs) : vous faites les calculs vous-même, les graphiques vous montrent ce que les chiffres racontent, et vous prenez la décision.</p>
      <div class="btn-row"><a class="btn primary" href="#/cours">Commencer par le cours →</a><a class="btn" href="#/cas/${CASES[0].id}">Aller directement au premier cas</a></div>
    </section>
    <div class="tiles">
      ${tile('Chapitres de cours validés', `${Object.keys(progress.cours || {}).length} / ${CHAPTERS.length}`, 'quiz terminé')}
      ${tile('Cas pratiques terminés', `${done} / ${CASES.length}`)}
      ${tile('Exercices réussis', `${e.correct} / ${e.done}`, e.done ? `${Math.round(e.correct / e.done * 100)} % de réussite` : 'Aucun exercice pour l’instant')}
      ${tile('Mini-test final', progress.tests?.best ? progress.tests.best + ' %' : '–', 'meilleur score')}
    </div>
    ${account ? '' : '<div class="insight"><h4>Sauvegardez votre progression</h4><a href="#/compte">Connectez-vous avec votre e-mail</a> pour retrouver vos cours, cas et scores sur tous vos appareils.</div>'}
    <div class="grid grid-2">
      ${[
        ['#/cours', 'Cours', '8 chapitres et 20 ratios expliqués : formule, exemple chiffré, grille de lecture, repères sectoriels, pièges et quiz d\u2019interprétation.'],
        ['#/cas', 'Cas pratiques', `${CASES.length} entreprises, 3 niveaux. Vous suivez les 7 étapes d’analyse jusqu’à la décision de crédit et la note de crédit rédigée.`],
        ['#/labo', 'Simulateurs', 'Faites varier les délais clients, la croissance ou le taux d’un prêt, et voyez en direct l’effet sur la trésorerie et le remboursement.'],
        ['#/exercices', 'Exercices express', 'Des calculs avec des chiffres différents à chaque tirage (EBE, CAF, BFR, délais, annuités…), corrigés pas à pas.'],
        ['#/dossier', 'Analyser un dossier', 'Saisissez les comptes d’une vraie entreprise : ratios, graphiques, score de risque et diagnostic automatique.'],
        ['#/fiches', 'Fiches méthode', 'L’essentiel en une page : formules, seuils bancaires, pièges classiques et exemples chiffrés.'],
      ].map(([href, t, d]) => `<a class="card module-link" href="${href}"><h3>${t}</h3><p class="muted">${d}</p></a>`).join('')}
    </div>`;
}

function viewCases() {
  app.innerHTML = `
    <h1>Cas pratiques</h1>
    <p class="muted">Chaque cas suit la démarche d’un chargé d’affaires : lire les comptes, calculer, interpréter les graphiques, décider. Commencez par le niveau débutant.</p>
    <div class="grid grid-3">${CASES.map(c => {
      const p = progress.cases[c.id];
      const n = p ? Object.keys(p.answered).length + (p.decision ? 1 : 0) : 0;
      const last = c.data[c.data.length - 1];
      return `<a class="card module-link" href="#/cas/${c.id}">
        <span class="badge">${c.level}</span>
        <h3 style="margin-top:10px">${c.name}</h3>
        <p class="small muted">${c.sector}</p>
        <p>${c.pitch}</p>
        <p class="small muted">Demande : ${E.fmt(c.request.amount)} FCFA · CA ${E.fmt(last.ca)}</p>
        <div class="progress-bar" aria-label="Progression"><div style="width:${n / 5 * 100}%"></div></div>
        <div class="small muted" style="margin-top:4px">${n} / 5 étapes</div>
      </a>`;
    }).join('')}</div>`;
}

const CASE_STEPS = [
  { id: 'dossier', title: 'Le dossier' },
  { id: 'activite', title: 'Activité et rentabilité' },
  { id: 'equilibre', title: 'Équilibre financier' },
  { id: 'rotation', title: 'Délais de paiement' },
  { id: 'endettement', title: 'Endettement' },
  { id: 'decision', title: 'Décision' },
];

// Bibliothèque de questions : chaque étape a une question par défaut, qu'un cas peut remplacer (c.questions).
const STEP_QUESTION = { activite: 'ebe', equilibre: 'bfr', rotation: 'dso', endettement: 'caf' };
function caseQuestion(stepId, c) {
  const i = c.data.length - 1, y = c.data[i], m = E.analyze(y), yr = c.years[i];
  const key = (c.questions && c.questions[stepId]) || STEP_QUESTION[stepId];
  const Q = {
    ebe: {
      prompt: `Calculez l’EBE ${yr} de ${c.name}.`,
      hint: 'Commencez par la valeur ajoutée : CA − achats consommés − services extérieurs. Retirez ensuite les impôts et taxes et les charges de personnel. Les dotations ne comptent pas.',
      answer: m.ebe, unit: 'M',
      solution: `VA = ${y.ca} − ${y.achats} − ${y.servicesExt} = ${E.round(m.va)}\nEBE = ${E.round(m.va)} − ${y.impotsTaxes} − ${y.chargesPersonnel} = ${E.round(m.ebe)} M\nMarge d’EBE = ${E.fmt(m.margeEbe, 'pct')}`,
    },
    va: {
      prompt: `Calculez la valeur ajoutée ${yr} de ${c.name}.`,
      hint: 'VA = chiffre d’affaires − achats consommés − transports et services extérieurs. C’est la richesse créée par l’entreprise elle-même.',
      answer: m.va, unit: 'M',
      solution: `VA = ${y.ca} − ${y.achats} − ${y.servicesExt} = ${E.round(m.va)} M\nTaux de VA = ${E.fmt(m.tauxVA, 'pct')} du CA\nEBE = ${E.round(m.va)} − ${y.impotsTaxes} − ${y.chargesPersonnel} = ${E.round(m.ebe)} M`,
    },
    bfr: {
      prompt: `Calculez le BFR ${yr}.`,
      hint: 'BFR = (stocks + créances clients + autres créances) − (dettes fournisseurs + dettes fiscales et sociales). La trésorerie n’entre pas dans le calcul.',
      answer: m.bfr, unit: 'M',
      solution: `Actif circulant = ${y.stocks} + ${y.creances} + ${y.autresCreances} = ${E.round(m.actifCirculant)}\nPassif circulant = ${y.fournisseurs} + ${y.dettesFiscalesSociales} = ${E.round(m.passifCirculant)}\nBFR = ${E.round(m.actifCirculant)} − ${E.round(m.passifCirculant)} = ${E.round(m.bfr)} M`,
    },
    fr: {
      prompt: `Calculez le fonds de roulement ${yr}.`,
      hint: 'FR = ressources stables (capitaux propres + dettes financières MLT) − immobilisations nettes.',
      answer: m.fr, unit: 'M',
      solution: `Ressources stables = ${y.capitauxPropres} + ${y.dettesFinancieres} = ${E.round(m.ressourcesStables)}\nFR = ${E.round(m.ressourcesStables)} − ${y.immoNettes} = ${E.round(m.fr)} M\nBFR = ${E.round(m.bfr)} M, donc trésorerie nette = ${E.round(m.tn)} M`,
    },
    dso: {
      prompt: `Calculez le délai moyen de paiement des clients en ${yr} (en jours).`,
      hint: 'Délai clients = créances clients / chiffre d’affaires × 360.',
      answer: E.round(m.dso), unit: 'j', tol: 1,
      solution: `DSO = ${y.creances} / ${y.ca} × 360 = ${E.round(m.dso)} jours`,
    },
    dio: {
      prompt: `Calculez la durée de rotation des stocks en ${yr} (en jours d’achats).`,
      hint: 'Rotation des stocks = stocks / achats consommés × 360.',
      answer: E.round(m.dio), unit: 'j', tol: 1,
      solution: `DIO = ${y.stocks} / ${y.achats} × 360 = ${E.round(m.dio)} jours`,
    },
    caf: {
      prompt: `Calculez la CAF ${yr}.`,
      hint: 'Il faut d’abord le résultat net : EBE − dotations + résultat financier + résultat HAO − impôt. Ajoutez ensuite les dotations. (Pour simplifier, on garde ici le HAO dans la CAF.)',
      answer: m.caf, unit: 'M',
      solution: `Résultat net = EBE ${E.round(m.ebe)} − dotations ${y.dotations} + résultat fin. (${E.round(m.rf)}) + HAO ${y.hao} − impôt ${y.impotResultat} = ${E.round(m.rn)}\nCAF = ${E.round(m.rn)} + ${y.dotations} = ${E.round(m.caf)} M`,
    },
    gearing: {
      prompt: `Calculez le gearing ${yr} (dette nette / capitaux propres).`,
      hint: 'Dette nette = dettes financières MLT + découverts − trésorerie actif. Divisez ensuite par les capitaux propres.',
      answer: E.round(m.gearing, 2), unit: 'x', tol: 0.03,
      solution: `Dette nette = ${y.dettesFinancieres} + ${y.tresoPassif} − ${y.tresoActif} = ${E.round(m.detteNette)}\nGearing = ${E.round(m.detteNette)} / ${y.capitauxPropres} = ${E.fmt(m.gearing, 'x')}`,
    },
  };
  return Q[key];
}

// Charge de la demande : intérêts pour un crédit court terme, annuité pour un prêt amortissable.
function requestCost(r) {
  return r.kind === 'ct' ? r.amount * r.rate * (r.months || 12) / 12 : E.loanSchedule(r.amount, r.rate, r.years)[0].payment;
}
function requestLabel(r) {
  const rate = (r.rate * 100).toLocaleString('fr-FR') + ' %';
  return r.kind === 'ct' ? ` (court terme, ${r.months} mois, taux ${rate})` : ` sur ${r.years} ans à ${rate}`;
}

function viewCase(id) {
  const c = CASES.find(x => x.id === id);
  if (!c) return viewCases();
  const p = caseProgress(id);
  const step = CASE_STEPS[p.step] ? p.step : 0;
  const stepDone = s => s.id === 'decision' ? !!p.decision : s.id === 'dossier' ? p.step > 0 || Object.keys(p.answered).length > 0 : !!p.answered[s.id];
  app.innerHTML = `
    <p class="small"><a href="#/cas">← Tous les cas</a></p>
    <h1>${c.name}</h1>
    <p class="muted">${c.sector} · <span class="badge">${c.level}</span></p>
    <div class="stepper" role="tablist">${CASE_STEPS.map((s, i) => `<button role="tab" data-step="${i}" class="${i === step ? 'current' : ''} ${stepDone(s) ? 'done' : ''}"><span class="n">Étape ${i + 1}</span>${s.title}</button>`).join('')}</div>
    <div id="stepBody"></div>
    <div class="btn-row" style="margin-top:20px;justify-content:space-between">
      <button class="btn" id="prevStep" ${step === 0 ? 'disabled' : ''}>← Précédent</button>
      <button class="btn primary" id="nextStep" ${step === CASE_STEPS.length - 1 ? 'disabled' : ''}>Étape suivante →</button>
    </div>`;
  const go = i => { p.step = i; saveProgress(); destroyCharts(); viewCase(id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  app.querySelectorAll('[data-step]').forEach(b => b.onclick = () => go(+b.dataset.step));
  document.getElementById('prevStep').onclick = () => go(step - 1);
  document.getElementById('nextStep').onclick = () => go(step + 1);

  const body = document.getElementById('stepBody');
  const s = CASE_STEPS[step];
  const statements = open => `<details class="statements" ${open ? 'open' : ''}><summary>États financiers ${c.years[0]}–${c.years[c.years.length - 1]} (M FCFA)</summary><div class="card">${statementsTable(c)}</div></details>`;

  if (s.id === 'dossier') {
    body.innerHTML = `
      <div class="grid grid-2">
        <div class="card"><div class="eyebrow">L’entreprise</div>${c.context.map(t => `<p>${t}</p>`).join('')}</div>
        <div class="card"><div class="eyebrow">La demande de crédit</div>
          <p><b>${E.fmt(c.request.amount)} FCFA</b>${requestLabel(c.request)}</p>
          <p>${c.request.object}</p>${c.request.note ? `<p class="small">${c.request.note}</p>` : ''}
          <p class="small muted">Votre mission : analyser les comptes étape par étape et proposer une décision au comité de crédit.</p>
        </div>
      </div>
      ${statements(true)}
      <div class="insight"><h4>Premier réflexe</h4>Avant de calculer, parcourez les comptes : l’activité monte-t-elle ou baisse-t-elle ? Les fonds propres grossissent-ils ? Les découverts augmentent-ils ? Notez vos premières impressions, puis vérifiez-les avec les calculs.</div>`;
    return;
  }

  if (s.id === 'decision') return renderDecision(c, p, body);

  body.innerHTML = `${statements(false)}<div id="q"></div><div id="analysis"></div>`;
  const q = caseQuestion(s.id, c);
  questionBlock(document.getElementById('q'), q, () => {
    if (!p.answered[s.id]) { p.answered[s.id] = true; saveProgress(); app.querySelector(`[data-step="${step}"]`).classList.add('done'); }
    renderAnalysis(s.id, c, document.getElementById('analysis'));
  }, !!p.answered[s.id]);
}

function renderAnalysis(stepId, c, root) {
  const ms = c.data.map(E.analyze);
  const i = c.data.length - 1, y = c.data[i], m = ms[i];
  const labels = c.years.map(String);
  const comment = `<div class="insight"><h4>Ce qu’il faut voir</h4>${c.comments[stepId]}</div>`;

  if (stepId === 'activite') {
    root.innerHTML = `
      <div class="tiles">
        ${tile('Chiffre d’affaires ' + c.years[i], E.fmt(y.ca), growthTxt(c.data[i - 1].ca, y.ca))}
        ${tile('EBE', E.fmt(m.ebe), `Marge ${E.fmt(m.margeEbe, 'pct')} ${statusChip(E.status('margeEbe', m.margeEbe))}`)}
        ${tile('Résultat net', E.fmt(m.rn), `Marge ${E.fmt(m.margeNette, 'pct')}`)}
        ${tile('Charges de personnel / VA', E.fmt(m.chargesPersoVA, 'pct'), 'Part de la richesse créée versée aux salariés')}
      </div>
      ${comment}
      <div class="grid grid-2">
        <div class="card chart-card"><h3>Du chiffre d’affaires au résultat net (${c.years[i]})</h3><div class="sub">Chaque barre grise est une charge retirée. En bleu, les soldes intermédiaires.</div>
          ${legend([['Soldes', css('--s1')], ['Charges', css('--neutral-bar')], ['Produits', css('--s3')]])}
          <div class="chart-box tall"><canvas id="c1"></canvas></div></div>
        <div class="card chart-card"><h3>Évolution des marges</h3><div class="sub">En % du chiffre d’affaires</div>
          ${legend([['Marge d’EBE', css('--s1')], ['Marge nette', css('--s2')]])}
          <div class="chart-box tall"><canvas id="c2"></canvas></div></div>
      </div>`;
    waterfall('c1', y, m);
    chart('c2', {
      type: 'line',
      data: { labels, datasets: [
        { label: 'Marge d’EBE', data: ms.map(x => x.margeEbe * 100), ...lineStyle(css('--s1')) },
        { label: 'Marge nette', data: ms.map(x => x.margeNette * 100), ...lineStyle(css('--s2')) },
      ] },
      options: {
        plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label} : ${ctx.raw.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %` } } },
        scales: { y: { ticks: { callback: v => v + ' %' } } },
      },
    });
  }

  if (stepId === 'equilibre') {
    root.innerHTML = `
      <div class="tiles">
        ${tile('Fonds de roulement', E.fmt(m.fr), 'Ressources stables − immobilisations')}
        ${tile('BFR', E.fmt(m.bfr), `${E.fmt(m.bfrJours, 'j')} de CA ${statusChip(E.status('bfrJours', m.bfrJours))}`)}
        ${tile('Trésorerie nette', E.fmt(m.tn), `FR − BFR ${statusChip(m.tn >= 0 ? 'good' : 'bad', m.tn >= 0 ? 'Positive' : 'Négative')}`)}
        ${tile('Liquidité générale', E.fmt(m.liquiditeGen, 'x'), statusChip(E.status('liquiditeGen', m.liquiditeGen)))}
      </div>
      ${comment}
      <div class="grid grid-2">
        <div class="card chart-card"><h3>FR, BFR et trésorerie nette</h3><div class="sub">Quand la barre BFR dépasse la barre FR, la trésorerie nette devient négative.</div>
          ${legend([['Fonds de roulement', css('--s1')], ['BFR', css('--s2')], ['Trésorerie nette', css('--s3')]])}
          <div class="chart-box tall"><canvas id="c1"></canvas></div></div>
        <div class="card chart-card"><h3>Qui finance quoi ? (${c.years[i]})</h3><div class="sub">Emplois à gauche, ressources à droite, en M FCFA</div>
          ${BILAN_LEGEND()}
          <div class="chart-box tall"><canvas id="c2"></canvas></div></div>
      </div>`;
    chart('c1', {
      type: 'bar',
      data: { labels, datasets: [
        { label: 'Fonds de roulement', data: ms.map(x => x.fr), ...barStyle(css('--s1')) },
        { label: 'BFR', data: ms.map(x => x.bfr), ...barStyle(css('--s2')) },
        { label: 'Trésorerie nette', data: ms.map(x => x.tn), ...barStyle(css('--s3')) },
      ] },
      options: { plugins: { tooltip: tipM }, datasets: { bar: { categoryPercentage: 0.7, barPercentage: 0.9 } } },
    });
    bilanChart('c2', y, m);
  }

  if (stepId === 'rotation') {
    const cash = y.ca / 360;
    root.innerHTML = `
      <div class="tiles">
        ${tile('Délai clients (DSO)', E.fmt(m.dso, 'j'), 'Créances / CA × 360')}
        ${tile('Rotation des stocks (DIO)', E.fmt(m.dio, 'j'), 'Stocks / achats × 360')}
        ${tile('Délai fournisseurs (DPO)', E.fmt(m.dpo, 'j'), 'Fournisseurs / (achats + services) × 360')}
        ${tile('1 jour de CA =', E.fmt(cash), 'Trésorerie immobilisée par jour de délai client en plus')}
      </div>
      ${comment}
      <div class="card chart-card"><h3>Délais en jours</h3><div class="sub">Les clients et les stocks consomment de la trésorerie, les fournisseurs en apportent.</div>
        ${legend([['Clients (DSO)', css('--s1')], ['Stocks (DIO)', css('--s2')], ['Fournisseurs (DPO)', css('--s3')]])}
        <div class="chart-box"><canvas id="c1"></canvas></div></div>
      <div class="card"><h3>Et si on agissait ?</h3><p class="muted small">Déplacez le curseur pour simuler un nouveau délai clients et voir la trésorerie libérée.</p>
        <div class="control"><label>Nouveau délai clients <b id="dsoVal"></b></label><input type="range" id="dsoRange" min="0" max="${Math.max(60, Math.ceil(m.dso * 1.3))}" value="${Math.round(m.dso)}"></div>
        <div id="dsoOut" class="feedback info"></div></div>`;
    chart('c1', {
      type: 'line',
      data: { labels, datasets: [
        { label: 'Clients (DSO)', data: ms.map(x => E.round(x.dso)), ...lineStyle(css('--s1')) },
        { label: 'Stocks (DIO)', data: ms.map(x => E.round(x.dio)), ...lineStyle(css('--s2')) },
        { label: 'Fournisseurs (DPO)', data: ms.map(x => E.round(x.dpo)), ...lineStyle(css('--s3')) },
      ] },
      options: { plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label} : ${Math.round(ctx.raw)} j` } } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' j' } } } },
    });
    const range = document.getElementById('dsoRange');
    const upd = () => {
      const d = +range.value, delta = (m.dso - d) * cash;
      document.getElementById('dsoVal').textContent = d + ' j';
      document.getElementById('dsoOut').innerHTML = delta >= 0
        ? `Passer de ${Math.round(m.dso)} à ${d} jours libérerait environ <b>${E.fmt(delta)} FCFA</b> de trésorerie. La trésorerie nette passerait de ${E.fmt(m.tn)} à <b>${E.fmt(m.tn + delta)}</b>.`
        : `Allonger le délai à ${d} jours consommerait <b>${E.fmt(-delta)} FCFA</b> de trésorerie supplémentaire. La trésorerie nette tomberait à <b>${E.fmt(m.tn + delta)}</b>.`;
    };
    range.oninput = upd; upd();
  }

  if (stepId === 'endettement') {
    const r = c.request;
    const isShort = r.kind === 'ct';
    const cost = requestCost(r);
    // Service de la dette existante estimé : intérêts actuels + capital remboursé l'an dernier.
    const existing = y.fraisFinanciers + Math.max(0, c.data[i - 1].dettesFinancieres - y.dettesFinancieres);
    const total = existing + cost;
    const dscr = m.caf / total;
    const dscrStatus = dscr >= 1.3 ? 'good' : dscr >= 1 ? 'warn' : 'bad';
    const after = m.caf > 0 ? (y.dettesFinancieres + (isShort ? 0 : r.amount)) / m.caf : -1;
    root.innerHTML = `
      <div class="tiles">
        ${tile('CAF ' + c.years[i], E.fmt(m.caf))}
        ${tile('Dette financière / CAF', m.caf > 0 ? E.fmt(m.capaRemb, 'ans') : 'CAF négative', statusChip(E.status('capaRemb', m.capaRemb)))}
        ${isShort ? '' : tile('Dette / CAF après le prêt', m.caf > 0 ? E.fmt(after, 'ans') : 'CAF négative', statusChip(E.status('capaRemb', after)))}
        ${tile('Gearing', E.fmt(m.gearing, 'x'), statusChip(E.status('gearing', m.gearing)))}
        ${tile('EBE / frais financiers', E.fmt(m.couvFF, 'x'), statusChip(E.status('couvFF', m.couvFF)))}
        ${isShort
          ? tile('Intérêts du crédit demandé', E.fmt(cost), `${r.months} mois à ${(r.rate * 100).toLocaleString('fr-FR')} %, s’il est utilisé en entier. Soit ${E.fmt(cost / m.ebe, 'pct')} de l’EBE`)
          : tile('Service total de la dette après le prêt', E.fmt(total), `Nouvelle annuité ${E.fmt(cost)} + dette existante ≈ ${E.fmt(existing)}. CAF / service = ${E.fmt(dscr, 'x')} ${statusChip(dscrStatus)}`)}
      </div>
      ${comment}
      <div class="grid grid-2">
        <div class="card chart-card"><h3>${isShort ? 'CAF face au coût du crédit demandé' : 'CAF face au service total de la dette'}</h3><div class="sub">${isShort ? 'Un crédit court terme se rembourse par les encaissements de l’activité. La CAF doit au moins en couvrir le coût.' : 'La CAF doit couvrir l’ancien et le nouveau prêt, idéalement 1,3 fois ou plus. Service existant estimé à partir des intérêts et du capital remboursé l’an dernier.'}</div>
          ${legend([['CAF', css('--s1')], [isShort ? 'Intérêts du crédit demandé' : 'Service de la dette après le prêt', css('--s2')]])}
          <div class="chart-box"><canvas id="c1"></canvas></div></div>
        <div class="card chart-card"><h3>Capitaux propres et dettes</h3><div class="sub">Dettes financières MLT et découverts comparés aux fonds propres</div>
          ${legend([['Capitaux propres', css('--s1')], ['Dettes financières MLT', css('--s2')], ['Découverts', css('--s4')]])}
          <div class="chart-box"><canvas id="c2"></canvas></div></div>
      </div>`;
    chart('c1', {
      type: 'bar',
      data: { labels, datasets: [
        { type: 'bar', label: 'CAF', data: ms.map(x => x.caf), ...barStyle(css('--s1')) },
        { type: 'line', label: isShort ? 'Intérêts du crédit demandé' : 'Service de la dette après le prêt', data: labels.map(() => E.round(isShort ? cost : total)), ...lineStyle(css('--s2')), borderDash: [6, 4], pointRadius: 0 },
      ] },
      options: { plugins: { tooltip: tipM } },
    });
    chart('c2', {
      type: 'bar',
      data: { labels, datasets: [
        { label: 'Capitaux propres', data: c.data.map(x => x.capitauxPropres), ...barStyle(css('--s1')) },
        { label: 'Dettes financières MLT', data: c.data.map(x => x.dettesFinancieres), ...barStyle(css('--s2')) },
        { label: 'Découverts', data: c.data.map(x => x.tresoPassif), ...barStyle(css('--s4')) },
      ] },
      options: { plugins: { tooltip: tipM }, datasets: { bar: { categoryPercentage: 0.7, barPercentage: 0.9 } } },
    });
  }
}

function scoreBlock(ms, data, years) {
  const scores = ms.map((m, k) => E.score(m, k ? data[k].ca / data[k - 1].ca - 1 : undefined));
  const last = scores[scores.length - 1];
  return { scores, last, html: `
    <div class="card">
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
        <div class="grade" aria-label="Classe de risque">${last.grade}</div>
        <div><div class="eyebrow" style="margin:0">Score de risque ${years[years.length - 1]}</div><div style="font-size:1.6rem;font-weight:700" class="num">${last.total} / 100</div><div class="muted small">${last.reading}</div></div>
      </div>
      <div class="table-wrap" style="margin-top:14px"><table>
        <thead><tr><th>Critère</th><th class="r">Valeur</th><th>Appréciation</th><th class="r">Points</th></tr></thead>
        <tbody>${last.details.map(d => `<tr><td>${d.label}</td><td class="r">${E.fmt(ms[ms.length - 1][d.key], E.THRESHOLDS[d.key].fmt)}</td><td>${statusChip(d.status)}</td><td class="r">${d.pts.toLocaleString('fr-FR')} / ${d.max}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="small muted" style="margin-top:8px">Pénalités : −5 si la trésorerie nette est négative, −5 si le CA baisse de plus de 5 %. Grille pédagogique simplifiée : chaque banque a sa propre notation.</p>
    </div>` };
}

function renderDecision(c, p, body) {
  const ms = c.data.map(E.analyze);
  const { scores, html } = scoreBlock(ms, c.data, c.years);
  const opts = [
    ['accord', 'Accorder', 'Le crédit tel que demandé, avec les garanties d’usage.'],
    ['conditions', 'Accorder sous conditions', 'Montant, forme ou garanties adaptés, avec des covenants.'],
    ['refus', 'Refuser en l’état', 'Le risque est trop élevé. Proposer une alternative.'],
  ];
  body.innerHTML = `
    <div class="grid grid-2">
      ${html}
      <div class="card chart-card"><h3>Évolution du score</h3><div class="sub">La tendance compte autant que le niveau.</div>
        <div class="chart-box"><canvas id="c1"></canvas></div></div>
    </div>
    <div class="card">
      <h3>Votre décision pour le comité de crédit</h3>
      <p class="muted small">Demande : ${c.request.object} (${E.fmt(c.request.amount)} FCFA)</p>
      <div class="choices">${opts.map(([k, t, d]) => `<button class="choice ${p.decision === k ? 'selected' : ''}" data-k="${k}"><b>${t}</b><span class="small muted">${d}</span></button>`).join('')}</div>
      <div id="decisionFb"></div>
    </div>`;
  chart('c1', {
    type: 'line',
    data: { labels: c.years.map(String), datasets: [{ label: 'Score', data: scores.map(s => s.total), ...lineStyle(css('--s1')), fill: false }] },
    options: { plugins: { tooltip: { callbacks: { label: ctx => ` Score : ${ctx.raw} / 100 (classe ${scores[ctx.dataIndex].grade})` } } }, scales: { y: { min: 0, max: 100 } } },
  });
  const show = k => {
    const ok = k === c.best;
    document.getElementById('decisionFb').innerHTML = `
      <div class="feedback ${ok ? 'ok' : 'ko'}">${c.decisions[k]}</div>
      <div class="card memo" style="margin-top:16px">
        <div class="eyebrow">Note de crédit de l’analyste senior</div>
        <h3>${c.name} : synthèse</h3>
        <div class="grid grid-2">
          <div><b>Points forts</b><ul>${c.memo.forces.map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div><b>Points de vigilance</b><ul>${c.memo.faiblesses.map(x => `<li>${x}</li>`).join('')}</ul></div>
        </div>
        <p><b>Recommandation :</b> ${c.memo.recommandation}</p>
      </div>
      <div class="btn-row">${nextCaseLink(c)}</div>`;
  };
  body.querySelectorAll('.choice').forEach(b => b.onclick = () => {
    p.decision = b.dataset.k; saveProgress();
    body.querySelectorAll('.choice').forEach(x => x.classList.toggle('selected', x === b));
    app.querySelector('[data-step="5"]').classList.add('done');
    show(b.dataset.k);
  });
  if (p.decision) show(p.decision);
}
function nextCaseLink(c) {
  const i = CASES.indexOf(c);
  return CASES[i + 1] ? `<a class="btn primary" href="#/cas/${CASES[i + 1].id}">Cas suivant : ${CASES[i + 1].name} →</a>` : '<a class="btn primary" href="#/dossier">Analysez maintenant un vrai dossier →</a>';
}

// ---------- Simulateurs ----------
function viewLabo(tab = 'bfr') {
  app.innerHTML = `
    <h1>Simulateurs</h1>
    <p class="muted">Changez une hypothèse et regardez immédiatement ce qui bouge. C’est la meilleure façon de comprendre les mécanismes.</p>
    <div class="seg" style="margin-bottom:16px"><button data-t="bfr" class="${tab === 'bfr' ? 'on' : ''}">Croissance et trésorerie</button><button data-t="pret" class="${tab === 'pret' ? 'on' : ''}">Prêt et remboursement</button></div>
    <div id="sim"></div>`;
  app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { location.hash = '#/labo/' + b.dataset.t; });
  (tab === 'pret' ? simLoan : simBfr)(document.getElementById('sim'));
}

function slider(id, label, min, max, step, value, suffix) {
  return `<div class="control"><label for="${id}">${label} <b id="${id}V">${value}${suffix}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}" data-suffix="${suffix}"></div>`;
}
function bindSliders(root, fn) {
  root.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', () => {
    document.getElementById(r.id + 'V').textContent = Number(r.value).toLocaleString('fr-FR') + r.dataset.suffix; fn();
  }));
  fn();
}
const val = id => +document.getElementById(id).value;

function simBfr(root) {
  root.innerHTML = `
    <div class="layout-sim">
      <div class="card">
        <h3>Hypothèses</h3>
        ${slider('ca0', 'CA de départ', 100, 2000, 50, 600, ' M')}
        ${slider('g', 'Croissance annuelle du CA', -20, 60, 5, 35, ' %')}
        ${slider('dso', 'Délai clients', 0, 180, 5, 120, ' j')}
        ${slider('dio', 'Stocks (jours de CA)', 0, 120, 5, 15, ' j')}
        ${slider('dpo', 'Délai fournisseurs (jours de CA)', 0, 120, 5, 35, ' j')}
        ${slider('auto', 'Autofinancement conservé (% du CA)', 0, 15, 0.5, 4, ' %')}
        ${slider('fr0', 'Fonds de roulement de départ', 0, 500, 10, 70, ' M')}
        <p class="small muted">Réglages par défaut : proches du cas TransExpress.</p>
      </div>
      <div>
        <div class="tiles" id="bfrTiles"></div>
        <div class="card chart-card"><h3>Projection sur 5 ans</h3><div class="sub">FR et BFR en courbes, trésorerie nette en barres (M FCFA)</div>
          ${legend([['Fonds de roulement', css('--s1')], ['BFR', css('--s2')], ['Trésorerie nette', css('--s3')]])}
          <div class="chart-box tall"><canvas id="cb"></canvas></div></div>
        <div class="insight" id="bfrMsg"></div>
      </div>
    </div>`;
  const labels = ['An 0', 'An 1', 'An 2', 'An 3', 'An 4', 'An 5'];
  const ch = chart('cb', {
    type: 'bar',
    data: { labels, datasets: [
      { type: 'line', label: 'Fonds de roulement', data: [], ...lineStyle(css('--s1')) },
      { type: 'line', label: 'BFR', data: [], ...lineStyle(css('--s2')) },
      { type: 'bar', label: 'Trésorerie nette', data: [], ...barStyle(css('--s3')) },
    ] },
    options: { plugins: { tooltip: tipM }, animation: { duration: 250 } },
  });
  bindSliders(root, () => {
    const g = val('g') / 100, days = val('dso') + val('dio') - val('dpo');
    let ca = val('ca0'), fr = val('fr0');
    const FR = [], BFR = [], TN = [];
    for (let t = 0; t <= 5; t++) {
      if (t > 0) { ca *= 1 + g; fr += ca * val('auto') / 100; }
      const bfr = ca * days / 360;
      FR.push(E.round(fr)); BFR.push(E.round(bfr)); TN.push(E.round(fr - bfr));
    }
    if (ch) { ch.data.datasets[0].data = FR; ch.data.datasets[1].data = BFR; ch.data.datasets[2].data = TN; ch.update(); }
    document.getElementById('bfrTiles').innerHTML =
      tile('BFR en jours de CA', days + ' j', 'Clients + stocks − fournisseurs') +
      tile('CA en année 5', E.fmt(ca)) +
      tile('Trésorerie nette en année 5', E.fmt(TN[5]), statusChip(TN[5] >= 0 ? 'good' : 'bad', TN[5] >= 0 ? 'Positive' : 'Négative'));
    const firstNeg = TN.findIndex(v => v < 0);
    const lever = Math.round(Math.max(0, days) * 0.2);
    document.getElementById('bfrMsg').innerHTML = `<h4>Lecture</h4>${
      days <= 0 ? 'Le BFR est négatif : clients et stocks sont financés par les fournisseurs. Plus vous grandissez, plus vous générez de trésorerie. C’est le modèle de la grande distribution.'
      : firstNeg === -1 ? 'La trésorerie reste positive sur 5 ans : l’autofinancement suit le rythme du BFR. Essayez d’augmenter la croissance ou le délai clients pour voir quand ça casse.'
      : `La trésorerie devient négative ${firstNeg === 0 ? 'dès le départ' : 'en année ' + firstNeg}. C’est l’<b>effet ciseaux</b> : chaque franc de CA en plus demande ${days} jours de financement, soit ${(days / 360 * 100).toFixed(0)} % du CA supplémentaire. Leviers possibles : réduire le délai clients (−${lever} j réduirait le BFR de ${E.fmt(ca * lever / 360)} en année 5), négocier avec les fournisseurs, garder plus de résultat dans l’entreprise, ou financer le BFR par un crédit adapté.`}`;
  });
}

function simLoan(root) {
  root.innerHTML = `
    <div class="layout-sim">
      <div class="card">
        <h3>Le prêt</h3>
        ${slider('lp', 'Montant', 10, 1000, 10, 60, ' M')}
        ${slider('lr', 'Taux annuel', 3, 16, 0.25, 9, ' %')}
        ${slider('ln', 'Durée', 1, 15, 1, 5, ' ans')}
        <div class="control"><label>Mode de remboursement</label>
          <div class="seg" id="ltype"><button data-v="annuity" class="on">Annuités constantes</button><button data-v="linear">Amortissement constant</button></div></div>
        <h3 style="margin-top:18px">L’emprunteur</h3>
        ${slider('lcaf', 'CAF annuelle disponible', 5, 300, 5, 80, ' M')}
      </div>
      <div>
        <div class="tiles" id="loanTiles"></div>
        <div class="card chart-card"><h3>Échéances annuelles face à la CAF</h3><div class="sub">Capital remboursé + intérêts, par année (M FCFA)</div>
          ${legend([['Capital remboursé', css('--s1')], ['Intérêts', css('--s2')], ['CAF disponible', css('--s3')]])}
          <div class="chart-box tall"><canvas id="cl"></canvas></div></div>
        <div class="insight" id="loanMsg"></div>
        <details class="statements"><summary>Tableau d’amortissement</summary><div class="card" id="loanTable"></div></details>
      </div>
    </div>`;
  let type = 'annuity';
  const ch = chart('cl', {
    type: 'bar',
    data: { labels: [], datasets: [
      { label: 'Capital remboursé', data: [], ...barStyle(css('--s1')), borderRadius: 0, stack: 's' },
      { label: 'Intérêts', data: [], ...barStyle(css('--s2')), borderRadius: { topLeft: 4, topRight: 4 }, stack: 's' },
      { type: 'line', label: 'CAF disponible', data: [], ...lineStyle(css('--s3')), borderDash: [6, 4], pointRadius: 0 },
    ] },
    options: { plugins: { tooltip: tipM }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, animation: { duration: 250 } },
  });
  const update = () => {
    const P = val('lp'), rate = val('lr') / 100, n = val('ln'), caf = val('lcaf');
    const rows = E.loanSchedule(P, rate, n, type);
    const maxPay = Math.max(...rows.map(r => r.payment));
    const totalInt = rows.reduce((s, r) => s + r.interest, 0);
    const dscr = caf / maxPay;
    if (ch) {
      ch.data.labels = rows.map(r => 'An ' + r.k);
      ch.data.datasets[0].data = rows.map(r => E.round(r.amort));
      ch.data.datasets[1].data = rows.map(r => E.round(r.interest));
      ch.data.datasets[2].data = rows.map(() => caf);
      ch.update();
    }
    const st = dscr >= 1.3 ? 'good' : dscr >= 1 ? 'warn' : 'bad';
    document.getElementById('loanTiles').innerHTML =
      tile(type === 'annuity' ? 'Annuité' : '1re échéance (la plus élevée)', E.fmt(maxPay)) +
      tile('Coût total des intérêts', E.fmt(totalInt), `${(totalInt / P * 100).toFixed(0)} % du montant emprunté`) +
      tile('Couverture CAF / échéance', E.fmt(dscr, 'x'), statusChip(st, { good: 'Confortable', warn: 'Tendu', bad: 'Insuffisant' }[st]));
    const maxP = caf / 1.3 * (1 - (1 + rate) ** -n) / rate;
    document.getElementById('loanMsg').innerHTML = `<h4>Lecture</h4>${
      st === 'good' ? 'La CAF couvre l’échéance avec une marge de sécurité : le prêt est supportable.'
      : st === 'warn' ? 'La CAF couvre l’échéance, mais sans marge : la moindre baisse d’activité crée un impayé. Allongez la durée ou réduisez le montant.'
      : 'La CAF ne suffit pas à payer l’échéance : l’entreprise devra puiser dans sa trésorerie ou s’endetter pour rembourser. Refus probable en l’état.'
    } Avec cette CAF, ce taux et cette durée, le montant maximal raisonnable (couverture de 1,3 fois) en annuités constantes est d’environ <b>${E.fmt(maxP)}</b>.${type === 'linear' ? ' En amortissement constant, les premières échéances sont plus lourdes mais le coût total est plus faible.' : ''}`;
    document.getElementById('loanTable').innerHTML = `<div class="table-wrap"><table><thead><tr><th>Année</th><th class="r">Échéance</th><th class="r">Intérêts</th><th class="r">Capital</th><th class="r">Capital restant dû</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.k}</td><td class="r">${E.fmt(r.payment)}</td><td class="r">${E.fmt(r.interest)}</td><td class="r">${E.fmt(r.amort)}</td><td class="r">${E.fmt(r.crd)}</td></tr>`).join('')}</tbody></table></div>`;
  };
  root.querySelectorAll('#ltype button').forEach(b => b.onclick = () => {
    type = b.dataset.v; root.querySelectorAll('#ltype button').forEach(x => x.classList.toggle('on', x === b)); update();
  });
  bindSliders(root, update);
}

// ---------- Exercices ----------
let exoFilter = 'Tous';
function viewExercises() {
  const cats = ['Tous', ...new Set(EXERCISES.map(e => e.cat))];
  const pool = EXERCISES.filter(e => exoFilter === 'Tous' || e.cat === exoFilter);
  const ex = pool[Math.floor(Math.random() * pool.length)];
  const inst = ex.gen();
  const e = progress.exo;
  app.innerHTML = `
    <h1>Exercices express</h1>
    <p class="muted">Des chiffres nouveaux à chaque tirage. Faites le calcul à la main ou avec une calculatrice, puis vérifiez.</p>
    <div class="tiles">
      ${tile('Réussis', `${e.correct} / ${e.done}`)}
      ${tile('Série en cours', e.streak)}
      ${tile('Meilleure série', e.best)}
    </div>
    <div class="chips">${cats.map(c => `<button class="chip ${c === exoFilter ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
    <div class="small muted" style="margin-bottom:6px">${ex.cat} · ${ex.title}</div>
    <div id="exo"></div>
    <div class="btn-row"><button class="btn primary" id="nextExo">Nouvel exercice →</button></div>`;
  app.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { exoFilter = b.dataset.c; viewExercises(); });
  document.getElementById('nextExo').onclick = viewExercises;
  let counted = false;
  questionBlock(document.getElementById('exo'), {
    ...inst, prompt: inst.question,
    onAttempt(ok) {
      if (counted) return;
      counted = true;
      e.done++;
      if (ok) { e.correct++; e.streak++; e.best = Math.max(e.best, e.streak); } else e.streak = 0;
      saveProgress();
    },
  });
}

// ---------- Analyse d'un dossier ----------
const DOSSIER_FIELDS = [
  ['Compte de résultat', [
    ['ca', 'Chiffre d’affaires'], ['caN1', 'CA de l’année précédente (facultatif)'], ['achats', 'Achats consommés'], ['servicesExt', 'Transports et services extérieurs'],
    ['impotsTaxes', 'Impôts et taxes'], ['chargesPersonnel', 'Charges de personnel'], ['dotations', 'Dotations aux amortissements et provisions'],
    ['produitsFinanciers', 'Produits financiers'], ['fraisFinanciers', 'Frais financiers'], ['hao', 'Résultat HAO (+/−)'], ['impotResultat', 'Impôt sur le résultat'],
  ]],
  ['Bilan', [
    ['immoNettes', 'Immobilisations nettes'], ['stocks', 'Stocks'], ['creances', 'Créances clients'], ['autresCreances', 'Autres créances'], ['tresoActif', 'Trésorerie actif'],
    ['capitauxPropres', 'Capitaux propres'], ['dettesFinancieres', 'Dettes financières MLT'], ['fournisseurs', 'Dettes fournisseurs'], ['dettesFiscalesSociales', 'Dettes fiscales et sociales'], ['tresoPassif', 'Découverts / trésorerie passif'],
  ]],
  ['Demande de crédit (facultatif)', [['loanAmount', 'Montant demandé'], ['loanRate', 'Taux annuel (%)'], ['loanYears', 'Durée (années)']]],
];

function viewDossier() {
  const example = { ...CASES[0].data[2], caN1: CASES[0].data[1].ca, loanAmount: 60, loanRate: 9, loanYears: 5 };
  const saved = store.get('dossier', example);
  app.innerHTML = `
    <h1>Analyser un dossier</h1>
    <p class="muted">Saisissez les comptes d’une entreprise (en M FCFA ou dans n’importe quelle unité, du moment qu’elle est la même partout). Le formulaire est pré-rempli avec l’exemple de la boulangerie.</p>
    <form class="card" id="dossierForm">
      ${DOSSIER_FIELDS.map(([title, fields]) => `<fieldset><legend>${title}</legend><div class="form-grid">${fields.map(([k, l]) =>
        `<label>${l}<input type="text" inputmode="decimal" name="${k}" value="${saved[k] ?? ''}"></label>`).join('')}</div></fieldset>`).join('')}
      <div class="btn-row"><button class="btn primary" type="submit">Analyser</button><button class="btn ghost" type="button" id="resetDossier">Recharger l’exemple</button><button class="btn ghost" type="button" id="clearDossier">Tout effacer</button></div>
    </form>
    <div id="dossierOut"></div>`;
  const form = document.getElementById('dossierForm');
  form.onsubmit = ev => {
    ev.preventDefault();
    const d = {};
    for (const [k, v] of new FormData(form)) d[k] = v.trim() === '' ? null : parseNum(v);
    store.set('dossier', d);
    analyzeDossier(d);
  };
  document.getElementById('resetDossier').onclick = () => { store.set('dossier', example); viewDossier(); };
  document.getElementById('clearDossier').onclick = () => { store.set('dossier', {}); viewDossier(); };
  if (saved.ca) analyzeDossier(saved);
}

function analyzeDossier(d) {
  destroyCharts();
  const out = document.getElementById('dossierOut');
  const y = {};
  DOSSIER_FIELDS.slice(0, 2).forEach(([, fs]) => fs.forEach(([k]) => { y[k] = isFinite(d[k]) && d[k] !== null ? d[k] : 0; }));
  if (!y.ca) { out.innerHTML = '<div class="feedback ko">Le chiffre d’affaires est obligatoire.</div>'; return; }
  const m = E.analyze(y);
  const growth = d.caN1 ? y.ca / d.caN1 - 1 : undefined;
  const sc = E.score(m, growth);
  const passif = y.capitauxPropres + y.dettesFinancieres + y.fournisseurs + y.dettesFiscalesSociales + y.tresoPassif;
  const gap = m.totalBilan - passif;
  const hasLoan = d.loanAmount > 0 && d.loanYears > 0;
  const loan = hasLoan ? E.loanSchedule(d.loanAmount, (d.loanRate || 0) / 100, Math.round(d.loanYears)) : null;
  const annuity = loan ? loan[0].payment : 0;
  const dscr = loan ? m.caf / annuity : null;
  const newCapa = hasLoan && m.caf > 0 ? (y.dettesFinancieres + d.loanAmount) / m.caf : null;

  // Diagnostic automatique
  const diag = [];
  const push = (s, t) => diag.push(`<li>${statusChip(s, '')} ${t}</li>`);
  if (growth !== undefined) push(growth >= 0 ? 'good' : growth > -0.05 ? 'warn' : 'bad', `CA ${growth >= 0 ? 'en hausse' : 'en baisse'} de ${E.fmt(Math.abs(growth), 'pct')}.`);
  push(E.status('margeEbe', m.margeEbe), `Marge d’EBE de ${E.fmt(m.margeEbe, 'pct')} : ${m.margeEbe >= 0.12 ? 'l’exploitation dégage une rentabilité confortable' : m.margeEbe >= 0.05 ? 'une rentabilité correcte, à comparer aux entreprises du secteur' : 'une rentabilité faible, qui laisse peu de marge pour absorber un choc'}.`);
  push(m.tn >= 0 ? 'good' : 'bad', m.tn >= 0 ? `Trésorerie nette positive (${E.fmt(m.tn)}) : le fonds de roulement finance tout le BFR.` : `Trésorerie nette négative (${E.fmt(m.tn)}) : le BFR (${E.fmt(m.bfr)}) dépasse le fonds de roulement (${E.fmt(m.fr)}) et une partie de l’exploitation est financée par découvert.`);
  push(E.status('bfrJours', m.bfrJours), `BFR de ${E.fmt(m.bfrJours, 'j')} de CA (clients ${E.fmt(m.dso, 'j')}, stocks ${E.fmt(m.dio, 'j')}, fournisseurs ${E.fmt(m.dpo, 'j')}).`);
  push(E.status('capaRemb', m.capaRemb), m.caf <= 0 ? 'CAF négative ou nulle : aucune capacité de remboursement.' : `La dette financière représente ${E.fmt(m.capaRemb, 'ans')} de CAF.`);
  push(E.status('autonomie', m.autonomie), `Autonomie financière de ${E.fmt(m.autonomie, 'pct')}, gearing de ${E.fmt(m.gearing, 'x')}.`);
  if (hasLoan) push(dscr >= 1.3 ? 'good' : dscr >= 1 ? 'warn' : 'bad', `Nouveau prêt : annuité de ${E.fmt(annuity)}, couverte ${E.fmt(dscr, 'x')} par la CAF${newCapa ? ` ; dette / CAF après le prêt : ${E.fmt(newCapa, 'ans')}` : ''}.`);

  out.innerHTML = `
    ${Math.abs(gap) > 0.5 ? `<div class="feedback info" style="margin-bottom:16px"><b>Bilan déséquilibré :</b> l’actif (${E.fmt(m.totalBilan)}) et le passif (${E.fmt(passif)}) diffèrent de ${E.fmt(Math.abs(gap))}. Vérifiez la saisie : les ratios de structure peuvent être faussés.</div>` : ''}
    <div class="tiles">
      ${tile('EBE', E.fmt(m.ebe), `Marge ${E.fmt(m.margeEbe, 'pct')}`)}
      ${tile('Résultat net', E.fmt(m.rn))}
      ${tile('CAF', E.fmt(m.caf))}
      ${tile('FR / BFR', `${E.fmt(m.fr)} / ${E.fmt(m.bfr)}`, `Trésorerie nette ${E.fmt(m.tn)}`)}
    </div>
    <div class="grid grid-2">
      ${scoreBlock([m], [y], ['du dossier']).html}
      <div class="card"><h3>Diagnostic</h3><ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px">${diag.join('')}</ul></div>
    </div>
    <div class="grid grid-2">
      <div class="card chart-card"><h3>Du chiffre d’affaires au résultat net</h3><div class="sub">Soldes intermédiaires de gestion</div>
        ${legend([['Soldes', css('--s1')], ['Charges', css('--neutral-bar')], ['Produits', css('--s3')]])}
        <div class="chart-box tall"><canvas id="d1"></canvas></div></div>
      <div class="card chart-card"><h3>Équilibre financier</h3><div class="sub">Fonds de roulement, BFR et trésorerie nette</div>
        <div class="chart-box tall"><canvas id="d2"></canvas></div></div>
    </div>`;
  waterfall('d1', y, m);
  chart('d2', {
    type: 'bar',
    data: { labels: ['Fonds de roulement', 'BFR', 'Trésorerie nette'], datasets: [{ label: 'Montant', data: [m.fr, m.bfr, m.tn], ...barStyle(null), backgroundColor: [css('--s1'), css('--s2'), css('--s3')], maxBarThickness: 70 }] },
    options: { interaction: { mode: 'nearest', intersect: true }, plugins: { tooltip: { callbacks: { label: ctx => ` ${E.fmt(ctx.raw)}` } } } },
  });
}

// ---------- Fiches ----------
function viewFiches() {
  app.innerHTML = `
    <h1>Fiches méthode</h1>
    <p class="muted">L’essentiel à garder sous la main pendant les cas pratiques. Chaque fiche renvoie à un exemple chiffré tiré des cas.</p>
    <div class="toc">${FICHES.map(fi => `<a class="chip" href="#fiche-${fi.id}" data-anchor="${fi.id}">${fi.title}</a>`).join('')}</div>
    <div class="grid grid-2">${FICHES.map(fi => `
      <article class="card fiche" id="fiche-${fi.id}">
        <h3>${fi.title} <span class="badge">${fi.tag}</span></h3>
        <dl>
          <dt>À quoi ça sert</dt><dd>${fi.usage}</dd>
          <dt>Formules</dt><dd><span class="formula">${esc(fi.formula).replace(/\n/g, '<br>')}</span></dd>
          <dt>Comment lire</dt><dd>${fi.lecture}</dd>
          <dt>Piège classique</dt><dd>${fi.piege}</dd>
          <dt>Exemple</dt><dd>${fi.exemple}</dd>
        </dl>
      </article>`).join('')}</div>`;
  app.querySelectorAll('[data-anchor]').forEach(a => a.onclick = ev => {
    ev.preventDefault();
    document.getElementById('fiche-' + a.dataset.anchor).scrollIntoView({ behavior: 'smooth' });
  });
}

// ---------- Cours ----------
const coursProgress = () => (progress.cours ||= {});
const lastYear = c => c.data[c.data.length - 1];
const lastM = c => E.analyze(lastYear(c));

function viewCoursIndex() {
  const cp = coursProgress();
  const families = [...new Set(Object.values(RATIOS).map(r => r.family))];
  const chapterOf = key => CHAPTERS.find(ch => ch.ratios.includes(key));
  app.innerHTML = `
    <h1>Cours</h1>
    <p class="muted">Huit chapitres courts pour comprendre chaque ratio : ce qu’il mesure, comment le calculer, comment l’interpréter et quels pièges éviter. Chaque notion est illustrée par les entreprises des cas pratiques, avec graphiques et quiz.</p>
    <div class="insight" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><h4>Mini-test final</h4>${TEST_SIZE} questions tirées au hasard dans tous les chapitres${progress.tests?.best ? ` · meilleur score : ${progress.tests.best} %` : ''}.</div><a class="btn primary" href="#/test">Faire le mini-test →</a></div>
    <div class="grid grid-2">${CHAPTERS.map((ch, i) => {
      const st = cp[ch.id];
      return `<a class="card module-link" href="#/cours/${ch.id}">
        <div class="small muted">Chapitre ${i + 1} · ${ch.duration}${ch.ratios.length ? ` · ${ch.ratios.length} ratios` : ''}</div>
        <h3 style="margin-top:6px">${ch.title}</h3>
        <p class="small muted">${ch.intro}</p>
        ${st ? `<span class="status ${st.score === st.total ? 'good' : 'warn'}">Quiz : ${st.score} / ${st.total}</span>` : '<span class="badge">À lire</span>'}
      </a>`;
    }).join('')}</div>
    <h2 style="margin-top:28px">Index des ratios</h2>
    <p class="muted small">Cliquez sur un ratio pour ouvrir sa fiche détaillée dans le chapitre correspondant.</p>
    <div class="card"><div class="table-wrap"><table>
      <thead><tr><th>Ratio</th><th>Famille</th><th>Formule</th><th>Repère favorable</th></tr></thead>
      <tbody>${families.map(f => Object.entries(RATIOS).filter(([, r]) => r.family === f).map(([k, r]) => {
        const ch = chapterOf(k);
        const good = r.grille.find(g => g[2] === 'good');
        return `<tr><td><a href="#/cours/${ch.id}/${k}">${r.name}</a></td><td>${f}</td><td class="small">${r.formula}</td><td class="small">${good ? good[0] : '–'}</td></tr>`;
      }).join('')).join('')}</tbody>
    </table></div></div>`;
}

function viewChapter(id, anchor) {
  const idx = CHAPTERS.findIndex(ch => ch.id === id);
  if (idx < 0) return viewCoursIndex();
  const ch = CHAPTERS[idx];
  const caseId = store.get('coursCase', CASES[0].id);
  const c = CASES.find(x => x.id === caseId) || CASES[0];
  const y = lastYear(c), m = E.analyze(y), yr = c.years[c.years.length - 1];
  const prev = CHAPTERS[idx - 1], next = CHAPTERS[idx + 1];
  app.innerHTML = `
    <p class="small"><a href="#/cours">← Tous les chapitres</a></p>
    <div class="eyebrow">Chapitre ${idx + 1} · ${ch.duration}</div>
    <h1>${ch.title}</h1>
    <p class="muted" style="max-width:70ch">${ch.intro}</p>
    <div class="card" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <label for="exCase" class="small muted">Entreprise utilisée pour les exemples chiffrés :</label>
      <select id="exCase" class="select">${CASES.map(x => `<option value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${x.name} (${x.years[x.years.length - 1]})</option>`).join('')}</select>
    </div>
    ${ch.ratios.length ? `<div class="toc">${ch.ratios.map(k => `<a class="chip" href="#/cours/${ch.id}/${k}">${RATIOS[k].name}</a>`).join('')}</div>` : ''}
    ${ch.blocks.map(b => `<section class="card lesson"><h2>${b.h}</h2>${b.html}</section>`).join('')}
    <div id="visual"></div>
    ${ch.ratios.map(k => ratioCard(k, c, y, m, yr)).join('')}
    <section class="card"><h2>Quiz : testez votre interprétation</h2><div id="quiz"></div></section>
    ${ch.practice.length ? `<div class="insight"><h4>Mettre en pratique</h4><div class="btn-row">${ch.practice.map(([h, l]) => `<a class="btn" href="${h}">${l} →</a>`).join('')}</div></div>` : ''}
    <div class="btn-row" style="justify-content:space-between;margin-top:20px">
      ${prev ? `<a class="btn" href="#/cours/${prev.id}">← ${prev.title}</a>` : '<span></span>'}
      ${next ? `<a class="btn primary" href="#/cours/${next.id}">${next.title} →</a>` : '<a class="btn primary" href="#/test">Faire le mini-test final →</a>'}
    </div>`;
  document.getElementById('exCase').onchange = ev => { store.set('coursCase', ev.target.value); destroyCharts(); viewChapter(id); };
  renderVisual(ch.visual, c, y, m, yr);
  ch.ratios.forEach(k => ratioChart(k, c));
  renderQuiz(ch, document.getElementById('quiz'));
  if (anchor) setTimeout(() => document.getElementById('ratio-' + anchor)?.scrollIntoView({ behavior: 'smooth' }), 50);
}

function ratioCard(k, c, y, m, yr) {
  const r = RATIOS[k];
  const v = m[k], t = E.THRESHOLDS[k];
  const st = t ? E.status(k, v) : null;
  return `<section class="card ratio" id="ratio-${k}">
    <div class="ratio-head"><h2>${r.name}</h2><span class="badge">${r.family}</span></div>
    <p>${r.measure}</p>
    <span class="formula">${esc(r.formula)}</span>
    <div class="grid grid-2" style="margin-top:12px">
      <div>
        <h4 class="mini">Exemple : ${c.name}, ${yr}</h4>
        <span class="formula">${esc(r.calc(y, m)).replace(/\n/g, '<br>')}</span>
        ${st ? `<p>${statusChip(st)} <span class="small muted">selon la grille ci-dessous</span></p>` : ''}
        <h4 class="mini">Grille de lecture</h4>
        <div class="table-wrap"><table><tbody>${r.grille.map(([range, txt, s]) => `<tr><td style="min-width:110px"><b>${range}</b></td><td>${statusChip(s, '')}</td><td class="small">${txt}</td></tr>`).join('')}</tbody></table></div>
      </div>
      <div>
        <h4 class="mini">Comparaison des entreprises des cas pratiques</h4>
        ${legend([['Entreprise sélectionnée', css('--s2')], ['Autres entreprises', css('--s1')], ...(t ? [['Seuil favorable', css('--good')], ['Seuil d’alerte', css('--bad')]] : [])])}
        <div class="chart-box"><canvas id="rc-${k}"></canvas></div>
        <h4 class="mini">Repères par secteur (ordres de grandeur)</h4>
        <div class="table-wrap"><table><tbody>${r.secteurs.map(([sct, val]) => `<tr><td>${sct}</td><td class="r">${val}</td></tr>`).join('')}</tbody></table></div>
      </div>
    </div>
    <div class="grid grid-2" style="margin-top:12px">
      <div><h4 class="mini">Comment l’améliorer</h4><ul>${r.leviers.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div><h4 class="mini">Pièges d’interprétation</h4><ul>${r.pieges.map(x => `<li>${x}</li>`).join('')}</ul></div>
    </div>
  </section>`;
}

function ratioChart(k, c) {
  const t = E.THRESHOLDS[k], fmtKind = t ? t.fmt : 'x';
  const scale = fmtKind === 'pct' ? 100 : 1;
  const vals = CASES.map(x => { const v = lastM(x)[k]; return isFinite(v) ? v * scale : null; });
  const datasets = [{
    type: 'bar', label: RATIOS[k].name, data: vals, ...barStyle(null),
    backgroundColor: CASES.map(x => x.id === c.id ? css('--s2') : css('--s1')),
  }];
  if (t) {
    datasets.push({ type: 'line', label: 'Seuil favorable', data: CASES.map(() => t.good * scale), borderColor: css('--good'), borderDash: [5, 4], borderWidth: 2, pointRadius: 0 });
    datasets.push({ type: 'line', label: 'Seuil d’alerte', data: CASES.map(() => t.bad * scale), borderColor: css('--bad'), borderDash: [5, 4], borderWidth: 2, pointRadius: 0 });
  }
  const show = v => fmtKind === 'pct' ? E.fmt(v / 100, 'pct') : E.fmt(v, fmtKind);
  chart('rc-' + k, {
    type: 'bar',
    data: { labels: CASES.map(x => x.short), datasets },
    options: {
      plugins: { tooltip: { callbacks: { label: ctx => ctx.raw === null ? ' Non calculable' : ` ${ctx.dataset.label} : ${show(ctx.raw)}` } } },
      scales: { x: { ticks: { autoSkip: false, maxRotation: 45, font: { size: 11 } } }, y: { ticks: { callback: v => fmtKind === 'pct' ? v + ' %' : v } } },
    },
  });
}

function renderVisual(kind, c, y, m, yr) {
  const root = document.getElementById('visual');
  if (!kind) return;
  if (kind === 'bilan') {
    root.innerHTML = `<div class="card chart-card"><h3>Le bilan fonctionnel de ${c.name} (${yr})</h3>
      <div class="sub">Emplois à gauche, ressources à droite. Changez d’entreprise en haut de la page pour comparer.</div>
      ${BILAN_LEGEND()}<div class="chart-box tall"><canvas id="v1"></canvas></div>
      <p class="small">FR = ${E.fmt(m.fr)} · BFR = ${E.fmt(m.bfr)} · Trésorerie nette = FR − BFR = <b>${E.fmt(m.tn)}</b></p></div>`;
    bilanChart('v1', y, m);
  }
  if (kind === 'sig') {
    root.innerHTML = `<div class="card chart-card"><h3>La cascade des soldes : ${c.name} (${yr})</h3>
      <div class="sub">Chaque barre grise est une charge retirée. En bleu, les soldes intermédiaires.</div>
      ${legend([['Soldes', css('--s1')], ['Charges', css('--neutral-bar')], ['Produits', css('--s3')]])}
      <div class="chart-box tall"><canvas id="v1"></canvas></div></div>`;
    waterfall('v1', y, m);
  }
  if (kind === 'ftn') {
    const ms = CASES.map(lastM);
    root.innerHTML = `<div class="card chart-card"><h3>FR, BFR et trésorerie des six entreprises</h3>
      <div class="sub">En jours de chiffre d’affaires, pour comparer des entreprises de tailles différentes</div>
      ${legend([['Fonds de roulement', css('--s1')], ['BFR', css('--s2')], ['Trésorerie nette', css('--s3')]])}
      <div class="chart-box tall"><canvas id="v1"></canvas></div></div>`;
    const j = (v, x) => E.round(v / lastYear(x).ca * 360);
    chart('v1', {
      type: 'bar',
      data: { labels: CASES.map(x => x.short), datasets: [
        { label: 'Fonds de roulement', data: ms.map((mm, i) => j(mm.fr, CASES[i])), ...barStyle(css('--s1')) },
        { label: 'BFR', data: ms.map((mm, i) => j(mm.bfr, CASES[i])), ...barStyle(css('--s2')) },
        { label: 'Trésorerie nette', data: ms.map((mm, i) => j(mm.tn, CASES[i])), ...barStyle(css('--s3')) },
      ] },
      options: { plugins: { tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label} : ${Math.round(ctx.raw)} j de CA` } } }, scales: { y: { ticks: { callback: v => v + ' j' } } }, datasets: { bar: { categoryPercentage: 0.75, barPercentage: 0.9 } } },
    });
  }
  if (kind === 'cycle') {
    root.innerHTML = `<div class="card chart-card"><h3>Le cycle d’exploitation de ${c.name} (${yr})</h3>
      <div class="sub">Jour 0 : la marchandise entre en stock. Elle est vendue après la rotation des stocks, puis encaissée après le délai clients. Le fournisseur, lui, est payé après le délai fournisseurs.</div>
      ${legend([['Stock', css('--s2')], ['Crédit client', css('--s1')], ['Crédit fournisseur', css('--s3')], ['Période à financer', css('--s4')]])}
      <div class="chart-box"><canvas id="v1"></canvas></div>
      <p class="small">Cycle = ${E.fmt(m.dio, 'j')} + ${E.fmt(m.dso, 'j')} − ${E.fmt(m.dpo, 'j')} = <b>${E.fmt(m.cycle, 'j')}</b> ${m.cycle > 0 ? `pendant lesquels l’entreprise doit avancer l’argent.` : ': le fournisseur est payé après l’encaissement du client, l’exploitation génère de la trésorerie.'}</p></div>`;
    const end = m.dio + m.dso;
    const rows = [['Stock', [0, m.dio], '--s2'], ['Crédit client', [m.dio, end], '--s1'], ['Crédit fournisseur', [0, m.dpo], '--s3'], ['Période à financer', m.cycle > 0 ? [m.dpo, end] : [end, end], '--s4']];
    chart('v1', {
      type: 'bar',
      data: { labels: rows.map(r => r[0]), datasets: [{ label: 'Jours', data: rows.map(r => r[1].map(v => E.round(v))), ...barStyle(null), backgroundColor: rows.map(r => css(r[2])), maxBarThickness: 28 }] },
      options: {
        indexAxis: 'y', interaction: { mode: 'nearest', intersect: true },
        plugins: { tooltip: { callbacks: { label: ctx => ` du jour ${Math.round(ctx.raw[0])} au jour ${Math.round(ctx.raw[1])} (${Math.round(ctx.raw[1] - ctx.raw[0])} j)` } } },
        scales: { x: { grid: { color: css('--grid') }, ticks: { callback: v => 'J' + v } }, y: { grid: { display: false } } },
      },
    });
  }
  if (kind === 'levier') {
    root.innerHTML = `<div class="card"><h3>Simulateur d’effet de levier</h3>
      <div class="layout-sim" style="margin-top:12px"><div>
        ${slider('lvRoce', 'Rentabilité économique (ROCE)', 0, 30, 1, 15, ' %')}
        ${slider('lvRate', 'Coût de la dette (après impôt)', 2, 20, 0.5, 8, ' %')}
        ${slider('lvDebt', 'Dettes / capitaux propres', 0, 4, 0.1, 1, ' x')}
      </div><div>
        <div class="tiles" id="lvTiles"></div>
        ${legend([['ROE selon le niveau d’endettement', css('--s1')], ['ROCE (sans dette)', css('--muted')]])}
        <div class="chart-box"><canvas id="v1"></canvas></div>
      </div></div>
      <div class="insight" id="lvMsg" style="margin-top:12px"></div></div>`;
    const xs = Array.from({ length: 21 }, (_, i) => E.round(i * 0.2, 1));
    const ch = chart('v1', {
      type: 'line',
      data: { labels: xs.map(x => x.toLocaleString('fr-FR')), datasets: [
        { label: 'ROE', data: [], ...lineStyle(css('--s1')), pointRadius: 0 },
        { label: 'ROCE', data: [], borderColor: css('--muted'), borderDash: [5, 4], borderWidth: 2, pointRadius: 0 },
      ] },
      options: {
        plugins: { tooltip: { callbacks: { title: items => `Dettes / CP = ${items[0].label}`, label: ctx => ` ${ctx.dataset.label} : ${ctx.raw.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %` } } },
        scales: { x: { title: { display: true, text: 'Dettes / capitaux propres', color: css('--muted') }, ticks: { maxTicksLimit: 9 } }, y: { ticks: { callback: v => v + ' %' } } },
        animation: { duration: 200 },
      },
    });
    bindSliders(root, () => {
      const roce = val('lvRoce'), rate = val('lvRate'), d = val('lvDebt');
      const roe = roce + (roce - rate) * d;
      if (ch) { ch.data.datasets[0].data = xs.map(x => roce + (roce - rate) * x); ch.data.datasets[1].data = xs.map(() => roce); ch.update(); }
      document.getElementById('lvTiles').innerHTML = tile('ROE obtenu', E.fmt(roe / 100, 'pct')) + tile('Effet de levier', (roe - roce >= 0 ? '+' : '') + E.fmt((roe - roce) / 100, 'pct'), roce >= rate ? statusChip('good', 'Positif') : statusChip('bad', 'Négatif : effet massue'));
      document.getElementById('lvMsg').innerHTML = `<h4>Lecture</h4>ROE = ${roce} % + (${roce} % − ${rate.toLocaleString('fr-FR')} %) × ${d.toLocaleString('fr-FR')} = <b>${E.fmt(roe / 100, 'pct')}</b>. ${roce > rate ? 'Le ROCE dépasse le coût de la dette : chaque franc emprunté rapporte plus qu’il ne coûte, l’endettement augmente la rentabilité des associés… mais aussi leur risque si l’activité baisse.' : roce === rate ? 'ROCE et coût de la dette sont égaux : l’endettement ne change pas la rentabilité, il ajoute seulement du risque.' : 'Le ROCE est inférieur au coût de la dette : plus l’entreprise s’endette, plus la rentabilité des associés chute. C’est l’effet massue, typique d’une entreprise en difficulté qui continue d’emprunter.'}`;
    });
  }
  if (kind === 'radar') {
    const keys = ['margeEbe', 'bfrJours', 'liquiditeGen', 'dso', 'dio', 'autonomie', 'gearing', 'capaRemb', 'couvFF'];
    root.innerHTML = `<div class="card"><h3>Vue d’ensemble : les six entreprises, ratio par ratio (dernier exercice)</h3>
      <p class="small muted">Lisez chaque ligne comme une histoire : où se concentrent les alertes ? Sont-elles cohérentes entre elles ?</p>
      <div class="table-wrap"><table class="matrix"><thead><tr><th>Entreprise</th>${keys.map(k => `<th>${E.THRESHOLDS[k].label.replace(/ \(.*\)/, '')}</th>`).join('')}</tr></thead>
      <tbody>${CASES.map(x => { const mm = lastM(x); return `<tr><td><a href="#/cas/${x.id}">${x.short}</a></td>${keys.map(k => `<td>${statusChip(E.status(k, mm[k]), E.fmt(mm[k], E.THRESHOLDS[k].fmt))}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div></div>`;
  }
}

function renderQuiz(ch, root) {
  const answers = {};
  root.innerHTML = ch.quiz.map((q, i) => `
    <div class="quiz-q" data-i="${i}">
      <p><b>${i + 1}. ${q.q}</b></p>
      <div class="quiz-opts">${q.options.map((o, j) => `<button class="choice" data-j="${j}">${o}</button>`).join('')}</div>
      <div class="quiz-fb"></div>
    </div>`).join('') + '<div id="quizScore"></div>';
  root.querySelectorAll('.quiz-q').forEach(el => {
    const i = +el.dataset.i, q = ch.quiz[i];
    el.querySelectorAll('.choice').forEach(btn => btn.onclick = () => {
      if (answers[i] !== undefined) return;
      const j = +btn.dataset.j;
      answers[i] = j === q.answer;
      el.querySelectorAll('.choice').forEach(b => {
        b.disabled = true;
        if (+b.dataset.j === q.answer) b.classList.add('right');
        else if (b === btn) b.classList.add('wrong');
      });
      el.querySelector('.quiz-fb').innerHTML = `<div class="feedback ${answers[i] ? 'ok' : 'ko'}"><b>${answers[i] ? 'Bonne réponse.' : 'Pas tout à fait.'}</b> ${q.explain}</div>`;
      if (Object.keys(answers).length === ch.quiz.length) {
        const score = Object.values(answers).filter(Boolean).length;
        coursProgress()[ch.id] = { score, total: ch.quiz.length };
        saveProgress();
        document.getElementById('quizScore').innerHTML = `<div class="feedback ${score === ch.quiz.length ? 'ok' : 'info'}" style="margin-top:12px"><b>Score : ${score} / ${ch.quiz.length}.</b> ${score === ch.quiz.length ? 'Parfait, passez au chapitre suivant.' : 'Relisez les fiches concernées puis retentez le quiz (rechargez la page).'}</div>`;
      }
    });
  });
}

// ---------- Mon compte ----------
let pendingEmail = null;
let resendAt = 0;
function viewCompte(notice) {
  if (account) {
    const done = CASES.filter(c => progress.cases[c.id]?.decision).length;
    app.innerHTML = `
      <h1>Mon compte</h1>
      <div class="card auth-card">
        <div class="small muted">Connecté avec</div>
        <p style="font-size:1.15rem;font-weight:600;margin-top:2px">${esc(account.email)}</p>
        <p id="syncStatus" class="sync-note">${esc(syncText())}</p>
        <div class="tiles" style="margin-top:12px">
          ${tile('Chapitres validés', `${Object.keys(progress.cours || {}).length} / ${CHAPTERS.length}`)}
          ${tile('Cas terminés', `${done} / ${CASES.length}`)}
          ${tile('Mini-test', progress.tests?.best ? progress.tests.best + ' %' : '–', 'meilleur score')}
        </div>
        <div class="btn-row"><button class="btn primary" id="syncBtn">Synchroniser maintenant</button><button class="btn" id="logoutBtn">Se déconnecter</button></div>
        <p class="small muted" style="margin-top:12px">Votre progression est enregistrée automatiquement sur votre compte à chaque action. Connectez-vous avec la même adresse sur un autre appareil pour la retrouver.</p>
      </div>`;
    document.getElementById('syncBtn').onclick = () => syncNow();
    document.getElementById('logoutBtn').onclick = async () => {
      try { await api('logout', { auth: true }); } catch { /* session déjà invalide : on déconnecte quand même */ }
      signOutLocal('Vous êtes déconnecté. Votre progression reste disponible sur cet appareil.');
      viewCompte();
    };
    return;
  }
  const step = pendingEmail ? 'code' : 'email';
  app.innerHTML = `
    <h1>Mon compte</h1>
    <p class="muted" style="max-width:62ch">Connectez-vous avec votre adresse e-mail pour sauvegarder votre progression (cours, cas pratiques, exercices, mini-test) et la retrouver sur tous vos appareils. Pas de mot de passe : vous recevez un code à 6 chiffres par e-mail.</p>
    ${notice || syncState.message ? `<div class="feedback info auth-card" style="margin-bottom:16px">${esc(notice || syncState.message)}</div>` : ''}
    <form class="card auth-card" id="authForm" novalidate>
      ${step === 'email' ? `
        <label for="authEmail"><b>Adresse e-mail</b></label>
        <input id="authEmail" type="email" autocomplete="email" inputmode="email" placeholder="vous@exemple.com" required>
        <div class="btn-row"><button class="btn primary" type="submit">Recevoir le code</button></div>` : `
        <p>Un code a été envoyé à <b>${esc(pendingEmail)}</b>. Il est valable 10 minutes. Pensez à vérifier vos courriers indésirables.</p>
        <label for="authCode"><b>Code de vérification</b></label>
        <input id="authCode" class="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" required>
        <div class="btn-row"><button class="btn primary" type="submit">Valider</button><button class="btn ghost" type="button" id="resendBtn">Renvoyer le code</button><button class="btn ghost" type="button" id="changeBtn">Changer d’adresse</button></div>`}
      <div id="authMsg"></div>
    </form>`;
  const msg = (kind, text) => { document.getElementById('authMsg').innerHTML = `<div class="feedback ${kind}">${esc(text)}</div>`; };
  const form = document.getElementById('authForm');
  const busy = on => form.querySelectorAll('button').forEach(b => { b.disabled = on; });
  const send = async email => {
    busy(true);
    try {
      await api('request', { body: { email } });
      pendingEmail = email.trim().toLowerCase();
      resendAt = Date.now() + 60000;
      syncState.message = null;
      viewCompte();
    } catch (e) { busy(false); msg('ko', e.message); }
  };
  if (step === 'email') {
    const input = document.getElementById('authEmail');
    input.focus();
    form.onsubmit = ev => {
      ev.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) return msg('ko', 'Adresse e-mail invalide.');
      send(input.value.trim());
    };
    return;
  }
  const codeInput = document.getElementById('authCode');
  codeInput.focus();
  codeInput.oninput = () => { codeInput.value = codeInput.value.replace(/\D/g, '').slice(0, 6); };
  form.onsubmit = async ev => {
    ev.preventDefault();
    if (codeInput.value.length !== 6) return msg('ko', 'Le code contient 6 chiffres.');
    busy(true);
    try {
      const r = await api('verify', { body: { email: pendingEmail, code: codeInput.value } });
      account = { email: r.email, token: r.token };
      store.set('account', account);
      pendingEmail = null;
      updateAccountUI();
      viewCompte();
      syncNow();
    } catch (e) { busy(false); msg('ko', e.message); }
  };
  document.getElementById('resendBtn').onclick = () => {
    const wait = Math.ceil((resendAt - Date.now()) / 1000);
    if (wait > 0) return msg('info', `Vous pourrez demander un nouveau code dans ${wait} s.`);
    send(pendingEmail);
  };
  document.getElementById('changeBtn').onclick = () => { pendingEmail = null; viewCompte(); };
}

// ---------- Mini-test final ----------
const TEST_SIZE = 10;
let testRun = null;
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const chapterTitle = id => CHAPTERS.find(ch => ch.id === id)?.title || id;

function startTest() {
  const pool = [...CHAPTERS.flatMap(ch => ch.quiz.map(q => ({ ...q, ch: ch.id }))), ...EXTRA_QUIZ];
  const qs = shuffle(pool).slice(0, TEST_SIZE).map(q => {
    const order = shuffle(q.options.map((_, i) => i));
    return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
  });
  testRun = { qs, i: 0, results: [] };
  viewTest();
}

function viewTest() {
  const t = progress.tests || {};
  if (!testRun) {
    const hist = t.history || [];
    app.innerHTML = `
      <p class="small"><a href="#/cours">← Cours</a></p>
      <h1>Mini-test final</h1>
      <p class="muted" style="max-width:62ch">${TEST_SIZE} questions tirées au hasard dans tous les chapitres : calculs rapides et interprétation de ratios. À la fin, vous voyez votre score par chapitre et ce qu’il faut revoir. Chaque tentative est différente.</p>
      <div class="tiles">
        ${tile('Meilleur score', t.best ? t.best + ' %' : '–')}
        ${tile('Tentatives', hist.length)}
        ${tile('Dernier score', hist.length ? `${hist[hist.length - 1].score} / ${hist[hist.length - 1].total}` : '–')}
      </div>
      <div class="btn-row" style="margin-bottom:16px"><button class="btn primary" id="startTest">Commencer le test →</button></div>
      ${hist.length >= 2 ? `<div class="card chart-card"><h3>Vos scores au fil des tentatives</h3><div class="sub">En % de bonnes réponses</div><div class="chart-box"><canvas id="th"></canvas></div></div>` : ''}
      ${account ? '' : '<p class="small muted"><a href="#/compte">Connectez-vous</a> pour conserver vos scores sur tous vos appareils.</p>'}`;
    document.getElementById('startTest').onclick = startTest;
    if (hist.length >= 2) chart('th', {
      type: 'line',
      data: { labels: hist.map((h, i) => `#${i + 1}`), datasets: [{ label: 'Score', data: hist.map(h => Math.round(h.score / h.total * 100)), ...lineStyle(css('--s1')) }] },
      options: { plugins: { tooltip: { callbacks: { title: items => new Date(hist[items[0].dataIndex].date).toLocaleDateString('fr-FR'), label: ctx => ` ${ctx.raw} %` } } }, scales: { y: { min: 0, max: 100, ticks: { callback: v => v + ' %' } } } },
    });
    return;
  }
  const { qs, i } = testRun;
  if (i >= qs.length) return testResults();
  const q = qs[i];
  app.innerHTML = `
    <div class="card test-card">
      <div class="test-top"><span>Question ${i + 1} / ${qs.length}</span><span class="badge">${chapterTitle(q.ch)}</span></div>
      <div class="progress-bar"><div style="width:${i / qs.length * 100}%"></div></div>
      <h2 style="margin-top:16px;font-size:1.2rem">${q.q}</h2>
      <div class="quiz-opts">${q.options.map((o, j) => `<button class="choice" data-j="${j}">${o}</button>`).join('')}</div>
      <div id="tfb"></div>
    </div>`;
  app.querySelectorAll('.choice').forEach(btn => btn.onclick = () => {
    const ok = +btn.dataset.j === q.answer;
    testRun.results.push({ ch: q.ch, ok });
    app.querySelectorAll('.choice').forEach(b => {
      b.disabled = true;
      if (+b.dataset.j === q.answer) b.classList.add('right');
      else if (b === btn) b.classList.add('wrong');
    });
    const last = i + 1 >= qs.length;
    document.getElementById('tfb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'ko'}"><b>${ok ? 'Bonne réponse.' : 'Pas tout à fait.'}</b> ${q.explain}</div>
      <div class="btn-row" style="margin-top:12px"><button class="btn primary" id="nextQ">${last ? 'Voir mon résultat' : 'Question suivante'} →</button></div>`;
    document.getElementById('nextQ').onclick = () => { testRun.i++; viewTest(); window.scrollTo(0, 0); };
    document.getElementById('nextQ').focus();
  });
}

function testResults() {
  const { results } = testRun;
  const score = results.filter(r => r.ok).length, total = results.length, pct = Math.round(score / total * 100);
  if (!testRun.saved) {
    testRun.saved = true;
    const t = (progress.tests ||= {});
    t.history = [...(t.history || []), { date: Date.now(), score, total }].slice(-20);
    t.best = Math.max(t.best || 0, pct);
    saveProgress();
  }
  const byCh = {};
  results.forEach(r => { (byCh[r.ch] ||= { ok: 0, n: 0 }); byCh[r.ch].n++; if (r.ok) byCh[r.ch].ok++; });
  const chs = CHAPTERS.filter(ch => byCh[ch.id]);
  const toReview = chs.filter(ch => byCh[ch.id].ok < byCh[ch.id].n);
  const level = pct >= 80 ? ['good', 'Excellent : vous maîtrisez l’analyse des ratios.'] : pct >= 50 ? ['warn', 'Bonne base. Revoyez les chapitres ci-dessous pour consolider.'] : ['bad', 'Reprenez les chapitres indiqués, puis retentez le test.'];
  app.innerHTML = `
    <p class="small"><a href="#/cours">← Cours</a></p>
    <h1>Résultat du mini-test</h1>
    <div class="tiles">
      ${tile('Score', `${score} / ${total}`, statusChip(level[0], pct + ' %'))}
      ${tile('Meilleur score', progress.tests.best + ' %')}
    </div>
    <div class="insight"><h4>Bilan</h4>${level[1]}</div>
    <div class="card chart-card"><h3>Résultat par chapitre</h3><div class="sub">Part de bonnes réponses (nombre de questions entre parenthèses)</div>
      <div class="chart-box" style="height:${60 + chs.length * 38}px"><canvas id="tr"></canvas></div></div>
    ${toReview.length ? `<div class="card"><h3>À revoir</h3><div class="btn-row">${toReview.map(ch => `<a class="btn" href="#/cours/${ch.id}">${ch.title} →</a>`).join('')}</div></div>` : ''}
    <div class="btn-row"><button class="btn primary" id="again">Refaire un test</button><a class="btn" href="#/cas">Passer aux cas pratiques</a></div>`;
  chart('tr', {
    type: 'bar',
    data: { labels: chs.map(ch => `${ch.title} (${byCh[ch.id].n})`), datasets: [{ label: 'Bonnes réponses', data: chs.map(ch => Math.round(byCh[ch.id].ok / byCh[ch.id].n * 100)), ...barStyle(css('--s1')), maxBarThickness: 22 }] },
    options: {
      indexAxis: 'y', interaction: { mode: 'nearest', intersect: true },
      plugins: { tooltip: { callbacks: { label: ctx => ` ${byCh[chs[ctx.dataIndex].id].ok} / ${byCh[chs[ctx.dataIndex].id].n} bonnes réponses` } } },
      scales: { x: { min: 0, max: 100, grid: { color: css('--grid') }, ticks: { callback: v => v + ' %' } }, y: { grid: { display: false } } },
    },
  });
  document.getElementById('again').onclick = startTest;
}

// ---------- Routage ----------
function render() {
  destroyCharts();
  const [view, arg, sub] = location.hash.replace(/^#\/?/, '').split('/');
  const navView = view === 'test' ? 'cours' : view;
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.view === navView));
  updateAccountUI();
  switch (view) {
    case 'cours': arg ? viewChapter(arg, sub) : viewCoursIndex(); break;
    case 'test': if (testRun && testRun.i >= testRun.qs.length) testRun = null; viewTest(); break;
    case 'compte': viewCompte(); break;
    case 'cas': arg ? viewCase(arg) : viewCases(); break;
    case 'labo': viewLabo(arg); break;
    case 'exercices': viewExercises(); break;
    case 'dossier': viewDossier(); break;
    case 'fiches': viewFiches(); break;
    default: viewHome();
  }
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
render();
if (account) syncNow();
