// Moteur de calcul : soldes de gestion, bilan fonctionnel, ratios et scoring crédit.
// Tous les montants sont en millions de FCFA (M FCFA). Présentation simplifiée inspirée du SYSCOHADA.

const Engine = (() => {
  // Complète la trésorerie actif pour que le bilan soit équilibré (actif = passif).
  function balance(y) {
    const passif = y.capitauxPropres + y.dettesFinancieres + y.fournisseurs + y.dettesFiscalesSociales + y.tresoPassif;
    const autresActifs = y.immoNettes + y.stocks + y.creances + y.autresCreances;
    return { ...y, tresoActif: round(passif - autresActifs) };
  }

  function round(v, d = 1) {
    const p = 10 ** d;
    return Math.round(v * p) / p;
  }

  function analyze(y) {
    const va = y.ca - y.achats - y.servicesExt;
    const ebe = va - y.impotsTaxes - y.chargesPersonnel;
    const rex = ebe - y.dotations;
    const rf = y.produitsFinanciers - y.fraisFinanciers;
    const rao = rex + rf;
    const rn = rao + y.hao - y.impotResultat;
    const caf = rn + y.dotations;

    const actifCirculant = y.stocks + y.creances + y.autresCreances;
    const passifCirculant = y.fournisseurs + y.dettesFiscalesSociales;
    const ressourcesStables = y.capitauxPropres + y.dettesFinancieres;
    const fr = ressourcesStables - y.immoNettes;
    const bfr = actifCirculant - passifCirculant;
    const tn = y.tresoActif - y.tresoPassif;
    const totalBilan = y.immoNettes + actifCirculant + y.tresoActif;
    const detteNette = y.dettesFinancieres + y.tresoPassif - y.tresoActif;

    return {
      va, ebe, rex, rf, rao, rn, caf,
      fr, bfr, tn, totalBilan, detteNette, actifCirculant, passifCirculant, ressourcesStables,
      margeVA: va / y.ca,
      margeEbe: ebe / y.ca,
      margeNette: rn / y.ca,
      dso: (y.creances / y.ca) * 360,
      dio: (y.stocks / y.achats) * 360,
      dpo: (y.fournisseurs / (y.achats + y.servicesExt)) * 360,
      bfrJours: (bfr / y.ca) * 360,
      autonomie: y.capitauxPropres / totalBilan,
      gearing: y.capitauxPropres > 0 ? detteNette / y.capitauxPropres : Infinity,
      capaRemb: y.dettesFinancieres / caf,
      couvFF: y.fraisFinanciers > 0 ? ebe / y.fraisFinanciers : Infinity,
      liquiditeGen: (actifCirculant + y.tresoActif) / (passifCirculant + y.tresoPassif),
      roe: rn / y.capitauxPropres,
      roce: rex / (y.immoNettes + bfr),
      chargesPersoVA: y.chargesPersonnel / va,
    };
  }

  // Seuils utilisés par les banques (ordres de grandeur, à adapter au secteur).
  const THRESHOLDS = {
    margeEbe:   { good: 0.12, bad: 0.05, higher: true,  label: 'Marge d’EBE', fmt: 'pct' },
    margeNette: { good: 0.05, bad: 0.01, higher: true,  label: 'Marge nette', fmt: 'pct' },
    autonomie:  { good: 0.35, bad: 0.20, higher: true,  label: 'Autonomie financière', fmt: 'pct' },
    gearing:    { good: 1.0,  bad: 2.0,  higher: false, label: 'Gearing (dette nette / CP)', fmt: 'x' },
    capaRemb:   { good: 3.0,  bad: 5.0,  higher: false, label: 'Capacité de remboursement (DF / CAF)', fmt: 'ans' },
    couvFF:     { good: 5.0,  bad: 2.5,  higher: true,  label: 'Couverture des frais financiers (EBE / FF)', fmt: 'x' },
    liquiditeGen: { good: 1.3, bad: 1.0, higher: true, label: 'Liquidité générale', fmt: 'x' },
    bfrJours:   { good: 45,   bad: 90,   higher: false, label: 'BFR en jours de CA', fmt: 'j' },
    roe:        { good: 0.12, bad: 0.04, higher: true,  label: 'Rentabilité des capitaux propres (ROE)', fmt: 'pct' },
  };

  function status(key, value) {
    const t = THRESHOLDS[key];
    if (!t) return 'warn';
    if (value === Infinity) return t.higher ? 'good' : 'bad';
    if (!isFinite(value)) return 'warn';
    if (t.higher) return value >= t.good ? 'good' : value <= t.bad ? 'bad' : 'warn';
    // Capacité de remboursement négative = CAF négative : aucune capacité à rembourser.
    if (key === 'capaRemb' && value < 0) return 'bad';
    return value <= t.good ? 'good' : value >= t.bad ? 'bad' : 'warn';
  }

  // Grille de scoring simple sur 100 points.
  const SCORE_WEIGHTS = {
    margeEbe: 15, autonomie: 15, capaRemb: 20, couvFF: 15, liquiditeGen: 10, bfrJours: 10, roe: 5, gearing: 10,
  };

  function score(m, growth) {
    let total = 0;
    const details = [];
    for (const [key, w] of Object.entries(SCORE_WEIGHTS)) {
      const s = status(key, m[key]);
      const pts = s === 'good' ? w : s === 'warn' ? w / 2 : 0;
      total += pts;
      details.push({ key, label: THRESHOLDS[key].label, pts, max: w, status: s });
    }
    if (m.tn < 0) total -= 5;
    if (growth !== undefined && growth < -0.05) total -= 5;
    total = Math.max(0, Math.min(100, Math.round(total)));
    const grade = total >= 80 ? 'A' : total >= 65 ? 'B' : total >= 50 ? 'C' : total >= 35 ? 'D' : 'E';
    const reading = {
      A: 'Risque faible : dossier bancable dans des conditions standard.',
      B: 'Risque modéré : finançable, avec des garanties classiques.',
      C: 'Risque moyen : finançable sous conditions (garanties renforcées, covenants, montant réduit).',
      D: 'Risque élevé : restructuration ou apport en fonds propres préalable.',
      E: 'Risque très élevé : refus en l’état.',
    }[grade];
    return { total, grade, reading, details };
  }

  // Prêt amortissable : annuités constantes ou amortissement constant.
  function loanSchedule(principal, rateAnnual, years, type = 'annuity', periodsPerYear = 1) {
    const n = years * periodsPerYear;
    const r = rateAnnual / periodsPerYear;
    const rows = [];
    let crd = principal;
    const annuity = r === 0 ? principal / n : principal * r / (1 - (1 + r) ** -n);
    for (let k = 1; k <= n; k++) {
      const interest = crd * r;
      const amort = type === 'annuity' ? annuity - interest : principal / n;
      const payment = amort + interest;
      crd = Math.max(0, crd - amort);
      rows.push({ k, interest, amort, payment, crd });
    }
    return rows;
  }

  function fmt(v, kind = 'm') {
    if (v === Infinity) return '∞';
    if (!isFinite(v)) return '–';
    switch (kind) {
      case 'pct': return (v * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
      case 'x': return v.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' x';
      case 'ans': return v.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' ans';
      case 'j': return Math.round(v).toLocaleString('fr-FR') + ' j';
      default: return v.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M';
    }
  }

  return { balance, analyze, status, score, loanSchedule, fmt, round, THRESHOLDS };
})();

if (typeof module !== 'undefined') module.exports = Engine;
