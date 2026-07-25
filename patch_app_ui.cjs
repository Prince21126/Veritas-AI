const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard loading with rotating messages
const loadingCode = `
  const [loadingMsg, setLoadingMsg] = useState("Veritas AI is consulting trusted sources...");
  const loadingMessages = [
    "Recherche dans les publications officielles...",
    "Comparaison des preuves disponibles...",
    "Évaluation de la fiabilité des sources...",
    "Croisement des publications récentes...",
    "Génération de votre rapport de vérification..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      let i = 0;
      interval = setInterval(() => {
        setLoadingMsg(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);
`;

code = code.replace("const [attachedFile, setAttachedFile] = useState<File | null>(null);", "const [attachedFile, setAttachedFile] = useState<File | null>(null);\n" + loadingCode);

// Add frequent searches from real history
const historyFetchCode = `
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/v1/veritas/history').then(r => r.json()).then(d => {
      if(Array.isArray(d)) setHistory(d.slice(0,2));
    }).catch(e => console.error(e));
  }, []);
`;
code = code.replace("const MainView = () => {", "const MainView = () => {\n" + historyFetchCode);

// Replace button with rotating messages
code = code.replace(
  "{loading ? <div className=\"w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin\" /> : \"Vérifier\"}",
  "{loading ? <><div className=\"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2\" /><span className=\"text-xs\">{loadingMsg}</span></> : \"Vérifier\"}"
);

// Replace frequent searches buttons with actual history mapping
code = code.replace(
  /<div className="mt-8 flex flex-wrap justify-center gap-3">[\s\S]*?<\/div>/,
  `<div className="mt-8 flex flex-wrap justify-center gap-3">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center mr-2">Recherches récentes:</span>
    {history.length > 0 ? history.map(h => (
      <button key={h.id} onClick={() => setQuery(h.query)} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors max-w-xs truncate" title={h.query}>{h.query}</button>
    )) : (
      <>
        <button onClick={() => setQuery("Les écoles seront-elles fermées à Bukavu demain suite à Ebola ?")} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">Écoles Bukavu Ebola</button>
        <button onClick={() => setQuery("L'OMS confirme que boire de l'eau salée guérit le choléra")} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">Eau salée Choléra</button>
      </>
    )}
  </div>`
);

fs.writeFileSync('src/App.tsx', code);
