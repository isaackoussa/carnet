# Cabinet de Lecture

> Ce dépôt contient aussi **Atelier Crédit** (`analyse-credit/`), une app pour pratiquer l'analyse financière et crédit. Voir `analyse-credit/README.md`.

App web pour extraire l'essentiel de tes ebooks, générer des quiz et lancer des réflexions/débats, avec rappels de lecture.

## Déploiement (comme gbaka-app)

1. Crée un repo GitHub (ex: `isaackoussa/cabinet-lecture`) et pousse ces fichiers.
2. Connecte ce repo à Netlify (New site from Git).
3. Dans Netlify → Site settings → Environment variables, ajoute :
   - `ANTHROPIC_API_KEY` = ta clé API (depuis console.anthropic.com)
4. Déploie. Netlify détecte automatiquement `netlify/functions/analyze.js`.

**Tant que la clé API n'est pas configurée**, l'app fonctionne quand même : bibliothèque pré-remplie, saisie manuelle d'extraits, et rappels de lecture marchent sans API. Seuls l'upload PDF, l'ajout par titre, le quiz et la réflexion ont besoin de la clé.

## Bibliothèque pré-remplie (10 livres, résumés écrits directement dans le code, sans coût API)

1. Trading the Line — How to Use Trendlines to Spot Reversals and Ride Trends
2. Devenir riche, ça s'apprend ! En 7 étapes
3. L'art de négocier avec la méthode Harvard
4. Construire son réseau d'entreprise
5. Le Personal MBA
6. Manipulation : ne vous laissez plus faire !
7. Comment parler en public
8. Créer votre propre entreprise (Office Consultant, version 2009)
9. L'Argent partout et toujours (Coach Patrick Armand Pognon)
10. Les politiques publiques (Pierre Muller, Que sais-je ?)

Pour ajouter d'autres livres pré-remplis sans API, éditer le tableau `SEED_BOOKS` en haut de `app.js`.

## Les 3 façons d'ajouter un livre (une fois la clé API branchée)

1. **Upload PDF** : extraction automatique de vrais extraits (limité aux 60 premières pages actuellement — modifiable dans `app.js`, fonction `extractPdfText`)
2. **Saisie manuelle** : coller un passage ou écrire ses propres notes
3. **Par titre seul** : donner titre + auteur, l'IA génère un résumé/points clés à partir de sa connaissance générale du livre (pas des extraits exacts — clairement étiqueté "Résumé IA")

## Fonctionnalités

- **Bibliothèque** : les 3 options ci-dessus, fiches par livre avec liste des extraits
- **Quiz** : génère un QCM à partir des extraits d'un livre choisi
- **Réflexion** : lance une question ouverte sur un livre et discute avec l'IA comme un partenaire de débat
- **Rappels** : notifications du navigateur à 9h, 13h et 19h (tant qu'un onglet de l'app est ouvert)

## Coûts API (tarifs Claude Sonnet 5, intro jusqu'au 31/08/2026 : 2 $/million tokens entrée, 10 $/million sortie)

- Ajout par titre seul : < 0,01 $ par livre
- Extraction PDF (60 pages actuelles) : quelques centimes par livre ; livre entier de 400 pages ≈ 0,40-0,50 $
- Quiz / réflexion : quelques millièmes de dollar par génération

## Limites actuelles

- Les livres/extraits sont stockés uniquement dans le navigateur (pas de synchronisation entre appareils pour l'instant — peut être ajouté avec Netlify Blobs comme pour gbaka-app).
- Les notifications ne fonctionnent que si un onglet du navigateur reste ouvert. Pour des vraies notifications push (app fermée), il faudra un service worker + un serveur push, en évolution future.
- L'extraction PDF se limite aux 60 premières pages pour rester raisonnable en taille d'appel API.
- Les fichiers EPUB ne sont pas encore supportés (uniquement PDF ou texte collé pour l'instant).

## Prochaine étape

Dès que la clé API Anthropic est prête : la brancher dans Netlify, tester l'upload PDF, le quiz et la réflexion.

