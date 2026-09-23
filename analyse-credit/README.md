# Atelier Crédit

Une app web pour pratiquer l'analyse financière et l'analyse crédit à partir de cas concrets. Chiffres en millions de FCFA, présentation inspirée du SYSCOHADA.

Elle est 100 % statique (HTML/JS, graphiques Chart.js), sans clé API ni serveur. Une fois le site Netlify déployé, elle est accessible à l'adresse `/analyse-credit/`.

## Modules

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

La progression est enregistrée dans le navigateur (localStorage).
