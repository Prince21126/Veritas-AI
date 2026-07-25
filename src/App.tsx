import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Scale, CheckCircle2, AlertTriangle, Info, ArrowRight, ShieldCheck, XCircle, FileSearch, ShieldAlert, Shield, Paperclip, FileText, UploadCloud, LogIn, LogOut, Settings, LayoutDashboard, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminDashboard } from './components/AdminDashboard';
import { PartnerDashboard } from './components/PartnerDashboard';

// --- Auth Context Mock ---
const useAuth = () => {
  const [user, setUser] = useState<{ id: string, email: string, role: string, name: string } | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('veritas_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = (userData: any, token: string) => {
    localStorage.setItem('veritas_token', token);
    localStorage.setItem('veritas_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('veritas_token');
    localStorage.removeItem('veritas_user');
    setUser(null);
  };

  return { user, login, logout };
};

// --- API Helper ---
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('veritas_token');
  if (token) {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
  }
  return fetch(url, options);
};

// --- Components ---
const Navigation = ({ user, logout }: { user: any, logout: () => void }) => (
  <nav className="w-full bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
    <Link to="/" className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
        <ShieldCheck size={24} strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">VERITAS<span className="text-blue-600">.AI</span></h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vérification Responsable</p>
      </div>
    </Link>
    <div className="flex items-center gap-4">
      <div className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
        Version RDC
      </div>
      
      {user ? (
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-slate-700 hidden sm:block">
            {user.name} <span className="text-slate-400 text-xs">({user.role})</span>
          </div>
          {user.role === 'admin' && (
            <Link to="/admin" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings size={20} />
            </Link>
          )}
          {user.role === 'partner' && (
            <Link to="/partner" className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Database size={20} />
            </Link>
          )}
          <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Déconnexion">
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-2">
          <LogIn size={18} /> Connexion
        </Link>
      )}
    </div>
  </nav>
);

