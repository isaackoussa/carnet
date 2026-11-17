// Data 365 : application d'apprentissage quotidien de R et Python pour la data.
// Progression stockée localement dans le navigateur (localStorage).

(() => {
  'use strict';

  // ───────────────────────── Stockage ─────────────────────────
  const STORE_KEY = 'data365.v1';
  const XP = { lesson: 20, quiz: 5, exo: 15, card: 2, daily: 5 };
  const LEITNER_DAYS = [0, 1, 3, 7, 14, 30];

  const defaultState = () => ({
    start: today(),
    lang: 'both',          // 'py' | 'r' | 'both'
    goal: 30,              // objectif XP par jour
    xpTotal: 0,
    xpByDay: {},
    done: {},              // lessonId -> { date, quiz: n correct, exo: bool }
    cards: {},             // cardId -> { box, due }
    daily: {},             // date -> { correct: bool }
    labCode: { py: null, r: null },
  });

  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { /* stockage indisponible */ }
    return defaultState();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
    refreshTop();
  }

  // ───────────────────────── Dates ─────────────────────────
  function today(d = new Date()) {
    const z = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }
  function addDays(dateStr, n) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return today(d);
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
  }

  // ───────────────────────── Progression ─────────────────────────
  function gainXP(n, label) {
    const t = today();
    S.xpTotal += n;
    S.xpByDay[t] = (S.xpByDay[t] || 0) + n;
    save();
    toast(`+${n} XP${label ? ' · ' + label : ''}`);
  }
  function xpToday() { return S.xpByDay[today()] || 0; }
  function streak() {
    let n = 0;
    let d = today();
    if (!S.xpByDay[d]) d = addDays(d, -1);   // la série tient jusqu'à la fin de la journée
    while (S.xpByDay[d]) { n++; d = addDays(d, -1); }
    return n;
  }
  function bestStreak() {
    const days = Object.keys(S.xpByDay).filter(d => S.xpByDay[d] > 0).sort();
    let best = 0, cur = 0, prev = null;
    for (const d of days) {
      cur = prev && daysBetween(prev, d) === 1 ? cur + 1 : 1;
      best = Math.max(best, cur);
      prev = d;
    }
    return best;
  }
  function programDay() { return Math.min(365, daysBetween(S.start, today()) + 1); }
  function level() { return Math.floor(Math.sqrt(S.xpTotal / 50)) + 1; }
  function nextLesson() { return LESSONS.find(l => !S.done[l.id]) || null; }
  function lessonById(id) { return LESSONS.find(l => l.id === id); }
  function moduleById(id) { return MODULES.find(m => m.id === id); }

  // Cartes de révision (système de Leitner)
  function allCards() {
    return LESSONS.flatMap(l => l.cards.map((c, i) => ({ id: `${l.id}.${i}`, lesson: l.id, front: c[0], back: c[1] })));
  }
  function unlockCards(lesson) {
    lesson.cards.forEach((_, i) => {
      const id = `${lesson.id}.${i}`;
      if (!S.cards[id]) S.cards[id] = { box: 1, due: addDays(today(), 1) };
    });
  }
  function dueCards() {
    const t = today();
    return allCards().filter(c => S.cards[c.id] && S.cards[c.id].due <= t);
  }
  function gradeCard(id, knew) {
    const c = S.cards[id];
    c.box = knew ? Math.min(c.box + 1, LEITNER_DAYS.length - 1) : 1;
    c.due = addDays(today(), LEITNER_DAYS[c.box]);
    save();
  }

  // Défi du jour : une question tirée de façon déterministe selon la date
  function dailyQuestion() {
    const pool = LESSONS.flatMap(l => l.quiz.map((q, i) => ({ ...q, lesson: l.id, key: `${l.id}.${i}` })));
    const seen = new Set(Object.keys(S.done));
    const eligible = pool.filter(q => seen.has(q.lesson));
    const src = eligible.length >= 3 ? eligible : pool.filter(q => q.lesson <= 'l06');
    let h = 0;
    for (const ch of today()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return src[h % src.length];
  }

  // ───────────────────────── Utilitaires UI ─────────────────────────
  const $app = document.getElementById('app');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function refreshTop() {
    document.getElementById('streak-pill').textContent = `🔥 ${streak()}`;
    document.getElementById('xp-pill').textContent = `⭐ ${S.xpTotal}`;
    const n = dueCards().length;
    const badge = document.getElementById('due-badge');
    badge.hidden = n === 0;
    badge.textContent = n;
  }

  // Coloration syntaxique minimale (commentaires, chaînes, nombres, mots-clés)
  const KW = {
    py: 'import|from|as|def|return|for|in|if|elif|else|while|and|or|not|True|False|None|lambda|with|print',
    r: 'function|return|for|in|if|else|while|TRUE|FALSE|NA|NULL|library|repeat|next|break',
  };
  function highlight(code, lang) {
    const re = new RegExp(`(#.*$)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|\\b(\\d+\\.?\\d*L?)\\b|\\b(${KW[lang]})\\b|(<-|\\|>|%>%)`, 'gm');
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'n' : m[4] ? 'k' : 'o';
      out += `<span class="tk-${cls}">${esc(m[0])}</span>`;
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  function langsToShow() { return S.lang === 'both' ? ['py', 'r'] : [S.lang]; }
  const LANG_NAME = { py: 'Python', r: 'R' };

  function codeTabs(lesson, idPrefix) {
    const langs = langsToShow();
    return `
      <div class="codetabs" data-prefix="${idPrefix}">
        <div class="tabbar">
          ${langs.map((l, i) => `<button class="tab ${i === 0 ? 'on' : ''}" data-lang="${l}">${LANG_NAME[l]}</button>`).join('')}
          <span class="spacer"></span>
          <button class="ghost small" data-open-lab>Ouvrir dans le Labo ↗</button>
        </div>
        ${langs.map((l, i) => `<pre class="code ${i === 0 ? '' : 'hidden'}" data-lang="${l}"><code>${highlight(lesson[l], l)}</code></pre>`).join('')}
      </div>`;
  }
  function wireCodeTabs(root, lesson) {
    root.querySelectorAll('.codetabs').forEach(box => {
      box.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
        box.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b === btn));
        box.querySelectorAll('pre.code').forEach(p => p.classList.toggle('hidden', p.dataset.lang !== btn.dataset.lang));
      }));
      const open = box.querySelector('[data-open-lab]');
      open && open.addEventListener('click', () => {
        const lang = box.querySelector('.tab.on').dataset.lang;
        S.labCode[lang] = lesson[lang];
        S.labLang = lang;
        save();
        location.hash = '#/labo';
      });
    });
  }

  function progressRing(value, max, size = 92, label = '') {
    const r = (size - 12) / 2, c = 2 * Math.PI * r;
    const pct = Math.min(1, max ? value / max : 0);
    return `
      <svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
        <text x="50%" y="47%" text-anchor="middle" class="ring-num">${value}</text>
        <text x="50%" y="66%" text-anchor="middle" class="ring-sub">/ ${max} XP</text>
      </svg>`;
  }

  // Console de sortie partagée (labo + exercices)
  function renderOutput(el, result, status) {
    if (status) { el.innerHTML = `<div class="out-status"><span class="spinner"></span>${esc(status)}</div>`; return; }
    const text = result.lines.map(l => `<span class="${l.type === 'err' ? 'out-err' : ''}">${esc(l.text)}</span>`).join('\n');
    el.innerHTML = (text ? `<pre class="out-text">${text}</pre>` : (result.images.length ? '' : '<div class="muted small">(aucune sortie)</div>'))
      + result.images.map(src => `<img class="out-img" src="${src}" alt="Graphique produit par le code">`).join('');
  }

  function editor(id, value) {
    return `<textarea id="${id}" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off">${esc(value)}</textarea>`;
  }
  function wireEditor(ta, onRun) {
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onRun && onRun();
      }
    });
  }

  // Tuteur IA (fonction Netlify, nécessite ANTHROPIC_API_KEY)
  async function askTutor(payload) {
    const res = await fetch('/.netlify/functions/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
    return data.message;
  }
  function tutorBox(context) {
    return `
      <details class="card tutor">
        <summary>🤖 Demander au tuteur</summary>
        <p class="muted small">Pose une question sur ${esc(context)}. Le tuteur répond en français avec des exemples en Python et R.</p>
        <textarea class="tutor-q" rows="2" placeholder="Ex : je ne comprends pas la différence entre variance et écart-type"></textarea>
        <button class="btn small tutor-send">Envoyer</button>
        <div class="tutor-a"></div>
      </details>`;
  }
  function wireTutor(root, getContext) {
    const box = root.querySelector('.tutor');
    if (!box) return;
    box.querySelector('.tutor-send').addEventListener('click', async () => {
      const q = box.querySelector('.tutor-q').value.trim();
      const out = box.querySelector('.tutor-a');
      if (!q) return;
      out.innerHTML = '<div class="out-status"><span class="spinner"></span>Le tuteur réfléchit…</div>';
      try {
        const msg = await askTutor({ mode: 'explain', question: q, ...getContext() });
        out.innerHTML = formatTutor(msg);
      } catch (e) {
        out.innerHTML = `<p class="warn">Tuteur indisponible : ${esc(e.message)}. Sur Netlify, ajoute la variable ANTHROPIC_API_KEY.</p>`;
      }
    });
  }
  function formatTutor(text) {
    // Rendu simple : blocs de code ``` et paragraphes
    const parts = String(text).split(/```(\w*)\n?([\s\S]*?)```/g);
    let html = '';
    for (let i = 0; i < parts.length; i += 3) {
      html += parts[i].split(/\n{2,}/).filter(p => p.trim()).map(p => `<p>${esc(p).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</p>`).join('');
      if (parts[i + 2] !== undefined) {
        const lang = /^r$/i.test(parts[i + 1]) ? 'r' : 'py';
        html += `<pre class="code"><code>${highlight(parts[i + 2].trimEnd(), lang)}</code></pre>`;
      }
    }
    return html;
  }

  // ───────────────────────── Vues ─────────────────────────
  const routes = {
    '': viewHome,
    'parcours': viewPath,
    'lecon': viewLesson,
    'labo': viewLab,
    'revisions': viewReview,
    'profil': viewProfile,
  };

  function router() {
    const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
    const view = routes[name] || viewHome;
    document.querySelectorAll('.bottomnav a').forEach(a => {
      const tab = a.dataset.tab;
      a.classList.toggle('on', tab === (name || 'home') || (name === 'lecon' && tab === 'parcours'));
    });
    view(arg);
    $app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    refreshTop();
  }

  // ── Accueil ──
  function viewHome() {
    const next = nextLesson();
    const doneCount = Object.keys(S.done).length;
    const due = dueCards().length;
    const dq = dailyQuestion();
    const dqState = S.daily[today()];
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const goalHit = xpToday() >= S.goal;

    $app.innerHTML = `
      <section class="hero card">
        <div>
          <p class="eyebrow">Jour ${programDay()} / 365</p>
          <h1>${hello} 👋</h1>
          <p class="muted">${goalHit ? 'Objectif du jour atteint, bravo ! Continue si tu veux gagner plus d\'XP.' : `Encore ${S.goal - xpToday()} XP pour atteindre ton objectif du jour.`}</p>
          <div class="hero-stats">
            <div><b>${streak()}</b><span>jours de série</span></div>
            <div><b>${doneCount}/${LESSONS.length}</b><span>leçons</span></div>
            <div><b>Niv. ${level()}</b><span>${S.xpTotal} XP</span></div>
          </div>
        </div>
        ${progressRing(xpToday(), S.goal, 104, 'Objectif du jour')}
      </section>

      ${next ? `
      <section class="card lesson-cta">
        <p class="eyebrow">${moduleById(next.module).icon} Leçon du jour · ${esc(moduleById(next.module).title)}</p>
        <h2>${esc(next.title)}</h2>
        <p class="muted small">⏱ ${next.minutes} min · théorie, code ${S.lang === 'both' ? 'Python + R' : LANG_NAME[S.lang]}, quiz${next.exo ? ', exercice' : ''}</p>
        <a class="btn" href="#/lecon/${next.id}">Commencer →</a>
      </section>` : `
      <section class="card lesson-cta">
        <p class="eyebrow">🏆 Parcours terminé</p>
        <h2>Tu as fini les ${LESSONS.length} leçons !</h2>
        <p class="muted">Continue chaque jour avec les révisions et le défi du jour, ou refais les exercices dans le Labo pour garder la main.</p>
        <a class="btn" href="#/labo">Ouvrir le Labo</a>
      </section>`}

      <div class="grid2">
        <a class="card tile" href="#/revisions">
          <span class="tile-icon">🃏</span>
          <b>${due} carte${due > 1 ? 's' : ''} à réviser</b>
          <span class="muted small">${due ? 'Répétition espacée' : 'Rien à réviser aujourd\'hui'}</span>
        </a>
        <a class="card tile" href="#/labo">
          <span class="tile-icon">⌨️</span>
          <b>Labo de code</b>
          <span class="muted small">Python et R dans le navigateur</span>
        </a>
      </div>

      <section class="card daily" id="daily">
        <p class="eyebrow">⚡ Défi du jour</p>
        <h3>${esc(dq.q)}</h3>
        <div class="options">
          ${dq.options.map((o, i) => `<button class="opt" data-i="${i}" ${dqState ? 'disabled' : ''}>${esc(o)}</button>`).join('')}
        </div>
        <p class="feedback">${dqState ? (dqState.correct ? '✅ Réussi aujourd\'hui. Reviens demain pour un nouveau défi.' : '❌ Raté aujourd\'hui. ' + esc(dq.explain)) : ''}</p>
      </section>
    `;

    const daily = document.getElementById('daily');
    if (dqState) markOptions(daily, dq.answer, null);
    daily.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => {
      const i = +btn.dataset.i;
      const ok = i === dq.answer;
      S.daily[today()] = { correct: ok };
      markOptions(daily, dq.answer, i);
      daily.querySelector('.feedback').innerHTML = (ok ? '✅ Exact ! ' : '❌ Pas tout à fait. ') + esc(dq.explain);
      if (ok) gainXP(XP.daily, 'défi du jour'); else save();
    }));
  }

  function markOptions(root, answer, chosen) {
    root.querySelectorAll('.opt').forEach(b => {
      const i = +b.dataset.i;
      b.disabled = true;
      if (i === answer) b.classList.add('good');
      else if (i === chosen) b.classList.add('bad');
    });
  }

  // ── Parcours ──
  function viewPath() {
    const next = nextLesson();
    $app.innerHTML = `
      <h1 class="page-title">Parcours</h1>
      <p class="muted">${LESSONS.length} leçons en ${MODULES.length} modules, des bases du code jusqu'aux modèles statistiques. Une leçon par jour, puis des révisions et des défis pour le reste de l'année.</p>
      ${MODULES.map(m => {
        const ls = LESSONS.filter(l => l.module === m.id);
        const done = ls.filter(l => S.done[l.id]).length;
        return `
        <section class="card module">
          <header class="module-head">
            <span class="module-icon">${m.icon}</span>
            <div><h2>${esc(m.title)}</h2><p class="muted small">${esc(m.desc)} · ${done}/${ls.length}</p></div>
          </header>
          <div class="bar"><i style="width:${(done / ls.length) * 100}%"></i></div>
          <ol class="lesson-list">
            ${ls.map(l => {
              const st = S.done[l.id] ? 'done' : (next && next.id === l.id ? 'next' : '');
              return `<li class="${st}"><a href="#/lecon/${l.id}">
                <span class="dot">${S.done[l.id] ? '✓' : LESSONS.indexOf(l) + 1}</span>
                <span class="lt">${esc(l.title)}</span>
                <span class="muted small">${l.minutes} min</span></a></li>`;
            }).join('')}
          </ol>
        </section>`;
      }).join('')}
    `;
  }

  // ── Leçon (étapes : théorie → quiz → exercice → bilan) ──
  function viewLesson(id) {
    const lesson = lessonById(id);
    if (!lesson) { location.hash = '#/parcours'; return; }
    const mod = moduleById(lesson.module);
    const steps = ['theory', ...lesson.quiz.map((_, i) => 'q' + i), ...(lesson.exo ? ['exo'] : []), 'end'];
    const st = { i: 0, quizOk: 0, exoOk: false, answered: {} };

    function render() {
      const step = steps[st.i];
      const pct = (st.i / (steps.length - 1)) * 100;
      let body = '';
      if (step === 'theory') body = stepTheory();
      else if (step.startsWith('q')) body = stepQuiz(+step.slice(1));
      else if (step === 'exo') body = stepExo();
      else body = stepEnd();

      $app.innerHTML = `
        <div class="lesson-top">
          <a href="#/parcours" class="ghost small">✕</a>
          <div class="bar grow"><i style="width:${pct}%"></i></div>
          <span class="muted small">${st.i + 1}/${steps.length}</span>
        </div>
        <p class="eyebrow">${mod.icon} ${esc(mod.title)} · Leçon ${LESSONS.indexOf(lesson) + 1}</p>
        ${body}`;
      wire(step);
      window.scrollTo(0, 0);
    }

    function stepTheory() {
      return `
        <h1 class="page-title">${esc(lesson.title)}</h1>
        <article class="card theory">${lesson.theory}</article>
        <h3>En code</h3>
        ${codeTabs(lesson, 'ex')}
        ${tutorBox('cette leçon')}
        <div class="actions"><button class="btn" data-next>Passer au quiz →</button></div>`;
    }
    function stepQuiz(k) {
      const q = lesson.quiz[k];
      return `
        <h2>Quiz · question ${k + 1}/${lesson.quiz.length}</h2>
        <section class="card quiz">
          <h3>${esc(q.q)}</h3>
          <div class="options">${q.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>
          <p class="feedback"></p>
        </section>
        <div class="actions"><button class="btn" data-next disabled>Continuer →</button></div>`;
    }
    function stepExo() {
      const langs = langsToShow();
      return `
        <h2>Exercice</h2>
        <section class="card exo">
          <p>${esc(lesson.exo.prompt)}</p>
          <p class="muted small">Le fichier <code>etudiants.csv</code> est disponible. Ton code doit <strong>afficher</strong> le résultat (avec <code>print()</code>). Ctrl/⌘ + Entrée pour exécuter.</p>
          <div class="tabbar">
            ${langs.map((l, i) => `<button class="tab ${i === 0 ? 'on' : ''}" data-lang="${l}">${LANG_NAME[l]}</button>`).join('')}
          </div>
          ${editor('exo-code', lesson.exo[langs[0]].starter)}
          <div class="row">
            <button class="btn" id="exo-run">▶ Exécuter et vérifier</button>
            <button class="ghost" id="exo-sol">Voir la solution</button>
          </div>
          <div id="exo-out" class="output"></div>
          <p class="feedback" id="exo-fb"></p>
        </section>
        <div class="actions"><button class="ghost" data-next>${st.exoOk ? 'Continuer →' : 'Passer l\'exercice →'}</button></div>`;
    }
    function stepEnd() {
      const first = st.firstTime;
      return `
        <section class="card end">
          <div class="big">🎉</div>
          <h1>Leçon terminée !</h1>
          <p>Quiz : <b>${st.quizOk}/${lesson.quiz.length}</b>${lesson.exo ? ` · Exercice : <b>${st.exoOk ? 'réussi' : 'passé'}</b>` : ''}</p>
          ${first ? `<p class="muted">${lesson.cards.length} carte${lesson.cards.length > 1 ? 's' : ''} ajoutée${lesson.cards.length > 1 ? 's' : ''} à tes révisions (première révision demain).</p>` : '<p class="muted">Leçon déjà validée : tes points de quiz et d\'exercice sont comptés, pas le bonus de leçon.</p>'}
          <h3>À retenir</h3>
          <ul class="takeaways">${lesson.cards.map(c => `<li><b>${esc(c[0])}</b><br>${esc(c[1])}</li>`).join('')}</ul>
          <div class="row center">
            ${nextAfter() ? `<a class="btn" href="#/lecon/${nextAfter().id}">Leçon suivante →</a>` : ''}
            <a class="ghost" href="#/">Accueil</a>
          </div>
        </section>`;
    }
    function nextAfter() {
      const i = LESSONS.indexOf(lesson);
      return LESSONS[i + 1] || null;
    }

    function wire(step) {
      const nextBtn = $app.querySelector('[data-next]');
      nextBtn && nextBtn.addEventListener('click', () => { st.i++; if (steps[st.i] === 'end') finish(); render(); });

      if (step === 'theory') {
        wireCodeTabs($app, lesson);
        wireTutor($app, () => ({ lesson: lesson.title, theory: lesson.theory.replace(/<[^>]+>/g, ' ').slice(0, 2500) }));
      }
      if (step.startsWith('q')) {
        const k = +step.slice(1), q = lesson.quiz[k];
        const box = $app.querySelector('.quiz');
        box.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
          const i = +b.dataset.i, ok = i === q.answer;
          markOptions(box, q.answer, i);
          box.querySelector('.feedback').innerHTML = (ok ? '✅ Exact ! ' : '❌ ') + esc(q.explain);
          if (ok && !st.answered[k]) { st.quizOk++; gainXP(XP.quiz); }
          st.answered[k] = true;
          nextBtn.disabled = false;
        }));
      }
      if (step === 'exo') wireExo();
    }

    function wireExo() {
      let lang = langsToShow()[0];
      const ta = $app.querySelector('#exo-code');
      const out = $app.querySelector('#exo-out');
      const fb = $app.querySelector('#exo-fb');
      const drafts = {};
      $app.querySelectorAll('.exo .tab').forEach(btn => btn.addEventListener('click', () => {
        drafts[lang] = ta.value;
        lang = btn.dataset.lang;
        $app.querySelectorAll('.exo .tab').forEach(b => b.classList.toggle('on', b === btn));
        ta.value = drafts[lang] ?? lesson.exo[lang].starter;
        out.innerHTML = ''; fb.textContent = '';
      }));
      const run = async () => {
        const btn = $app.querySelector('#exo-run');
        btn.disabled = true;
        fb.textContent = '';
        try {
          const res = await Runtimes.run(lang, ta.value, s => renderOutput(out, null, s));
          renderOutput(out, res);
          const stdout = res.lines.filter(l => l.type === 'out').map(l => l.text).join('\n');
          if (outputMatches(stdout, lesson.exo[lang].expect)) {
            fb.innerHTML = '✅ Bravo, c\'est le bon résultat !';
            fb.className = 'feedback ok';
            if (!st.exoOk) { st.exoOk = true; gainXP(XP.exo, 'exercice'); }
            const nb = $app.querySelector('[data-next]');
            nb.textContent = 'Continuer →'; nb.className = 'btn';
          } else {
            fb.innerHTML = `Pas encore. Résultat attendu : <code>${esc(lesson.exo[lang].expect)}</code>`;
            fb.className = 'feedback ko';
          }
        } catch (e) {
          renderOutput(out, { lines: [{ type: 'err', text: 'Le moteur n\'a pas pu démarrer : ' + e.message + '\nVérifie ta connexion Internet.' }], images: [] });
        } finally { btn.disabled = false; }
      };
      wireEditor(ta, run);
      $app.querySelector('#exo-run').addEventListener('click', run);
      $app.querySelector('#exo-sol').addEventListener('click', () => { ta.value = lesson.exo[lang].solution; });
      // Préchauffe le moteur pendant que l'apprenant lit la consigne
      (lang === 'r' ? Runtimes.initR() : Runtimes.initPython()).catch(() => {});
    }

    function finish() {
      const first = !S.done[lesson.id];
      st.firstTime = first;
      const prev = S.done[lesson.id] || {};
      S.done[lesson.id] = { date: prev.date || today(), quiz: Math.max(st.quizOk, prev.quiz || 0), exo: st.exoOk || !!prev.exo };
      if (first) { unlockCards(lesson); gainXP(XP.lesson, 'leçon terminée'); }
      else save();
    }

    render();
  }

  // ── Labo ──
  function viewLab() {
    let lang = S.labLang || (S.lang === 'r' ? 'r' : 'py');
    const starters = {
      py: 'import pandas as pd\n\ndf = pd.read_csv("etudiants.csv")\nprint(df.head())\nprint(df.describe().round(2))\n',
      r: 'df <- read.csv("etudiants.csv")\nhead(df)\nsummary(df)\n',
    };
    $app.innerHTML = `
      <h1 class="page-title">Labo</h1>
      <p class="muted">Écris et exécute du code Python ou R ici, sans rien installer. Le fichier <code>etudiants.csv</code> (40 étudiants : sexe, age, filiere, heures_etude, note, reussite) est déjà chargé. Les graphiques s'affichent sous la console.</p>
      <section class="card lab">
        <div class="tabbar">
          <button class="tab ${lang === 'py' ? 'on' : ''}" data-lang="py">Python</button>
          <button class="tab ${lang === 'r' ? 'on' : ''}" data-lang="r">R</button>
          <span class="spacer"></span>
          <button class="ghost small" id="lab-reset">Réinitialiser</button>
        </div>
        ${editor('lab-code', S.labCode[lang] || starters[lang])}
        <div class="row">
          <button class="btn" id="lab-run">▶ Exécuter</button>
          <span class="muted small">Ctrl/⌘ + Entrée</span>
          <span class="spacer"></span>
          <button class="ghost small" id="lab-review">🤖 Corriger mon code</button>
        </div>
        <div id="lab-out" class="output"></div>
        <div id="lab-tutor"></div>
      </section>
      <details class="card">
        <summary>📄 Aperçu de etudiants.csv</summary>
        <div id="csv-preview" class="table-wrap muted small">Chargement…</div>
      </details>
      <details class="card">
        <summary>ℹ️ Bon à savoir</summary>
        <ul class="small">
          <li>Le premier lancement télécharge le moteur (Python ≈ 10 Mo, R ≈ 20 Mo). Ensuite, les exécutions sont rapides.</li>
          <li>Python : numpy, pandas, scipy, statsmodels, matplotlib et scikit-learn se chargent automatiquement quand tu les importes.</li>
          <li>R : les packages appelés avec <code>library()</code> (dplyr, ggplot2…) sont installés automatiquement depuis le dépôt webR.</li>
          <li>Ton code est sauvegardé dans ce navigateur.</li>
        </ul>
      </details>
    `;
    const ta = $app.querySelector('#lab-code');
    const out = $app.querySelector('#lab-out');
    let lastResult = null;

    ta.addEventListener('input', () => { S.labCode[lang] = ta.value; save(); });
    $app.querySelectorAll('.lab .tab').forEach(btn => btn.addEventListener('click', () => {
      lang = btn.dataset.lang;
      S.labLang = lang; save();
      $app.querySelectorAll('.lab .tab').forEach(b => b.classList.toggle('on', b === btn));
      ta.value = S.labCode[lang] || starters[lang];
      out.innerHTML = '';
    }));
    $app.querySelector('#lab-reset').addEventListener('click', () => {
      ta.value = starters[lang]; S.labCode[lang] = null; save(); out.innerHTML = '';
    });
    const run = async () => {
      const btn = $app.querySelector('#lab-run');
      btn.disabled = true;
      try {
        lastResult = await Runtimes.run(lang, ta.value, s => renderOutput(out, null, s));
        renderOutput(out, lastResult);
      } catch (e) {
        renderOutput(out, { lines: [{ type: 'err', text: 'Le moteur n\'a pas pu démarrer : ' + e.message + '\nVérifie ta connexion Internet.' }], images: [] });
      } finally { btn.disabled = false; }
    };
    wireEditor(ta, run);
    $app.querySelector('#lab-run').addEventListener('click', run);
    $app.querySelector('#lab-review').addEventListener('click', async () => {
      const box = $app.querySelector('#lab-tutor');
      box.innerHTML = '<div class="out-status"><span class="spinner"></span>Le tuteur relit ton code…</div>';
      try {
        const output = lastResult ? lastResult.lines.map(l => l.text).join('\n').slice(0, 3000) : '';
        const msg = await askTutor({ mode: 'review', lang: LANG_NAME[lang], code: ta.value, output });
        box.innerHTML = `<div class="tutor-a">${formatTutor(msg)}</div>`;
      } catch (e) {
        box.innerHTML = `<p class="warn">Tuteur indisponible : ${esc(e.message)}. Sur Netlify, ajoute la variable ANTHROPIC_API_KEY.</p>`;
      }
    });

    fetch('data/etudiants.csv').then(r => r.text()).then(txt => {
      const rows = txt.trim().split('\n').map(l => l.split(','));
      $app.querySelector('#csv-preview').innerHTML = `<table><thead><tr>${rows[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.slice(1, 11).map(r => `<tr>${r.map(c => `<td>${c === '' ? '<i>NA</i>' : esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
        <p>… ${rows.length - 1} lignes au total.</p>`;
    }).catch(() => {});
  }

  // ── Révisions ──
  function viewReview() {
    const queue = dueCards();
    const total = queue.length;
    const unlocked = Object.keys(S.cards).length;
    let flipped = false;

    function render() {
      if (!queue.length) {
        const nextDue = Object.values(S.cards).map(c => c.due).sort()[0];
        $app.innerHTML = `
          <h1 class="page-title">Révisions</h1>
          <section class="card end">
            <div class="big">${unlocked ? '✅' : '🃏'}</div>
            <h2>${unlocked ? (total ? 'Révisions terminées pour aujourd\'hui !' : 'Rien à réviser aujourd\'hui') : 'Pas encore de cartes'}</h2>
            <p class="muted">${unlocked
              ? `${unlocked} carte${unlocked > 1 ? 's' : ''} dans ton paquet.${nextDue ? ` Prochaine révision : ${nextDue === today() ? 'aujourd\'hui' : new Date(nextDue + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.` : ''}`
              : 'Chaque leçon terminée ajoute ses cartes « À retenir » à ton paquet de révision.'}</p>
            <p class="muted small">Répétition espacée : une carte réussie revient après 1, 3, 7, 14 puis 30 jours. Une carte ratée revient le lendemain.</p>
            <a class="btn" href="#/">Retour à l'accueil</a>
          </section>
          ${unlocked ? boxesSummary() : ''}`;
        return;
      }
      const c = queue[0];
      const l = lessonById(c.lesson);
      $app.innerHTML = `
        <h1 class="page-title">Révisions</h1>
        <div class="lesson-top"><div class="bar grow"><i style="width:${((total - queue.length) / total) * 100}%"></i></div><span class="muted small">${total - queue.length + 1}/${total}</span></div>
        <button class="card flash ${flipped ? 'flipped' : ''}" id="flash" aria-live="polite">
          <span class="eyebrow">${esc(l.title)}</span>
          <span class="flash-front">${esc(c.front)}</span>
          ${flipped ? `<span class="flash-back">${esc(c.back)}</span>` : '<span class="muted small">Touche pour voir la réponse</span>'}
        </button>
        ${flipped ? `
        <div class="row center">
          <button class="btn bad-btn" id="again">↺ À revoir</button>
          <button class="btn good-btn" id="knew">✓ Je savais</button>
        </div>` : ''}`;
      $app.querySelector('#flash').addEventListener('click', () => { if (!flipped) { flipped = true; render(); } });
      if (flipped) {
        $app.querySelector('#again').addEventListener('click', () => grade(false));
        $app.querySelector('#knew').addEventListener('click', () => grade(true));
      }
    }
    function grade(knew) {
      const c = queue.shift();
      gradeCard(c.id, knew);
      if (knew) gainXP(XP.card);
      flipped = false;
      render();
    }
    function boxesSummary() {
      const counts = [1, 2, 3, 4, 5].map(b => Object.values(S.cards).filter(c => c.box === b).length);
      const labels = ['Nouvelles', '3 jours', '1 semaine', '2 semaines', 'Maîtrisées'];
      const max = Math.max(1, ...counts);
      return `<section class="card"><h3>Ton paquet</h3>
        <div class="boxes">${counts.map((n, i) => `<div class="boxcol"><div class="boxbar"><i style="height:${(n / max) * 100}%"></i></div><b>${n}</b><span class="muted small">${labels[i]}</span></div>`).join('')}</div></section>`;
    }
    render();
  }

  // ── Profil ──
  function viewProfile() {
    const doneCount = Object.keys(S.done).length;
    const quizTotal = LESSONS.reduce((a, l) => a + l.quiz.length, 0);
    const quizOk = Object.values(S.done).reduce((a, d) => a + (d.quiz || 0), 0);
    const exoOk = Object.values(S.done).filter(d => d.exo).length;
    const mastered = Object.values(S.cards).filter(c => c.box >= 4).length;

    $app.innerHTML = `
      <h1 class="page-title">Profil</h1>
      <div class="statgrid">
        <div class="card stat"><b>${S.xpTotal}</b><span>XP · niveau ${level()}</span></div>
        <div class="card stat"><b>${streak()}</b><span>série actuelle (record ${bestStreak()})</span></div>
        <div class="card stat"><b>${doneCount}/${LESSONS.length}</b><span>leçons terminées</span></div>
        <div class="card stat"><b>${quizOk}/${quizTotal}</b><span>bonnes réponses aux quiz</span></div>
        <div class="card stat"><b>${exoOk}</b><span>exercices de code réussis</span></div>
        <div class="card stat"><b>${mastered}</b><span>cartes bien ancrées</span></div>
      </div>

      <section class="card">
        <h3>Ton année en data</h3>
        <p class="muted small">Chaque case est un jour. Plus elle est foncée, plus tu as gagné d'XP ce jour-là.</p>
        ${heatmap()}
      </section>

      <section class="card settings">
        <h3>Réglages</h3>
        <label>Langage des exemples
          <select id="set-lang">
            <option value="both" ${S.lang === 'both' ? 'selected' : ''}>Python et R</option>
            <option value="py" ${S.lang === 'py' ? 'selected' : ''}>Python uniquement</option>
            <option value="r" ${S.lang === 'r' ? 'selected' : ''}>R uniquement</option>
          </select>
        </label>
        <label>Objectif quotidien
          <select id="set-goal">
            ${[[10, 'Détente : 10 XP'], [30, 'Régulier : 30 XP'], [50, 'Sérieux : 50 XP'], [80, 'Intensif : 80 XP']].map(([v, t]) => `<option value="${v}" ${S.goal === v ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </label>
        <div class="row">
          <button class="ghost small" id="export">Exporter ma progression</button>
          <label class="ghost small file">Importer<input type="file" id="import" accept="application/json" hidden></label>
          <span class="spacer"></span>
          <button class="ghost small danger" id="reset">Tout réinitialiser</button>
        </div>
      </section>
    `;
    const hm = $app.querySelector('.heatmap-wrap');
    hm.scrollLeft = hm.scrollWidth;
    $app.querySelector('#set-lang').addEventListener('change', e => { S.lang = e.target.value; save(); toast('Préférence enregistrée'); });
    $app.querySelector('#set-goal').addEventListener('change', e => { S.goal = +e.target.value; save(); toast('Objectif mis à jour'); });
    $app.querySelector('#reset').addEventListener('click', () => {
      if (confirm('Effacer toute ta progression ? Cette action est définitive.')) { S = defaultState(); save(); router(); }
    });
    $app.querySelector('#export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `data365-progression-${today()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $app.querySelector('#import').addEventListener('change', async e => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (typeof data.xpTotal !== 'number') throw new Error('format');
        S = Object.assign(defaultState(), data); save(); toast('Progression importée'); router();
      } catch (err) { toast('Fichier invalide'); }
    });
  }

  function heatmap() {
    const end = today();
    const endDate = new Date(end + 'T12:00:00');
    const offset = (endDate.getDay() + 6) % 7;            // lundi = 0
    const startStr = addDays(end, -(52 * 7 + offset));
    const max = Math.max(S.goal, ...Object.values(S.xpByDay));
    let cells = '';
    for (let i = 0; i <= 52 * 7 + offset; i++) {
      const d = addDays(startStr, i);
      const xp = S.xpByDay[d] || 0;
      const lvl = xp === 0 ? 0 : xp < max * 0.25 ? 1 : xp < max * 0.5 ? 2 : xp < max * 0.75 ? 3 : 4;
      cells += `<i class="h${lvl}" title="${d} : ${xp} XP"></i>`;
    }
    return `<div class="heatmap-wrap"><div class="heatmap">${cells}</div></div>
      <div class="legend small muted">Moins <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> Plus</div>`;
  }

  // ───────────────────────── Démarrage ─────────────────────────
  window.addEventListener('hashchange', router);
  router();
})();
