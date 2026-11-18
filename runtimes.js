// Exécution de Python (Pyodide) et de R (webR) directement dans le navigateur.
// Les deux moteurs sont chargés à la demande (premier lancement : 10 à 30 s selon la connexion).

const PYODIDE_VERSION = '0.26.4';
const WEBR_VERSION = 'v0.4.2';
const DATA_FILE = 'data/etudiants.csv';

const Runtimes = (() => {
  let pyPromise = null;
  let rPromise = null;
  let csvBytes = null;

  async function getCsv() {
    if (!csvBytes) {
      const res = await fetch(DATA_FILE);
      csvBytes = new Uint8Array(await res.arrayBuffer());
    }
    return csvBytes;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Impossible de charger ' + src));
      document.head.appendChild(s);
    });
  }

  // ───────────── Python ─────────────
  function initPython(onStatus) {
    if (pyPromise) return pyPromise;
    pyPromise = (async () => {
      onStatus && onStatus('Chargement de Python (Pyodide)…');
      const base = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
      await loadScript(base + 'pyodide.js');
      const py = await loadPyodide({ indexURL: base });
      py.FS.writeFile('etudiants.csv', await getCsv());
      await py.runPythonAsync(`
import os, sys, io, base64, warnings
os.environ["MPLBACKEND"] = "AGG"
warnings.filterwarnings("ignore", message=".*non-interactive.*")
warnings.filterwarnings("ignore", category=DeprecationWarning)

def __data365_figures():
    if "matplotlib.pyplot" not in sys.modules:
        return []
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return out
`);
      return py;
    })();
    pyPromise.catch(() => { pyPromise = null; });
    return pyPromise;
  }

  async function runPython(code, onStatus) {
    const py = await initPython(onStatus);
    const lines = [];
    py.setStdout({ batched: s => lines.push({ type: 'out', text: s }) });
    py.setStderr({ batched: s => lines.push({ type: 'err', text: s }) });
    onStatus && onStatus('Chargement des bibliothèques…');
    try {
      await py.loadPackagesFromImports(code, { messageCallback: () => {}, errorCallback: () => {} });
    } catch (e) { /* un package introuvable sera signalé à l'exécution */ }
    onStatus && onStatus('Exécution…');
    const ns = py.globals.get('dict')();
    ns.set('__name__', '__main__');
    let error = null;
    try {
      await py.runPythonAsync(code, { globals: ns });
    } catch (e) {
      error = cleanPyError(String(e.message || e));
    }
    let images = [];
    try {
      const figs = py.globals.get('__data365_figures')();
      images = figs.toJs().map(b64 => 'data:image/png;base64,' + b64);
      figs.destroy();
    } catch (e) { /* pas de figure */ }
    ns.destroy();
    if (error) lines.push({ type: 'err', text: error });
    return { lines, images };
  }

  function cleanPyError(msg) {
    // Garde la fin utile de la trace (sans les cadres internes de Pyodide)
    const parts = msg.split('\n');
    const idx = parts.findIndex(l => l.includes('File "<exec>"'));
    return (idx >= 0 ? parts.slice(idx) : parts.slice(-6)).join('\n').trim();
  }

  // ───────────── R ─────────────
  function initR(onStatus) {
    if (rPromise) return rPromise;
    rPromise = (async () => {
      onStatus && onStatus('Chargement de R (webR)…');
      const { WebR } = await import(`https://webr.r-wasm.org/${WEBR_VERSION}/webr.mjs`);
      const webR = new WebR();
      await webR.init();
      await webR.FS.writeFile('/home/web_user/etudiants.csv', await getCsv());
      return { webR, installed: new Set() };
    })();
    rPromise.catch(() => { rPromise = null; });
    return rPromise;
  }

  const BASE_R_PKGS = new Set(['stats', 'utils', 'graphics', 'grDevices', 'methods', 'base', 'datasets', 'tools', 'grid', 'parallel', 'splines']);

  function detectRPackages(code) {
    const noComments = code.split('\n').map(l => l.replace(/#.*$/, '')).join('\n');
    const found = new Set();
    for (const m of noComments.matchAll(/\b(?:library|require)\(\s*["']?([A-Za-z][\w.]*)["']?\s*\)/g)) found.add(m[1]);
    for (const m of noComments.matchAll(/\b([A-Za-z][\w.]*)::/g)) found.add(m[1]);
    return [...found].filter(p => !BASE_R_PKGS.has(p));
  }

  async function runR(code, onStatus) {
    const ctx = await initR(onStatus);
    const { webR } = ctx;
    const pkgs = detectRPackages(code).filter(p => !ctx.installed.has(p));
    if (pkgs.length) {
      onStatus && onStatus('Installation de ' + pkgs.join(', ') + '…');
      try { await webR.installPackages(pkgs, { quiet: true }); } catch (e) { /* signalé à l'exécution */ }
      pkgs.forEach(p => ctx.installed.add(p));
    }
    onStatus && onStatus('Exécution…');
    const shelter = await new webR.Shelter();
    const lines = [];
    const images = [];
    try {
      const res = await shelter.captureR(code, {
        withAutoprint: true,
        captureStreams: true,
        captureConditions: false,
        captureGraphics: { width: 640, height: 420 },
      });
      for (const o of res.output) {
        lines.push({ type: o.type === 'stderr' ? 'err' : 'out', text: o.data });
      }
      for (const img of res.images || []) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        images.push(canvas.toDataURL('image/png'));
      }
    } catch (e) {
      lines.push({ type: 'err', text: 'Erreur : ' + String(e.message || e).replace(/^Error:\s*/, '') });
    } finally {
      shelter.purge();
    }
    return { lines, images };
  }

  function run(lang, code, onStatus) {
    return lang === 'r' ? runR(code, onStatus) : runPython(code, onStatus);
  }

  function isReady(lang) {
    return lang === 'r' ? !!rPromise : !!pyPromise;
  }

  return { run, isReady, initPython, initR };
})();

// Compare la sortie obtenue à la sortie attendue (lignes consécutives, espaces normalisés).
function outputMatches(stdout, expected) {
  const norm = s => s.split('\n').map(l => l.trim().replace(/\s+/g, ' ')).filter(Boolean);
  const out = norm(stdout);
  const exp = norm(expected);
  if (!exp.length) return false;
  for (let i = 0; i + exp.length <= out.length; i++) {
    if (exp.every((l, j) => out[i + j] === l)) return true;
  }
  return false;
}
