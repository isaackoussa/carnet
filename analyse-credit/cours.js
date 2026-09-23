// Partie « Cours » : fiches détaillées par ratio et chapitres, avec quiz d'interprétation.
// Les exemples chiffrés sont calculés à partir de l'entreprise choisie dans les cas pratiques.

const n1 = v => (Math.round(v * 10) / 10).toLocaleString('fr-FR');

const RATIOS = {
  tauxVA: {
    name: 'Taux de valeur ajoutée', family: 'Activité',
    formula: 'Taux de VA = valeur ajoutée / chiffre d’affaires',
    measure: 'La part du chiffre d’affaires qui correspond à la richesse créée par l’entreprise elle-même, une fois payés les fournisseurs de biens et de services. Il mesure son degré d’« intégration » : fait-elle beaucoup elle-même, ou revend-elle surtout ce qu’elle achète ?',
    calc: (y, m) => `VA = ${y.ca} − ${y.achats} − ${y.servicesExt} = ${n1(m.va)}\nTaux de VA = ${n1(m.va)} / ${y.ca} = ${E.fmt(m.tauxVA, 'pct')}`,
    grille: [
      ['Moins de 15 %', 'Activité de négoce ou de distribution : on revend beaucoup, on transforme peu. Normal si le volume est important.', 'warn'],
      ['15 à 40 %', 'Industrie légère, artisanat, BTP, transport : l’entreprise transforme ou apporte un vrai service.', 'good'],
      ['Plus de 40 %', 'Services, santé, conseil, éducation : l’essentiel de la valeur vient des compétences du personnel.', 'good'],
    ],
    secteurs: [['Négoce / grossiste', '5 à 15 %'], ['Commerce de détail', '15 à 25 %'], ['Industrie, boulangerie', '35 à 50 %'], ['Services, santé', '55 à 75 %']],
    leviers: ['Mieux négocier les achats et les services extérieurs', 'Internaliser des tâches sous-traitées', 'Monter en gamme (vendre plus cher le même produit)'],
    pieges: ['Ce n’est pas un ratio de performance : un taux de VA faible n’est pas « mauvais » en soi. Comparez toujours avec le secteur.', 'Une baisse du taux de VA sur plusieurs années, dans un même métier, signale en revanche une pression sur les prix de vente ou une hausse des coûts d’achat.'],
  },
  chargesPersoVA: {
    name: 'Charges de personnel / VA', family: 'Activité',
    formula: 'Charges de personnel / valeur ajoutée',
    measure: 'La part de la richesse créée qui est versée aux salariés. Ce qui reste (après impôts et taxes) forme l’EBE, qui rémunère les prêteurs, l’État et les associés, et finance l’investissement.',
    calc: (y, m) => `${y.chargesPersonnel} / ${n1(m.va)} = ${E.fmt(m.chargesPersoVA, 'pct')}`,
    grille: [
      ['Moins de 60 %', 'Il reste une part confortable de la VA pour l’EBE.', 'good'],
      ['60 à 75 %', 'Normal dans les métiers de main-d’œuvre (santé, services), à surveiller ailleurs.', 'warn'],
      ['Plus de 75 %', 'La masse salariale absorbe presque toute la richesse créée : l’EBE devient trop mince.', 'bad'],
    ],
    secteurs: [['Négoce', '30 à 50 %'], ['Industrie', '50 à 65 %'], ['Santé, services', '60 à 75 %']],
    leviers: ['Augmenter la VA (volumes, prix) plus vite que la masse salariale', 'Améliorer la productivité (organisation, équipements)'],
    pieges: ['Dans une entreprise individuelle ou une SARL familiale, la rémunération du dirigeant est parfois prise en prélèvements plutôt qu’en salaires : le ratio paraît alors meilleur qu’il ne l’est.'],
  },
  margeEbe: {
    name: 'Marge d’EBE', family: 'Rentabilité',
    formula: 'Marge d’EBE = EBE / chiffre d’affaires',
    measure: 'Ce que l’exploitation dégage en cash sur 100 FCFA de ventes, avant les amortissements, les intérêts et l’impôt. C’est l’indicateur préféré des banquiers : il ne dépend ni de la politique d’amortissement, ni de la manière dont l’entreprise est financée.',
    calc: (y, m) => `EBE = VA ${n1(m.va)} − impôts et taxes ${y.impotsTaxes} − personnel ${y.chargesPersonnel} = ${n1(m.ebe)}\nMarge d’EBE = ${n1(m.ebe)} / ${y.ca} = ${E.fmt(m.margeEbe, 'pct')}`,
    grille: [
      ['Plus de 12 %', 'Rentabilité confortable pour la plupart des PME.', 'good'],
      ['5 à 12 %', 'Correcte, à comparer au secteur. Vigilance si elle baisse.', 'warn'],
      ['Moins de 5 %', 'Fragile (sauf négoce à gros volumes) : le moindre choc peut rendre l’EBE négatif.', 'bad'],
    ],
    secteurs: [['Négoce de produits agricoles', '2 à 6 %'], ['Distribution de matériaux', '6 à 10 %'], ['Transport', '12 à 20 %'], ['Boulangerie, restauration', '12 à 22 %'], ['Santé privée, télécoms', '20 à 35 %']],
    leviers: ['Hausse des prix de vente', 'Baisse du coût des achats (négociation, centrale d’achat)', 'Maîtrise des frais fixes (loyers, énergie, personnel)', 'Abandon des produits ou clients non rentables'],
    pieges: ['Une marge d’EBE élevée ne dit rien de la trésorerie : TransExpress a 17 % de marge et une trésorerie de –300 M.', 'Toujours regarder la tendance sur 3 ans. Une marge qui passe de 5 % à 0,3 % (Agro Négoce) est plus grave qu’une marge faible mais stable (coop cacao).'],
  },
  margeNette: {
    name: 'Marge nette', family: 'Rentabilité',
    formula: 'Marge nette = résultat net / chiffre d’affaires',
    measure: 'Ce qui reste pour les associés sur 100 FCFA de ventes, après toutes les charges : amortissements, intérêts, éléments exceptionnels (HAO) et impôt.',
    calc: (y, m) => `Résultat net = ${n1(m.rn)}\nMarge nette = ${n1(m.rn)} / ${y.ca} = ${E.fmt(m.margeNette, 'pct')}`,
    grille: [
      ['Plus de 5 %', 'Bonne rentabilité finale.', 'good'],
      ['1 à 5 %', 'Positive mais mince.', 'warn'],
      ['Moins de 1 %', 'L’entreprise gagne à peine sa vie, ou perd de l’argent.', 'bad'],
    ],
    secteurs: [['Négoce', '0,5 à 3 %'], ['PME industrielles et services', '3 à 8 %'], ['Santé privée', '8 à 12 %']],
    leviers: ['Tous les leviers de l’EBE', 'Réduire l’endettement (moins d’intérêts)', 'Éviter les investissements qui génèrent plus d’amortissements que de marge'],
    pieges: ['Le résultat net peut être gonflé par une plus-value HAO (vente d’un terrain, d’un véhicule). Retirez-la pour juger la rentabilité récurrente.', 'Un écart important entre marge d’EBE et marge nette révèle des amortissements ou des frais financiers lourds.'],
  },
  roce: {
    name: 'Rentabilité économique (ROCE)', family: 'Rentabilité',
    formula: 'ROCE = résultat d’exploitation / (immobilisations nettes + BFR)',
    measure: 'Ce que rapporte chaque franc investi dans l’outil de production (machines, bâtiments) et dans le cycle d’exploitation, quelle que soit l’origine de l’argent (associés ou banque).',
    calc: (y, m) => `Capitaux engagés = immobilisations ${y.immoNettes} + BFR ${n1(m.bfr)} = ${n1(y.immoNettes + m.bfr)}\nROCE = ${n1(m.rex)} / ${n1(y.immoNettes + m.bfr)} = ${E.fmt(m.roce, 'pct')}`,
    grille: [
      ['Plus de 10 %', 'L’outil de production est bien rentabilisé, au-dessus du coût du crédit.', 'good'],
      ['4 à 10 %', 'Proche du coût de l’argent : l’entreprise crée peu de valeur.', 'warn'],
      ['Moins de 4 %', 'Inférieur au taux des crédits : s’endetter pour investir détruit de la valeur.', 'bad'],
    ],
    secteurs: [['Industrie lourde, hôtellerie', '6 à 12 %'], ['Commerce, services', '10 à 25 %']],
    leviers: ['Augmenter le résultat d’exploitation', 'Réduire le BFR (moins de capitaux immobilisés)', 'Céder les actifs inutilisés'],
    pieges: ['Un BFR négatif réduit les capitaux engagés et gonfle fortement le ROCE (cas de la boulangerie) : c’est réel, mais ne comparez qu’avec des entreprises du même modèle.', 'Des immobilisations très amorties (matériel ancien) donnent un ROCE flatteur qui chutera au prochain renouvellement.'],
  },
  roe: {
    name: 'Rentabilité des capitaux propres (ROE)', family: 'Rentabilité',
    formula: 'ROE = résultat net / capitaux propres',
    measure: 'Ce que rapporte chaque franc apporté ou laissé par les associés. C’est l’indicateur de l’actionnaire. Il dépend de la rentabilité économique ET de l’endettement (effet de levier).',
    calc: (y, m) => `${n1(m.rn)} / ${y.capitauxPropres} = ${E.fmt(m.roe, 'pct')}`,
    grille: [
      ['Plus de 12 %', 'Les associés sont bien rémunérés.', 'good'],
      ['4 à 12 %', 'Rémunération modeste, proche d’un placement sans risque.', 'warn'],
      ['Moins de 4 %', 'Faible ou négative : les associés s’appauvrissent.', 'bad'],
    ],
    secteurs: [['PME en bonne santé', '10 à 25 %']],
    leviers: ['Améliorer la rentabilité économique', 'Utiliser l’effet de levier (dette), tant que le ROCE reste supérieur au coût de la dette'],
    pieges: ['Un ROE très élevé peut venir de capitaux propres minuscules (entreprise sous-capitalisée), pas d’une excellente performance.', 'Des capitaux propres négatifs rendent le ROE impossible à interpréter.'],
  },
  bfrJours: {
    name: 'BFR en jours de CA', family: 'Équilibre',
    formula: 'BFR en jours = BFR / chiffre d’affaires × 360',
    measure: 'Le nombre de jours de chiffre d’affaires qu’il faut financer en permanence pour faire tourner l’exploitation. Il permet de comparer des entreprises de tailles différentes et de prévoir le BFR quand le CA augmente.',
    calc: (y, m) => `BFR = ${n1(m.actifCirculant)} − ${n1(m.passifCirculant)} = ${n1(m.bfr)}\nBFR en jours = ${n1(m.bfr)} / ${y.ca} × 360 = ${E.fmt(m.bfrJours, 'j')}`,
    grille: [
      ['Négatif', 'Les fournisseurs financent l’exploitation (commerce au comptant) : la croissance génère de la trésorerie.', 'good'],
      ['0 à 45 jours', 'Besoin raisonnable.', 'good'],
      ['45 à 90 jours', 'Besoin significatif : la croissance consommera de la trésorerie.', 'warn'],
      ['Plus de 90 jours', 'Besoin lourd : sans ressources stables suffisantes, effet ciseaux assuré en cas de croissance.', 'bad'],
    ],
    secteurs: [['Grande distribution, restauration', 'Négatif'], ['Services, transport privé', '30 à 60 j'], ['Négoce de matériaux', '60 à 100 j'], ['BTP, fournisseurs de l’État', '90 à 180 j']],
    leviers: ['Réduire le délai clients (relances, escompte pour paiement rapide, affacturage)', 'Réduire les stocks', 'Négocier des délais fournisseurs plus longs', 'Surveiller les « autres créances » (avances aux associés, etc.)'],
    pieges: ['Règle pratique : si le CA augmente de 100 M, le BFR augmente d’environ 100 × BFR en jours / 360. Avec 116 jours, c’est 32 M à financer.', 'Le bilan de clôture peut sous-estimer le BFR d’une activité saisonnière (coop cacao).'],
  },
  liquiditeGen: {
    name: 'Liquidité générale', family: 'Liquidité',
    formula: 'Liquidité générale = actif circulant (y c. trésorerie) / passif à court terme (y c. découverts)',
    measure: 'La capacité à payer les dettes à moins d’un an avec les actifs qui deviendront de l’argent à moins d’un an (stocks, créances, trésorerie).',
    calc: (y, m) => `(${n1(m.actifCirculant)} + ${y.tresoActif}) / (${n1(m.passifCirculant)} + ${y.tresoPassif}) = ${E.fmt(m.liquiditeGen, 'x')}`,
    grille: [
      ['Plus de 1,3', 'Marge de sécurité confortable.', 'good'],
      ['1 à 1,3', 'Juste : tout dépend de la qualité des stocks et des créances.', 'warn'],
      ['Moins de 1', 'Les actifs à court terme ne suffisent pas à payer les dettes à court terme : le fonds de roulement est négatif.', 'bad'],
    ],
    secteurs: [['Commerce au comptant', '0,8 à 1,2 (normal)'], ['Industrie, négoce', '1,2 à 2']],
    leviers: ['Renforcer le fonds de roulement (capitaux propres, crédit MT)', 'Consolider les découverts en crédit à moyen terme'],
    pieges: ['Un bon ratio peut cacher des stocks invendables : vérifiez toujours la liquidité réduite.'],
  },
  liquiditeRed: {
    name: 'Liquidité réduite', family: 'Liquidité',
    formula: 'Liquidité réduite = (créances + autres créances + trésorerie actif) / passif à court terme',
    measure: 'La même chose que la liquidité générale, mais sans les stocks, qui sont l’actif le plus difficile à transformer vite en argent.',
    calc: (y, m) => `(${y.creances} + ${y.autresCreances} + ${y.tresoActif}) / (${n1(m.passifCirculant)} + ${y.tresoPassif}) = ${E.fmt(m.liquiditeRed, 'x')}`,
    grille: [
      ['Plus de 1', 'L’entreprise peut honorer ses dettes court terme sans vendre ses stocks.', 'good'],
      ['0,7 à 1', 'Dépend de l’écoulement des stocks.', 'warn'],
      ['Moins de 0,7', 'Forte dépendance aux ventes de stocks pour payer les dettes.', 'bad'],
    ],
    secteurs: [['Négoce avec stocks lourds', '0,5 à 0,9'], ['Services', '1 à 2']],
    leviers: ['Réduire les stocks', 'Accélérer les encaissements'],
    pieges: ['Les « autres créances » peuvent contenir des avances aux associés qui ne seront jamais remboursées (quincaillerie Bamba). Retirez-les si elles ne sont pas mobilisables.'],
  },
  liquiditeImm: {
    name: 'Liquidité immédiate', family: 'Liquidité',
    formula: 'Liquidité immédiate = trésorerie actif / passif à court terme',
    measure: 'La part des dettes à court terme que l’entreprise pourrait payer aujourd’hui avec l’argent qu’elle a en banque et en caisse.',
    calc: (y, m) => `${y.tresoActif} / (${n1(m.passifCirculant)} + ${y.tresoPassif}) = ${E.fmt(m.liquiditeImm, 'x')}`,
    grille: [
      ['Plus de 0,3', 'Bon coussin de trésorerie.', 'good'],
      ['0,1 à 0,3', 'Coussin faible, courant pour une PME.', 'warn'],
      ['Moins de 0,1', 'Trésorerie quasi nulle : l’entreprise vit au jour le jour.', 'bad'],
    ],
    secteurs: [['PME', '0,1 à 0,5']],
    leviers: ['Constituer une réserve de trésorerie', 'Lisser les décaissements'],
    pieges: ['Ratio très volatil : il dépend du jour de clôture. Un gros encaissement la veille suffit à l’embellir.'],
  },
  dso: {
    name: 'Délai clients (DSO)', family: 'Rotation',
    formula: 'Délai clients = créances clients / chiffre d’affaires × 360',
    measure: 'Le nombre moyen de jours entre la vente et l’encaissement. Chaque jour de délai en plus immobilise environ CA / 360 de trésorerie.',
    calc: (y, m) => `${y.creances} / ${y.ca} × 360 = ${E.fmt(m.dso, 'j')}\n1 jour de CA = ${n1(y.ca / 360)} M`,
    grille: [
      ['Moins de 60 jours', 'Conforme aux délais légaux et aux usages de la plupart des secteurs.', 'good'],
      ['60 à 90 jours', 'Long : vérifier la qualité des clients et les relances.', 'warn'],
      ['Plus de 90 jours', 'Très long : risque d’impayés et forte consommation de trésorerie.', 'bad'],
    ],
    secteurs: [['Commerce au comptant', '0 à 15 j'], ['Entre entreprises', '30 à 60 j'], ['Cliniques (assureurs)', '60 à 120 j'], ['Clients publics', '90 à 180 j et plus']],
    leviers: ['Facturer vite et relancer systématiquement', 'Exiger des acomptes', 'Escompte ou affacturage', 'Diversifier les clients'],
    pieges: ['Les créances sont TTC alors que le CA est HT. Pour être précis, on divise par le CA TTC (CA × 1,18 avec une TVA à 18 %, comme en Côte d’Ivoire). Ici on reste en HT pour simplifier, ce qui surestime un peu le délai.', 'Si une partie des ventes est au comptant, le délai réel des clients à crédit est plus long que le ratio (clinique : 91 j en moyenne, plus de 150 j pour les assureurs).'],
  },
  dio: {
    name: 'Rotation des stocks (DIO)', family: 'Rotation',
    formula: 'Rotation des stocks = stocks / achats consommés × 360',
    measure: 'Le nombre de jours pendant lesquels la marchandise reste en stock avant d’être vendue ou utilisée.',
    calc: (y, m) => `${y.stocks} / ${y.achats} × 360 = ${E.fmt(m.dio, 'j')}`,
    grille: [
      ['Moins de 60 jours', 'Stock qui tourne bien.', 'good'],
      ['60 à 90 jours', 'Lourd pour des produits périssables, normal pour une large gamme.', 'warn'],
      ['Plus de 90 jours', 'Risque de stock dormant, d’obsolescence ou de pertes.', 'bad'],
    ],
    secteurs: [['Produits frais', '2 à 10 j'], ['Négoce agricole', '30 à 90 j'], ['Quincaillerie, pièces détachées', '90 à 150 j']],
    leviers: ['Supprimer les références qui ne tournent pas', 'Commander plus souvent, en plus petites quantités', 'Déstocker (promotions)'],
    pieges: ['Un stock qui augmente alors que le CA baisse est un des signaux les plus sûrs de difficultés (Agro Négoce).', 'Pour un industriel, on distingue matières premières, en-cours et produits finis.'],
  },
  dpo: {
    name: 'Délai fournisseurs (DPO)', family: 'Rotation',
    formula: 'Délai fournisseurs = dettes fournisseurs / (achats + services extérieurs) × 360',
    measure: 'Le nombre moyen de jours de crédit que les fournisseurs accordent. C’est une ressource gratuite qui réduit le BFR.',
    calc: (y, m) => `${y.fournisseurs} / (${y.achats} + ${y.servicesExt}) × 360 = ${E.fmt(m.dpo, 'j')}`,
    grille: [
      ['Stable et conforme aux conditions', 'Bonne relation fournisseurs.', 'good'],
      ['En forte hausse', 'Peut signaler que l’entreprise paie en retard faute de trésorerie.', 'warn'],
      ['Très court (comptant)', 'Fournisseurs méfiants, ou pouvoir de négociation faible.', 'warn'],
    ],
    secteurs: [['Planteurs, petits producteurs', '0 à 15 j (comptant)'], ['Grossistes, importateurs', '30 à 60 j']],
    leviers: ['Négocier des délais contractuels', 'Regrouper les achats pour peser davantage'],
    pieges: ['Un délai fournisseurs qui s’allonge n’est pas forcément une bonne nouvelle : c’est souvent le premier signe d’une trésorerie tendue. Les fournisseurs impayés peuvent couper les livraisons.'],
  },
  cycle: {
    name: 'Cycle de conversion de trésorerie', family: 'Rotation',
    formula: 'Cycle = délai clients + rotation des stocks − délai fournisseurs',
    measure: 'Le nombre de jours entre le moment où l’entreprise paie ses fournisseurs et celui où elle encaisse l’argent de ses clients. C’est la durée pendant laquelle elle doit « avancer » l’argent.',
    calc: (y, m) => `${n1(m.dso)} + ${n1(m.dio)} − ${n1(m.dpo)} = ${E.fmt(m.cycle, 'j')}`,
    grille: [
      ['Moins de 45 jours', 'Cycle court : peu d’argent immobilisé.', 'good'],
      ['45 à 90 jours', 'Cycle moyen.', 'warn'],
      ['Plus de 90 jours', 'Cycle long : la croissance sera très gourmande en trésorerie.', 'bad'],
    ],
    secteurs: [['Commerce au comptant', 'Négatif'], ['Industrie', '60 à 120 j']],
    leviers: ['Agir sur les trois délais en même temps'],
    pieges: ['Les trois délais n’ont pas la même base (CA ou achats) : le cycle est une approximation. Pour un calcul exact, on raisonne directement sur le BFR en jours de CA.'],
  },
  autonomie: {
    name: 'Autonomie financière', family: 'Structure',
    formula: 'Autonomie financière = capitaux propres / total du bilan',
    measure: 'La part de l’entreprise financée par les associés. Les capitaux propres sont le « matelas » qui absorbe les pertes avant que les créanciers ne soient touchés.',
    calc: (y, m) => `${y.capitauxPropres} / ${n1(m.totalBilan)} = ${E.fmt(m.autonomie, 'pct')}`,
    grille: [
      ['Plus de 35 %', 'Structure solide.', 'good'],
      ['20 à 35 %', 'Correcte.', 'warn'],
      ['Moins de 20 %', 'Sous-capitalisée : les créanciers portent l’essentiel du risque.', 'bad'],
    ],
    secteurs: [['PME saines', '30 à 60 %'], ['Négoce', '15 à 30 %']],
    leviers: ['Mettre les bénéfices en réserve plutôt que de les distribuer', 'Augmentation de capital', 'Bloquer les comptes courants d’associés (quasi-fonds propres)'],
    pieges: ['Des capitaux propres qui baissent alors que l’entreprise fait des bénéfices signifient que les associés se distribuent plus qu’ils ne gagnent (quincaillerie Bamba).', 'Des capitaux propres inférieurs à la moitié du capital social obligent, en droit OHADA, à statuer sur la continuité de la société.'],
  },
  gearing: {
    name: 'Gearing', family: 'Structure',
    formula: 'Gearing = (dettes financières + découverts − trésorerie actif) / capitaux propres',
    measure: 'La dette nette rapportée aux capitaux propres : combien la banque a prêté pour chaque franc apporté par les associés.',
    calc: (y, m) => `Dette nette = ${y.dettesFinancieres} + ${y.tresoPassif} − ${y.tresoActif} = ${n1(m.detteNette)}\nGearing = ${n1(m.detteNette)} / ${y.capitauxPropres} = ${E.fmt(m.gearing, 'x')}`,
    grille: [
      ['Négatif', 'La trésorerie dépasse les dettes : l’entreprise n’est pas endettée en net.', 'good'],
      ['0 à 1', 'Endettement maîtrisé.', 'good'],
      ['1 à 2', 'Endettement significatif.', 'warn'],
      ['Plus de 2', 'Très endetté : peu de marge pour un nouveau crédit.', 'bad'],
    ],
    secteurs: [['PME', '0,3 à 1,5'], ['Immobilier, infrastructures', 'jusqu’à 3']],
    leviers: ['Renforcer les capitaux propres', 'Rembourser la dette avec la CAF', 'Réduire le BFR pour réduire les découverts'],
    pieges: ['Ne pas oublier les découverts : c’est souvent là que se cache la vraie dette (TransExpress, quincaillerie).', 'Retraiter le crédit-bail en dette financière pour comparer des entreprises qui louent et d’autres qui achètent leurs équipements.'],
  },
  endettement: {
    name: 'Dettes financières / capitaux propres', family: 'Structure',
    formula: 'Taux d’endettement = dettes financières MLT / capitaux propres',
    measure: 'Version simple du gearing, sans les découverts ni la trésorerie. Il mesure l’équilibre entre les deux sources de financement stable.',
    calc: (y, m) => `${y.dettesFinancieres} / ${y.capitauxPropres} = ${E.fmt(m.endettement, 'x')}`,
    grille: [
      ['Moins de 1', 'Les associés financent plus que la banque à long terme.', 'good'],
      ['1 à 2', 'Endettement élevé.', 'warn'],
      ['Plus de 2', 'La banque porte l’essentiel du risque.', 'bad'],
    ],
    secteurs: [['Règle bancaire classique', 'Dettes MLT ≤ capitaux propres']],
    leviers: ['Apport en capital', 'Crédits plus courts, remboursés plus vite'],
    pieges: ['Peut sembler bon alors que l’entreprise vit à découvert : comparez toujours avec le gearing.'],
  },
  capaRemb: {
    name: 'Capacité de remboursement', family: 'Remboursement',
    formula: 'Capacité de remboursement = dettes financières / CAF',
    measure: 'Le nombre d’années de CAF nécessaires pour rembourser toute la dette financière, si l’entreprise y consacrait tout son autofinancement. C’est LE ratio du banquier.',
    calc: (y, m) => `CAF = ${n1(m.rn)} + ${y.dotations} = ${n1(m.caf)}\nCapacité = ${y.dettesFinancieres} / ${n1(m.caf)} = ${m.caf > 0 ? E.fmt(m.capaRemb, 'ans') : 'CAF négative : pas de capacité'}`,
    grille: [
      ['Moins de 3 ans', 'Bonne capacité : place pour un nouveau crédit.', 'good'],
      ['3 à 5 ans', 'Acceptable, nouveau crédit à dimensionner avec prudence.', 'warn'],
      ['Plus de 5 ans ou CAF négative', 'Endettement excessif par rapport à ce que l’entreprise génère.', 'bad'],
    ],
    secteurs: [['Règle générale', '≤ 3 à 4 ans'], ['Immobilier locatif', 'jusqu’à 8-10 ans']],
    leviers: ['Augmenter la CAF (rentabilité)', 'Réduire la dette', 'Allonger la durée des crédits pour étaler les échéances'],
    pieges: ['Calculez-le APRÈS le projet : ajoutez le nouveau prêt à la dette (clinique : de 1,8 à 4,4 ans).', 'Retirez de la CAF les plus-values de cession, qui ne se répéteront pas.', 'La durée du crédit doit être supérieure au ratio : prêter sur 3 ans à une entreprise qui a besoin de 5 ans de CAF, c’est programmer un impayé.'],
  },
  couvFF: {
    name: 'Couverture des frais financiers', family: 'Remboursement',
    formula: 'Couverture = EBE / frais financiers',
    measure: 'Combien de fois l’exploitation paie les intérêts. Il mesure la résistance à une baisse d’activité ou à une hausse des taux.',
    calc: (y, m) => `${n1(m.ebe)} / ${y.fraisFinanciers} = ${E.fmt(m.couvFF, 'x')}`,
    grille: [
      ['Plus de 5', 'Confortable.', 'good'],
      ['2,5 à 5', 'Tendu.', 'warn'],
      ['Moins de 2,5', 'Fragile. Sous 1, l’exploitation ne paie même plus les intérêts.', 'bad'],
    ],
    secteurs: [['PME saines', '5 à 20']],
    leviers: ['Augmenter l’EBE', 'Rembourser la dette la plus chère', 'Renégocier les taux'],
    pieges: ['Un bon ratio ne suffit pas : il ne tient pas compte du remboursement du capital. Complétez avec le DSCR.'],
  },
  poidsFF: {
    name: 'Frais financiers / CA', family: 'Remboursement',
    formula: 'Poids des frais financiers = frais financiers / chiffre d’affaires',
    measure: 'La part des ventes absorbée par les intérêts. C’est un ratio d’alerte très utilisé par les banques françaises et africaines.',
    calc: (y, m) => `${y.fraisFinanciers} / ${y.ca} = ${E.fmt(m.poidsFF, 'pct')}`,
    grille: [
      ['Moins de 3 %', 'Poids supportable.', 'good'],
      ['3 à 5 %', 'Zone de vigilance.', 'warn'],
      ['Plus de 5 %', 'Zone de danger : les intérêts mangent la marge.', 'bad'],
    ],
    secteurs: [['Négoce (marges faibles)', 'à comparer à la marge d’EBE']],
    leviers: ['Réduire l’endettement et les découverts', 'Remplacer le découvert (cher) par des financements adaptés'],
    pieges: ['À lire avec la marge : 3 % de frais financiers, c’est peu pour une clinique à 23 % de marge d’EBE, mais énorme pour un négociant à 4 %.'],
  },
};