const LoginView = ({ login }: { login: (user: any, token: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      login(data.user, data.token);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'partner') navigate('/partner');
      else navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Connexion Sécurisée</h2>
          <p className="text-sm text-slate-500 mt-2">Accès partenaires officiels et administrateurs</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Officiel</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

const MainView = () => {

  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/v1/veritas/history').then(r => r.json()).then(d => {
      if(Array.isArray(d)) setHistory(d.slice(0,2));
    }).catch(e => console.error(e));
  }, []);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const [loadingMsg, setLoadingMsg] = useState("Veritas AI is consulting trusted sources...");
  const loadingMessages = [
    "Veritas AI consulte les institutions de confiance...",
    "Recherche dans les publications officielles...",
    "Analyse des documents joints...",
    "Comparaison des preuves disponibles...",
    "Évaluation de la fiabilité des sources...",
    "Croisement des publications récentes...",
    "Préparation de votre rapport responsable..."
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 5) return;
    
    setLoading(true);
    setResultData(null);
    setErrorMsg(null);
    
    try {
      const formData = new FormData();
      formData.append('raw_text', query);
      if (attachedFile) formData.append('file', attachedFile);

      const res = await fetch('/api/v1/veritas/submit', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de la vérification.');
      }
      
      setResultId(data.id);
      pollResult(data.id);
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const pollResult = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/veritas/result/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la récupération des résultats.');
      }
      
      if (data.status === 'processing') {
        setTimeout(() => pollResult(id), 2000);
      } else {
        setResultData(data);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <AnimatePresence mode="wait">
        {!resultData ? (
          <motion.div 
            key="input-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="flex-1 flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto w-full"
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4 leading-tight">
                Vérifiez l'information <br/> avant de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">partager.</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                Notre IA croise les rumeurs avec les bases de données officielles et les médias fiables en temps réel.
              </p>
            </div>

            <div className="w-full bg-white p-4 md:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all focus-within:shadow-[0_8px_40px_rgb(59,130,246,0.1)] focus-within:border-blue-200">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center text-blue-600 flex-shrink-0 hidden sm:flex">
                    <Search size={24} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Information à vérifier</label>
                    <div className="relative">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ex: Une attaque est signalée à Bukavu ce soir..."
                        className={`w-full min-h-[100px] bg-slate-50 border ${errorMsg ? 'border-red-400' : 'border-slate-200'} rounded-xl px-4 py-3 pb-16 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all resize-none outline-none`}
                        disabled={loading}
                      />
                      <div className="absolute left-3 bottom-3 flex items-center gap-2">
                        <label className="cursor-pointer text-slate-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 flex items-center gap-2 hover:bg-blue-50">
                          <Paperclip size={16} />
                          <span className="text-xs font-semibold hidden sm:inline">Joindre une preuve (Image, Audio)</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                            disabled={loading}
                          />
                        </label>
                        {attachedFile && (
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                            <FileText size={14} />
                            <span className="truncate max-w-[100px]">{attachedFile.name}</span>
                            <button type="button" onClick={() => setAttachedFile(null)} className="ml-1 text-blue-500 hover:text-blue-900"><XCircle size={14} /></button>
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={loading || query.trim().length < 5}
                        className="absolute right-3 bottom-3 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
                      >
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /><span className="text-xs">{loadingMsg}</span></> : "Vérifier"}
                      </button>
                    </div>
                    {errorMsg && (
                      <p className="text-red-500 text-sm font-medium mt-2 flex items-center gap-1">
                        <AlertCircle size={16} /> {errorMsg}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-3">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center mr-2">Recherches récentes:</span>
    {history.length > 0 ? history.map(h => (
      <button key={h.id} onClick={() => setQuery(h.query)} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors max-w-xs truncate" title={h.query}>{h.query}</button>
    )) : (
      <>
        <button onClick={() => setQuery("Les écoles seront-elles fermées à Bukavu demain suite à Ebola ?")} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">Écoles Bukavu Ebola</button>
        <button onClick={() => setQuery("L'OMS confirme que boire de l'eau salée guérit le choléra")} className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">Eau salée Choléra</button>
      </>
    )}
  </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => { setResultData(null); setQuery(''); setAttachedFile(null); }}
                className="text-slate-400 hover:text-slate-700 flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
              >
                <ArrowRight size={24} className="rotate-180" />
              </button>
              <h2 className="text-2xl font-black text-slate-800">Rapport d'Analyse</h2>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${
                resultData.analysis_json.verification_status === 'Vérifié' ? 'bg-emerald-500' : 
                resultData.analysis_json.verification_status === 'Contredit' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pl-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                      resultData.analysis_json.verification_status === 'Vérifié' ? 'bg-emerald-100 text-emerald-700' : 
                      resultData.analysis_json.verification_status === 'Contredit' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {resultData.analysis_json.verification_status === 'Vérifié' ? <CheckCircle2 size={16} /> : 
                       resultData.analysis_json.verification_status === 'Contredit' ? <XCircle size={16} /> : <AlertTriangle size={16} />}
                      {resultData.analysis_json.verification_status}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {resultData.analysis_json.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{resultData.analysis_json.summary}</h3>
                </div>
                
                <div className="flex md:flex-col items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[160px] justify-center text-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Score de Confiance</p>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-3xl font-black text-slate-800">{resultData.confidence.confidence_score}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4">
                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Scale size={16} className="text-blue-500" /> Analyse Détaillée
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {resultData.analysis_json.reasoning}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-blue-500" /> Conseil Responsable
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      {resultData.analysis_json.responsible_advice || "Agissez avec prudence et consultez les sources officielles."}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileSearch size={16} className="text-blue-500" /> Preuves Issues de la Base
                  </h4>
                  <div className="space-y-3">
                    {resultData.sources && resultData.sources.length > 0 ? (
                      resultData.sources.map((src: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-slate-800">{src.organization}</h4>
                            <span className="text-[10px] text-slate-500 font-medium">{src.publication_date}</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2 line-clamp-3">
                            "{src.text_extract}"
                          </div>
                          {src.selection_reason && (
                            <div className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                              <ShieldCheck size={12} /> {src.selection_reason}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">Aucune source officielle trouvée.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default function App() {
  const { user, login, logout } = useAuth();
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-blue-100">
        <Navigation user={user} logout={logout} />
        <Routes>
          <Route path="/" element={<MainView />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginView login={login} />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/partner" element={user?.role === 'partner' ? <PartnerDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
