// Cas pratiques : entreprises fictives, chiffres en millions de FCFA.
// La trésorerie actif est calculée automatiquement pour équilibrer chaque bilan.

const CASES = [
  {
    id: 'boulangerie',
    name: 'Boulangerie Le Bon Pain SARL',
    sector: 'Boulangerie-pâtisserie · Abidjan, Cocody',
    level: 'Débutant',
    pitch: 'Une PME rentable qui veut s’agrandir. Est-ce que la banque peut suivre ?',
    context: [
      'Créée en 2014 par Mme Koné, la boulangerie emploie 38 personnes et vend surtout au comptoir (paiement comptant). Environ 15 % des ventes vont à des hôtels et restaurants, payés à 30 jours.',
      'Le matériel est bien entretenu. Le principal fournisseur de farine accorde 45 jours de délai de paiement.',
    ],
    request: {
      amount: 60, years: 5, rate: 0.09,
      object: 'Un four à sole neuf et l’aménagement d’un deuxième point de vente à Angré.',
    },
    years: [2023, 2024, 2025],
    data: [
      { ca: 420, achats: 180, servicesExt: 45, impotsTaxes: 6, chargesPersonnel: 110, dotations: 18, fraisFinanciers: 5, produitsFinanciers: 0, hao: 0, impotResultat: 14,
        immoNettes: 160, stocks: 10, creances: 12, autresCreances: 4, capitauxPropres: 135, dettesFinancieres: 54, fournisseurs: 24, dettesFiscalesSociales: 18, tresoPassif: 0 },
      { ca: 465, achats: 197, servicesExt: 49, impotsTaxes: 7, chargesPersonnel: 120, dotations: 20, fraisFinanciers: 4.5, produitsFinanciers: 0, hao: 0, impotResultat: 17,
        immoNettes: 155, stocks: 11, creances: 13, autresCreances: 4, capitauxPropres: 160, dettesFinancieres: 42, fournisseurs: 26, dettesFiscalesSociales: 20, tresoPassif: 0 },
      { ca: 510, achats: 214, servicesExt: 53, impotsTaxes: 7, chargesPersonnel: 131, dotations: 22, fraisFinanciers: 4, produitsFinanciers: 0.5, hao: 0, impotResultat: 20,
        immoNettes: 150, stocks: 12, creances: 15, autresCreances: 5, capitauxPropres: 190, dettesFinancieres: 30, fournisseurs: 28, dettesFiscalesSociales: 22, tresoPassif: 0 },
    ],
    comments: {
      activite: 'Le CA progresse d’environ 10 % par an et la marge d’EBE reste stable autour de 20 %. Pour une boulangerie, c’est très bon : les prix de vente couvrent largement la farine, l’énergie et les salaires. La croissance est donc rentable.',
      equilibre: 'Le BFR est même négatif : les clients paient comptant et le fournisseur de farine accorde des délais, donc l’exploitation dégage des ressources au lieu d’en consommer. Avec un fonds de roulement positif en plus, on obtient une trésorerie positive qui grossit chaque année. C’est le profil type d’un commerce de détail sain.',
      rotation: 'Les clients paient en une dizaine de jours en moyenne et les stocks tournent vite (produits frais). Le fournisseur finance plus longtemps que ce que durent les stocks et le crédit client : l’activité génère de la trésorerie.',
      endettement: 'La dette financière restante représente moins de six mois de CAF. Même avec le nouveau prêt, l’annuité reste très inférieure à la CAF : le remboursement ne pose aucun problème.',
    },
    best: 'accord',
    decisions: {
      accord: 'Bonne décision. Rentabilité solide, trésorerie positive, endettement très faible : le dossier est bancable. On prendra des garanties classiques, par exemple un nantissement du matériel financé et la domiciliation des recettes.',
      conditions: 'Défendable, mais trop prudent. Rien dans les chiffres ne justifie des conditions lourdes : vous risquez de perdre un bon client au profit d’une banque concurrente. Des garanties standard suffisent.',
      refus: 'Mauvaise décision. Tous les indicateurs sont au vert. Refuser ce dossier, c’est passer à côté d’un client rentable et peu risqué.',
    },
    memo: {
      forces: ['Croissance régulière (+10 %/an) et marge d’EBE d’environ 20 %', 'Trésorerie nette positive et croissante', 'Dette financière inférieure à 6 mois de CAF', 'Fonds propres qui augmentent chaque année (résultats en partie mis en réserve)'],
      faiblesses: ['Dépendance à une dirigeante clé (risque « homme-clé »)', 'Sensibilité au prix de la farine importée', 'Risque d’exécution sur le nouveau point de vente'],
      recommandation: 'Accord de 60 M sur 5 ans. Garanties : nantissement du four, assurance décès-invalidité de la gérante, domiciliation d’une partie des recettes.',
    },
  },
  {
    id: 'transport',
    name: 'TransExpress CI SARL',
    sector: 'Transport et logistique · San-Pédro / Abidjan',
    level: 'Intermédiaire',
    pitch: 'Une croissance spectaculaire… et une trésorerie qui s’effondre. Pourquoi ?',
    context: [
      'Ce transporteur de marchandises (42 camions) a décroché de gros contrats avec des sociétés minières et deux ministères. Le CA a presque doublé en deux ans.',
      'Les clients publics paient souvent à plus de 150 jours. Le gérant demande de porter le découvert autorisé de 150 à 400 M FCFA « pour payer le carburant et les salaires ».',
    ],
    request: {
      amount: 250, years: 1, rate: 0.11,
      object: 'Hausse du découvert autorisé de 150 à 400 M FCFA (+250 M).',
    },
    years: [2023, 2024, 2025],
    data: [
      { ca: 600, achats: 250, servicesExt: 90, impotsTaxes: 8, chargesPersonnel: 150, dotations: 45, fraisFinanciers: 12, produitsFinanciers: 0, hao: 0, impotResultat: 13,
        immoNettes: 260, stocks: 20, creances: 165, autresCreances: 12, capitauxPropres: 180, dettesFinancieres: 150, fournisseurs: 60, dettesFiscalesSociales: 28, tresoPassif: 60 },
      { ca: 820, achats: 350, servicesExt: 125, impotsTaxes: 10, chargesPersonnel: 195, dotations: 60, fraisFinanciers: 22, produitsFinanciers: 0, hao: 0, impotResultat: 17,
        immoNettes: 330, stocks: 28, creances: 290, autresCreances: 15, capitauxPropres: 214, dettesFinancieres: 190, fournisseurs: 80, dettesFiscalesSociales: 35, tresoPassif: 150 },
      { ca: 1150, achats: 500, servicesExt: 180, impotsTaxes: 14, chargesPersonnel: 265, dotations: 85, fraisFinanciers: 40, produitsFinanciers: 0, hao: 0, impotResultat: 20,
        immoNettes: 420, stocks: 35, creances: 470, autresCreances: 20, capitauxPropres: 260, dettesFinancieres: 230, fournisseurs: 110, dettesFiscalesSociales: 45, tresoPassif: 310 },
    ],
    comments: {
      activite: 'L’activité est rentable : la marge d’EBE tourne autour de 17 % et le CA progresse de près de 40 % par an. Le problème n’est donc pas la rentabilité. C’est la première chose à retenir : une entreprise rentable peut quand même manquer de cash.',
      equilibre: 'Voici « l’effet ciseaux » : le BFR a plus que triplé (de 109 à 370 M), alors que le fonds de roulement stagne autour de 70 M. La différence est financée par le découvert, et la trésorerie nette s’enfonce à –300 M. Chaque nouveau contrat creuse le trou, parce qu’il faut avancer le carburant et les salaires des mois avant d’être payé.',
      rotation: 'Le délai clients est passé d’environ 100 à environ 150 jours, alors que les fournisseurs (carburant) sont payés en moins de 60 jours. L’entreprise fait crédit à ses clients avec l’argent de la banque, et c’est ce levier qu’il faut traiter.',
      endettement: 'La dette à moyen terme est remboursable en moins de 2 ans de CAF : c’est correct. En revanche, la dette totale (MT + découvert) dépasse deux fois les fonds propres, et un découvert n’est pas fait pour financer un besoin permanent.',
    },
    best: 'conditions',
    decisions: {
      accord: 'Risqué. Augmenter le découvert soigne le symptôme, pas la cause. Si les clients publics paient encore plus tard, le découvert sera de nouveau saturé dans 6 mois et la banque sera piégée avec un encours court terme qui finance en réalité un besoin permanent.',
      conditions: 'Bonne décision. L’activité est rentable, mais le BFR doit être financé par des outils adaptés : mobilisation des créances (escompte, affacturage, avances sur marchés publics), consolidation d’une partie du découvert en crédit à moyen terme, et apport des associés. On encadre le tout avec des covenants sur le délai clients.',
      refus: 'Trop sévère. L’entreprise est rentable et ses clients sont solvables, même s’ils sont lents. Refuser pourrait provoquer une cessation de paiements… et mettre en difficulté l’encours existant de la banque.',
    },
    memo: {
      forces: ['Rentabilité d’exploitation solide (marge d’EBE d’environ 17 %)', 'Carnet de commandes en forte croissance, clients de premier plan', 'Dette MT raisonnable par rapport à la CAF'],
      faiblesses: ['Effet ciseaux : BFR ×3,4 en deux ans, FR stagnant', 'Délai clients d’environ 150 jours, concentré sur des débiteurs publics', 'Trésorerie nette de –300 M, découvert saturé', 'Gearing supérieur à 2'],
      recommandation: 'Accord partiel et restructuré : ligne de mobilisation de créances publiques de 200 M (avances sur marchés domiciliés), consolidation de 100 M de découvert en crédit MT sur 3 ans, apport en compte courant d’associés de 50 M. Covenant : délai clients inférieur à 120 jours d’ici 12 mois.',
    },
  },
  {
    id: 'agro',
    name: 'Agro Négoce du Plateau SA',
    sector: 'Négoce de produits vivriers et intrants agricoles · Bouaké',
    level: 'Avancé',
    pitch: 'Un gros chiffre d’affaires, un projet ambitieux… et des signaux faibles à repérer.',
    context: [
      'Grossiste historique de riz, maïs et engrais, la société réalise plus de 2 milliards de FCFA de CA. La concurrence de nouveaux importateurs pèse sur ses prix de vente.',
      'En 2025, elle a vendu un terrain, ce qui a généré une plus-value exceptionnelle (HAO). Le DG présente un plan de relance qui repose sur un nouvel entrepôt frigorifique.',
    ],
    request: {
      amount: 300, years: 7, rate: 0.10,
      object: 'Construction d’un entrepôt frigorifique de 3 000 m² à Bouaké.',
    },
    years: [2023, 2024, 2025],
    data: [
      { ca: 2400, achats: 1950, servicesExt: 170, impotsTaxes: 15, chargesPersonnel: 140, dotations: 55, fraisFinanciers: 60, produitsFinanciers: 2, hao: 0, impotResultat: 4,
        immoNettes: 740, stocks: 420, creances: 350, autresCreances: 30, capitauxPropres: 340, dettesFinancieres: 680, fournisseurs: 280, dettesFiscalesSociales: 45, tresoPassif: 260 },
      { ca: 2250, achats: 1860, servicesExt: 165, impotsTaxes: 15, chargesPersonnel: 145, dotations: 58, fraisFinanciers: 72, produitsFinanciers: 2, hao: 0, impotResultat: 2,
        immoNettes: 720, stocks: 470, creances: 360, autresCreances: 35, capitauxPropres: 275, dettesFinancieres: 650, fournisseurs: 300, dettesFiscalesSociales: 50, tresoPassif: 380 },
      { ca: 2050, achats: 1720, servicesExt: 160, impotsTaxes: 14, chargesPersonnel: 150, dotations: 60, fraisFinanciers: 85, produitsFinanciers: 1, hao: 15, impotResultat: 2,
        immoNettes: 700, stocks: 520, creances: 380, autresCreances: 40, capitauxPropres: 150, dettesFinancieres: 620, fournisseurs: 330, dettesFiscalesSociales: 60, tresoPassif: 520 },
    ],
    comments: {
      activite: 'Ne vous laissez pas impressionner par les 2 milliards de CA. La marge d’EBE s’effondre, de 5,2 % à 0,3 %, et en 2025 l’EBE (6 M) ne couvre même plus les frais financiers (85 M). Sans la plus-value HAO de 15 M, la perte serait encore plus lourde : un produit exceptionnel ne doit jamais masquer la tendance.',
      equilibre: 'Le BFR augmente pendant que le CA baisse : c’est un très mauvais signe, qui évoque des stocks qui ne se vendent plus. Les pertes rongent les fonds propres, qui ont été divisés par plus de deux, et le découvert explose (520 M).',
      rotation: 'Les stocks représentent plus de 100 jours d’achats en 2025, contre environ 78 jours en 2023, pour des produits vivriers périssables ou soumis aux prix du marché. Risque de dépréciation. Les fournisseurs sont payés de plus en plus tard, ce qui peut indiquer une tension sur la trésorerie.',
      endettement: 'La CAF est négative : l’entreprise ne génère plus de ressources pour rembourser quoi que ce soit. Chaque échéance est donc payée avec… de la nouvelle dette. Ajouter 300 M sur 7 ans aggraverait la situation.',
    },
    best: 'refus',
    decisions: {
      accord: 'Décision dangereuse. Avec une CAF négative et des fonds propres qui fondent, l’entreprise ne peut pas rembourser un nouveau prêt de 300 M. Le risque de défaut est très élevé, et la banque ajouterait de l’encours sur un dossier déjà fragile.',
      conditions: 'Insuffisant. Aucune garantie ne remplace une capacité de remboursement : prendre une hypothèque sur l’entrepôt revient à prêter en comptant sur une saisie. Ici, il faut d’abord restructurer.',
      refus: 'Bonne décision. Refus en l’état, mais en proposant une piste : recapitalisation par les actionnaires, plan de réduction des stocks et des coûts, puis réexamen sur la base de comptes redressés. Il faut aussi surveiller de près l’encours existant (classement en « sous surveillance »).',
    },
    memo: {
      forces: ['Acteur historique avec une vraie part de marché', 'Actifs immobiliers mobilisables en garantie'],
      faiblesses: ['CA en baisse de 15 % en deux ans', 'Marge d’EBE passée de 5,2 % à 0,3 %, EBE inférieur aux frais financiers', 'CAF négative : capacité de remboursement nulle', 'Fonds propres divisés par 2,3 à cause des pertes', 'Stocks à plus de 100 jours, découvert de 520 M', 'Résultat 2025 « embelli » par une plus-value HAO'],
      recommandation: 'Refus du financement de 300 M. Proposer un rendez-vous avec les actionnaires : augmentation de capital préalable (au moins 200 M), plan de déstockage et suivi mensuel de la trésorerie. Classer l’encours actuel sous surveillance renforcée.',
    },
  },
];

CASES.forEach(c => { c.data = c.data.map(Engine.balance); });
