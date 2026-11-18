// Programme Data 365 : leçons de data analyse et statistiques en Python et R.
// Chaque leçon : théorie, exemples Python + R, quiz, exercice de code vérifié, cartes de révision.
// Le jeu de données "etudiants.csv" (40 étudiants) est disponible dans le labo des deux langages.

const MODULES = [
  { id: 'm1', title: 'Premiers pas', icon: '🌱', desc: 'Variables, vecteurs, fonctions, boucles' },
  { id: 'm2', title: 'Manipuler des données', icon: '🧮', desc: 'Data frames avec pandas et R' },
  { id: 'm3', title: 'Statistiques descriptives', icon: '📏', desc: 'Résumer une distribution' },
  { id: 'm4', title: 'Visualiser', icon: '📊', desc: 'Les graphiques essentiels' },
  { id: 'm5', title: 'Probabilités', icon: '🎲', desc: 'Lois et échantillonnage' },
  { id: 'm6', title: 'Inférence', icon: '🔬', desc: 'Intervalles et tests statistiques' },
  { id: 'm7', title: 'Modéliser', icon: '📈', desc: 'Régressions et évaluation' },
  { id: 'm8', title: 'Pratique pro', icon: '🧑‍💻', desc: 'Reproductibilité et projet complet' },
];

