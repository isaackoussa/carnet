// Fonction Netlify : tuteur IA de Data 365.
// Modes : "explain" (question sur une leçon) et "review" (relecture du code du Labo).
// Nécessite la variable d'environnement ANTHROPIC_API_KEY (jamais dans le code front).

const MODEL = 'claude-sonnet-5-5';

const SYSTEM_BASE = `Tu es le tuteur de Data 365, une application qui apprend l'analyse de données et les statistiques avec Python (pandas, numpy, scipy, statsmodels, matplotlib) et R (base R, tidyverse). Tu réponds toujours en français, de façon claire et pédagogique, à un apprenant débutant ou intermédiaire. Donne des exemples courts dans des blocs de code markdown (\`\`\`python ou \`\`\`r). Quand c'est utile, montre l'équivalent dans les deux langages. Le jeu de données d'entraînement s'appelle etudiants.csv (colonnes : id, sexe, age, filiere, heures_etude, note, reussite ; 2 valeurs manquantes dans heures_etude). Reste concis : 120 à 250 mots environ.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Méthode non autorisée.' });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'ANTHROPIC_API_KEY manquante côté serveur' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'JSON invalide.' }); }

  let system, userText;
  if (body.mode === 'explain') {
    if (!body.question) return json(400, { error: 'Question vide.' });
    system = SYSTEM_BASE + ` L'apprenant est sur la leçon « ${clip(body.lesson, 200)} ». Résumé de la leçon : ${clip(body.theory, 2500)}`;
    userText = clip(body.question, 2000);
  } else if (body.mode === 'review') {
    if (!body.code) return json(400, { error: 'Code vide.' });
    system = SYSTEM_BASE + ` Tu relis le code ${clip(body.lang, 20)} de l'apprenant. Commence par dire ce que fait le code. S'il y a une erreur, explique sa cause simplement et propose une correction. Sinon, propose une amélioration ou une piste d'analyse statistique pour aller plus loin. Ne réécris pas tout si ce n'est pas nécessaire.`;
    userText = `Code :\n${clip(body.code, 6000)}\n\nSortie obtenue :\n${clip(body.output || '(pas encore exécuté)', 3000)}`;
  } else {
    return json(400, { error: 'Mode inconnu.' });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system,
        messages: [{ role: 'user', content: userText }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error('Anthropic API', res.status, t);
      return json(502, { error: `API Anthropic (${res.status})` });
    }
    const data = await res.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return json(200, { message: text });
  } catch (err) {
    console.error(err);
    return json(500, { error: err.message });
  }
};

function clip(s, n) { return String(s || '').slice(0, n); }
function json(statusCode, obj) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
