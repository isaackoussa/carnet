// Fonction Netlify (v2) : comptes Atelier Crédit et synchronisation de la progression.
// Variables d'environnement : BREVO_API_KEY, BREVO_SENDER_EMAIL (expéditeur validé dans Brevo), BREVO_SENDER_NAME (facultatif).
//   POST ?action=request   { email }        → envoie un code à 6 chiffres
//   POST ?action=verify    { email, code }  → { token, email }
//   GET  ?action=progress  (Bearer token)   → { email, progress, updatedAt }
//   PUT  ?action=progress  { progress }     → { ok, updatedAt }
//   POST ?action=logout    (Bearer token)

import { getStore } from '@netlify/blobs';
import { createAccountService, brevoSender, toResponse, HttpError } from '../lib/ac-account.mjs';

export default async (req) => {
  const action = new URL(req.url).searchParams.get('action');
  const makeService = () => createAccountService({
    codes: getStore({ name: 'ac-codes', consistency: 'strong' }),
    sessions: getStore({ name: 'ac-sessions', consistency: 'strong' }),
    progress: getStore({ name: 'ac-progress', consistency: 'strong' }),
    sendEmail: brevoSender({
      apiKey: process.env.BREVO_API_KEY,
      senderEmail: process.env.BREVO_SENDER_EMAIL,
      senderName: process.env.BREVO_SENDER_NAME,
    }),
  });
  const auth = req.headers.get('authorization');
  const body = async () => { try { return await req.json(); } catch { throw new HttpError(400, 'JSON invalide.'); } };

  return toResponse(async () => {
    const service = makeService();
    if (req.method === 'POST' && action === 'request') return service.requestCode((await body()).email);
    if (req.method === 'POST' && action === 'verify') { const b = await body(); return service.verifyCode(b.email, b.code); }
    if (req.method === 'GET' && action === 'progress') return service.loadProgress(auth);
    if (req.method === 'PUT' && action === 'progress') return service.saveProgress(auth, (await body()).progress);
    if (req.method === 'POST' && action === 'logout') return service.logout(auth);
    throw new HttpError(404, 'Action inconnue.');
  });
};