const LESSONS = [
  // ───────────────────────── MODULE 1 ─────────────────────────
  {
    id: 'l01', module: 'm1', title: 'R et Python : deux outils, un métier', minutes: 5,
    theory: `
<p><strong>Python</strong> est un langage généraliste : on l'utilise pour le web, l'automatisation et, grâce à <code>pandas</code>, <code>numpy</code>, <code>scipy</code> et <code>statsmodels</code>, pour l'analyse de données. <strong>R</strong> a été conçu par des statisticiens : les tests, les modèles et les graphiques sont intégrés dès l'installation.</p>
<p>Le travail d'un analyste suit presque toujours le même cycle : <em>importer → nettoyer → explorer → visualiser → modéliser → communiquer</em>. Les deux langages couvrent tout le cycle, donc les apprendre ensemble aide à comprendre les concepts plutôt que la syntaxe.</p>
<p>Les environnements courants : <strong>RStudio</strong> ou <strong>Positron</strong> pour R, <strong>Jupyter</strong> ou <strong>VS Code</strong> pour Python. Ici, le <em>Labo</em> exécute les deux directement dans ton navigateur.</p>`,
    py: `# Python : afficher un message et faire un calcul
print("Bonjour la data !")
print(2 + 3 * 4)`,
    r: `# R : afficher un message et faire un calcul
print("Bonjour la data !")
2 + 3 * 4`,
    quiz: [
      { q: 'Quel langage a été conçu à l\'origine par des statisticiens ?', options: ['Python', 'R', 'JavaScript', 'SQL'], answer: 1, explain: 'R descend du langage S, créé aux laboratoires Bell pour la statistique.' },
      { q: 'Quelle bibliothèque Python sert à manipuler des tableaux de données ?', options: ['pandas', 'flask', 'requests', 'pygame'], answer: 0, explain: 'pandas fournit le DataFrame, l\'équivalent du data.frame de R.' },
      { q: 'Quelle étape vient en général juste après l\'import des données ?', options: ['Modéliser', 'Nettoyer', 'Publier', 'Tester une hypothèse'], answer: 1, explain: 'On nettoie d\'abord (types, valeurs manquantes, doublons) avant d\'explorer.' },
    ],
    exo: {
      prompt: 'Affiche le résultat de (10 + 5) / 3.',
      py: { starter: '# écris ton code ici\n', solution: 'print((10 + 5) / 3)', expect: '5.0' },
      r: { starter: '# écris ton code ici\n', solution: 'print((10 + 5) / 3)', expect: '[1] 5' },
    },
    cards: [
      ['Les 6 étapes du cycle d\'analyse', 'Importer → nettoyer → explorer → visualiser → modéliser → communiquer'],
      ['Équivalent Python du data.frame de R', 'pandas.DataFrame'],
    ],
  },
  {
    id: 'l02', module: 'm1', title: 'Variables et types', minutes: 7,
    theory: `
<p>Une <strong>variable</strong> associe un nom à une valeur. En Python on écrit <code>x = 5</code>. En R on écrit plutôt <code>x &lt;- 5</code> (le <code>=</code> marche aussi, mais <code>&lt;-</code> est la convention).</p>
<p>Les types de base se correspondent :</p>
<table><tr><th>Concept</th><th>Python</th><th>R</th></tr>
<tr><td>Nombre décimal</td><td><code>float</code></td><td><code>numeric</code> (double)</td></tr>
<tr><td>Entier</td><td><code>int</code></td><td><code>integer</code> (<code>5L</code>)</td></tr>
<tr><td>Texte</td><td><code>str</code></td><td><code>character</code></td></tr>
<tr><td>Booléen</td><td><code>True</code> / <code>False</code></td><td><code>TRUE</code> / <code>FALSE</code></td></tr>
<tr><td>Valeur manquante</td><td><code>None</code>, <code>np.nan</code></td><td><code>NA</code></td></tr></table>
<p>Pour connaître le type : <code>type(x)</code> en Python, <code>class(x)</code> en R. En statistique, le type compte : une note est <em>quantitative</em>, une filière est <em>qualitative</em>. Le mauvais type donne un mauvais calcul.</p>`,
    py: `age = 21
nom = "Awa"
boursier = True
print(type(age), type(nom), type(boursier))
print(nom, "a", age, "ans")`,
    r: `age <- 21
nom <- "Awa"
boursier <- TRUE
class(age); class(nom); class(boursier)
cat(nom, "a", age, "ans\\n")`,
    quiz: [
      { q: 'Comment écrit-on « vrai » en R ?', options: ['True', 'true', 'TRUE', '1L'], answer: 2, explain: 'R utilise TRUE et FALSE en majuscules (T et F existent mais sont à éviter).' },
      { q: 'Quelle fonction R donne le type d\'un objet ?', options: ['type()', 'class()', 'kind()', 'dtype()'], answer: 1, explain: 'class() en R, type() en Python.' },
      { q: 'Que vaut class(5) en R ?', options: ['"integer"', '"numeric"', '"double"', '"number"'], answer: 1, explain: 'Sans le suffixe L, 5 est un numeric (double). 5L est un integer.' },
    ],
    exo: {
      prompt: 'Crée une variable prix = 1500 et une variable qte = 3, puis affiche le total prix × qte.',
      py: { starter: 'prix = \nqte = \n', solution: 'prix = 1500\nqte = 3\nprint(prix * qte)', expect: '4500' },
      r: { starter: 'prix <- \nqte <- \n', solution: 'prix <- 1500\nqte <- 3\nprint(prix * qte)', expect: '[1] 4500' },
    },
    cards: [
      ['Opérateur d\'assignation conventionnel en R', '<-  (ex : x <- 5)'],
      ['Valeur manquante en R / en pandas', 'NA en R ; NaN (np.nan) ou None en pandas'],
      ['Obtenir le type : Python vs R', 'type(x) vs class(x)'],
    ],
  },
  {
    id: 'l03', module: 'm1', title: 'Vecteurs et listes', minutes: 8,
    theory: `
<p>En R, l'objet de base est le <strong>vecteur</strong> : <code>c(12, 15, 9)</code>. Toutes les opérations sont <em>vectorisées</em> : <code>notes + 1</code> ajoute 1 à chaque élément.</p>
<p>En Python, la <code>list</code> native n'est pas vectorisée (<code>[1,2] * 2</code> donne <code>[1,2,1,2]</code>). Pour calculer, on utilise un <strong>array numpy</strong> : <code>np.array([12, 15, 9]) + 1</code>.</p>
<p>⚠️ <strong>Indexation</strong> : Python commence à <strong>0</strong>, R commence à <strong>1</strong>. <code>notes[0]</code> en Python et <code>notes[1]</code> en R désignent le premier élément. En R, un indice négatif <em>retire</em> l'élément (<code>notes[-1]</code>) ; en Python, il compte depuis la fin (<code>notes[-1]</code> = dernier).</p>`,
    py: `import numpy as np
notes = np.array([12, 15, 9, 17])
print(notes[0])        # premier élément
print(notes + 1)       # vectorisé
print(notes[notes > 10])  # filtre logique
print(len(notes), notes.sum())`,
    r: `notes <- c(12, 15, 9, 17)
notes[1]          # premier élément
notes + 1         # vectorisé
notes[notes > 10] # filtre logique
length(notes); sum(notes)`,
    quiz: [
      { q: 'En R, que renvoie c(4, 8, 6)[2] ?', options: ['4', '8', '6', 'Une erreur'], answer: 1, explain: 'R indexe à partir de 1 : le 2e élément est 8.' },
      { q: 'En Python, que donne [1, 2] * 2 ?', options: ['[2, 4]', '[1, 2, 1, 2]', 'Erreur', '6'], answer: 1, explain: 'Une liste Python se répète. Avec np.array on obtiendrait [2, 4].' },
      { q: 'En R, que fait x[-1] ?', options: ['Renvoie le dernier élément', 'Retire le premier élément', 'Erreur', 'Renvoie NA'], answer: 1, explain: 'Un indice négatif en R exclut l\'élément.' },
    ],
    exo: {
      prompt: 'Avec les notes 8, 14, 11, 16, 7, affiche uniquement les notes supérieures ou égales à 10.',
      py: { starter: 'import numpy as np\nnotes = np.array([8, 14, 11, 16, 7])\n', solution: 'import numpy as np\nnotes = np.array([8, 14, 11, 16, 7])\nprint(notes[notes >= 10])', expect: '[14 11 16]' },
      r: { starter: 'notes <- c(8, 14, 11, 16, 7)\n', solution: 'notes <- c(8, 14, 11, 16, 7)\nprint(notes[notes >= 10])', expect: '[1] 14 11 16' },
    },
    cards: [
      ['Premier indice : Python vs R', 'Python : 0 ; R : 1'],
      ['Créer un vecteur en R', 'c(1, 2, 3)'],
      ['Que fait x[-1] en Python ? et en R ?', 'Python : dernier élément. R : tout sauf le premier.'],
    ],
  },
  {
    id: 'l04', module: 'm1', title: 'Écrire des fonctions', minutes: 8,
    theory: `
<p>Une fonction regroupe un calcul réutilisable. Python utilise <code>def</code> et l'indentation ; R affecte une <code>function</code> à un nom et utilise des accolades.</p>
<p>En R, la dernière expression évaluée est renvoyée automatiquement ; <code>return()</code> est facultatif. En Python, sans <code>return</code>, la fonction renvoie <code>None</code>.</p>
<p>Les deux langages acceptent des <strong>arguments par défaut</strong> (<code>def f(x, n=2)</code> / <code>function(x, n = 2)</code>) et des arguments nommés à l'appel.</p>`,
    py: `def ecart_moyenne(x, arrondi=2):
    moyenne = sum(x) / len(x)
    return [round(v - moyenne, arrondi) for v in x]

print(ecart_moyenne([10, 12, 17]))`,
    r: `ecart_moyenne <- function(x, arrondi = 2) {
  moyenne <- mean(x)
  round(x - moyenne, arrondi)   # renvoyé automatiquement
}
ecart_moyenne(c(10, 12, 17))`,
    quiz: [
      { q: 'Que renvoie une fonction Python sans return ?', options: ['0', 'La dernière ligne', 'None', 'Une erreur'], answer: 2, explain: 'Contrairement à R, Python renvoie None sans return explicite.' },
      { q: 'Quel mot-clé définit une fonction en Python ?', options: ['function', 'def', 'fun', 'lambda seulement'], answer: 1, explain: 'def nom(args): puis un bloc indenté.' },
    ],
    exo: {
      prompt: 'Écris une fonction carre(x) qui renvoie x au carré, puis affiche carre(7).',
      py: { starter: 'def carre(x):\n    \n', solution: 'def carre(x):\n    return x ** 2\nprint(carre(7))', expect: '49' },
      r: { starter: 'carre <- function(x) {\n  \n}\n', solution: 'carre <- function(x) {\n  x^2\n}\nprint(carre(7))', expect: '[1] 49' },
    },
    cards: [
      ['Puissance : Python vs R', 'x ** 2 en Python ; x^2 en R'],
      ['Valeur renvoyée par une fonction R sans return()', 'La dernière expression évaluée'],
    ],
  },
  {
    id: 'l05', module: 'm1', title: 'Conditions, boucles et vectorisation', minutes: 9,
    theory: `
<p>Les conditions : <code>if / elif / else</code> en Python, <code>if / else if / else</code> en R. Les boucles <code>for</code> existent dans les deux langages.</p>
<p>Mais en analyse de données, on évite les boucles quand on peut : on <strong>vectorise</strong>. Pour classer une colonne entière, on utilise <code>np.where()</code> en Python et <code>ifelse()</code> en R. C'est plus court, plus lisible et beaucoup plus rapide.</p>
<p>Règle pratique : si tu écris une boucle sur les lignes d'un tableau, il existe probablement une fonction vectorisée qui fait la même chose.</p>`,
    py: `import numpy as np
notes = np.array([8, 14, 11, 16, 7])

# boucle classique
for n in notes:
    if n >= 10:
        print(n, "admis")
    else:
        print(n, "ajourné")

# version vectorisée
print(np.where(notes >= 10, "admis", "ajourné"))`,
    r: `notes <- c(8, 14, 11, 16, 7)

for (n in notes) {
  if (n >= 10) cat(n, "admis\\n") else cat(n, "ajourné\\n")
}

# version vectorisée
ifelse(notes >= 10, "admis", "ajourné")`,
    quiz: [
      { q: 'Quel est l\'équivalent R de np.where(cond, a, b) ?', options: ['which()', 'ifelse()', 'switch()', 'case_when() uniquement'], answer: 1, explain: 'ifelse(cond, a, b) est vectorisé. dplyr::case_when() gère plusieurs conditions.' },
      { q: 'Pourquoi préférer la vectorisation aux boucles ?', options: ['Elle est obligatoire', 'Plus rapide et plus lisible', 'Les boucles n\'existent pas en R', 'Elle évite les NA'], answer: 1, explain: 'Le calcul est délégué à du code compilé et le code reste court.' },
    ],
    exo: {
      prompt: 'Compte combien de valeurs de c(3, 12, 18, 9, 10) sont supérieures ou égales à 10 (sans boucle).',
      py: { starter: 'import numpy as np\nx = np.array([3, 12, 18, 9, 10])\n', solution: 'import numpy as np\nx = np.array([3, 12, 18, 9, 10])\nprint((x >= 10).sum())', expect: '3' },
      r: { starter: 'x <- c(3, 12, 18, 9, 10)\n', solution: 'x <- c(3, 12, 18, 9, 10)\nprint(sum(x >= 10))', expect: '[1] 3' },
    },
    cards: [
      ['Astuce : compter les TRUE', 'sum(x >= 10) en R ; (x >= 10).sum() en numpy : TRUE vaut 1'],
      ['Condition vectorisée : Python / R', 'np.where(cond, a, b) / ifelse(cond, a, b)'],
    ],
  },

  // ───────────────────────── MODULE 2 ─────────────────────────
  {
    id: 'l06', module: 'm2', title: 'Le data frame', minutes: 8,
    theory: `
<p>Le <strong>data frame</strong> est un tableau où chaque <em>colonne</em> est une variable (un type par colonne) et chaque <em>ligne</em> une observation. C'est le format « tidy » qu'attendent la plupart des fonctions statistiques.</p>
<p>Python : <code>pd.DataFrame({...})</code>. R : <code>data.frame(...)</code> ou <code>tibble(...)</code> (tidyverse).</p>
<p>Les premiers réflexes pour inspecter un tableau :</p>
<table><tr><th>But</th><th>pandas</th><th>R</th></tr>
<tr><td>Dimensions</td><td><code>df.shape</code></td><td><code>dim(df)</code></td></tr>
<tr><td>Premières lignes</td><td><code>df.head()</code></td><td><code>head(df)</code></td></tr>
<tr><td>Structure, types</td><td><code>df.info()</code></td><td><code>str(df)</code></td></tr>
<tr><td>Résumé statistique</td><td><code>df.describe()</code></td><td><code>summary(df)</code></td></tr>
<tr><td>Une colonne</td><td><code>df["note"]</code></td><td><code>df$note</code></td></tr></table>`,
    py: `import pandas as pd
df = pd.DataFrame({
    "nom": ["Awa", "Koffi", "Mariam"],
    "age": [21, 23, 20],
    "note": [14.5, 11.0, 16.0],
})
print(df.shape)
print(df["note"].mean())
print(df)`,
    r: `df <- data.frame(
  nom  = c("Awa", "Koffi", "Mariam"),
  age  = c(21, 23, 20),
  note = c(14.5, 11.0, 16.0)
)
dim(df)
mean(df$note)
df`,
    quiz: [
      { q: 'Dans un tableau « tidy », une ligne représente…', options: ['Une variable', 'Une observation', 'Un type', 'Un fichier'], answer: 1, explain: 'Une ligne = une observation, une colonne = une variable, une cellule = une valeur.' },
      { q: 'Équivalent R de df.describe() ?', options: ['str(df)', 'summary(df)', 'head(df)', 'describe(df) en base R'], answer: 1, explain: 'summary() donne min, quartiles, moyenne et max par colonne.' },
      { q: 'Comment accéder à la colonne age en R ?', options: ['df.age', 'df["age"] uniquement', 'df$age', 'df->age'], answer: 2, explain: 'df$age (ou df[["age"]]).' },
    ],
    exo: {
      prompt: 'Crée un tableau avec une colonne x = 2, 4, 6, 8 et affiche la somme de x.',
      py: { starter: 'import pandas as pd\n', solution: 'import pandas as pd\ndf = pd.DataFrame({"x": [2, 4, 6, 8]})\nprint(df["x"].sum())', expect: '20' },
      r: { starter: '', solution: 'df <- data.frame(x = c(2, 4, 6, 8))\nprint(sum(df$x))', expect: '[1] 20' },
    },
    cards: [
      ['Inspecter la structure : pandas / R', 'df.info() / str(df)'],
      ['Dimensions : pandas / R', 'df.shape / dim(df)'],
      ['Les 3 règles du tidy data', '1 variable = 1 colonne ; 1 observation = 1 ligne ; 1 valeur = 1 cellule'],
    ],
  },
  {
    id: 'l07', module: 'm2', title: 'Importer un fichier CSV', minutes: 7,
    theory: `
<p>Le CSV est le format d'échange le plus courant. Python : <code>pd.read_csv("fichier.csv")</code>. R : <code>read.csv("fichier.csv")</code> en base, ou <code>readr::read_csv()</code> (plus rapide, renvoie un tibble).</p>
<p>Points de vigilance avec les fichiers « à la française » : séparateur <code>;</code> et virgule décimale. Utilise <code>sep=";", decimal=","</code> en pandas et <code>read.csv2()</code> en R.</p>
<p>Pour Excel : <code>pd.read_excel()</code> et <code>readxl::read_excel()</code>. Vérifie toujours les types juste après l'import.</p>
<p>👉 Dans le Labo, le fichier <code>etudiants.csv</code> est déjà disponible : 40 étudiants avec <code>sexe, age, filiere, heures_etude, note, reussite</code>.</p>`,
    py: `import pandas as pd
df = pd.read_csv("etudiants.csv")
print(df.shape)
print(df.dtypes)
print(df.head())`,
    r: `df <- read.csv("etudiants.csv")
dim(df)
str(df)
head(df)`,
    quiz: [
      { q: 'Quelle fonction R lit un CSV avec « ; » et virgule décimale ?', options: ['read.csv()', 'read.csv2()', 'read.table2()', 'readLines()'], answer: 1, explain: 'read.csv2() utilise sep=";" et dec="," par défaut.' },
      { q: 'En pandas, quel argument gère la virgule décimale ?', options: ['dec=","', 'decimal=","', 'comma=True', 'locale="fr"'], answer: 1, explain: 'pd.read_csv(..., sep=";", decimal=",").' },
    ],
    exo: {
      prompt: 'Importe etudiants.csv et affiche le nombre de lignes.',
      py: { starter: 'import pandas as pd\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(len(df))', expect: '40' },
      r: { starter: '', solution: 'df <- read.csv("etudiants.csv")\nprint(nrow(df))', expect: '[1] 40' },
    },
    cards: [
      ['Lire un CSV : pandas / R base / tidyverse', 'pd.read_csv() / read.csv() / readr::read_csv()'],
      ['Nombre de lignes : pandas / R', 'len(df) ou df.shape[0] / nrow(df)'],
    ],
  },
  {
    id: 'l08', module: 'm2', title: 'Sélectionner et filtrer', minutes: 9,
    theory: `
<p><strong>Sélectionner</strong> = garder certaines colonnes. <strong>Filtrer</strong> = garder certaines lignes selon une condition.</p>
<table><tr><th>Action</th><th>pandas</th><th>R base</th><th>dplyr</th></tr>
<tr><td>Colonnes</td><td><code>df[["a","b"]]</code></td><td><code>df[, c("a","b")]</code></td><td><code>select(df, a, b)</code></td></tr>
<tr><td>Lignes</td><td><code>df[df.note &gt; 10]</code></td><td><code>df[df$note &gt; 10, ]</code></td><td><code>filter(df, note &gt; 10)</code></td></tr>
<tr><td>ET / OU</td><td><code>&amp;</code> / <code>|</code> (avec parenthèses)</td><td><code>&amp;</code> / <code>|</code></td><td>virgule = ET</td></tr></table>
<p>En pandas, <code>df.query("note &gt; 10 and filiere == 'Info'")</code> est une alternative lisible. Attention : en pandas, chaque condition combinée doit être entre parenthèses : <code>(df.a &gt; 1) &amp; (df.b == "x")</code>.</p>`,
    py: `import pandas as pd
df = pd.read_csv("etudiants.csv")
info = df[(df["filiere"] == "Info") & (df["note"] >= 10)]
print(info[["id", "note"]])
print(df.query("age > 24")[["id", "age"]])`,
    r: `df <- read.csv("etudiants.csv")
info <- df[df$filiere == "Info" & df$note >= 10, ]
info[, c("id", "note")]
subset(df, age > 24, select = c(id, age))
# avec dplyr : df |> filter(filiere == "Info", note >= 10) |> select(id, note)`,
    quiz: [
      { q: 'Pourquoi des parenthèses dans (df.a > 1) & (df.b == "x") en pandas ?', options: ['Style uniquement', '& est prioritaire sur > et ==', 'Pour convertir en booléen', 'Elles sont facultatives'], answer: 1, explain: '& a une priorité plus forte que les comparaisons : sans parenthèses, l\'expression est mal évaluée.' },
      { q: 'Dans df[cond, ] en R, que désigne la partie après la virgule ?', options: ['Les lignes', 'Les colonnes', 'Le type', 'Rien'], answer: 1, explain: 'df[lignes, colonnes]. Vide = toutes les colonnes.' },
    ],
    exo: {
      prompt: 'Combien d\'étudiantes (sexe == "F") ont une note supérieure ou égale à 12 ?',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(len(df[(df["sexe"] == "F") & (df["note"] >= 12)]))', expect: '3' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(nrow(df[df$sexe == "F" & df$note >= 12, ]))', expect: '[1] 3' },
    },
    cards: [
      ['Filtrer des lignes : pandas / dplyr', 'df[df.x > 1] ou df.query("x > 1") / filter(df, x > 1)'],
      ['Syntaxe d\'indexation d\'un data.frame R', 'df[lignes, colonnes]'],
    ],
  },
  {
    id: 'l09', module: 'm2', title: 'Trier et créer des colonnes', minutes: 8,
    theory: `
<p><strong>Trier</strong> : <code>df.sort_values("note", ascending=False)</code> en pandas ; <code>df[order(-df$note), ]</code> en R base ; <code>arrange(df, desc(note))</code> avec dplyr.</p>
<p><strong>Créer une colonne</strong> : <code>df["note_100"] = df["note"] * 5</code> en pandas ; <code>df$note_100 &lt;- df$note * 5</code> en R ; <code>mutate(df, note_100 = note * 5)</code> avec dplyr.</p>
<p>Le <strong>pipe</strong> enchaîne les étapes de gauche à droite : <code>|&gt;</code> (ou <code>%&gt;%</code>) en R. En pandas, on chaîne les méthodes avec des points : <code>df.assign(...).sort_values(...).head()</code>.</p>`,
    py: `import pandas as pd
df = pd.read_csv("etudiants.csv")
top = (df.assign(note_100=df["note"] * 5)
         .sort_values("note", ascending=False)
         .head(3))
print(top[["id", "note", "note_100"]])`,
    r: `df <- read.csv("etudiants.csv")
df$note_100 <- df$note * 5
top <- head(df[order(-df$note), c("id", "note", "note_100")], 3)
top
# dplyr : df |> mutate(note_100 = note * 5) |> arrange(desc(note)) |> head(3)`,
    quiz: [
      { q: 'Équivalent dplyr de df.assign() ?', options: ['summarise()', 'mutate()', 'transmute() uniquement', 'select()'], answer: 1, explain: 'mutate() ajoute ou modifie des colonnes.' },
      { q: 'Comment trier en ordre décroissant en R base ?', options: ['order(df$x, rev)', 'df[order(-df$x), ]', 'sort(df)', 'df[desc(x), ]'], answer: 1, explain: 'order() avec un signe moins (ou decreasing = TRUE).' },
    ],
    exo: {
      prompt: 'Affiche la note la plus haute du fichier etudiants.csv (une seule valeur).',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(df.sort_values("note", ascending=False)["note"].iloc[0])', expect: '18.1' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(df[order(-df$note), "note"][1])', expect: '[1] 18.1' },
    },
    cards: [
      ['Le pipe natif de R (depuis R 4.1)', '|>  (ex : df |> head())'],
      ['Créer une colonne : pandas / dplyr', 'df["y"] = ... ou df.assign(y=...) / mutate(df, y = ...)'],
    ],
  },
  {
    id: 'l10', module: 'm2', title: 'Grouper et résumer', minutes: 10,
    theory: `
<p>Le schéma <strong>split → apply → combine</strong> est au cœur de l'analyse : on découpe les données par groupe, on calcule un résumé, on rassemble les résultats.</p>
<p>pandas : <code>df.groupby("filiere")["note"].mean()</code>, ou plusieurs résumés avec <code>.agg(moy=("note","mean"), n=("note","size"))</code>.</p>
<p>R base : <code>aggregate(note ~ filiere, data = df, FUN = mean)</code> ou <code>tapply(df$note, df$filiere, mean)</code>. dplyr : <code>df |&gt; group_by(filiere) |&gt; summarise(moy = mean(note), n = n())</code>.</p>
<p>Toujours afficher l'<strong>effectif</strong> de chaque groupe : une moyenne calculée sur 3 personnes ne vaut pas une moyenne calculée sur 300.</p>`,
    py: `import pandas as pd
df = pd.read_csv("etudiants.csv")
res = df.groupby("filiere").agg(
    moy=("note", "mean"),
    n=("note", "size"),
).round(2)
print(res)`,
    r: `df <- read.csv("etudiants.csv")
aggregate(note ~ filiere, data = df, FUN = function(x) round(mean(x), 2))
table(df$filiere)   # effectifs
# dplyr : df |> group_by(filiere) |> summarise(moy = mean(note), n = n())`,
    quiz: [
      { q: 'Le schéma derrière groupby / group_by s\'appelle…', options: ['map-reduce', 'split-apply-combine', 'divide-and-conquer', 'pivot'], answer: 1, explain: 'Expression popularisée par Hadley Wickham.' },
      { q: 'Quelle fonction dplyr compte les lignes d\'un groupe ?', options: ['count_rows()', 'length()', 'n()', 'size()'], answer: 2, explain: 'n() à l\'intérieur de summarise() ou mutate().' },
    ],
    exo: {
      prompt: 'Affiche la note moyenne par sexe, arrondie à 2 décimales.',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(df.groupby("sexe")["note"].mean().round(2))', expect: 'F 9.61\nH 10.65' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(tapply(df$note, df$sexe, mean), 2))', expect: 'F H\n9.61 10.65' },
    },
    cards: [
      ['Moyenne par groupe : pandas', 'df.groupby("g")["x"].mean()'],
      ['Moyenne par groupe : dplyr', 'df |> group_by(g) |> summarise(m = mean(x))'],
      ['Moyenne par groupe : R base (2 façons)', 'tapply(df$x, df$g, mean) ; aggregate(x ~ g, df, mean)'],
    ],
  },
  {
    id: 'l11', module: 'm2', title: 'Valeurs manquantes', minutes: 9,
    theory: `
<p>Les données réelles ont des trous. Avant tout calcul, il faut les <strong>repérer</strong> : <code>df.isna().sum()</code> en pandas, <code>colSums(is.na(df))</code> en R.</p>
<p>⚠️ Différence importante : pandas <strong>ignore</strong> les NaN par défaut (<code>df.x.mean()</code> marche), alors que R <strong>propage</strong> les NA : <code>mean(x)</code> renvoie <code>NA</code> s'il y en a un. Il faut écrire <code>mean(x, na.rm = TRUE)</code>.</p>
<p>Stratégies : supprimer les lignes (<code>dropna()</code> / <code>na.omit()</code>), imputer par la médiane (<code>fillna()</code>), ou modéliser l'absence. Supprimer est simple mais peut <em>biaiser</em> l'analyse si les données ne manquent pas au hasard.</p>
<p>👉 Dans <code>etudiants.csv</code>, deux étudiants n'ont pas renseigné <code>heures_etude</code>.</p>`,
    py: `import pandas as pd
df = pd.read_csv("etudiants.csv")
print(df.isna().sum())
print(df["heures_etude"].mean())          # NaN ignorés
med = df["heures_etude"].median()
df["heures_imp"] = df["heures_etude"].fillna(med)
print(df["heures_imp"].isna().sum())`,
    r: `df <- read.csv("etudiants.csv")
colSums(is.na(df))
mean(df$heures_etude)                 # NA !
mean(df$heures_etude, na.rm = TRUE)
df$heures_imp <- ifelse(is.na(df$heures_etude),
                        median(df$heures_etude, na.rm = TRUE),
                        df$heures_etude)
sum(is.na(df$heures_imp))`,
    quiz: [
      { q: 'Que renvoie mean(c(2, NA, 4)) en R ?', options: ['3', 'NA', '2', 'Erreur'], answer: 1, explain: 'R propage NA. Utilise na.rm = TRUE pour obtenir 3.' },
      { q: 'Que renvoie pd.Series([2, None, 4]).mean() ?', options: ['3.0', 'NaN', 'Erreur', '2.0'], answer: 0, explain: 'pandas ignore les valeurs manquantes par défaut (skipna=True).' },
      { q: 'Quel est le risque de supprimer les lignes incomplètes ?', options: ['Aucun', 'Biais si les manquants ne sont pas aléatoires', 'Le code plante', 'Les types changent'], answer: 1, explain: 'Si ce sont surtout les étudiants en difficulté qui ne répondent pas, l\'échantillon restant est biaisé.' },
    ],
    exo: {
      prompt: 'Affiche la moyenne de heures_etude en ignorant les valeurs manquantes, arrondie à 2 décimales.',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(round(df["heures_etude"].mean(), 2))', expect: '10.82' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(mean(df$heures_etude, na.rm = TRUE), 2))', expect: '[1] 10.82' },
    },
    cards: [
      ['Compter les NA par colonne : pandas / R', 'df.isna().sum() / colSums(is.na(df))'],
      ['Ignorer les NA dans mean() en R', 'mean(x, na.rm = TRUE)'],
      ['Supprimer les lignes avec NA : pandas / R', 'df.dropna() / na.omit(df)'],
    ],
  },
  {
    id: 'l12', module: 'm2', title: 'Joindre deux tableaux', minutes: 9,
    theory: `
<p>Une <strong>jointure</strong> combine deux tableaux grâce à une <em>clé</em> commune (ex. <code>id</code>).</p>
<ul><li><strong>inner</strong> : seulement les clés présentes des deux côtés.</li>
<li><strong>left</strong> : toutes les lignes de gauche, NA si pas de correspondance.</li>
<li><strong>outer / full</strong> : toutes les lignes des deux côtés.</li></ul>
<p>pandas : <code>pd.merge(a, b, on="id", how="left")</code>. R base : <code>merge(a, b, by = "id", all.x = TRUE)</code>. dplyr : <code>left_join(a, b, by = "id")</code>.</p>
<p>Vérifie toujours le nombre de lignes après une jointure : si une clé est dupliquée dans un tableau, les lignes se multiplient.</p>`,
    py: `import pandas as pd
etu = pd.DataFrame({"id": [1, 2, 3], "nom": ["Awa", "Koffi", "Mariam"]})
bourse = pd.DataFrame({"id": [1, 3, 4], "montant": [50000, 75000, 60000]})
print(pd.merge(etu, bourse, on="id", how="inner"))
print(pd.merge(etu, bourse, on="id", how="left"))`,
    r: `etu <- data.frame(id = 1:3, nom = c("Awa", "Koffi", "Mariam"))
bourse <- data.frame(id = c(1, 3, 4), montant = c(50000, 75000, 60000))
merge(etu, bourse, by = "id")                 # inner
merge(etu, bourse, by = "id", all.x = TRUE)   # left
# dplyr : left_join(etu, bourse, by = "id")`,
    quiz: [
      { q: 'Une left join de etu (3 lignes, id uniques) avec bourse donne combien de lignes si les id de bourse sont uniques ?', options: ['Moins de 3', 'Exactement 3', 'Plus de 3', 'Impossible à dire'], answer: 1, explain: 'Toutes les lignes de gauche sont gardées, sans duplication puisque les clés sont uniques.' },
      { q: 'Équivalent R base de how="left" ?', options: ['all = TRUE', 'all.x = TRUE', 'all.y = TRUE', 'left = TRUE'], answer: 1, explain: 'all.x garde toutes les lignes de x (gauche).' },
    ],
    exo: {
      prompt: 'Fais une jointure interne (inner) de a (id 1 à 4) et b (id 2, 4, 6) et affiche le nombre de lignes obtenues.',
      py: { starter: 'import pandas as pd\na = pd.DataFrame({"id": [1, 2, 3, 4]})\nb = pd.DataFrame({"id": [2, 4, 6], "v": [1, 2, 3]})\n', solution: 'import pandas as pd\na = pd.DataFrame({"id": [1, 2, 3, 4]})\nb = pd.DataFrame({"id": [2, 4, 6], "v": [1, 2, 3]})\nprint(len(pd.merge(a, b, on="id")))', expect: '2' },
      r: { starter: 'a <- data.frame(id = 1:4)\nb <- data.frame(id = c(2, 4, 6), v = 1:3)\n', solution: 'a <- data.frame(id = 1:4)\nb <- data.frame(id = c(2, 4, 6), v = 1:3)\nprint(nrow(merge(a, b, by = "id")))', expect: '[1] 2' },
    },
    cards: [
      ['Left join : pandas / dplyr', 'pd.merge(a, b, on="id", how="left") / left_join(a, b, by = "id")'],
      ['Piège classique des jointures', 'Clé dupliquée → lignes multipliées. Vérifier nrow avant/après.'],
    ],
  },
  {
    id: 'l13', module: 'm2', title: 'Format long et format large', minutes: 9,
    theory: `
<p>Un même jeu de données peut être <strong>large</strong> (une colonne par mesure : <code>T1, T2, T3</code>) ou <strong>long</strong> (une colonne <code>trimestre</code> et une colonne <code>note</code>).</p>
<p>Le format long est préféré pour grouper, modéliser et faire des graphiques (ggplot2, seaborn). Le format large est plus lisible dans un rapport.</p>
<table><tr><th>Passage</th><th>pandas</th><th>tidyr</th></tr>
<tr><td>large → long</td><td><code>df.melt(id_vars="id")</code></td><td><code>pivot_longer(df, -id)</code></td></tr>
<tr><td>long → large</td><td><code>df.pivot(index="id", columns="var", values="val")</code></td><td><code>pivot_wider(df, names_from = var, values_from = val)</code></td></tr></table>
<p>En R base, <code>reshape()</code> existe mais tidyr est beaucoup plus lisible.</p>`,
    py: `import pandas as pd
large = pd.DataFrame({"id": [1, 2], "T1": [12, 9], "T2": [14, 11]})
long = large.melt(id_vars="id", var_name="trimestre", value_name="note")
print(long)
print(long.pivot(index="id", columns="trimestre", values="note"))`,
    r: `large <- data.frame(id = 1:2, T1 = c(12, 9), T2 = c(14, 11))
long <- reshape(large, direction = "long", varying = c("T1", "T2"),
                v.names = "note", timevar = "trimestre",
                times = c("T1", "T2"), idvar = "id")
long
# tidyr : pivot_longer(large, -id, names_to = "trimestre", values_to = "note")`,
    quiz: [
      { q: 'Équivalent tidyr de df.melt() ?', options: ['pivot_wider()', 'pivot_longer()', 'gather_wide()', 'spread()'], answer: 1, explain: 'pivot_longer() remplace l\'ancien gather().' },
      { q: 'Quel format préfèrent ggplot2 et seaborn ?', options: ['Large', 'Long', 'Les deux', 'Aucun'], answer: 1, explain: 'Une ligne par observation-mesure permet de mapper une colonne à la couleur, aux facettes, etc.' },
    ],
    exo: {
      prompt: 'Passe le tableau large (id, A, B) au format long et affiche le nombre de lignes.',
      py: { starter: 'import pandas as pd\nlarge = pd.DataFrame({"id": [1, 2, 3], "A": [5, 6, 7], "B": [8, 9, 10]})\n', solution: 'import pandas as pd\nlarge = pd.DataFrame({"id": [1, 2, 3], "A": [5, 6, 7], "B": [8, 9, 10]})\nprint(len(large.melt(id_vars="id")))', expect: '6' },
      r: { starter: 'large <- data.frame(id = 1:3, A = 5:7, B = 8:10)\n', solution: 'large <- data.frame(id = 1:3, A = 5:7, B = 8:10)\nlong <- reshape(large, direction = "long", varying = c("A", "B"), v.names = "val", timevar = "var", times = c("A", "B"), idvar = "id")\nprint(nrow(long))', expect: '[1] 6' },
    },
    cards: [
      ['Large → long : pandas / tidyr', 'df.melt() / pivot_longer()'],
      ['Long → large : pandas / tidyr', 'df.pivot() / pivot_wider()'],
    ],
  },

  // ───────────────────────── MODULE 3 ─────────────────────────
  {
    id: 'l14', module: 'm3', title: 'Tendance centrale : moyenne, médiane, mode', minutes: 8,
    theory: `
<p>La <strong>moyenne</strong> est la somme divisée par l'effectif. Elle est sensible aux valeurs extrêmes. La <strong>médiane</strong> coupe la série en deux moitiés : elle est <em>robuste</em>. Le <strong>mode</strong> est la valeur la plus fréquente (utile surtout pour les variables qualitatives).</p>
<p>Exemple : salaires 200, 220, 250, 260, 3000 (en milliers de FCFA). Moyenne = 786, médiane = 250. La médiane décrit mieux le salaire « typique ».</p>
<p>Si moyenne &gt; médiane, la distribution est souvent <strong>asymétrique à droite</strong> (longue queue vers les grandes valeurs).</p>
<p>R n'a pas de fonction mode statistique intégrée (<code>mode()</code> donne le type de stockage !) : on utilise <code>names(which.max(table(x)))</code>.</p>`,
    py: `import pandas as pd
salaires = pd.Series([200, 220, 250, 260, 3000])
print(salaires.mean(), salaires.median())
df = pd.read_csv("etudiants.csv")
print(df["filiere"].mode()[0])`,
    r: `salaires <- c(200, 220, 250, 260, 3000)
mean(salaires); median(salaires)
df <- read.csv("etudiants.csv")
names(which.max(table(df$filiere)))   # mode`,
    quiz: [
      { q: 'Quelle mesure est robuste aux valeurs extrêmes ?', options: ['Moyenne', 'Médiane', 'Somme', 'Maximum'], answer: 1, explain: 'La médiane ne dépend que de l\'ordre des valeurs, pas de leur amplitude.' },
      { q: 'Moyenne = 15, médiane = 10. La distribution est probablement…', options: ['Symétrique', 'Asymétrique à droite', 'Asymétrique à gauche', 'Uniforme'], answer: 1, explain: 'Quelques grandes valeurs tirent la moyenne vers le haut.' },
      { q: 'Que renvoie mode(x) en R ?', options: ['La valeur la plus fréquente', 'Le type de stockage', 'La médiane', 'Une erreur'], answer: 1, explain: 'mode() donne "numeric", "character"… Piège classique.' },
    ],
    exo: {
      prompt: 'Affiche la médiane des notes de etudiants.csv.',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(df["note"].median())', expect: '9.7' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(median(df$note))', expect: '[1] 9.7' },
    },
    cards: [
      ['Moyenne > médiane signifie souvent…', 'Asymétrie à droite (queue vers les grandes valeurs)'],
      ['Calculer le mode en R', 'names(which.max(table(x)))'],
    ],
  },
  {
    id: 'l15', module: 'm3', title: 'Dispersion : variance et écart-type', minutes: 9,
    theory: `
<p>Deux classes peuvent avoir la même moyenne mais des notes très différentes. La <strong>dispersion</strong> mesure cet écart.</p>
<ul><li><strong>Étendue</strong> = max − min (très sensible aux extrêmes).</li>
<li><strong>Variance</strong> = moyenne des carrés des écarts à la moyenne. Pour un échantillon on divise par <em>n − 1</em>.</li>
<li><strong>Écart-type</strong> = racine de la variance, dans la même unité que les données.</li>
<li><strong>Coefficient de variation</strong> = écart-type / moyenne, pour comparer des séries d'unités différentes.</li></ul>
<p>⚠️ Piège : <code>np.var()</code> et <code>np.std()</code> divisent par <em>n</em> par défaut (<code>ddof=0</code>), alors que pandas (<code>.var()</code>, <code>.std()</code>) et R (<code>var()</code>, <code>sd()</code>) divisent par <em>n − 1</em>.</p>`,
    py: `import numpy as np, pandas as pd
x = [10, 12, 14, 16, 18]
print(np.std(x))            # ddof=0 (population)
print(np.std(x, ddof=1))    # échantillon
print(pd.Series(x).std())   # pandas : ddof=1 par défaut`,
    r: `x <- c(10, 12, 14, 16, 18)
var(x)    # n - 1
sd(x)
sd(x) / mean(x)   # coefficient de variation`,
    quiz: [
      { q: 'Pourquoi divise-t-on par n − 1 pour un échantillon ?', options: ['Convention arbitraire', 'Pour obtenir un estimateur sans biais de la variance', 'Pour éviter la division par 0', 'Pour arrondir'], answer: 1, explain: 'La correction de Bessel compense le fait que la moyenne est elle-même estimée.' },
      { q: 'np.std(x) utilise par défaut…', options: ['n − 1', 'n', 'n + 1', 'La médiane'], answer: 1, explain: 'ddof=0 par défaut dans numpy, contrairement à pandas et R.' },
      { q: 'Quelle mesure est dans la même unité que les données ?', options: ['Variance', 'Écart-type', 'Les deux', 'Aucune'], answer: 1, explain: 'La variance est en unités au carré.' },
    ],
    exo: {
      prompt: 'Affiche l\'écart-type (échantillon) des notes de etudiants.csv, arrondi à 2 décimales.',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(round(df["note"].std(), 2))', expect: '3.47' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(sd(df$note), 2))', expect: '[1] 3.47' },
    },
    cards: [
      ['Diviseur par défaut : np.std / pandas .std / R sd', 'n / n − 1 / n − 1'],
      ['Coefficient de variation', 'écart-type / moyenne'],
    ],
  },
  {
    id: 'l16', module: 'm3', title: 'Quantiles et valeurs atypiques', minutes: 9,
    theory: `
<p>Les <strong>quartiles</strong> découpent la série en 4 : Q1 (25 %), Q2 = médiane (50 %), Q3 (75 %). L'<strong>écart interquartile</strong> IQR = Q3 − Q1 contient la moitié centrale des données.</p>
<p>Règle de Tukey : une valeur est <strong>atypique</strong> si elle est en dessous de <code>Q1 − 1,5 × IQR</code> ou au-dessus de <code>Q3 + 1,5 × IQR</code>. C'est la règle utilisée pour les points isolés d'un boxplot.</p>
<p>Python : <code>s.quantile([.25, .5, .75])</code>. R : <code>quantile(x)</code>, <code>IQR(x)</code>. Les méthodes de calcul par défaut sont les mêmes (type 7 en R, « linear » en pandas).</p>
<p>Une valeur atypique n'est pas forcément une erreur : vérifie-la avant de la supprimer.</p>`,
    py: `import pandas as pd
df = pd.read_csv("etudiants.csv")
q1, q3 = df["note"].quantile([0.25, 0.75])
iqr = q3 - q1
print(q1, q3, iqr)
atyp = df[(df["note"] < q1 - 1.5 * iqr) | (df["note"] > q3 + 1.5 * iqr)]
print(len(atyp), "valeur(s) atypique(s)")`,
    r: `df <- read.csv("etudiants.csv")
quantile(df$note)
iqr <- IQR(df$note)
q <- quantile(df$note, c(0.25, 0.75))
sum(df$note < q[1] - 1.5 * iqr | df$note > q[2] + 1.5 * iqr)
boxplot.stats(df$note)$out`,
    quiz: [
      { q: 'Q1 = 8, Q3 = 14. À partir de quelle valeur un point est-il atypique vers le haut ?', options: ['14', '17', '23', '20'], answer: 2, explain: 'IQR = 6 ; 14 + 1,5 × 6 = 23.' },
      { q: 'Le 2e quartile est…', options: ['La moyenne', 'La médiane', 'Le mode', 'L\'IQR'], answer: 1, explain: 'Q2 = 50e percentile = médiane.' },
    ],
    exo: {
      prompt: 'Affiche l\'écart interquartile des notes.',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(round(df["note"].quantile(0.75) - df["note"].quantile(0.25), 3))', expect: '4.575' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(IQR(df$note), 3))', expect: '[1] 4.575' },
    },
    cards: [
      ['Règle de Tukey (valeurs atypiques)', '< Q1 − 1,5·IQR ou > Q3 + 1,5·IQR'],
      ['IQR en R', 'IQR(x)'],
    ],
  },
  {
    id: 'l17', module: 'm3', title: 'Variables qualitatives : fréquences', minutes: 8,
    theory: `
<p>Pour une variable qualitative (filière, sexe…), on ne calcule pas de moyenne : on compte. Le <strong>tableau de fréquences</strong> donne les effectifs et les proportions.</p>
<p>pandas : <code>s.value_counts()</code> et <code>s.value_counts(normalize=True)</code>. R : <code>table(x)</code> et <code>prop.table(table(x))</code>.</p>
<p>Pour croiser deux variables : <strong>tableau de contingence</strong> avec <code>pd.crosstab(a, b)</code> ou <code>table(a, b)</code>. Ce tableau est le point de départ du test du khi-deux (module 6).</p>
<p>En R, le type <code>factor</code> représente une variable qualitative avec ses modalités (<em>levels</em>). En pandas, l'équivalent est <code>astype("category")</code>.</p>`,
    py: `import pandas as pd
df = pd.read_csv("etudiants.csv")
print(df["filiere"].value_counts())
print(df["filiere"].value_counts(normalize=True).round(3))
print(pd.crosstab(df["filiere"], df["reussite"]))`,
    r: `df <- read.csv("etudiants.csv")
table(df$filiere)
round(prop.table(table(df$filiere)), 3)
table(df$filiere, df$reussite)
df$filiere <- factor(df$filiere)
levels(df$filiere)`,
    quiz: [
      { q: 'Équivalent R de value_counts(normalize=True) ?', options: ['table(x)', 'prop.table(table(x))', 'freq(x)', 'summary(x)'], answer: 1, explain: 'prop.table() convertit les effectifs en proportions.' },
      { q: 'Comment s\'appellent les modalités d\'un factor R ?', options: ['labels', 'levels', 'names', 'values'], answer: 1, explain: 'levels(f) liste les modalités.' },
    ],
    exo: {
      prompt: 'Affiche le nombre d\'étudiants en réussite (reussite == 1).',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint((df["reussite"] == 1).sum())', expect: '19' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(sum(df$reussite == 1))', expect: '[1] 19' },
    },
    cards: [
      ['Tableau croisé : pandas / R', 'pd.crosstab(a, b) / table(a, b)'],
      ['Variable qualitative : type R / pandas', 'factor / category'],
    ],
  },
  {
    id: 'l18', module: 'm3', title: 'Corrélation', minutes: 10,
    theory: `
<p>Le <strong>coefficient de corrélation de Pearson</strong> <em>r</em> mesure la force d'une relation <em>linéaire</em> entre deux variables quantitatives. Il va de −1 (relation décroissante parfaite) à +1 (croissante parfaite) ; 0 = pas de relation linéaire.</p>
<p>Repères approximatifs : |r| &lt; 0,3 faible, 0,3–0,7 modérée, &gt; 0,7 forte. Le <strong>Spearman</strong> utilise les rangs : il capte les relations monotones et résiste aux valeurs extrêmes.</p>
<p>⚠️ <strong>Corrélation ≠ causalité</strong>. Une troisième variable peut expliquer les deux (facteur de confusion). Et un r proche de 0 n'exclut pas une relation non linéaire : regarde toujours le nuage de points.</p>
<p>Python : <code>df["a"].corr(df["b"])</code>, <code>method="spearman"</code>. R : <code>cor(a, b, use = "complete.obs")</code>, <code>method = "spearman"</code>.</p>`,
    py: `import pandas as pd
df = pd.read_csv("etudiants.csv")
print(round(df["heures_etude"].corr(df["note"]), 3))
print(round(df["heures_etude"].corr(df["note"], method="spearman"), 3))
print(df[["age", "heures_etude", "note"]].corr().round(2))`,
    r: `df <- read.csv("etudiants.csv")
round(cor(df$heures_etude, df$note, use = "complete.obs"), 3)
round(cor(df$heures_etude, df$note, use = "complete.obs", method = "spearman"), 3)
round(cor(df[, c("age", "heures_etude", "note")], use = "complete.obs"), 2)`,
    quiz: [
      { q: 'r = −0,85 signifie…', options: ['Pas de relation', 'Relation linéaire décroissante forte', 'Relation faible', 'Causalité négative'], answer: 1, explain: 'Le signe donne le sens, la valeur absolue la force.' },
      { q: 'Pourquoi R renvoie NA pour cor(x, y) ici ?', options: ['Bug', 'Il y a des NA dans heures_etude', 'Les variables sont qualitatives', 'r = 0'], answer: 1, explain: 'Il faut use = "complete.obs" (pandas ignore les NaN seul).' },
      { q: 'r ≈ 0 permet de conclure…', options: ['Aucune relation', 'Aucune relation linéaire', 'Une causalité', 'Une erreur de calcul'], answer: 1, explain: 'Une relation en U peut donner r ≈ 0.' },
    ],
    exo: {
      prompt: 'Affiche la corrélation de Pearson entre age et note, arrondie à 3 décimales.',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(round(df["age"].corr(df["note"]), 3))', expect: '0.038' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(cor(df$age, df$note), 3))', expect: '[1] 0.038' },
    },
    cards: [
      ['Pearson vs Spearman', 'Pearson : linéaire, valeurs. Spearman : monotone, rangs, robuste.'],
      ['Corrélation en R avec des NA', 'cor(x, y, use = "complete.obs")'],
    ],
  },

  // ───────────────────────── MODULE 4 ─────────────────────────
  {
    id: 'l19', module: 'm4', title: 'Histogramme', minutes: 8,
    theory: `
<p>L'<strong>histogramme</strong> montre la forme d'une distribution quantitative : symétrie, asymétrie, pics multiples, valeurs isolées.</p>
<p>Le nombre de classes (<em>bins</em>) change beaucoup la lecture : trop peu, on écrase la forme ; trop, on voit du bruit. Teste plusieurs valeurs.</p>
<p>Python : <code>plt.hist(x, bins=10)</code> (matplotlib) ou <code>sns.histplot()</code>. R : <code>hist(x, breaks = 10)</code> en base, ou <code>ggplot(df, aes(x)) + geom_histogram(bins = 10)</code>.</p>
<p>👉 Lance l'exemple dans le Labo : les graphiques s'affichent sous la console.</p>`,
    py: `import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv("etudiants.csv")
plt.hist(df["note"], bins=8, color="#4f7cff", edgecolor="white")
plt.title("Distribution des notes")
plt.xlabel("Note /20"); plt.ylabel("Effectif")
plt.show()`,
    r: `df <- read.csv("etudiants.csv")
hist(df$note, breaks = 8, col = "#4f7cff", border = "white",
     main = "Distribution des notes", xlab = "Note /20", ylab = "Effectif")
# ggplot2 : ggplot(df, aes(note)) + geom_histogram(bins = 8)`,
    quiz: [
      { q: 'Un histogramme convient pour…', options: ['Une variable qualitative', 'Une variable quantitative', 'Deux variables qualitatives', 'Une série temporelle uniquement'], answer: 1, explain: 'Pour une qualitative, on utilise un diagramme en barres.' },
      { q: 'Quel argument fixe le nombre de classes dans hist() en R ?', options: ['bins', 'breaks', 'classes', 'n'], answer: 1, explain: 'breaks en base R ; bins en matplotlib et ggplot2.' },
    ],
    exo: null,
    cards: [
      ['Histogramme : matplotlib / R base / ggplot2', 'plt.hist() / hist() / geom_histogram()'],
      ['Effet du nombre de classes', 'Trop peu : forme écrasée ; trop : bruit'],
    ],
  },
  {
    id: 'l20', module: 'm4', title: 'Nuage de points', minutes: 8,
    theory: `
<p>Le <strong>nuage de points</strong> croise deux variables quantitatives. C'est le compagnon indispensable de la corrélation et de la régression.</p>
<p>On y cherche : la direction (croissante / décroissante), la forme (linéaire, courbe), la force (points serrés ou dispersés) et les points isolés.</p>
<p>On peut ajouter une 3e variable par la couleur (<code>c=</code> en matplotlib, <code>hue=</code> en seaborn, <code>col=</code> en R base, <code>aes(color = )</code> en ggplot2) et une droite de tendance (<code>np.polyfit</code> / <code>abline(lm(y ~ x))</code>).</p>`,
    py: `import pandas as pd, numpy as np
import matplotlib.pyplot as plt
df = pd.read_csv("etudiants.csv").dropna()
plt.scatter(df["heures_etude"], df["note"], alpha=0.7)
a, b = np.polyfit(df["heures_etude"], df["note"], 1)
xs = np.linspace(0, 20, 50)
plt.plot(xs, a * xs + b, color="red")
plt.xlabel("Heures d'étude"); plt.ylabel("Note")
plt.show()`,
    r: `df <- na.omit(read.csv("etudiants.csv"))
plot(df$heures_etude, df$note, pch = 19,
     xlab = "Heures d'étude", ylab = "Note")
abline(lm(note ~ heures_etude, data = df), col = "red")
# ggplot2 : ggplot(df, aes(heures_etude, note)) + geom_point() + geom_smooth(method = "lm")`,
    quiz: [
      { q: 'Quelle fonction R base ajoute une droite de régression à un nuage ?', options: ['lines()', 'abline(lm(y ~ x))', 'curve()', 'trend()'], answer: 1, explain: 'abline() trace une droite ; il accepte directement un objet lm.' },
      { q: 'Dans seaborn, quel argument colore par groupe ?', options: ['color', 'group', 'hue', 'fill'], answer: 2, explain: 'sns.scatterplot(data=df, x=..., y=..., hue="filiere").' },
    ],
    exo: null,
    cards: [
      ['Les 4 choses à lire dans un nuage de points', 'Direction, forme, force, points isolés'],
      ['ggplot2 : droite de tendance', 'geom_smooth(method = "lm")'],
    ],
  },
  {
    id: 'l21', module: 'm4', title: 'Barres et boîtes à moustaches', minutes: 9,
    theory: `
<p>Le <strong>diagramme en barres</strong> représente les effectifs d'une variable qualitative. Trie les barres par taille et commence toujours l'axe à 0.</p>
<p>La <strong>boîte à moustaches</strong> (boxplot) résume une variable quantitative : médiane, Q1, Q3, moustaches à 1,5 × IQR et points atypiques. Elle est idéale pour <em>comparer des groupes</em> : notes par filière, salaires par région…</p>
<p>Python : <code>df["filiere"].value_counts().plot.bar()</code>, <code>df.boxplot(column="note", by="filiere")</code>. R : <code>barplot(table(x))</code>, <code>boxplot(note ~ filiere, data = df)</code>.</p>`,
    py: `import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv("etudiants.csv")
fig, ax = plt.subplots(1, 2, figsize=(9, 3.5))
df["filiere"].value_counts().plot.bar(ax=ax[0], color="#22a06b")
df.boxplot(column="note", by="filiere", ax=ax[1])
plt.suptitle("")
plt.show()`,
    r: `df <- read.csv("etudiants.csv")
par(mfrow = c(1, 2))
barplot(sort(table(df$filiere), decreasing = TRUE), col = "#22a06b")
boxplot(note ~ filiere, data = df, col = "#ffd166")
par(mfrow = c(1, 1))`,
    quiz: [
      { q: 'Le trait central d\'un boxplot représente…', options: ['La moyenne', 'La médiane', 'Le mode', 'Le maximum'], answer: 1, explain: 'La boîte va de Q1 à Q3, le trait est la médiane.' },
      { q: 'Pour comparer la distribution des notes entre 4 filières, le plus adapté est…', options: ['Un camembert', 'Des boxplots côte à côte', 'Un histogramme unique', 'Une courbe temporelle'], answer: 1, explain: 'Les boxplots alignés comparent médianes et dispersions d\'un coup d\'œil.' },
    ],
    exo: null,
    cards: [
      ['Boxplot par groupe en R', 'boxplot(y ~ groupe, data = df)'],
      ['Règle d\'or des diagrammes en barres', 'Axe qui commence à 0 et barres triées'],
    ],
  },
  {
    id: 'l22', module: 'm4', title: 'Bien choisir son graphique', minutes: 7,
    theory: `
<p>Le bon graphique dépend du <strong>type des variables</strong> et de la <strong>question posée</strong> :</p>
<table><tr><th>Question</th><th>Graphique</th></tr>
<tr><td>Distribution d'une quantitative</td><td>Histogramme, densité, boxplot</td></tr>
<tr><td>Répartition d'une qualitative</td><td>Barres (évite le camembert au-delà de 3 parts)</td></tr>
<tr><td>Relation entre 2 quantitatives</td><td>Nuage de points</td></tr>
<tr><td>Quantitative selon les groupes</td><td>Boxplots, violons, points avec barres d'erreur</td></tr>
<tr><td>Évolution dans le temps</td><td>Courbe (lignes)</td></tr>
<tr><td>2 qualitatives</td><td>Barres empilées ou groupées, heatmap</td></tr></table>
<p>La <strong>grammaire des graphiques</strong> (ggplot2, plotnine en Python) décrit un graphique par : données + correspondances esthétiques (<code>aes</code>) + géométries (<code>geom_*</code>) + facettes + thème. Penser ainsi rend tous les graphiques cohérents.</p>
<p>Un bon graphique a un titre qui dit la conclusion, des axes avec unités, et le moins d'encre décorative possible.</p>`,
    py: `# plotnine reproduit ggplot2 en Python :
# from plotnine import ggplot, aes, geom_boxplot
# ggplot(df, aes("filiere", "note")) + geom_boxplot()
import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv("etudiants.csv")
moy = df.groupby("filiere")["note"].mean().sort_values()
moy.plot.barh(color="#4f7cff")
plt.title("L'Info a la note moyenne la plus élevée ?")
plt.xlabel("Note moyenne /20")
plt.show()`,
    r: `df <- read.csv("etudiants.csv")
moy <- sort(tapply(df$note, df$filiere, mean))
barplot(moy, horiz = TRUE, las = 1, col = "#4f7cff",
        main = "Note moyenne par filière", xlab = "Note /20")
# ggplot(df, aes(filiere, note)) + geom_boxplot() + theme_minimal()`,
    quiz: [
      { q: 'Pour montrer l\'évolution mensuelle du chiffre d\'affaires :', options: ['Camembert', 'Courbe', 'Boxplot', 'Histogramme'], answer: 1, explain: 'Le temps en abscisse et une ligne qui relie les points.' },
      { q: 'Dans ggplot2, aes() sert à…', options: ['Choisir les couleurs du thème', 'Relier des colonnes aux propriétés visuelles', 'Exporter le graphique', 'Filtrer les données'], answer: 1, explain: 'aes(x = , y = , color = ) mappe des variables sur des esthétiques.' },
    ],
    exo: null,
    cards: [
      ['Relation entre 2 variables quantitatives', 'Nuage de points'],
      ['Composants de la grammaire des graphiques', 'Données, aes, geom, facettes, thème'],
    ],
  },

  // ───────────────────────── MODULE 5 ─────────────────────────
  {
    id: 'l23', module: 'm5', title: 'La loi normale', minutes: 10,
    theory: `
<p>La <strong>loi normale</strong> N(μ, σ) est la courbe en cloche, symétrique autour de sa moyenne μ. Règle 68-95-99,7 : environ 68 % des valeurs sont à ±1σ, 95 % à ±2σ (exactement 1,96σ), 99,7 % à ±3σ.</p>
<p>Le <strong>score z</strong> = (x − μ) / σ indique à combien d'écarts-types une valeur se trouve de la moyenne.</p>
<p>Les 4 fonctions de R pour chaque loi : <code>d</code> (densité), <code>p</code> (probabilité cumulée), <code>q</code> (quantile), <code>r</code> (tirage). Pour la normale : <code>dnorm, pnorm, qnorm, rnorm</code>. En Python, <code>scipy.stats.norm</code> a les méthodes <code>.pdf, .cdf, .ppf, .rvs</code>.</p>`,
    py: `from scipy import stats
# P(X < 130) pour X ~ N(100, 15)
print(round(stats.norm.cdf(130, loc=100, scale=15), 4))
# quantile 97,5 % de la normale centrée réduite
print(round(stats.norm.ppf(0.975), 3))`,
    r: `# P(X < 130) pour X ~ N(100, 15)
round(pnorm(130, mean = 100, sd = 15), 4)
# quantile 97,5 % de la normale centrée réduite
round(qnorm(0.975), 3)`,
    quiz: [
      { q: 'Environ quelle part des valeurs se trouve à ±2σ de la moyenne ?', options: ['68 %', '95 %', '99,7 %', '50 %'], answer: 1, explain: 'Règle 68-95-99,7.' },
      { q: 'Équivalent scipy de pnorm() ?', options: ['norm.pdf', 'norm.cdf', 'norm.ppf', 'norm.rvs'], answer: 1, explain: 'cdf = fonction de répartition (probabilité cumulée).' },
      { q: 'Note 16, moyenne 12, écart-type 2. Score z ?', options: ['1', '2', '4', '0,5'], answer: 1, explain: '(16 − 12) / 2 = 2.' },
    ],
    exo: {
      prompt: 'Calcule P(X > 120) pour X ~ N(100, 10), arrondi à 4 décimales.',
      py: { starter: 'from scipy import stats\n', solution: 'from scipy import stats\nprint(round(1 - stats.norm.cdf(120, 100, 10), 4))', expect: '0.0228' },
      r: { starter: '', solution: 'print(round(1 - pnorm(120, 100, 10), 4))', expect: '[1] 0.0228' },
    },
    cards: [
      ['Les 4 préfixes des lois en R', 'd densité, p cumulée, q quantile, r tirage'],
      ['scipy : cdf / ppf correspondent à…', 'pnorm / qnorm'],
      ['Quantile 97,5 % de N(0,1)', '≈ 1,96'],
    ],
  },
  {
    id: 'l24', module: 'm5', title: 'La loi binomiale', minutes: 9,
    theory: `
<p>La <strong>loi binomiale</strong> B(n, p) compte le nombre de succès sur <em>n</em> essais indépendants, chacun réussi avec la probabilité <em>p</em>. Exemples : nombre de clients qui achètent parmi 20 visiteurs, nombre de pièces défectueuses dans un lot.</p>
<p>Espérance = n·p, variance = n·p·(1 − p).</p>
<p>R : <code>dbinom(k, n, p)</code> donne P(X = k), <code>pbinom(k, n, p)</code> donne P(X ≤ k). Python : <code>stats.binom.pmf(k, n, p)</code> et <code>stats.binom.cdf(k, n, p)</code>.</p>
<p>Pour P(X ≥ k), calcule <code>1 − P(X ≤ k − 1)</code> : erreur fréquente de décalage d'une unité !</p>`,
    py: `from scipy import stats
n, p = 20, 0.3
print(round(stats.binom.pmf(6, n, p), 4))      # P(X = 6)
print(round(stats.binom.cdf(4, n, p), 4))      # P(X <= 4)
print(round(1 - stats.binom.cdf(9, n, p), 4))  # P(X >= 10)
print(n * p)                                   # espérance`,
    r: `n <- 20; p <- 0.3
round(dbinom(6, n, p), 4)       # P(X = 6)
round(pbinom(4, n, p), 4)       # P(X <= 4)
round(1 - pbinom(9, n, p), 4)   # P(X >= 10)
n * p`,
    quiz: [
      { q: 'Espérance de B(50, 0,2) ?', options: ['5', '10', '20', '0,2'], answer: 1, explain: 'n·p = 50 × 0,2 = 10.' },
      { q: 'P(X ≥ 3) s\'écrit en R…', options: ['pbinom(3, n, p)', '1 - pbinom(3, n, p)', '1 - pbinom(2, n, p)', 'dbinom(3, n, p)'], answer: 2, explain: 'P(X ≥ 3) = 1 − P(X ≤ 2).' },
    ],
    exo: {
      prompt: 'On lance 10 fois une pièce équilibrée. Probabilité d\'obtenir exactement 5 piles (4 décimales) ?',
      py: { starter: 'from scipy import stats\n', solution: 'from scipy import stats\nprint(round(stats.binom.pmf(5, 10, 0.5), 4))', expect: '0.2461' },
      r: { starter: '', solution: 'print(round(dbinom(5, 10, 0.5), 4))', expect: '[1] 0.2461' },
    },
    cards: [
      ['Espérance et variance de B(n, p)', 'n·p et n·p·(1 − p)'],
      ['P(X = k) binomiale : R / scipy', 'dbinom(k, n, p) / binom.pmf(k, n, p)'],
    ],
  },
  {
    id: 'l25', module: 'm5', title: 'Échantillonnage et théorème central limite', minutes: 11,
    theory: `
<p>On étudie rarement toute une population : on tire un <strong>échantillon</strong>. Chaque échantillon donne une moyenne un peu différente : c'est la <strong>fluctuation d'échantillonnage</strong>.</p>
<p><strong>Loi des grands nombres</strong> : plus l'échantillon est grand, plus sa moyenne se rapproche de la vraie moyenne.</p>
<p><strong>Théorème central limite (TCL)</strong> : quelle que soit la forme de la population, la distribution des moyennes d'échantillons tend vers une loi normale, centrée sur μ, d'écart-type σ / √n (l'<strong>erreur standard</strong>). C'est ce qui justifie la plupart des intervalles de confiance et des tests.</p>
<p>Pour la reproductibilité, fixe la graine aléatoire : <code>np.random.default_rng(42)</code> / <code>set.seed(42)</code>.</p>`,
    py: `import numpy as np
import matplotlib.pyplot as plt
rng = np.random.default_rng(42)
# population très asymétrique (exponentielle, moyenne 5)
moyennes = [rng.exponential(5, size=40).mean() for _ in range(2000)]
print(round(np.mean(moyennes), 2), round(np.std(moyennes), 2))
print("erreur standard théorique :", round(5 / np.sqrt(40), 2))
plt.hist(moyennes, bins=40); plt.show()`,
    r: `set.seed(42)
moyennes <- replicate(2000, mean(rexp(40, rate = 1/5)))
round(mean(moyennes), 2); round(sd(moyennes), 2)
round(5 / sqrt(40), 2)   # erreur standard théorique
hist(moyennes, breaks = 40)`,
    quiz: [
      { q: 'Erreur standard de la moyenne avec σ = 10 et n = 100 ?', options: ['10', '1', '0,1', '100'], answer: 1, explain: 'σ / √n = 10 / 10 = 1.' },
      { q: 'Le TCL dit que la distribution des moyennes…', options: ['Est toujours uniforme', 'Tend vers une normale', 'Garde la forme de la population', 'Dépend de la graine'], answer: 1, explain: 'Même pour une population asymétrique, si n est assez grand.' },
      { q: 'Pour diviser l\'erreur standard par 2, il faut…', options: ['Doubler n', 'Multiplier n par 4', 'Diviser σ par 4', 'Rien'], answer: 1, explain: 'Elle varie en 1/√n : ×4 sur n donne ÷2.' },
    ],
    exo: {
      prompt: 'Calcule l\'erreur standard σ/√n pour σ = 12 et n = 36.',
      py: { starter: 'import math\n', solution: 'import math\nprint(12 / math.sqrt(36))', expect: '2.0' },
      r: { starter: '', solution: 'print(12 / sqrt(36))', expect: '[1] 2' },
    },
    cards: [
      ['Erreur standard de la moyenne', 'σ / √n'],
      ['Fixer la graine : numpy / R', 'np.random.default_rng(42) / set.seed(42)'],
      ['Théorème central limite (une phrase)', 'Les moyennes d\'échantillons suivent approximativement une normale N(μ, σ/√n)'],
    ],
  },

  // ───────────────────────── MODULE 6 ─────────────────────────
  {
    id: 'l26', module: 'm6', title: 'Intervalle de confiance', minutes: 10,
    theory: `
<p>Un <strong>intervalle de confiance à 95 %</strong> est une plage de valeurs construite de sorte que, si on répétait l'étude un grand nombre de fois, 95 % des intervalles contiendraient la vraie valeur.</p>
<p>Pour une moyenne : <code>x̄ ± t × s/√n</code>, où <em>t</em> est le quantile de la loi de Student à n − 1 degrés de liberté (≈ 2 pour n assez grand).</p>
<p>⚠️ Interprétation correcte : on ne dit pas « il y a 95 % de chances que μ soit dans <em>cet</em> intervalle » (μ est fixe), on dit que la <em>méthode</em> capture μ dans 95 % des cas.</p>
<p>R donne l'IC directement avec <code>t.test(x)$conf.int</code>. Python : <code>stats.t.interval(0.95, df=n-1, loc=moy, scale=se)</code>.</p>`,
    py: `import pandas as pd
from scipy import stats
df = pd.read_csv("etudiants.csv")
x = df["note"]
se = x.std() / len(x) ** 0.5
ic = stats.t.interval(0.95, df=len(x) - 1, loc=x.mean(), scale=se)
print(round(x.mean(), 2), [round(v, 2) for v in ic])`,
    r: `df <- read.csv("etudiants.csv")
round(mean(df$note), 2)
round(t.test(df$note)$conf.int, 2)`,
    quiz: [
      { q: 'Si on augmente n, l\'intervalle de confiance…', options: ['S\'élargit', 'Se rétrécit', 'Ne change pas', 'Devient asymétrique'], answer: 1, explain: 'L\'erreur standard s/√n diminue.' },
      { q: 'Un IC à 99 % est, par rapport à un IC à 95 %…', options: ['Plus étroit', 'Plus large', 'Identique', 'Impossible'], answer: 1, explain: 'Plus de confiance exige un intervalle plus large.' },
    ],
    exo: {
      prompt: 'Affiche la borne inférieure de l\'IC à 95 % de la note moyenne (2 décimales).',
      py: { starter: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\nx = df["note"]\nic = stats.t.interval(0.95, df=len(x)-1, loc=x.mean(), scale=x.std()/len(x)**0.5)\nprint(round(ic[0], 2))', expect: '9.07' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(t.test(df$note)$conf.int[1], 2))', expect: '[1] 9.07' },
    },
    cards: [
      ['IC 95 % d\'une moyenne', 'x̄ ± t(n−1; 0,975) × s/√n'],
      ['IC d\'une moyenne en une ligne R', 't.test(x)$conf.int'],
    ],
  },
  {
    id: 'l27', module: 'm6', title: 'Test d\'hypothèse et p-value', minutes: 11,
    theory: `
<p>Un test oppose deux hypothèses : <strong>H0</strong> (pas d'effet, pas de différence) et <strong>H1</strong> (il y a un effet). On calcule une <strong>statistique de test</strong>, puis la <strong>p-value</strong> : la probabilité d'observer un résultat au moins aussi extrême <em>si H0 était vraie</em>.</p>
<p>Si p &lt; α (souvent 0,05), on <strong>rejette H0</strong>. Sinon, on ne la rejette pas, ce qui ne prouve pas qu'elle est vraie.</p>
<ul><li><strong>Erreur de type I</strong> : rejeter H0 alors qu'elle est vraie (probabilité α).</li>
<li><strong>Erreur de type II</strong> : ne pas rejeter H0 alors qu'elle est fausse (probabilité β). La <strong>puissance</strong> = 1 − β.</li></ul>
<p>⚠️ La p-value n'est <em>pas</em> la probabilité que H0 soit vraie, et elle ne mesure pas l'importance de l'effet. Rapporte toujours la taille de l'effet et son intervalle de confiance.</p>`,
    py: `from scipy import stats
# La moyenne des notes est-elle différente de 10 ?
import pandas as pd
df = pd.read_csv("etudiants.csv")
res = stats.ttest_1samp(df["note"], popmean=10)
print(round(res.statistic, 3), round(res.pvalue, 4))`,
    r: `df <- read.csv("etudiants.csv")
res <- t.test(df$note, mu = 10)
res
round(res$p.value, 4)`,
    quiz: [
      { q: 'p = 0,03 avec α = 0,05 :', options: ['On accepte H0', 'On rejette H0', 'H0 est vraie à 97 %', 'Le test est invalide'], answer: 1, explain: 'p < α : résultat statistiquement significatif.' },
      { q: 'La p-value est…', options: ['P(H0 vraie)', 'P(données au moins aussi extrêmes | H0)', 'La taille de l\'effet', 'Le risque de type II'], answer: 1, explain: 'Elle se calcule en supposant H0 vraie.' },
      { q: 'Rejeter H0 alors qu\'elle est vraie est une erreur de…', options: ['Type I', 'Type II', 'Mesure', 'Puissance'], answer: 0, explain: 'Type I = faux positif, contrôlé par α.' },
    ],
    exo: {
      prompt: 'Teste si la note moyenne diffère de 11 et affiche la p-value arrondie à 4 décimales.',
      py: { starter: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\nprint(round(stats.ttest_1samp(df["note"], 11).pvalue, 4))', expect: '0.1448' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(t.test(df$note, mu = 11)$p.value, 4))', expect: '[1] 0.1448' },
    },
    cards: [
      ['Définition de la p-value', 'Probabilité d\'un résultat au moins aussi extrême si H0 est vraie'],
      ['Erreur de type I / type II', 'Faux positif (α) / faux négatif (β)'],
      ['Puissance d\'un test', '1 − β : probabilité de détecter un effet réel'],
    ],
  },
  {
    id: 'l28', module: 'm6', title: 'Comparer deux moyennes : test t', minutes: 10,
    theory: `
<p>Le <strong>test t de Student</strong> compare les moyennes de deux groupes. H0 : les moyennes sont égales.</p>
<ul><li><strong>Indépendant</strong> : deux groupes distincts (filles / garçons).</li>
<li><strong>Apparié</strong> : les mêmes individus mesurés deux fois (avant / après).</li></ul>
<p>Par défaut, R utilise la version de <strong>Welch</strong> (variances inégales), recommandée. En scipy, il faut le demander : <code>equal_var=False</code>.</p>
<p>Conditions : observations indépendantes, distributions à peu près normales ou échantillons assez grands (n &gt; 30 par groupe, grâce au TCL). Sinon, utilise le test de Wilcoxon-Mann-Whitney (leçon 31).</p>
<p>La taille d'effet <strong>d de Cohen</strong> = différence des moyennes / écart-type commun (0,2 petit, 0,5 moyen, 0,8 grand).</p>`,
    py: `import pandas as pd
from scipy import stats
df = pd.read_csv("etudiants.csv")
f = df[df["sexe"] == "F"]["note"]
h = df[df["sexe"] == "H"]["note"]
res = stats.ttest_ind(f, h, equal_var=False)   # Welch
print(round(f.mean(), 2), round(h.mean(), 2))
print(round(res.statistic, 3), round(res.pvalue, 4))`,
    r: `df <- read.csv("etudiants.csv")
t.test(note ~ sexe, data = df)   # Welch par défaut
# apparié : t.test(apres, avant, paired = TRUE)`,
    quiz: [
      { q: 'Mesurer le stress des mêmes salariés avant et après une formation :', options: ['t indépendant', 't apparié', 'Khi-deux', 'ANOVA'], answer: 1, explain: 'Mêmes individus → mesures appariées.' },
      { q: 'Quel argument scipy donne le test de Welch ?', options: ['welch=True', 'equal_var=False', 'paired=False', 'var="unequal"'], answer: 1, explain: 'stats.ttest_ind(a, b, equal_var=False).' },
    ],
    exo: {
      prompt: 'Compare les notes des filières Info et Eco (test de Welch) et affiche la p-value arrondie à 4 décimales.',
      py: { starter: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\na = df[df.filiere == "Info"]["note"]\nb = df[df.filiere == "Eco"]["note"]\nprint(round(stats.ttest_ind(a, b, equal_var=False).pvalue, 4))', expect: '0.9872' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nd <- df[df$filiere %in% c("Info", "Eco"), ]\nprint(round(t.test(note ~ filiere, data = d)$p.value, 4))', expect: '[1] 0.9872' },
    },
    cards: [
      ['Test t par défaut de R', 'Welch (variances inégales)'],
      ['Test t de Welch en scipy', 'stats.ttest_ind(a, b, equal_var=False)'],
      ['Seuils du d de Cohen', '0,2 petit ; 0,5 moyen ; 0,8 grand'],
    ],
  },
  {
    id: 'l29', module: 'm6', title: 'Test du khi-deux d\'indépendance', minutes: 10,
    theory: `
<p>Le <strong>khi-deux (χ²)</strong> teste si deux variables <em>qualitatives</em> sont liées. H0 : les variables sont indépendantes.</p>
<p>Il compare les effectifs <strong>observés</strong> du tableau de contingence aux effectifs <strong>théoriques</strong> attendus sous l'indépendance (total ligne × total colonne / total général).</p>
<p>Condition : effectifs théoriques ≥ 5 dans la plupart des cases. Sinon, utilise le <strong>test exact de Fisher</strong> (<code>fisher.test()</code> / <code>stats.fisher_exact()</code> pour un 2×2).</p>
<p>Pour la force de la liaison, calcule le <strong>V de Cramér</strong> (entre 0 et 1).</p>
<p>Attention : par défaut, R applique la correction de Yates sur les tableaux 2×2, scipy aussi (<code>correction=True</code>).</p>`,
    py: `import pandas as pd
from scipy import stats
df = pd.read_csv("etudiants.csv")
tab = pd.crosstab(df["sexe"], df["reussite"])
print(tab)
chi2, p, ddl, attendus = stats.chi2_contingency(tab)
print(round(chi2, 3), round(p, 4), ddl)
print(attendus.round(1))`,
    r: `df <- read.csv("etudiants.csv")
tab <- table(df$sexe, df$reussite)
tab
res <- chisq.test(tab)
res
res$expected`,
    quiz: [
      { q: 'Le khi-deux d\'indépendance s\'applique à…', options: ['2 variables quantitatives', '2 variables qualitatives', '1 quantitative et 1 qualitative', 'Des séries temporelles'], answer: 1, explain: 'On travaille sur un tableau de contingence.' },
      { q: 'Effectifs théoriques trop petits (< 5) dans un 2×2 :', options: ['On ignore', 'Test exact de Fisher', 'Test t', 'On double les effectifs'], answer: 1, explain: 'fisher.test() en R, stats.fisher_exact() en Python.' },
    ],
    exo: {
      prompt: 'Teste le lien entre filiere et reussite. Affiche les degrés de liberté du test.',
      py: { starter: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\nres = stats.chi2_contingency(pd.crosstab(df.filiere, df.reussite))\nprint(res[2])', expect: '3' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nres <- suppressWarnings(chisq.test(table(df$filiere, df$reussite)))\nprint(unname(res$parameter))', expect: '[1] 3' },
    },
    cards: [
      ['Degrés de liberté du khi-deux', '(lignes − 1) × (colonnes − 1)'],
      ['Effectif théorique d\'une case', 'total ligne × total colonne / total général'],
    ],
  },
  {
    id: 'l30', module: 'm6', title: 'ANOVA : comparer plus de deux groupes', minutes: 10,
    theory: `
<p>Pour comparer les moyennes de <strong>3 groupes ou plus</strong>, enchaîner les tests t gonfle le risque de faux positif. On utilise l'<strong>ANOVA à un facteur</strong>. H0 : toutes les moyennes sont égales.</p>
<p>L'ANOVA compare la variance <em>entre</em> les groupes à la variance <em>à l'intérieur</em> des groupes : c'est la statistique <strong>F</strong>.</p>
<p>Un résultat significatif dit seulement « au moins un groupe diffère ». Pour savoir lesquels, on fait un test <strong>post-hoc</strong> : Tukey HSD (<code>TukeyHSD()</code> en R, <code>statsmodels.stats.multicomp.pairwise_tukeyhsd</code> en Python).</p>
<p>Conditions : normalité des résidus, variances proches (test de Levene ou de Bartlett), indépendance. Alternative non paramétrique : Kruskal-Wallis.</p>`,
    py: `import pandas as pd
from scipy import stats
df = pd.read_csv("etudiants.csv")
groupes = [g["note"].values for _, g in df.groupby("filiere")]
F, p = stats.f_oneway(*groupes)
print(round(F, 3), round(p, 4))
# post-hoc :
# from statsmodels.stats.multicomp import pairwise_tukeyhsd
# print(pairwise_tukeyhsd(df["note"], df["filiere"]))`,
    r: `df <- read.csv("etudiants.csv")
modele <- aov(note ~ filiere, data = df)
summary(modele)
TukeyHSD(modele)`,
    quiz: [
      { q: 'Pourquoi ne pas faire 6 tests t pour comparer 4 groupes ?', options: ['C\'est trop long', 'Le risque global de faux positif augmente', 'Le test t ne marche qu\'une fois', 'C\'est interdit'], answer: 1, explain: 'Avec 6 tests à 5 %, la probabilité d\'au moins un faux positif approche 26 %.' },
      { q: 'Une ANOVA significative indique que…', options: ['Tous les groupes diffèrent', 'Au moins un groupe diffère', 'Les variances sont égales', 'Les données sont normales'], answer: 1, explain: 'Il faut un post-hoc pour savoir lesquels.' },
    ],
    exo: {
      prompt: 'ANOVA de note selon filiere : affiche la statistique F arrondie à 3 décimales.',
      py: { starter: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\ng = [x["note"].values for _, x in df.groupby("filiere")]\nprint(round(stats.f_oneway(*g).statistic, 3))', expect: '0.158' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(summary(aov(note ~ filiere, data = df))[[1]][1, "F value"], 3))', expect: '[1] 0.158' },
    },
    cards: [
      ['ANOVA à un facteur en R', 'summary(aov(y ~ groupe, data = df))'],
      ['Post-hoc après ANOVA', 'Tukey HSD : TukeyHSD() / pairwise_tukeyhsd()'],
    ],
  },
  {
    id: 'l31', module: 'm6', title: 'Tests non paramétriques et normalité', minutes: 9,
    theory: `
<p>Quand les données sont très asymétriques, ordinales (notes de satisfaction de 1 à 5) ou que les échantillons sont petits, on utilise des tests <strong>non paramétriques</strong> basés sur les rangs :</p>
<table><tr><th>Situation</th><th>Paramétrique</th><th>Non paramétrique</th></tr>
<tr><td>2 groupes indépendants</td><td>t de Welch</td><td>Mann-Whitney (Wilcoxon rang-somme)</td></tr>
<tr><td>2 mesures appariées</td><td>t apparié</td><td>Wilcoxon signé</td></tr>
<tr><td>3+ groupes</td><td>ANOVA</td><td>Kruskal-Wallis</td></tr>
<tr><td>Corrélation</td><td>Pearson</td><td>Spearman</td></tr></table>
<p>Pour vérifier la normalité : <strong>Shapiro-Wilk</strong> (<code>shapiro.test()</code> / <code>stats.shapiro()</code>) et surtout un graphique QQ-plot. Sur un grand échantillon, Shapiro rejette pour des écarts minuscules : le graphique compte plus que la p-value.</p>`,
    py: `import pandas as pd
from scipy import stats
df = pd.read_csv("etudiants.csv")
print(round(stats.shapiro(df["note"]).pvalue, 4))
f = df[df.sexe == "F"]["note"]; h = df[df.sexe == "H"]["note"]
print(round(stats.mannwhitneyu(f, h).pvalue, 4))
g = [x["note"] for _, x in df.groupby("filiere")]
print(round(stats.kruskal(*g).pvalue, 4))`,
    r: `df <- read.csv("etudiants.csv")
shapiro.test(df$note)
wilcox.test(note ~ sexe, data = df, exact = FALSE)
kruskal.test(note ~ filiere, data = df)
qqnorm(df$note); qqline(df$note)`,
    quiz: [
      { q: 'Alternative non paramétrique à l\'ANOVA :', options: ['Mann-Whitney', 'Kruskal-Wallis', 'Shapiro-Wilk', 'Fisher'], answer: 1, explain: 'Kruskal-Wallis compare 3 groupes ou plus avec les rangs.' },
      { q: 'Shapiro-Wilk : p = 0,001. On conclut…', options: ['Données normales', 'Écart significatif à la normalité', 'Test invalide', 'Moyennes différentes'], answer: 1, explain: 'H0 du Shapiro = normalité. On la rejette ici.' },
    ],
    exo: {
      prompt: 'Affiche la p-value du test de Shapiro-Wilk sur heures_etude (sans les NA), 4 décimales.',
      py: { starter: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\nfrom scipy import stats\ndf = pd.read_csv("etudiants.csv")\nprint(round(stats.shapiro(df["heures_etude"].dropna()).pvalue, 4))', expect: '0.1499' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(round(shapiro.test(df$heures_etude)$p.value, 4))', expect: '[1] 0.1499' },
    },
    cards: [
      ['Non paramétrique pour 2 groupes indépendants', 'Mann-Whitney : wilcox.test() / stats.mannwhitneyu()'],
      ['H0 du test de Shapiro-Wilk', 'Les données suivent une loi normale'],
    ],
  },

  // ───────────────────────── MODULE 7 ─────────────────────────
  {
    id: 'l32', module: 'm7', title: 'Régression linéaire simple', minutes: 12,
    theory: `
<p>La régression linéaire modélise <code>y = β0 + β1·x + ε</code>. <strong>β1</strong> (la pente) indique de combien <em>y</em> change en moyenne quand <em>x</em> augmente d'une unité. Les coefficients sont estimés par les <strong>moindres carrés</strong>.</p>
<p>À lire dans la sortie : les coefficients et leur p-value (H0 : β = 0), le <strong>R²</strong> (part de variance expliquée, entre 0 et 1) et l'erreur standard des résidus.</p>
<p>R : <code>lm(note ~ heures_etude, data = df)</code> puis <code>summary()</code>. Python : <code>statsmodels.formula.api.ols("note ~ heures_etude", data=df).fit()</code>, avec la <em>même formule</em> que R.</p>
<p>Vérifie les résidus : ils doivent être centrés, sans structure, de variance constante (<code>plot(modele)</code> en R).</p>`,
    py: `import pandas as pd
import statsmodels.formula.api as smf
df = pd.read_csv("etudiants.csv")
m = smf.ols("note ~ heures_etude", data=df).fit()
print(m.params.round(3))
print("R² =", round(m.rsquared, 3))
# print(m.summary())  # sortie complète`,
    r: `df <- read.csv("etudiants.csv")
m <- lm(note ~ heures_etude, data = df)
summary(m)
round(coef(m), 3)
round(summary(m)$r.squared, 3)`,
    quiz: [
      { q: 'Pente β1 = 0,6 pour note ~ heures_etude :', options: ['0,6 h d\'étude par point', '+0,6 point de note par heure d\'étude en plus, en moyenne', 'La note moyenne est 0,6', 'Corrélation de 0,6'], answer: 1, explain: 'La pente s\'exprime en unités de y par unité de x.' },
      { q: 'R² = 0,72 signifie…', options: ['72 % des prédictions sont justes', '72 % de la variance de y est expliquée par le modèle', 'r = 0,72', 'p = 0,72'], answer: 1, explain: 'Le R² est la part de variance expliquée.' },
      { q: 'Quelle bibliothèque Python accepte les formules à la R ?', options: ['numpy', 'statsmodels', 'matplotlib', 'requests'], answer: 1, explain: 'statsmodels.formula.api.ols("y ~ x", data=df).' },
    ],
    exo: {
      prompt: 'Ajuste note ~ heures_etude et affiche la pente arrondie à 3 décimales.',
      py: { starter: 'import pandas as pd\nimport statsmodels.formula.api as smf\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\nimport statsmodels.formula.api as smf\ndf = pd.read_csv("etudiants.csv")\nm = smf.ols("note ~ heures_etude", data=df).fit()\nprint(round(m.params["heures_etude"], 3))', expect: '0.569' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nm <- lm(note ~ heures_etude, data = df)\nprint(round(unname(coef(m)[2]), 3))', expect: '[1] 0.569' },
    },
    cards: [
      ['Régression linéaire : R / statsmodels', 'lm(y ~ x, data = df) / smf.ols("y ~ x", data=df).fit()'],
      ['Interprétation du R²', 'Part de la variance de y expliquée par le modèle'],
    ],
  },
  {
    id: 'l33', module: 'm7', title: 'Régression multiple et variables qualitatives', minutes: 12,
    theory: `
<p>La régression multiple ajoute plusieurs prédicteurs : <code>note ~ heures_etude + age + filiere</code>. Chaque coefficient s'interprète <strong>toutes choses égales par ailleurs</strong> : l'effet d'une variable quand les autres restent constantes.</p>
<p>Une variable qualitative est codée en <strong>variables indicatrices</strong> (dummies) : une modalité sert de référence, les coefficients des autres sont des écarts à cette référence. R et statsmodels le font automatiquement.</p>
<p>Pour comparer des modèles de tailles différentes, utilise le <strong>R² ajusté</strong> ou l'<strong>AIC</strong> (plus petit = meilleur). Surveille la <strong>multicolinéarité</strong> (prédicteurs très corrélés entre eux) avec le VIF.</p>`,
    py: `import pandas as pd
import statsmodels.formula.api as smf
df = pd.read_csv("etudiants.csv")
m = smf.ols("note ~ heures_etude + age + C(filiere)", data=df).fit()
print(m.params.round(3))
print("R² ajusté =", round(m.rsquared_adj, 3), "| AIC =", round(m.aic, 1))`,
    r: `df <- read.csv("etudiants.csv")
m <- lm(note ~ heures_etude + age + filiere, data = df)
round(coef(m), 3)
round(summary(m)$adj.r.squared, 3); round(AIC(m), 1)`,
    quiz: [
      { q: '« Toutes choses égales par ailleurs » signifie…', options: ['Les variables sont égales', 'Effet d\'une variable en gardant les autres constantes', 'Les coefficients sont égaux', 'Le R² est constant'], answer: 1, explain: 'C\'est l\'intérêt principal de la régression multiple.' },
      { q: 'Une variable qualitative à 4 modalités crée combien de coefficients ?', options: ['1', '3', '4', '5'], answer: 1, explain: '4 − 1 = 3 indicatrices, la 1re modalité sert de référence.' },
      { q: 'Pour comparer deux modèles, un AIC plus petit signifie…', options: ['Un moins bon modèle', 'Un meilleur compromis ajustement/complexité', 'Plus de variables', 'Un R² nul'], answer: 1, explain: 'L\'AIC pénalise la complexité.' },
    ],
    exo: {
      prompt: 'Ajuste note ~ heures_etude + age et affiche le R² ajusté arrondi à 3 décimales.',
      py: { starter: 'import pandas as pd\nimport statsmodels.formula.api as smf\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\nimport statsmodels.formula.api as smf\ndf = pd.read_csv("etudiants.csv")\nm = smf.ols("note ~ heures_etude + age", data=df).fit()\nprint(round(m.rsquared_adj, 3))', expect: '0.706' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nm <- lm(note ~ heures_etude + age, data = df)\nprint(round(summary(m)$adj.r.squared, 3))', expect: '[1] 0.706' },
    },
    cards: [
      ['Variable qualitative dans une formule statsmodels', 'C(variable)'],
      ['Nombre d\'indicatrices pour k modalités', 'k − 1 (une modalité de référence)'],
    ],
  },
  {
    id: 'l34', module: 'm7', title: 'Régression logistique', minutes: 12,
    theory: `
<p>Quand <em>y</em> est binaire (réussite oui/non, achat, défaut de paiement), on utilise la <strong>régression logistique</strong>. Elle modélise la probabilité <code>P(y = 1)</code> via la fonction logistique, qui reste entre 0 et 1.</p>
<p>Les coefficients sont sur l'échelle du <strong>log-odds</strong>. On les rend lisibles avec l'exponentielle : <code>exp(β)</code> est un <strong>odds ratio</strong>. OR = 1,5 → les chances de succès sont multipliées par 1,5 pour chaque unité de x en plus.</p>
<p>R : <code>glm(reussite ~ heures_etude, family = binomial, data = df)</code>. Python : <code>smf.logit("reussite ~ heures_etude", data=df).fit()</code>.</p>
<p>Prédire : <code>predict(m, type = "response")</code> / <code>m.predict()</code> donnent des probabilités ; on classe ensuite avec un seuil (souvent 0,5).</p>`,
    py: `import pandas as pd, numpy as np
import statsmodels.formula.api as smf
df = pd.read_csv("etudiants.csv")
m = smf.logit("reussite ~ heures_etude", data=df).fit(disp=0)
print(m.params.round(3))
print("odds ratio :", round(np.exp(m.params["heures_etude"]), 3))
print(m.predict(pd.DataFrame({"heures_etude": [5, 15]})).round(3))`,
    r: `df <- read.csv("etudiants.csv")
m <- glm(reussite ~ heures_etude, family = binomial, data = df)
round(coef(m), 3)
round(exp(coef(m)["heures_etude"]), 3)   # odds ratio
round(predict(m, data.frame(heures_etude = c(5, 15)), type = "response"), 3)`,
    quiz: [
      { q: 'La régression logistique sert à prédire…', options: ['Une variable continue', 'Une variable binaire', 'Un nombre d\'événements', 'Une date'], answer: 1, explain: 'Elle prédit une probabilité de y = 1.' },
      { q: 'Coefficient β = 0,4. L\'odds ratio vaut…', options: ['0,4', 'exp(0,4) ≈ 1,49', '1,4', 'log(0,4)'], answer: 1, explain: 'OR = exp(β).' },
      { q: 'Dans glm(), quel argument donne une logistique ?', options: ['type = "logit"', 'family = binomial', 'link = "logistic"', 'binary = TRUE'], answer: 1, explain: 'family = binomial (lien logit par défaut).' },
    ],
    exo: {
      prompt: 'Ajuste reussite ~ heures_etude et affiche l\'odds ratio de heures_etude arrondi à 2 décimales.',
      py: { starter: 'import pandas as pd, numpy as np\nimport statsmodels.formula.api as smf\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd, numpy as np\nimport statsmodels.formula.api as smf\ndf = pd.read_csv("etudiants.csv")\nm = smf.logit("reussite ~ heures_etude", data=df).fit(disp=0)\nprint(round(np.exp(m.params["heures_etude"]), 2))', expect: '2.17' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nm <- glm(reussite ~ heures_etude, family = binomial, data = df)\nprint(round(unname(exp(coef(m)[2])), 2))', expect: '[1] 2.17' },
    },
    cards: [
      ['Odds ratio à partir d\'un coefficient logistique', 'exp(β)'],
      ['Logistique : R / statsmodels', 'glm(y ~ x, family = binomial) / smf.logit("y ~ x", data=df)'],
    ],
  },
  {
    id: 'l35', module: 'm7', title: 'Évaluer un modèle : train/test et métriques', minutes: 11,
    theory: `
<p>Un modèle qui colle parfaitement aux données d'entraînement peut échouer sur de nouvelles données : c'est le <strong>surapprentissage</strong>. Pour l'éviter, on sépare les données en <strong>entraînement</strong> (≈ 70-80 %) et <strong>test</strong>, puis on évalue sur le test uniquement. La <strong>validation croisée</strong> répète l'opération sur plusieurs découpages.</p>
<p>Métriques en régression : <strong>RMSE</strong> (erreur quadratique moyenne, dans l'unité de y), <strong>MAE</strong>, R².</p>
<p>Métriques en classification : <strong>matrice de confusion</strong>, <strong>exactitude</strong> (accuracy), <strong>précision</strong> (parmi les positifs prédits, combien sont vrais), <strong>rappel</strong> (parmi les vrais positifs, combien sont détectés), <strong>AUC</strong>.</p>
<p>Outils : <code>scikit-learn</code> en Python (<code>train_test_split</code>, <code>metrics</code>) ; <code>tidymodels</code> ou <code>caret</code> en R.</p>`,
    py: `import pandas as pd, numpy as np
import statsmodels.formula.api as smf
df = pd.read_csv("etudiants.csv").dropna()
rng = np.random.default_rng(1)
idx = rng.permutation(len(df))
train, test = df.iloc[idx[:28]], df.iloc[idx[28:]]
m = smf.ols("note ~ heures_etude", data=train).fit()
pred = m.predict(test)
rmse = np.sqrt(((test["note"] - pred) ** 2).mean())
print("RMSE test :", round(rmse, 2))`,
    r: `df <- na.omit(read.csv("etudiants.csv"))
set.seed(1)
idx <- sample(nrow(df), 28)
train <- df[idx, ]; test <- df[-idx, ]
m <- lm(note ~ heures_etude, data = train)
pred <- predict(m, test)
round(sqrt(mean((test$note - pred)^2)), 2)   # RMSE test`,
    quiz: [
      { q: 'Pourquoi évaluer sur un jeu de test séparé ?', options: ['Pour aller plus vite', 'Pour mesurer la performance sur des données jamais vues', 'Pour augmenter le R²', 'C\'est facultatif'], answer: 1, explain: 'Sinon on mesure la mémorisation, pas la généralisation.' },
      { q: 'Un test médical doit rater le moins de malades possible. On maximise…', options: ['La précision', 'Le rappel', 'Le RMSE', 'L\'AIC'], answer: 1, explain: 'Rappel = part des vrais positifs détectés.' },
    ],
    exo: {
      prompt: 'Vrais = [1,0,1,1,0,1], prédits = [1,0,0,1,0,1]. Affiche l\'exactitude (accuracy).',
      py: { starter: 'import numpy as np\nvrai = np.array([1,0,1,1,0,1])\npred = np.array([1,0,0,1,0,1])\n', solution: 'import numpy as np\nvrai = np.array([1,0,1,1,0,1])\npred = np.array([1,0,0,1,0,1])\nprint(round((vrai == pred).mean(), 3))', expect: '0.833' },
      r: { starter: 'vrai <- c(1,0,1,1,0,1)\npred <- c(1,0,0,1,0,1)\n', solution: 'vrai <- c(1,0,1,1,0,1)\npred <- c(1,0,0,1,0,1)\nprint(round(mean(vrai == pred), 3))', expect: '[1] 0.833' },
    },
    cards: [
      ['Précision vs rappel', 'Précision : justesse des positifs prédits. Rappel : part des vrais positifs détectés.'],
      ['Formule du RMSE', '√(moyenne des (y − ŷ)²)'],
    ],
  },

  // ───────────────────────── MODULE 8 ─────────────────────────
  {
    id: 'l36', module: 'm8', title: 'Reproductibilité et bonnes pratiques', minutes: 8,
    theory: `
<p>Une analyse professionnelle doit pouvoir être <strong>refaite à l'identique</strong> par quelqu'un d'autre (ou par toi dans 6 mois).</p>
<ul><li><strong>Scripts plutôt que clics</strong> : tout le nettoyage est écrit dans le code, jamais à la main dans Excel.</li>
<li><strong>Documents dynamiques</strong> : <em>Quarto</em> (R et Python) ou <em>R Markdown</em> et <em>Jupyter</em> mêlent texte, code et résultats.</li>
<li><strong>Graines aléatoires</strong> fixées (<code>set.seed</code>, <code>default_rng</code>).</li>
<li><strong>Environnements</strong> : <code>renv</code> en R, <code>venv</code>/<code>requirements.txt</code> ou <code>conda</code> en Python, pour figer les versions des packages.</li>
<li><strong>Versionnement</strong> avec Git, et des noms de variables explicites (<code>snake_case</code>).</li>
<li>Données brutes en lecture seule, données nettoyées dans un dossier à part.</li></ul>`,
    py: `# Structure type d'un projet
# projet/
#   data/raw/        <- données brutes (jamais modifiées)
#   data/clean/
#   notebooks/analyse.ipynb
#   src/nettoyage.py
#   requirements.txt
import numpy as np
rng = np.random.default_rng(2026)
print(rng.integers(1, 100, size=3))   # toujours les mêmes nombres`,
    r: `# Structure type d'un projet RStudio
# projet/
#   projet.Rproj
#   data/raw/   data/clean/
#   R/nettoyage.R
#   rapport.qmd      <- Quarto
#   renv.lock        <- versions des packages
set.seed(2026)
sample(1:100, 3)   # toujours les mêmes nombres`,
    quiz: [
      { q: 'Quel outil fige les versions des packages R d\'un projet ?', options: ['git', 'renv', 'Quarto', 'CRAN'], answer: 1, explain: 'renv crée un fichier renv.lock.' },
      { q: 'Quarto permet de…', options: ['Héberger des données', 'Mêler texte, code R/Python et résultats dans un rapport', 'Remplacer pandas', 'Compiler du C'], answer: 1, explain: 'Successeur multi-langage de R Markdown.' },
    ],
    exo: null,
    cards: [
      ['Figer les dépendances : R / Python', 'renv / requirements.txt (pip) ou environment.yml (conda)'],
      ['Règle d\'or des données brutes', 'Ne jamais les modifier : tout nettoyage passe par le code'],
    ],
  },
  {
    id: 'l37', module: 'm8', title: 'Projet guidé : une analyse complète', minutes: 15,
    theory: `
<p>On met tout ensemble sur <code>etudiants.csv</code>. Question : <strong>le temps d'étude explique-t-il la réussite, et cela dépend-il de la filière ?</strong></p>
<ol><li><strong>Importer et inspecter</strong> : dimensions, types, valeurs manquantes.</li>
<li><strong>Nettoyer</strong> : traiter les 2 NA de heures_etude (suppression ou imputation, et justifier ce choix).</li>
<li><strong>Décrire</strong> : moyenne, médiane, écart-type des notes ; réussite par filière.</li>
<li><strong>Visualiser</strong> : nuage heures × note coloré par filière, boxplots par filière.</li>
<li><strong>Tester</strong> : corrélation heures/note, ANOVA note ~ filiere.</li>
<li><strong>Modéliser</strong> : <code>note ~ heures_etude + filiere</code> et logistique pour la réussite.</li>
<li><strong>Conclure</strong> en 3 phrases pour un non-statisticien, avec les limites (40 étudiants, données observationnelles, donc pas de causalité).</li></ol>
<p>Lance le code ci-dessous dans le Labo, puis modifie-le. Si tu bloques, demande au tuteur.</p>`,
    py: `import pandas as pd
import statsmodels.formula.api as smf
from scipy import stats
df = pd.read_csv("etudiants.csv")
print(df.shape, df.isna().sum().sum(), "NA")
df = df.dropna()
print(df.groupby("filiere")[["note", "reussite"]].mean().round(2))
r, p = stats.pearsonr(df["heures_etude"], df["note"])
print("corrélation :", round(r, 2), "p =", round(p, 4))
m = smf.ols("note ~ heures_etude + C(filiere)", data=df).fit()
print(m.params.round(2), "\\nR² ajusté :", round(m.rsquared_adj, 2))`,
    r: `df <- read.csv("etudiants.csv")
dim(df); sum(is.na(df))
df <- na.omit(df)
aggregate(cbind(note, reussite) ~ filiere, data = df, FUN = function(x) round(mean(x), 2))
cor.test(df$heures_etude, df$note)
m <- lm(note ~ heures_etude + filiere, data = df)
round(coef(m), 2); round(summary(m)$adj.r.squared, 2)`,
    quiz: [
      { q: 'Peut-on conclure que « étudier plus cause de meilleures notes » à partir de ces données ?', options: ['Oui, la corrélation est forte', 'Non, les données sont observationnelles', 'Oui si p < 0,05', 'Oui avec la régression multiple'], answer: 1, explain: 'Sans expérience contrôlée, des facteurs de confusion (motivation, niveau initial) peuvent expliquer le lien.' },
    ],
    exo: {
      prompt: 'Après suppression des NA, combien de lignes reste-t-il ?',
      py: { starter: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\n', solution: 'import pandas as pd\ndf = pd.read_csv("etudiants.csv")\nprint(len(df.dropna()))', expect: '38' },
      r: { starter: 'df <- read.csv("etudiants.csv")\n', solution: 'df <- read.csv("etudiants.csv")\nprint(nrow(na.omit(df)))', expect: '[1] 38' },
    },
    cards: [
      ['Les 7 étapes du projet guidé', 'Importer, nettoyer, décrire, visualiser, tester, modéliser, conclure (avec limites)'],
    ],
  },
];

// Défis quotidiens : petites questions variées tirées chaque jour (en plus des quiz de leçon).
const DAILY_POOL = LESSONS.flatMap(l => l.quiz.map(q => ({ ...q, lesson: l.id })));

if (typeof module !== 'undefined') module.exports = { MODULES, LESSONS };
