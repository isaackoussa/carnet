# Atelier Crédit

Une app web pour pratiquer l'analyse financière et l'analyse crédit à partir de cas concrets. Chiffres en millions de FCFA, présentation inspirée du SYSCOHADA.

L'app est en HTML/JS avec des graphiques Chart.js. Une fois le site Netlify déployé, elle est accessible à l'adresse `/analyse-credit/`. Tout fonctionne sans configuration, sauf la connexion par e-mail (voir ci-dessous).

## Compte par e-mail et sauvegarde de la progression (Brevo)

L'utilisateur saisit son adresse e-mail, reçoit un code à 6 chiffres envoyé par Brevo, puis sa progression (cours, cas, exercices, mini-test) est sauvegardée sur son compte. Il la retrouve sur tous ses appareils : les progressions de l'appareil et du compte sont fusionnées sans perte.

À configurer dans Netlify → Site configuration → Environment variables :

| Variable | Valeur |
|---|---|
| `BREVO_API_KEY` | Clé API Brevo (Brevo → SMTP & API → API Keys) |
| `BREVO_SENDER_EMAIL` | Adresse d'expédition **validée dans Brevo** (Brevo → Senders, domains & dedicated IPs) |
| `BREVO_SENDER_NAME` | Facultatif, par défaut « Atelier Crédit » |

Le stockage utilise Netlify Blobs, activé automatiquement sur Netlify, sans configuration. Sécurité :
- les codes sont stockés hachés, valables 10 minutes et à usage unique, avec 5 essais au maximum ;
- un envoi par minute et 5 par heure au maximum par adresse ;
- les sessions durent 90 jours.

Sans ces variables, l'app fonctionne normalement : la progression reste simplement enregistrée dans le navigateur.

Tests de la logique de compte : `npm install` puis `npm test`.

## Modules

- **Mini-test final** : 10 questions tirées au hasard dans tous les chapitres (calcul et interprétation), avec un score par chapitre, les chapitres à revoir et l'historique des scores.
- **Cours** : 8 chapitres (lire les états financiers, SIG, rentabilité et effet de levier, équilibre et liquidité, rotation, structure, capacité de remboursement, interprétation d'un ensemble de ratios). Les 20 ratios ont chacun une fiche : ce qu'il mesure, la formule, un exemple chiffré sur l'entreprise choisie, une grille de lecture, un graphique qui compare les 6 entreprises aux seuils, des repères sectoriels, les leviers d'amélioration et les pièges. Chaque chapitre se termine par un quiz d'interprétation. Visuels interactifs : bilan fonctionnel, cascade des soldes, simulateur d'effet de levier, frise du cycle d'exploitation, matrice des ratios des 6 entreprises.
- **Cas pratiques** (6 entreprises, 3 niveaux) : Boulangerie Le Bon Pain (dossier sain), TransExpress CI (effet ciseaux, BFR qui explose), Agro Négoce du Plateau (entreprise en déclin, CAF négative), SCOOPS Cacao de Soubré (crédit de campagne, besoin saisonnier), Quincaillerie Bamba & Fils (argent sorti vers les associés) et Clinique Sainte-Grâce (excellent dossier, mais projet trop lourd pour la CAF). Chaque cas suit 6 étapes : dossier, activité et rentabilité, équilibre financier, délais, endettement, décision. À chaque étape, vous faites le calcul vous-même, puis vous voyez les graphiques, le commentaire d'analyste, le score de risque et une note de crédit modèle.
- **Simulateurs** : effet ciseaux (croissance, délais, BFR, trésorerie sur 5 ans) et prêt (annuités constantes ou amortissement constant, couverture CAF / échéance, montant maximal empruntable, tableau d'amortissement).
- **Exercices express** : 10 types de calculs avec des chiffres aléatoires, corrigés pas à pas, avec suivi des scores.
- **Analyser un dossier** : saisie des comptes d'une vraie entreprise, puis ratios, score sur 100, diagnostic automatique et graphiques.
- **Fiches méthode** : formules, seuils bancaires, pièges classiques et exemples chiffrés.

## Fichiers

- `engine.js` : calculs (SIG, CAF, FR/BFR/TN, ratios, scoring, tableau d'amortissement)
- `data.js` : les cas pratiques (pour ajouter un cas, ajouter un objet au tableau `CASES`)
- `content.js` : fiches méthode et générateurs d'exercices
- `cours.js` : chapitres de cours, fiches ratios et quiz
- `app.js` : interface et graphiques

- `icons/` et `manifest.webmanifest` : icône de l'app (onglet, écran d'accueil iPhone et Android, installation comme application)
- `../netlify/functions/ac-account.mjs` et `../netlify/lib/ac-account.mjs` : comptes, codes Brevo et sauvegarde de la progression
