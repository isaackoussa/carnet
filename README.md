# Data 365

Une app web pour apprendre **R et Python appliqués à l'analyse de données et aux statistiques**, une petite leçon par jour, sur le modèle des apps d'apprentissage des langues : objectif quotidien, série de jours, XP, défi du jour et révisions espacées.

## Fonctionnalités

- **Parcours** : 37 leçons en 8 modules, chacune avec la théorie, le même exemple en Python **et** en R, un quiz et un exercice de code.
  1. Premiers pas : variables, vecteurs, fonctions, boucles et vectorisation
  2. Manipuler des données : data frames, import CSV, filtres, tri, groupby, valeurs manquantes, jointures, pivot
  3. Statistiques descriptives : tendance centrale, dispersion, quantiles, fréquences, corrélation
  4. Visualiser : histogramme, nuage de points, barres, boxplots, choisir son graphique
  5. Probabilités : loi normale, binomiale, échantillonnage et TCL
  6. Inférence : intervalle de confiance, p-value, test t, khi-deux, ANOVA, tests non paramétriques
  7. Modéliser : régression linéaire simple et multiple, logistique, train/test et métriques
  8. Pratique pro : reproductibilité et projet guidé complet
- **Exercices vérifiés automatiquement** : le code s'exécute dans le navigateur ([Pyodide](https://pyodide.org) pour Python, [webR](https://docs.r-wasm.org/webr/) pour R) et sa sortie est comparée au résultat attendu.
- **Labo** : éditeur Python / R libre avec le jeu de données `etudiants.csv` préchargé, affichage des graphiques et installation automatique des packages (`pandas`, `scipy`, `statsmodels`, `matplotlib`… / `dplyr`, `ggplot2`…).
- **Révisions** : cartes « À retenir » de chaque leçon, en répétition espacée (système de Leitner : 1, 3, 7, 14 puis 30 jours).
- **Accueil** : jour X / 365, objectif XP du jour, série, leçon du jour, défi du jour.
- **Profil** : statistiques, calendrier d'activité sur un an, choix du langage (Python, R ou les deux), objectif quotidien, export et import de la progression.
- **Tuteur IA** (facultatif) : pose une question sur une leçon ou fais relire ton code du Labo.

La progression est enregistrée dans le navigateur (localStorage). Utilise Profil → Exporter pour la sauvegarder ou la transférer sur un autre appareil.

## Déploiement sur Netlify

1. Connecte ce repo à Netlify (New site from Git). Il n'y a pas de build : `netlify.toml` publie la racine.
2. Facultatif, pour le tuteur IA : dans Site settings → Environment variables, ajoute `ANTHROPIC_API_KEY`.
3. Déploie.

Sans clé API, tout fonctionne sauf le tuteur IA (leçons, quiz, exercices, labo, révisions).

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Coquille de l'app et navigation |
| `style.css` | Styles (clair / sombre, mobile d'abord) |
| `curriculum.js` | Modules, leçons, quiz, exercices et cartes |
| `runtimes.js` | Exécution de Python (Pyodide) et R (webR) dans le navigateur |
| `app.js` | Vues, progression, XP, séries, révisions |
| `data/etudiants.csv` | Jeu de données d'entraînement (40 étudiants, 2 valeurs manquantes) |
| `netlify/functions/tutor.js` | Tuteur IA (API Anthropic) |

## Ajouter une leçon

Ajoute un objet dans le tableau `LESSONS` de `curriculum.js` :

```js
{
  id: 'l38', module: 'm7', title: 'Mon sujet', minutes: 8,
  theory: `<p>…</p>`,
  py: `print("exemple Python")`,
  r: `print("exemple R")`,
  quiz: [{ q: '…', options: ['a', 'b'], answer: 0, explain: '…' }],
  exo: {
    prompt: 'Consigne',
    py: { starter: '', solution: 'print(1)', expect: '1' },
    r:  { starter: '', solution: 'print(1)', expect: '[1] 1' },
  },   // ou exo: null
  cards: [['Recto', 'Verso']],
}
```

`expect` est la sortie attendue (une ou plusieurs lignes consécutives). Les espaces sont normalisés à la comparaison.
