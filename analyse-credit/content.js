// Fiches méthode et générateurs d'exercices (chiffres aléatoires à chaque tirage).

const FICHES = [
  {
    id: 'methode', title: 'La méthode en 7 étapes', tag: 'Démarche',
    usage: 'Analyser un dossier de crédit toujours dans le même ordre, pour ne rien oublier.',
    formula: '1. Comprendre l’entreprise et la demande\n2. Activité : évolution du CA\n3. Rentabilité : VA, EBE, résultat net\n4. Équilibre : FR, BFR, trésorerie nette\n5. Délais : clients, stocks, fournisseurs\n6. Endettement : CAF, dette / CAF, gearing\n7. Décision : forces, faiblesses, garanties, conditions',
    lecture: 'On lit toujours 3 exercices : une tendance compte plus qu’une photo. Chaque chiffre doit répondre à la question « est-ce que l’entreprise pourra rembourser avec l’argent qu’elle génère ? ».',
    piege: 'Commencer par les garanties. Une garantie sert à limiter la perte si ça tourne mal, elle ne rend pas un dossier remboursable.',
    exemple: 'Cas TransExpress : activité en forte hausse et rentabilité correcte, mais l’étape 4 révèle une trésorerie de –300 M. La décision change complètement.',
  },
  {
    id: 'ebe', title: 'Valeur ajoutée et EBE', tag: 'Rentabilité',
    usage: 'Mesurer ce que l’activité rapporte avant toute politique de financement ou d’amortissement. C’est l’indicateur n°1 du banquier.',
    formula: 'VA = CA − achats consommés − services extérieurs\nEBE = VA − impôts et taxes − charges de personnel\nMarge d’EBE = EBE / CA',
    lecture: 'Au-dessus de 12 % : confortable pour la plupart des PME. Entre 5 et 12 % : à surveiller selon le secteur. Sous 5 % : fragile. Le négoce a naturellement des marges faibles, les services des marges élevées.',
    piege: 'Comparer la marge d’un grossiste avec celle d’un prestataire de services. Toujours comparer à des entreprises du même secteur et regarder la tendance.',
    exemple: 'Boulangerie 2025 : VA = 510 − 214 − 53 = 243 ; EBE = 243 − 7 − 131 = 105 M, soit 20,6 % du CA.',
  },
  {
    id: 'caf', title: 'Capacité d’autofinancement (CAF)', tag: 'Remboursement',
    usage: 'C’est l’argent que l’entreprise génère chaque année pour rembourser ses emprunts, investir et verser des dividendes.',
    formula: 'CAF (méthode additive simplifiée) = résultat net + dotations aux amortissements et provisions − reprises\nCapacité de remboursement = dettes financières / CAF',
    lecture: 'Dette financière / CAF inférieure à 3 ans : bon. Entre 3 et 5 ans : acceptable. Au-delà de 5 ans : risqué. Une CAF négative signifie que l’entreprise ne peut rien rembourser par elle-même.',
    piege: 'Oublier que les plus-values de cession (HAO) gonflent le résultat mais ne se répètent pas : pour une vraie analyse, on les retire de la CAF.',
    exemple: 'Boulangerie 2025 : CAF = 59,5 + 22 = 81,5 M. Dette financière de 30 M, soit 0,4 an de CAF.',
  },
  {
    id: 'frbfr', title: 'FR, BFR et trésorerie nette', tag: 'Équilibre',
    usage: 'Savoir si le cycle d’exploitation (stocks, clients, fournisseurs) est financé par des ressources stables ou par du découvert.',
    formula: 'FR = (capitaux propres + dettes financières) − immobilisations nettes\nBFR = (stocks + créances clients + autres créances) − (fournisseurs + dettes fiscales et sociales)\nTrésorerie nette = FR − BFR = trésorerie actif − trésorerie passif',
    lecture: 'Une trésorerie nette positive veut dire que le FR finance tout le BFR. Si elle est négative, c’est le découvert qui finance l’exploitation : dangereux si ça dure. Un BFR négatif (commerce au comptant) est une force.',
    piege: 'L’« effet ciseaux » : une entreprise qui grandit vite voit son BFR grimper plus vite que son FR. Elle peut être rentable et quand même tomber à court de cash.',
    exemple: 'TransExpress 2025 : FR = 70 M, BFR = 370 M, donc trésorerie nette = –300 M, financée par le découvert.',
  },
  {
    id: 'delais', title: 'Délais clients, stocks, fournisseurs', tag: 'Exploitation',
    usage: 'Comprendre pourquoi le BFR bouge et quel levier actionner.',
    formula: 'Délai clients (DSO) = créances clients / CA × 360\nRotation des stocks (DIO) = stocks / achats consommés × 360\nDélai fournisseurs (DPO) = fournisseurs / (achats + services extérieurs) × 360',
    lecture: 'Plus le DSO et le DIO sont longs et le DPO court, plus le BFR est lourd. Chaque jour de délai client en plus immobilise environ CA / 360 de trésorerie.',
    piege: 'Calculer sur le CA hors taxes alors que les créances sont TTC : en pratique, les banques corrigent souvent de la TVA (18 % en Côte d\u2019Ivoire). Ici on reste en HT pour simplifier.',
    exemple: 'TransExpress : 1 150 M de CA / 360 = 3,2 M par jour. Réduire le délai clients de 147 à 120 jours libérerait environ 86 M de trésorerie.',
  },
  {
    id: 'structure', title: 'Autonomie financière et gearing', tag: 'Solvabilité',
    usage: 'Mesurer le poids des dettes par rapport à l’argent des associés, c’est-à-dire le « matelas » en cas de pertes.',
    formula: 'Autonomie financière = capitaux propres / total bilan\nGearing = (dettes financières + découverts − trésorerie actif) / capitaux propres',
    lecture: 'Autonomie supérieure à 35 % : solide. Sous 20 % : fragile. Gearing inférieur à 1 : bon. Au-dessus de 2 : très endetté. Un gearing négatif veut dire que la trésorerie dépasse les dettes.',
    piege: 'Des fonds propres qui baissent d’une année sur l’autre signalent des pertes ou des dividendes excessifs. Regarder toujours l’évolution.',
    exemple: 'Agro Négoce 2025 : autonomie de 9 % et gearing supérieur à 7. Les associés ne portent presque plus de risque, c’est la banque qui le porte.',
  },
  {
    id: 'couverture', title: 'Couverture des frais financiers', tag: 'Remboursement',
    usage: 'Vérifier que l’exploitation paie largement les intérêts.',
    formula: 'Couverture = EBE / frais financiers\nDSCR (couverture du service de la dette) = CAF / (échéances en capital + intérêts)',
    lecture: 'Couverture supérieure à 5 : confortable ; sous 2,5 : tendu ; sous 1 : l’exploitation ne paie même plus les intérêts. Pour un nouveau prêt, on veut un DSCR d’au moins 1,3.',
    piege: 'Regarder seulement le taux d’intérêt. Un taux bas ne sert à rien si l’échéance dépasse ce que l’entreprise génère.',
    exemple: 'Agro Négoce 2025 : EBE de 6 M pour 85 M de frais financiers, soit une couverture de 0,07. Situation critique.',
  },
  {
    id: '5c', title: 'Les 5 C du crédit', tag: 'Décision',
    usage: 'Grille qualitative utilisée par les banques pour compléter les chiffres.',
    formula: 'Character : moralité, historique bancaire, expérience du dirigeant\nCapacity : capacité de remboursement (CAF, DSCR)\nCapital : fonds propres, apport personnel\nCollateral : garanties (hypothèque, nantissement, caution)\nConditions : secteur, conjoncture, objet du crédit',
    lecture: 'La capacité est le critère principal. Les garanties viennent en dernier : elles réduisent la perte, pas la probabilité de défaut.',
    piege: 'Un client sympathique avec une belle garantie mais sans CAF reste un mauvais dossier.',
    exemple: 'Agro Négoce : collateral (terrains) correct, mais capacity nulle et capital en fonte. Refus.',
  },
  {
    id: 'financement', title: 'Quel crédit pour quel besoin ?', tag: 'Structuration',
    usage: 'Adapter l’outil au besoin : c’est la règle d’or de l’équilibre financier.',
    formula: 'Investissement (machines, bâtiments) → crédit à moyen/long terme, amortissable\nBFR permanent → fonds de roulement : capitaux propres ou crédit MT\nBesoins saisonniers → crédit de campagne, découvert ponctuel\nCréances sur clients solvables → escompte, affacturage, avances sur marchés\nBesoin ponctuel de caisse → facilité de caisse',
    lecture: 'La durée du financement doit correspondre à la durée du besoin. Financer un besoin long avec un crédit court crée une tension permanente sur la trésorerie.',
    piege: 'Financer des camions ou un BFR structurel avec un découvert : le découvert devient « dur » et la banque ne peut plus le réduire sans provoquer la faillite.',
    exemple: 'TransExpress : on remplace une partie du découvert par une ligne de mobilisation de créances et un crédit MT.',
  },
];

