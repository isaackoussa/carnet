import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAccountService, brevoSender, normalizeEmail, CODE_TTL_MS, RESEND_DELAY_MS } from '../netlify/lib/ac-account.mjs';

function memoryStore() {
  const m = new Map();
  return {
    async get(k) { return m.has(k) ? structuredClone(m.get(k)) : null; },
    async setJSON(k, v) { m.set(k, structuredClone(v)); },
    async delete(k) { m.delete(k); },
  };
}

function setup() {
  let t = 1_000_000;
  const sent = [];
  const svc = createAccountService({
    codes: memoryStore(), sessions: memoryStore(), progress: memoryStore(),
    sendEmail: async (email, code) => { sent.push({ email, code }); },
    now: () => t,
  });
  return { svc, sent, advance: ms => { t += ms; } };
}

test('normalise et valide les adresses', () => {
  assert.equal(normalizeEmail('  Isaac@Exemple.COM '), 'isaac@exemple.com');
  assert.throws(() => normalizeEmail('pas-un-mail'), /invalide/);
});

test('parcours complet : code, vérification, sauvegarde et lecture', async () => {
  const { svc, sent } = setup();
  await svc.requestCode('Moi@Test.ci');
  assert.equal(sent.length, 1);
  assert.match(sent[0].code, /^\d{6}$/);
  const { token, email } = await svc.verifyCode('moi@test.ci', sent[0].code);
  assert.equal(email, 'moi@test.ci');
  const auth = 'Bearer ' + token;
  assert.equal((await svc.loadProgress(auth)).progress, null);
  await svc.saveProgress(auth, { cases: { a: 1 } });
  assert.deepEqual((await svc.loadProgress(auth)).progress, { cases: { a: 1 } });
});

test('le code est à usage unique', async () => {
  const { svc, sent } = setup();
  await svc.requestCode('a@b.ci');
  await svc.verifyCode('a@b.ci', sent[0].code);
  await assert.rejects(svc.verifyCode('a@b.ci', sent[0].code), /Aucun code/);
});

test('code incorrect, expiré, et nombre d’essais limité', async () => {
  const { svc, sent, advance } = setup();
  await svc.requestCode('a@b.ci');
  const wrong = sent[0].code === '000000' ? '111111' : '000000';
  await assert.rejects(svc.verifyCode('a@b.ci', wrong), /4 essais/);
  for (let i = 0; i < 4; i++) await assert.rejects(svc.verifyCode('a@b.ci', wrong));
  await assert.rejects(svc.verifyCode('a@b.ci', sent[0].code), /Trop d’essais/);
  advance(RESEND_DELAY_MS);
  await svc.requestCode('a@b.ci');
  advance(CODE_TTL_MS + 1);
  await assert.rejects(svc.verifyCode('a@b.ci', sent[1].code), /expiré/);
});

test('limite les envois répétés', async () => {
  const { svc, advance } = setup();
  await svc.requestCode('a@b.ci');
  await assert.rejects(svc.requestCode('a@b.ci'), /Patientez/);
  for (let i = 0; i < 4; i++) { advance(RESEND_DELAY_MS); await svc.requestCode('a@b.ci'); }
  advance(RESEND_DELAY_MS);
  await assert.rejects(svc.requestCode('a@b.ci'), /une heure/);
});

test('refuse un jeton invalide et déconnecte', async () => {
  const { svc, sent } = setup();
  await assert.rejects(svc.loadProgress('Bearer faux'), /Session expirée/);
  await assert.rejects(svc.loadProgress(null), /Non connecté/);
  await svc.requestCode('a@b.ci');
  const { token } = await svc.verifyCode('a@b.ci', sent[0].code);
  await svc.logout('Bearer ' + token);
  await assert.rejects(svc.loadProgress('Bearer ' + token), /Session expirée/);
});

test('la progression est séparée par adresse', async () => {
  const { svc, sent, advance } = setup();
  await svc.requestCode('a@b.ci'); const a = await svc.verifyCode('a@b.ci', sent[0].code);
  advance(1); await svc.requestCode('c@d.ci'); const c = await svc.verifyCode('c@d.ci', sent[1].code);
  await svc.saveProgress('Bearer ' + a.token, { x: 1 });
  assert.equal((await svc.loadProgress('Bearer ' + c.token)).progress, null);
});

test('appel Brevo : en-têtes et contenu', async () => {
  let call;
  const send = brevoSender({ apiKey: 'k', senderEmail: 'no-reply@x.ci', fetchImpl: async (url, opts) => { call = { url, opts }; return { ok: true }; } });
  await send('a@b.ci', '123456');
  assert.equal(call.url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal(call.opts.headers['api-key'], 'k');
  const body = JSON.parse(call.opts.body);
  assert.deepEqual(body.to, [{ email: 'a@b.ci' }]);
  assert.match(body.subject, /123456/);
  await assert.rejects(brevoSender({})('a@b.ci', '1'), /non configuré/);
});
