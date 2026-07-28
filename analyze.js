// Fonction Netlify : appelle l'API Anthropic pour extraire des passages,
// générer un quiz, ou animer une réflexion sur un livre.
// Nécessite la variable d'environnement ANTHROPIC_API_KEY (jamais dans le code front).

const MODEL = 'claude-sonnet-5';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY manquante côté serveur.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON invalide.' }) };
  }

  const { mode } = body;

  try {
    if (mode === 'extract') {
      return await handleExtract(body, apiKey);
    } else if (mode === 'byTitle') {
      return await handleByTitle(body, apiKey);
    } else if (mode === 'quiz') {
      return await handleQuiz(body, apiKey);
    } else if (mode === 'debate') {
      return await handleDebate(body, apiKey);
    }
    return { statusCode: 400, body: JSON.stringify({ error: 'mode inconnu.' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

async function callClaude(apiKey, system, userText, maxTokens = 1500) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userText }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${t}`);
  }
  const data = await res.json();
  const textBlock = data.content.find(b => b.type === 'text');
  return textBlock ? textBlock.text : '';
}

function parseJsonLoose(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

async function handleExtract({ title, content }, apiKey) {
  const system = `Tu aides à extraire les passages et idées les plus utiles d'un livre pour un lecteur francophone. Réponds UNIQUEMENT en JSON valide, sans aucun texte autour, au format exact: {"extracts": ["...", "...", ...]}. Fournis entre 6 et 12 extraits courts (1 à 3 phrases chacun), en français, qui capturent les idées ou passages les plus importants et actionnables du texte fourni. Reformule si besoin pour rester clair et concis, sans jamais recopier de longs passages mot pour mot.`;
  const userText = `Titre du livre : ${title}\n\nContenu (peut être partiel) :\n${content}`;
  const raw = await callClaude(apiKey, system, userText, 2000);
  const parsed = parseJsonLoose(raw);
  return { statusCode: 200, body: JSON.stringify(parsed) };
}

async function handleByTitle({ title, author }, apiKey) {
  const system = `Tu aides un lecteur francophone à retenir l'essentiel d'un livre qu'il possède déjà, à partir de ta connaissance générale de cet ouvrage (il n'a pas fourni le texte). Réponds UNIQUEMENT en JSON valide, format exact: {"extracts": ["...", "...", ...]}. Fournis entre 6 et 10 points clés courts (1 à 3 phrases chacun), en français, qui résument fidèlement les idées, arguments ou étapes les plus importantes du livre. Ce sont des résumés dans tes propres mots, jamais des citations ou passages copiés mot pour mot. Si tu ne connais pas cet ouvrage avec certitude, indique-le honnêtement dans un des points plutôt que d'inventer du contenu.`;
  const userText = `Titre : ${title}${author ? `\nAuteur : ${author}` : ''}`;
  const raw = await callClaude(apiKey, system, userText, 1500);
  const parsed = parseJsonLoose(raw);
  return { statusCode: 200, body: JSON.stringify(parsed) };
}

async function handleQuiz({ title, extracts }, apiKey) {
  const system = `Tu crées un quiz à choix multiple en français pour tester la mémorisation d'un lecteur sur les extraits d'un livre. Réponds UNIQUEMENT en JSON valide, format exact: {"questions":[{"question":"...","options":["...","...","...","..."],"correct":0}]}. "correct" est l'index (0 à 3) de la bonne réponse dans "options". Crée entre 4 et 6 questions, basées uniquement sur les extraits fournis.`;
  const userText = `Titre : ${title}\n\nExtraits :\n${extracts.map((e,i)=>`${i+1}. ${e}`).join('\n')}`;
  const raw = await callClaude(apiKey, system, userText, 2000);
  const parsed = parseJsonLoose(raw);
  return { statusCode: 200, body: JSON.stringify(parsed) };
}

async function handleDebate({ title, extracts, history }, apiKey) {
  const system = `Tu es un partenaire de réflexion qui aide un lecteur à approfondir sa compréhension d'un livre par le débat. Base-toi uniquement sur les extraits fournis. Pose une question ouverte et stimulante (s'il n'y a pas encore d'historique), ou réagis brièvement au point de vue du lecteur puis relance avec une question de suivi qui challenge ou approfondit sa pensée. Réponds UNIQUEMENT en JSON valide, format exact: {"message":"..."}. Reste concis (3-5 phrases maximum), en français, ton direct et stimulant sans être condescendant.`;
  const histText = (history || []).map(h => `${h.role === 'user' ? 'Lecteur' : 'Toi'}: ${h.text}`).join('\n');
  const userText = `Titre : ${title}\n\nExtraits :\n${extracts.map((e,i)=>`${i+1}. ${e}`).join('\n')}\n\nHistorique de la conversation :\n${histText || '(aucun, c\'est le début)'}`;
  const raw = await callClaude(apiKey, system, userText, 800);
  const parsed = parseJsonLoose(raw);
  return { statusCode: 200, body: JSON.stringify(parsed) };
}