const CHAPTERS = [
  {
    id: 'bases', title: 'Lire les états financiers', duration: '15 min', visual: 'bilan',
    intro: 'Avant de calculer le moindre ratio, il faut savoir où trouver les chiffres et ce qu’ils représentent. Ce chapitre vous donne la « carte » des états financiers, vue par un banquier.',
    blocks: [
      { h: 'Le bilan : une photo à une date', html: `<p>Le bilan décrit ce que l’entreprise possède et doit à la date de clôture (souvent le 31 décembre).</p>
        <div class="table-wrap"><table><thead><tr><th>Actif : ce que l’entreprise possède (emplois)</th><th>Passif : d’où vient l’argent (ressources)</th></tr></thead><tbody>
        <tr><td><b>Immobilisations</b> : terrains, bâtiments, machines, véhicules (nettes des amortissements)</td><td><b>Capitaux propres</b> : capital apporté + réserves + résultat de l’année</td></tr>
        <tr><td><b>Stocks</b> : marchandises, matières, produits finis</td><td><b>Dettes financières</b> : emprunts bancaires à moyen et long terme, crédit-bail</td></tr>
        <tr><td><b>Créances</b> : clients qui n’ont pas encore payé, autres créances</td><td><b>Dettes circulantes</b> : fournisseurs, dettes fiscales et sociales</td></tr>
        <tr><td><b>Trésorerie actif</b> : banque, caisse</td><td><b>Trésorerie passif</b> : découverts, facilités de caisse, crédits de campagne</td></tr>
        </tbody></table></div><p class="small muted">Toujours : total actif = total passif.</p>` },
      { h: 'Le compte de résultat : le film de l’année', html: `<p>Il raconte ce qui s’est passé pendant l’exercice : les <b>produits</b> (ventes, produits financiers) moins les <b>charges</b> (achats, services, salaires, impôts, amortissements, intérêts) donnent le <b>résultat</b>.</p>
        <p>Spécificité du SYSCOHADA : on distingue les <b>activités ordinaires</b> (le métier) des opérations <b>hors activités ordinaires (HAO)</b> : cession d’un bâtiment, pénalités exceptionnelles, etc. Le banquier isole toujours le HAO, parce qu’il ne se reproduira pas.</p>` },
      { h: 'Du bilan comptable au bilan fonctionnel', html: `<p>Le banquier réorganise le bilan en trois étages, selon la <b>durée</b> des emplois et des ressources :</p>
        <ul><li><b>Haut du bilan (long terme)</b> : immobilisations, face aux capitaux propres et aux dettes financières. La différence est le <b>fonds de roulement (FR)</b>.</li>
        <li><b>Milieu du bilan (exploitation)</b> : stocks et créances, face aux dettes fournisseurs, fiscales et sociales. La différence est le <b>besoin en fonds de roulement (BFR)</b>.</li>
        <li><b>Bas du bilan (trésorerie)</b> : banque et caisse, face aux découverts. La différence est la <b>trésorerie nette (TN)</b>.</li></ul>
        <span class="formula">Trésorerie nette = FR − BFR</span>
        <p>C’est l’équation la plus importante de l’analyse financière : elle explique <i>pourquoi</i> la trésorerie est positive ou négative.</p>` },
      { h: 'Les trois questions du banquier', html: `<ol><li><b>L’entreprise gagne-t-elle de l’argent ?</b> Rentabilité : VA, EBE, marges, résultat.</li>
        <li><b>Est-elle bien financée ?</b> Équilibre et structure : FR, BFR, trésorerie, autonomie, gearing.</li>
        <li><b>Peut-elle rembourser ?</b> CAF, capacité de remboursement, couverture de la dette.</li></ol>
        <p>Tous les ratios des chapitres suivants répondent à l’une de ces trois questions.</p>` },
      { h: 'Qu’est-ce qu’un ratio, et comment le lire ?', html: `<p>Un ratio est simplement le rapport entre deux chiffres. Seul, il ne veut rien dire. On le compare toujours de trois façons :</p>
        <ul><li><b>Dans le temps</b> : la tendance sur 3 ans compte plus que la valeur d’une année.</li>
        <li><b>Avec le secteur</b> : 4 % de marge, c’est bien pour un négociant de cacao, catastrophique pour une clinique.</li>
        <li><b>Avec une norme bancaire</b> : les seuils (par exemple une dette inférieure à 3 ans de CAF) donnent un repère, pas une vérité.</li></ul>` },
    ],
    ratios: [],
    quiz: [
      { q: 'Un camion acheté par l’entreprise apparaît…', options: ['À l’actif, dans les immobilisations', 'Au passif, dans les dettes financières', 'Dans le compte de résultat, en achats'], answer: 0, explain: 'C’est un bien durable : il est inscrit à l’actif et amorti sur plusieurs années. S’il a été financé par un emprunt, c’est l’emprunt qui apparaît au passif.' },
      { q: 'Le fonds de roulement est de 70 M et le BFR de 370 M. La trésorerie nette est de…', options: ['+440 M', '–300 M', '+300 M'], answer: 1, explain: 'TN = FR − BFR = 70 − 370 = –300 M. Le découvert finance 300 M d’exploitation (TransExpress).' },
      { q: 'Pourquoi le banquier isole-t-il le résultat HAO ?', options: ['Parce qu’il n’est pas imposable', 'Parce qu’il ne se reproduira pas les années suivantes', 'Parce qu’il est toujours négatif'], answer: 1, explain: 'Une plus-value de cession ou une charge exceptionnelle ne dit rien de la capacité future à rembourser.' },
    ],
    practice: [['#/cas/boulangerie', 'Lire les comptes de la boulangerie']],
  },
  {
    id: 'sig', title: 'Les soldes intermédiaires de gestion', duration: '15 min', visual: 'sig',
    intro: 'Les soldes intermédiaires de gestion (SIG) découpent le compte de résultat en étapes, du chiffre d’affaires au résultat net. Chaque étape répond à une question précise.',
    blocks: [
      { h: 'La cascade, étape par étape', html: `<div class="table-wrap"><table><thead><tr><th>Solde</th><th>Calcul</th><th>Ce qu’il dit</th></tr></thead><tbody>
        <tr><td><b>Marge brute</b></td><td>Ventes de marchandises − achats de marchandises (± variation de stock)</td><td>Ce que gagne un commerçant sur ce qu’il revend</td></tr>
        <tr><td><b>Valeur ajoutée (VA)</b></td><td>Production + marge brute − consommations (matières, services extérieurs)</td><td>La richesse créée par l’entreprise</td></tr>
        <tr><td><b>EBE</b></td><td>VA − impôts et taxes − charges de personnel (+ subventions d’exploitation)</td><td>Le cash dégagé par le métier</td></tr>
        <tr><td><b>Résultat d’exploitation</b></td><td>EBE − dotations aux amortissements et provisions + reprises</td><td>La performance du métier après usure du matériel</td></tr>
        <tr><td><b>Résultat financier</b></td><td>Produits financiers − frais financiers</td><td>Le coût du financement</td></tr>
        <tr><td><b>Résultat des activités ordinaires (RAO)</b></td><td>Résultat d’exploitation + résultat financier</td><td>Le résultat « récurrent »</td></tr>
        <tr><td><b>Résultat HAO</b></td><td>Produits HAO − charges HAO</td><td>L’exceptionnel</td></tr>
        <tr><td><b>Résultat net</b></td><td>RAO + résultat HAO − participation − impôt sur le résultat</td><td>Ce qui revient aux associés</td></tr>
        </tbody></table></div><p class="small muted">Dans l’app, achats de marchandises et de matières sont regroupés en « achats consommés » pour simplifier.</p>` },
      { h: 'Pourquoi l’EBE est roi', html: `<p>L’EBE ne dépend ni de la façon dont l’entreprise est financée (pas d’intérêts), ni de sa politique d’amortissement, ni de l’impôt. Deux boulangeries identiques, l’une financée par emprunt et l’autre par ses associés, ont le même EBE. C’est donc le meilleur indicateur pour comparer des entreprises et pour juger si le métier « tourne ».</p>
        <p>Un EBE négatif est une alerte maximale : l’entreprise perd de l’argent à chaque vente, avant même de payer ses dettes.</p>` },
      { h: 'La CAF : l’argent disponible pour rembourser', html: `<p>La capacité d’autofinancement mesure les ressources que l’activité génère. Deux méthodes donnent le même résultat :</p>
        <span class="formula">Méthode additive : CAF = résultat net + dotations − reprises − plus-values de cession + valeur comptable des actifs cédés − produits de cession</span>
        <span class="formula">Méthode soustractive : CAF = EBE + autres produits encaissables − autres charges décaissables ± résultat financier − impôt sur le résultat</span>
        <p>Retenez l’idée : la CAF, c’est le résultat net auquel on rajoute les charges qui ne sortent pas de la caisse (amortissements) et dont on retire les produits qui n’y entrent pas.</p>
        <p class="small muted">Dans les cas pratiques, on simplifie : CAF = résultat net + dotations.</p>` },
    ],
    ratios: ['tauxVA', 'chargesPersoVA'],
    quiz: [
      { q: 'Une entreprise a une VA de 243, des impôts et taxes de 7 et des charges de personnel de 131. Son EBE est de…', options: ['105', '112', '236'], answer: 0, explain: '243 − 7 − 131 = 105 (boulangerie 2025).' },
      { q: 'Deux entreprises ont le même EBE. L’une est très endettée, l’autre non. Laquelle a le meilleur résultat net ?', options: ['La plus endettée', 'Celle qui n’est pas endettée', 'Elles ont le même résultat net'], answer: 1, explain: 'Les intérêts sont déduits après l’EBE : l’entreprise endettée a plus de frais financiers, donc un résultat net plus faible.' },
      { q: 'Les dotations aux amortissements…', options: ['diminuent la CAF', 'diminuent le résultat mais pas la CAF', 'n’ont aucun effet'], answer: 1, explain: 'C’est une charge « calculée » : elle réduit le résultat, mais aucun argent ne sort. On la rajoute donc au résultat pour calculer la CAF.' },
    ],
    practice: [['#/exercices', 'S’entraîner au calcul de l’EBE et de la CAF'], ['#/cas/clinique', 'Cas clinique : calculer la VA']],
  },
  {
    id: 'rentabilite', title: 'Les ratios de rentabilité', duration: '20 min', visual: 'levier',
    intro: 'Être rentable, c’est dégager plus que ce qu’on dépense, et rémunérer correctement l’argent investi. On mesure la rentabilité par rapport aux ventes (marges) puis par rapport aux capitaux investis (ROCE, ROE).',
    blocks: [
      { h: 'Marges : la rentabilité sur les ventes', html: `<p>Les marges répondent à la question : « sur 100 FCFA vendus, combien reste-t-il ? ». La marge d’EBE juge le métier, la marge nette juge le résultat final. L’écart entre les deux vous indique le poids des amortissements, des intérêts et de l’impôt.</p>` },
      { h: 'ROCE et ROE : la rentabilité des capitaux', html: `<p>Une entreprise peut avoir une belle marge mais immobiliser énormément de capitaux (usines, stocks). Le <b>ROCE</b> rapporte le résultat d’exploitation à tout l’argent investi dans l’activité. Le <b>ROE</b> rapporte le résultat net à l’argent des associés seulement.</p>` },
      { h: 'L’effet de levier : quand la dette augmente (ou détruit) la rentabilité', html: `<p>Si l’entreprise emprunte à 8 % pour investir dans une activité qui rapporte 15 %, la différence profite aux associés : c’est l’<b>effet de levier</b>.</p>
        <span class="formula">ROE ≈ ROCE + (ROCE − coût de la dette) × dettes / capitaux propres</span>
        <p>Mais si le ROCE tombe sous le coût de la dette, le levier s’inverse : plus l’entreprise est endettée, plus sa rentabilité s’effondre. C’est l’<b>effet massue</b>. Testez-le avec le simulateur ci-dessous.</p>` },
    ],
    ratios: ['margeEbe', 'margeNette', 'roce', 'roe'],
    quiz: [
      { q: 'Une entreprise a une marge d’EBE de 17 % mais une trésorerie très négative. Qu’en concluez-vous ?', options: ['Elle n’est pas rentable', 'Elle est rentable mais son cycle d’exploitation consomme trop de trésorerie', 'Les comptes sont faux'], answer: 1, explain: 'Rentabilité et trésorerie sont deux choses différentes. C’est le cas TransExpress : il faut regarder le BFR.' },
      { q: 'ROCE = 6 %, taux des crédits = 10 %. Que se passe-t-il si l’entreprise s’endette davantage ?', options: ['Son ROE augmente', 'Son ROE diminue', 'Rien'], answer: 1, explain: 'Le ROCE est inférieur au coût de la dette : chaque franc emprunté rapporte moins qu’il ne coûte. L’effet de levier devient négatif.' },
      { q: 'Un ROE de 45 % est-il forcément une excellente nouvelle ?', options: ['Oui, toujours', 'Non : il peut venir de capitaux propres très faibles', 'Non : un ROE ne dépasse jamais 20 %'], answer: 1, explain: 'Un petit dénominateur gonfle le ratio. Vérifiez l’autonomie financière avant de vous réjouir.' },
    ],
    practice: [['#/cas/agro', 'Cas Agro Négoce : une rentabilité qui s’effondre']],
  },
  {
    id: 'equilibre', title: 'Équilibre financier et liquidité', duration: '20 min', visual: 'ftn',
    intro: 'Une entreprise meurt rarement d’un manque de rentabilité, mais souvent d’un manque de trésorerie. Ce chapitre explique comment le FR, le BFR et la trésorerie s’articulent, et comment mesurer la liquidité.',
    blocks: [
      { h: 'La règle d’or : financer le long terme par du long terme', html: `<p>Les immobilisations durent des années : elles doivent être financées par des ressources durables (capitaux propres, emprunts à moyen et long terme). Le surplus de ressources stables, le <b>fonds de roulement</b>, sert ensuite à financer le BFR.</p>` },
      { h: 'Les quatre situations types', html: `<div class="table-wrap"><table><thead><tr><th>FR</th><th>BFR</th><th>Trésorerie</th><th>Lecture</th></tr></thead><tbody>
        <tr><td>Positif</td><td>Positif, inférieur au FR</td><td>Positive</td><td>Situation saine : le FR finance tout le BFR (coop cacao en 2025)</td></tr>
        <tr><td>Positif</td><td>Négatif</td><td>Très positive</td><td>Commerce au comptant : les fournisseurs financent l’exploitation (boulangerie)</td></tr>
        <tr><td>Positif</td><td>Supérieur au FR</td><td>Négative</td><td>Déséquilibre : le découvert finance l’exploitation (TransExpress, quincaillerie)</td></tr>
        <tr><td>Négatif</td><td>Positif</td><td>Très négative</td><td>Grave : des immobilisations sont financées à court terme (Agro Négoce se rapproche de ce cas)</td></tr>
        </tbody></table></div>` },
      { h: 'Pourquoi le BFR augmente-t-il ?', html: `<ul><li><b>Croissance</b> : plus de ventes, donc plus de créances et de stocks (effet volume).</li>
        <li><b>Allongement des délais</b> : clients qui paient plus tard, stocks qui tournent moins vite, fournisseurs payés plus tôt.</li>
        <li><b>Sorties anormales</b> : avances aux associés ou aux sociétés sœurs dans les « autres créances ».</li></ul>
        <p>L’analyste doit toujours identifier laquelle de ces causes est en jeu : la solution n’est pas la même.</p>` },
      { h: 'Liquidité : trois niveaux d’exigence', html: `<p>Les ratios de liquidité comparent ce qui va rentrer à moins d’un an avec ce qui doit sortir à moins d’un an. On retire progressivement les actifs les moins sûrs : d’abord les stocks (liquidité réduite), puis les créances (liquidité immédiate).</p>` },
    ],
    ratios: ['bfrJours', 'liquiditeGen', 'liquiditeRed', 'liquiditeImm'],
    quiz: [
      { q: 'Le CA d’une entreprise augmente de 40 % et son BFR représente 116 jours de CA. Que va-t-il se passer ?', options: ['Sa trésorerie va s’améliorer', 'Sa trésorerie va se dégrader si le FR n’augmente pas', 'Rien, le BFR est indépendant du CA'], answer: 1, explain: 'Le BFR augmente avec le CA. Sans hausse équivalente du FR, c’est l’effet ciseaux.' },
      { q: 'Une supérette a un BFR négatif. C’est…', options: ['Un signe de faillite', 'Normal : les clients paient comptant et les fournisseurs accordent des délais', 'Impossible'], answer: 1, explain: 'C’est le modèle de la distribution : l’exploitation fournit de la trésorerie au lieu d’en consommer.' },
      { q: 'Liquidité générale 1,4 mais liquidité réduite 0,5. Que regardez-vous en priorité ?', options: ['Les stocks', 'Les capitaux propres', 'Le chiffre d’affaires'], answer: 0, explain: 'L’écart vient des stocks. Sont-ils vendables ? Tournent-ils ? Un stock dormant rend la liquidité générale trompeuse.' },
    ],
    practice: [['#/cas/transport', 'Cas TransExpress : l’effet ciseaux'], ['#/labo/bfr', 'Simulateur croissance et trésorerie']],
  },
  {
    id: 'rotation', title: 'Les ratios de rotation', duration: '15 min', visual: 'cycle',
    intro: 'Les ratios de rotation traduisent le BFR en jours. Ils montrent quel levier actionner : les clients, les stocks ou les fournisseurs.',
    blocks: [
      { h: 'Raisonner en jours', html: `<p>Dire « les créances clients sont de 470 M » ne dit pas grand-chose. Dire « les clients paient à 147 jours » est immédiatement parlant, et comparable d’une année à l’autre ou avec le secteur. Chaque délai se transforme ensuite facilement en argent : <b>1 jour de délai clients = CA / 360</b>.</p>` },
      { h: 'Trois précautions de calcul', html: `<ul><li><b>HT ou TTC</b> : les créances et les dettes fournisseurs sont TTC, alors que le CA et les achats sont HT. Pour être rigoureux, on multiplie le dénominateur par 1 + taux de TVA (1,18 en Côte d’Ivoire).</li>
        <li><b>Fin d’année ou moyenne</b> : le bilan donne une photo au jour de la clôture. Si l’activité est saisonnière, prenez une moyenne (ou demandez des situations intermédiaires).</li>
        <li><b>Base de calcul</b> : les stocks de marchandises se rapportent aux achats, les stocks de produits finis au coût de production.</li></ul>` },
      { h: 'Ce que le banquier en fait', html: `<p>Les délais permettent de choisir le bon financement : un délai clients long sur des débiteurs solides (État, grandes entreprises) se finance par l’escompte, l’affacturage ou les avances sur marchés. Un stock saisonnier se finance par un crédit de campagne garanti par le stock lui-même (warrant).</p>` },
    ],
    ratios: ['dso', 'dio', 'dpo', 'cycle'],
    quiz: [
      { q: 'CA = 1 150 M. Réduire le délai clients de 30 jours libère environ…', options: ['30 M', '96 M', '345 M'], answer: 1, explain: '1 150 / 360 × 30 ≈ 96 M.' },
      { q: 'Le délai fournisseurs passe de 40 à 90 jours sans renégociation. C’est probablement…', options: ['Une excellente gestion', 'Le signe d’une trésorerie tendue : l’entreprise paie en retard', 'Sans importance'], answer: 1, explain: 'Un allongement subi est un signal d’alerte : les fournisseurs peuvent réagir en coupant les livraisons.' },
      { q: 'Une coopérative clôture ses comptes en fin de campagne. Sa rotation des stocks de 9 jours…', options: ['Représente fidèlement son besoin', 'Sous-estime fortement son besoin en pleine campagne', 'Surestime son besoin'], answer: 1, explain: 'À la clôture, les fèves ont été vendues. En pleine campagne, le stock représente plusieurs mois d’achats.' },
    ],
    practice: [['#/cas/cacao', 'Cas coop cacao : un besoin saisonnier'], ['#/exercices', 'Exercices sur les délais']],
  },
  {
    id: 'structure', title: 'Structure financière et solvabilité', duration: '15 min', visual: null,
    intro: 'La structure financière répond à une question simple : qui porte le risque ? Les associés (capitaux propres) ou les créanciers (banques, fournisseurs) ?',
    blocks: [
      { h: 'Les capitaux propres, un matelas', html: `<p>En cas de pertes, ce sont d’abord les capitaux propres qui fondent. Tant qu’ils restent importants, les créanciers sont protégés. Quand ils deviennent faibles ou négatifs, c’est l’argent de la banque qui est en jeu. C’est pourquoi les banques exigent souvent un <b>apport</b> de 20 à 30 % pour financer un projet.</p>` },
      { h: 'Les retraitements à connaître', html: `<ul><li><b>Comptes courants d’associés créditeurs</b> : l’argent prêté par les associés. S’il est bloqué par une convention pendant la durée du crédit, le banquier le traite comme des quasi-fonds propres.</li>
        <li><b>Comptes courants d’associés débiteurs</b> (dans les autres créances) : l’inverse, l’entreprise prête aux associés. On les déduit des capitaux propres, car cet argent a quitté l’entreprise.</li>
        <li><b>Crédit-bail</b> : un équipement loué avec option d’achat n’apparaît pas toujours en dette. Pour comparer, on l’ajoute aux dettes financières.</li>
        <li><b>Découverts permanents</b> : un découvert utilisé toute l’année est en réalité une dette structurelle.</li></ul>` },
      { h: 'Le signal des capitaux propres qui baissent', html: `<p>Si l’entreprise fait des pertes, ses capitaux propres baissent : c’est logique. Mais s’ils baissent alors qu’elle fait des bénéfices, c’est que les associés se distribuent plus qu’elle ne gagne. C’est un signal de gouvernance que le banquier doit relever (quincaillerie Bamba).</p>` },
    ],
    ratios: ['autonomie', 'gearing', 'endettement'],
    quiz: [
      { q: 'Capitaux propres 150, autres créances 110 dont 100 d’avances aux associés. Quels capitaux propres retenez-vous ?', options: ['150', '50', '260'], answer: 1, explain: 'L’argent avancé aux associés a quitté l’entreprise : on le déduit. 150 − 100 = 50 M de capitaux propres « réels ».' },
      { q: 'Un gearing négatif signifie…', options: ['Des capitaux propres négatifs', 'Une trésorerie supérieure aux dettes financières', 'Une entreprise surendettée'], answer: 1, explain: 'La dette nette est négative : l’entreprise pourrait rembourser toutes ses dettes avec sa trésorerie (boulangerie).' },
      { q: 'Dettes MLT / capitaux propres = 0,2, mais les découverts sont trois fois supérieurs aux capitaux propres. L’entreprise est…', options: ['Peu endettée', 'Fortement endettée à court terme', 'Sans risque'], answer: 1, explain: 'D’où l’intérêt du gearing, qui inclut les découverts.' },
    ],
    practice: [['#/cas/quincaillerie', 'Cas quincaillerie : où part l’argent ?']],
  },
  {
    id: 'remboursement', title: 'Capacité de remboursement', duration: '20 min', visual: null,
    intro: 'C’est le cœur de l’analyse crédit : l’entreprise peut-elle rembourser avec l’argent qu’elle génère, sans compter sur les garanties ?',
    blocks: [
      { h: 'La CAF face à la dette', html: `<p>Le ratio <b>dettes financières / CAF</b> donne le nombre d’années nécessaires pour tout rembourser. La plupart des banques veulent moins de 3 à 4 ans pour une PME.</p>` },
      { h: 'Le DSCR : couverture du service de la dette', html: `<span class="formula">DSCR = CAF / (échéances en capital + intérêts de l’année)</span>
        <p>C’est le ratio de référence pour dimensionner un crédit. On vise au moins <b>1,3</b> : l’entreprise génère 30 % de plus que ce qu’elle doit payer, ce qui laisse une marge en cas de mauvaise année. Sous 1, elle ne peut pas payer ses échéances avec son activité.</p>
        <p>Pour trouver le montant maximal empruntable, on inverse le calcul : annuité maximale = CAF / 1,3, puis on en déduit le capital selon le taux et la durée (voir le simulateur de prêt).</p>` },
      { h: 'Toujours raisonner après le projet', html: `<p>Un dossier excellent aujourd’hui peut devenir fragile avec le nouveau crédit. Le banquier recalcule tous les ratios en ajoutant :</p>
        <ul><li>le nouveau prêt aux dettes financières ;</li><li>la nouvelle annuité au service de la dette existant ;</li><li>la CAF supplémentaire attendue du projet, mais avec prudence (et souvent avec un décalage d’un an).</li></ul>
        <p>C’est tout l’enjeu du cas de la clinique.</p>` },
      { h: 'Adapter la durée au besoin', html: `<p>La durée du crédit doit être cohérente avec la durée de vie du bien financé et avec la capacité de remboursement. Un matériel qui dure 5 ans ne se finance pas sur 10 ans, et une dette qui demande 5 ans de CAF ne se rembourse pas en 3 ans.</p>` },
    ],
    ratios: ['capaRemb', 'couvFF', 'poidsFF'],
    quiz: [
      { q: 'CAF = 189 M, service de la dette existante = 66 M, nouvelle annuité = 115 M. Le DSCR après projet est d’environ…', options: ['1,05', '1,64', '2,86'], answer: 0, explain: '189 / (66 + 115) ≈ 1,05. Aucune marge de sécurité, même si la situation avant projet était excellente.' },
      { q: 'CAF négative, belle hypothèque disponible. Le dossier est-il finançable ?', options: ['Oui, grâce à la garantie', 'Non : la garantie ne crée pas de capacité de remboursement', 'Oui si le taux est élevé'], answer: 1, explain: 'La garantie limite la perte en cas de défaut, elle ne rend pas le remboursement possible.' },
      { q: 'Avec une CAF de 80 M et un DSCR cible de 1,3, l’annuité maximale est d’environ…', options: ['62 M', '80 M', '104 M'], answer: 0, explain: '80 / 1,3 ≈ 61,5 M.' },
    ],
    practice: [['#/labo/pret', 'Simulateur de prêt'], ['#/cas/clinique', 'Cas clinique : analyser après le projet']],
  },
  {
    id: 'interpretation', title: 'Interpréter un ensemble de ratios', duration: '25 min', visual: 'radar',
    intro: 'Un ratio isolé ne dit presque rien. L’analyste expérimenté lit les ratios ensemble, cherche les incohérences et raconte une histoire cohérente. Ce chapitre vous donne la méthode et les combinaisons à reconnaître.',
    blocks: [
      { h: 'La méthode en quatre temps', html: `<ol><li><b>Tendance</b> : pour chaque ratio, la direction sur 3 ans (amélioration, stabilité, dégradation).</li>
        <li><b>Comparaison</b> : avec le secteur et les seuils bancaires.</li>
        <li><b>Explication</b> : pourquoi ce ratio bouge-t-il ? Remontez aux postes du bilan et du compte de résultat.</li>
        <li><b>Synthèse</b> : 2 ou 3 forces, 2 ou 3 faiblesses, et un lien avec la demande de crédit.</li></ol>` },
      { h: 'Les combinaisons typiques à reconnaître', html: `<div class="table-wrap"><table><thead><tr><th>Ce que vous observez</th><th>Diagnostic probable</th><th>Cas</th></tr></thead><tbody>
        <tr><td>CA ↑↑, marge stable, BFR en jours ↑, trésorerie ↓↓</td><td>Croissance mal financée : effet ciseaux</td><td>TransExpress</td></tr>
        <tr><td>CA ↓, marge ↓↓, stocks en jours ↑, découvert ↑</td><td>Mévente, perte de compétitivité, stocks dormants</td><td>Agro Négoce</td></tr>
        <tr><td>Résultat net &gt; 0 mais capitaux propres ↓</td><td>Distributions excessives aux associés</td><td>Quincaillerie</td></tr>
        <tr><td>Autres créances ↑↑ sans hausse d’activité</td><td>Sorties de trésorerie vers les associés ou des sociétés liées</td><td>Quincaillerie</td></tr>
        <tr><td>EBE correct mais résultat net faible</td><td>Endettement trop lourd (intérêts) ou investissements trop amortis</td><td>–</td></tr>
        <tr><td>Résultat net soutenu par le HAO</td><td>Rentabilité récurrente plus faible qu’il n’y paraît</td><td>Agro Négoce 2025</td></tr>
        <tr><td>Délai fournisseurs ↑ sans renégociation, découvert au maximum</td><td>Tension de trésorerie : l’entreprise « tire » sur ses fournisseurs</td><td>–</td></tr>
        <tr><td>Marge faible mais stable, gros volumes, BFR court</td><td>Modèle de négoce, normal pour le secteur</td><td>Coop cacao</td></tr>
        <tr><td>Excellents ratios avant projet, DSCR ≈ 1 après</td><td>Projet surdimensionné par rapport à la CAF</td><td>Clinique</td></tr>
        </tbody></table></div>` },
      { h: 'Les limites d’un score', html: `<p>Un score (comme celui de l’app) additionne des ratios avec des seuils généraux. Il est utile pour un premier tri, mais il ne connaît ni le secteur, ni la saisonnalité, ni le projet. La coop cacao est pénalisée pour sa marge (normale dans son métier), et la clinique obtient la note A alors que son projet la met en tension. Le jugement de l’analyste reste indispensable.</p>` },
      { h: 'Rédiger sa conclusion', html: `<p>Une bonne conclusion d’analyse tient en quelques lignes :</p>
        <span class="formula">[Entreprise] présente [niveau de rentabilité + tendance].\nSa structure financière est [solide / tendue] : [ratio clé].\nSa capacité de remboursement [après projet] est de [ratio], ce qui [permet / ne permet pas] de supporter le crédit demandé.\nPoints de vigilance : […]\nRecommandation : [accord / accord sous conditions / refus] avec [garanties, covenants].</span>` },
    ],
    ratios: [],
    quiz: [
      { q: 'CA +40 %/an, marge d’EBE stable à 17 %, délai clients de 99 à 147 jours, trésorerie de –39 à –300 M. Diagnostic ?', options: ['Perte de rentabilité', 'Effet ciseaux : croissance qui consomme la trésorerie', 'Surendettement à long terme'], answer: 1, explain: 'La rentabilité est stable ; c’est le BFR qui explose avec la croissance et l’allongement des délais.' },
      { q: 'Résultat net positif chaque année, mais capitaux propres de 190 à 150 M et autres créances de 20 à 110 M. Diagnostic ?', options: ['Pertes cachées', 'Argent sorti vers les associés (distributions et avances)', 'Investissements massifs'], answer: 1, explain: 'Les bénéfices ne restent pas dans l’entreprise et de l’argent part en avances aux associés.' },
      { q: 'CA en baisse, stock de 78 à 109 jours, marge d’EBE de 5,2 % à 0,3 %, plus-value HAO en dernière année. Diagnostic ?', options: ['Entreprise en difficulté dont le résultat est embelli par un élément exceptionnel', 'Entreprise saine qui investit', 'Effet saisonnier'], answer: 0, explain: 'Tous les indicateurs d’exploitation se dégradent ; le HAO masque partiellement la perte.' },
      { q: 'Marge d’EBE de 4 %, stable, volumes en hausse, BFR de 16 jours, autonomie de 60 %. Pour une coopérative de négoce de cacao, c’est…', options: ['Un dossier fragile à cause de la marge', 'Un profil sain pour ce secteur', 'Un dossier à refuser'], answer: 1, explain: 'Dans le négoce, la marge unitaire est faible par nature. La stabilité, la structure et le cycle court sont bons.' },
    ],
    practice: [['#/dossier', 'Analyser un vrai dossier'], ['#/cas', 'Refaire tous les cas pratiques']],
  },
];
