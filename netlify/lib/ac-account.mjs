// Atelier Crédit : comptes par e-mail (code de vérification envoyé via Brevo) et sauvegarde de la progression.
// La logique est indépendante de Netlify : les « stores » suivent l'API de Netlify Blobs (get / setJSON / delete),
// ce qui permet de la tester avec un stockage en mémoire.

import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export const CODE_TTL_MS = 10 * 60 * 1000;          // un code est valable 10 minutes
export const RESEND_DELAY_MS = 60 * 1000;           // un envoi par minute au plus
export const MAX_SENDS_PER_HOUR = 5;
export const MAX_ATTEMPTS = 5;                      // essais de code avant d'en redemander un
export const SESSION_TTL_MS = 90 * 24 * 3600 * 1000; // session de 90 jours
export const MAX_PROGRESS_BYTES = 100 * 1024;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const sha256 = s => createHash('sha256').update(s).digest('hex');

export function normalizeEmail(raw) {
  const email = String(raw || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new HttpError(400, 'Adresse e-mail invalide.');
  return email;
}

export function createAccountService({ codes, sessions, progress, sendEmail, now = () => Date.now() }) {
  const emailKey = email => sha256('email:' + email);

  async function requestCode(rawEmail) {
    const email = normalizeEmail(rawEmail);
    const key = emailKey(email);
    const t = now();
    const prev = (await codes.get(key, { type: 'json' })) || {};
    const recent = (prev.sends || []).filter(s => t - s < 3600 * 1000);
    if (recent.length && t - recent[recent.length - 1] < RESEND_DELAY_MS) {
      throw new HttpError(429, 'Un code vient d’être envoyé. Patientez une minute avant d’en demander un autre.');
    }
    if (recent.length >= MAX_SENDS_PER_HOUR) {
      throw new HttpError(429, 'Trop de demandes pour cette adresse. Réessayez dans une heure.');
    }
    const code = String(randomInt(0, 1000000)).padStart(6, '0');
    const salt = randomBytes(16).toString('hex');
    await codes.setJSON(key, { hash: sha256(salt + ':' + code), salt, expires: t + CODE_TTL_MS, attempts: 0, sends: [...recent, t] });
    await sendEmail(email, code);
    return { ok: true };
  }

  async function verifyCode(rawEmail, rawCode) {
    const email = normalizeEmail(rawEmail);
    const code = String(rawCode || '').replace(/\s/g, '');
    if (!/^\d{6}$/.test(code)) throw new HttpError(400, 'Le code contient 6 chiffres.');
    const key = emailKey(email);
    const entry = await codes.get(key, { type: 'json' });
    if (!entry || !entry.hash) throw new HttpError(400, 'Aucun code en cours pour cette adresse. Demandez un nouveau code.');
    if (now() > entry.expires) throw new HttpError(400, 'Ce code a expiré. Demandez-en un nouveau.');
    if (entry.attempts >= MAX_ATTEMPTS) throw new HttpError(429, 'Trop d’essais. Demandez un nouveau code.');
    const expected = Buffer.from(entry.hash, 'hex');
    const given = Buffer.from(sha256(entry.salt + ':' + code), 'hex');
    if (!timingSafeEqual(expected, given)) {
      await codes.setJSON(key, { ...entry, attempts: entry.attempts + 1 });
      const left = MAX_ATTEMPTS - entry.attempts - 1;
      throw new HttpError(400, left > 0 ? `Code incorrect. Il vous reste ${left} essai${left > 1 ? 's' : ''}.` : 'Code incorrect. Demandez un nouveau code.');
    }
    // Le code est à usage unique : on l'efface mais on garde l'historique d'envoi pour la limite horaire.
    await codes.setJSON(key, { sends: entry.sends || [] });
    const token = randomBytes(32).toString('base64url');
    await sessions.setJSON(sha256('session:' + token), { email, created: now(), expires: now() + SESSION_TTL_MS });
    return { token, email };
  }

  async function authenticate(authorization) {
    const token = String(authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) throw new HttpError(401, 'Non connecté.');
    const key = sha256('session:' + token);
    const s = await sessions.get(key, { type: 'json' });
    if (!s || now() > s.expires) throw new HttpError(401, 'Session expirée. Reconnectez-vous.');
    return { email: s.email, sessionKey: key };
  }

  async function loadProgress(authorization) {
    const { email } = await authenticate(authorization);
    const saved = await progress.get(emailKey(email), { type: 'json' });
    return { email, progress: saved ? saved.data : null, updatedAt: saved ? saved.updatedAt : null };
  }

  async function saveProgress(authorization, data) {
    const { email } = await authenticate(authorization);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'Progression invalide.');
    if (JSON.stringify(data).length > MAX_PROGRESS_BYTES) throw new HttpError(413, 'Progression trop volumineuse.');
    const updatedAt = now();
    await progress.setJSON(emailKey(email), { data, updatedAt });
    return { ok: true, updatedAt };
  }

  async function logout(authorization) {
    const { sessionKey } = await authenticate(authorization);
    await sessions.delete(sessionKey);
    return { ok: true };
  }

  return { requestCode, verifyCode, loadProgress, saveProgress, logout };
}

// Envoi du code via l'API transactionnelle de Brevo.
export function brevoSender({ apiKey, senderEmail, senderName = 'Atelier Crédit', fetchImpl = fetch }) {
  return async (email, code) => {
    if (!apiKey || !senderEmail) throw new HttpError(500, 'Envoi d’e-mail non configuré (BREVO_API_KEY et BREVO_SENDER_EMAIL).');
    const res = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        subject: `${code} est votre code Atelier Crédit`,
        htmlContent: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0b0b0b">
          <h2 style="margin:0 0 12px">Atelier Crédit</h2>
          <p>Voici votre code de vérification :</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
          <p style="color:#52514e">Il est valable 10 minutes. Si vous n’avez pas demandé ce code, ignorez simplement cet e-mail.</p>
        </div>`,
        textContent: `Votre code de vérification Atelier Crédit : ${code}\nIl est valable 10 minutes. Si vous n’avez pas demandé ce code, ignorez cet e-mail.`,
      }),
    });
    if (!res.ok) {
      console.error('Brevo', res.status, await res.text());
      throw new HttpError(502, 'L’e-mail n’a pas pu être envoyé. Réessayez dans quelques instants.');
    }
  };
}

// Adapte le service en réponses HTTP (fonctions Netlify v2 : Request → Response).
export async function toResponse(fn) {
  try {
    return Response.json(await fn());
  } catch (err) {
    if (err instanceof HttpError) return Response.json({ error: err.message }, { status: err.status });
    console.error(err);
    return Response.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