// ---------- Générateurs d'exercices ----------
const rnd = (min, max, step = 1) => Math.round((min + Math.random() * (max - min)) / step) * step;
const r1 = v => Math.round(v * 10) / 10;
const f = v => v.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

const EXERCISES = [
  {
    id: 'ebe', cat: 'Rentabilité', title: 'Calculer l’EBE',
    gen() {
      const ca = rnd(200, 1500, 10), achats = r1(ca * rnd(35, 60) / 100), se = r1(ca * rnd(6, 14) / 100);
      const it = r1(ca * rnd(1, 3) / 100), cp = r1(ca * rnd(12, 28) / 100);
      const va = r1(ca - achats - se), ebe = r1(va - it - cp);
      return {
        context: 'Une PME de distribution vous transmet son compte de résultat.',
        data: [['Chiffre d’affaires', ca], ['Achats consommés', achats], ['Services extérieurs', se], ['Impôts et taxes', it], ['Charges de personnel', cp], ['Dotations aux amortissements', r1(ca * 0.04)]],
        question: 'Quel est l’EBE (en M FCFA) ?', answer: ebe, unit: 'M',
        solution: `VA = ${f(ca)} − ${f(achats)} − ${f(se)} = ${f(va)}\nEBE = ${f(va)} − ${f(it)} − ${f(cp)} = ${f(ebe)} M\nMarge d’EBE = ${f(r1(ebe / ca * 100))} %`,
        lesson: 'Les dotations aux amortissements ne comptent pas dans l’EBE : c’est justement ce qui en fait un bon indicateur de la performance « cash » de l’exploitation.',
      };
    },
  },
  {
    id: 'caf', cat: 'Remboursement', title: 'Calculer la CAF',
    gen() {
      const rn = rnd(-20, 80), dot = rnd(10, 60), rep = rnd(0, 8), pv = rnd(0, 15);
      const caf = rn + dot - rep - pv;
      return {
        context: 'Extrait du compte de résultat d’un industriel.',
        data: [['Résultat net', rn], ['Dotations aux amortissements et provisions', dot], ['Reprises de provisions', rep], ['Plus-value de cession d’immobilisation (HAO)', pv]],
        question: 'Quelle est la CAF (méthode additive, en M FCFA) ?', answer: caf, unit: 'M',
        solution: `CAF = résultat net + dotations − reprises − plus-values de cession\nCAF = ${rn} + ${dot} − ${rep} − ${pv} = ${caf} M`,
        lesson: 'La plus-value de cession est un produit ponctuel : on la retire de la CAF parce qu’elle ne se reproduira pas l’an prochain pour rembourser le prêt.',
      };
    },
  },
  {
    id: 'bfr', cat: 'Équilibre', title: 'Calculer le BFR',
    gen() {
      const st = rnd(20, 300), cl = rnd(30, 400), ac = rnd(0, 40), fo = rnd(20, 250), dfs = rnd(5, 60);
      const bfr = st + cl + ac - fo - dfs;
      return {
        context: 'Postes du bilan d’une entreprise commerciale.',
        data: [['Stocks', st], ['Créances clients', cl], ['Autres créances', ac], ['Dettes fournisseurs', fo], ['Dettes fiscales et sociales', dfs], ['Trésorerie actif', rnd(5, 50)]],
        question: 'Quel est le BFR (en M FCFA) ?', answer: bfr, unit: 'M',
        solution: `Actif circulant = ${st} + ${cl} + ${ac} = ${st + cl + ac}\nPassif circulant = ${fo} + ${dfs} = ${fo + dfs}\nBFR = ${st + cl + ac} − ${fo + dfs} = ${bfr} M`,
        lesson: 'La trésorerie n’entre pas dans le BFR : c’est justement la variable d’ajustement (TN = FR − BFR).',
      };
    },
  },
  {
    id: 'tn', cat: 'Équilibre', title: 'FR, BFR et trésorerie',
    gen() {
      const cp = rnd(100, 500), df = rnd(0, 300), immo = rnd(100, 600), bfr = rnd(-30, 350);
      const fr = cp + df - immo, tn = fr - bfr;
      return {
        context: 'Vous disposez des masses du bilan fonctionnel.',
        data: [['Capitaux propres', cp], ['Dettes financières MLT', df], ['Immobilisations nettes', immo], ['BFR', bfr]],
        question: 'Quelle est la trésorerie nette (en M FCFA) ?', answer: tn, unit: 'M',
        solution: `FR = ${cp} + ${df} − ${immo} = ${fr}\nTN = FR − BFR = ${fr} − (${bfr}) = ${tn} M`,
        lesson: tn < 0 ? 'Trésorerie négative : le découvert finance une partie de l’exploitation. Il faut regarder si c’est ponctuel (saisonnalité) ou structurel.' : 'Trésorerie positive : le fonds de roulement couvre tout le besoin d’exploitation.',
      };
    },
  },
  {
    id: 'dso', cat: 'Exploitation', title: 'Délai clients',
    gen() {
      const ca = rnd(300, 2000, 10), days = rnd(20, 150), cl = r1(ca * days / 360);
      const ans = r1(cl / ca * 360);
      return {
        context: 'Un fournisseur de matériel BTP travaille avec des entreprises privées et des collectivités.',
        data: [['Chiffre d’affaires annuel', ca], ['Créances clients', cl]],
        question: 'Quel est le délai moyen de paiement des clients (en jours) ?', answer: ans, unit: 'j', tol: 1,
        solution: `DSO = ${f(cl)} / ${f(ca)} × 360 = ${f(ans)} jours`,
        lesson: `Chaque jour de délai en moins libérerait environ ${f(r1(ca / 360))} M de trésorerie (CA / 360).`,
      };
    },
  },
  {
    id: 'dio', cat: 'Exploitation', title: 'Rotation des stocks',
    gen() {
      const achats = rnd(200, 1500, 10), days = rnd(15, 120), st = r1(achats * days / 360);
      const ans = r1(st / achats * 360);
      return {
        context: 'Un grossiste en produits alimentaires.',
        data: [['Achats consommés de l’année', achats], ['Stock moyen', st]],
        question: 'Combien de jours d’achats le stock représente-t-il ?', answer: ans, unit: 'j', tol: 1,
        solution: `DIO = ${f(st)} / ${f(achats)} × 360 = ${f(ans)} jours`,
        lesson: 'Pour des produits périssables ou à prix volatils, un stock supérieur à 90 jours doit alerter : risque de pertes et de dépréciation.',
      };
    },
  },
  {
    id: 'capa', cat: 'Remboursement', title: 'Capacité de remboursement',
    gen() {
      const caf = rnd(20, 150), df = rnd(40, 700);
      const ans = r1(df / caf);
      return {
        context: 'Une entreprise demande un nouveau prêt. Avant le nouveau prêt :',
        data: [['Dettes financières existantes', df], ['CAF annuelle', caf]],
        question: 'Combien d’années de CAF faut-il pour rembourser la dette ?', answer: ans, unit: 'ans', tol: 0.1,
        solution: `Capacité de remboursement = ${df} / ${caf} = ${f(ans)} ans`,
        lesson: ans <= 3 ? 'Moins de 3 ans : bonne capacité, il y a de la marge pour un nouveau prêt.' : ans <= 5 ? 'Entre 3 et 5 ans : acceptable, mais le nouveau prêt doit rester modéré.' : 'Plus de 5 ans : endettement lourd. Un nouveau prêt nécessite un apport ou une hausse de la CAF.',
      };
    },
  },
  {
    id: 'annuite', cat: 'Remboursement', title: 'Annuité d’un prêt',
    gen() {
      const p = rnd(20, 500, 5), rate = rnd(6, 13) / 100, n = rnd(3, 10);
      const a = p * rate / (1 - (1 + rate) ** -n);
      const ans = r1(a);
      return {
        context: 'Une PME emprunte pour acheter des équipements, remboursables par annuités constantes.',
        data: [['Montant emprunté', p], ['Taux annuel', (rate * 100) + ' %'], ['Durée', n + ' ans']],
        question: 'Quelle est l’annuité constante (en M FCFA) ?', answer: ans, unit: 'M', tol: 0.02,
        solution: `a = P × t / (1 − (1 + t)^−n)\na = ${p} × ${f(rate)} / (1 − ${f(1 + rate)}^−${n}) = ${f(ans)} M\nCoût total des intérêts = ${f(r1(a * n - p))} M`,
        lesson: 'Pour que le prêt soit supportable, on veut en général une CAF d’au moins 1,3 fois l’annuité (DSCR ≥ 1,3).',
      };
    },
  },
  {
    id: 'autonomie', cat: 'Solvabilité', title: 'Autonomie financière',
    gen() {
      const cp = rnd(50, 600), total = rnd(cp + 100, cp * 5 + 200);
      const ans = r1(cp / total * 100);
      return {
        context: 'Structure du passif d’une société.',
        data: [['Capitaux propres', cp], ['Total bilan', total]],
        question: 'Quelle est l’autonomie financière (en %) ?', answer: ans, unit: '%', tol: 0.5,
        solution: `Autonomie = ${cp} / ${total} = ${f(ans)} %`,
        lesson: ans >= 35 ? 'Au-dessus de 35 % : structure solide.' : ans >= 20 ? 'Entre 20 et 35 % : correct, mais on surveille.' : 'Sous 20 % : les associés portent peu de risque. La banque demandera souvent un renforcement des fonds propres.',
      };
    },
  },
  {
    id: 'couv', cat: 'Rentabilité', title: 'Couverture des frais financiers',
    gen() {
      const ebe = rnd(5, 200), ff = rnd(3, 60);
      const ans = r1(ebe / ff);
      return {
        context: 'Données de l’exercice écoulé.',
        data: [['EBE', ebe], ['Frais financiers', ff]],
        question: 'Combien de fois l’EBE couvre-t-il les frais financiers ?', answer: ans, unit: 'x', tol: 0.1,
        solution: `Couverture = ${ebe} / ${ff} = ${f(ans)} x`,
        lesson: ans >= 5 ? 'Confortable.' : ans >= 2.5 ? 'Tendu : une baisse d’activité peut vite rendre les intérêts difficiles à payer.' : 'Critique : la rentabilité de l’exploitation ne suffit presque plus à payer les intérêts.',
      };
    },
  },
];
