import React, { useState, useEffect } from 'react';
import { Settings, Database, Server, Users, Search, RefreshCw, FileText, CheckCircle2, ShieldAlert, Plus, Pencil, Trash2, X, UserPlus, Building, Mail, Shield } from 'lucide-react';
import { authFetch, parseJsonResponse } from '../utils/api';
import { IngestionForm } from './IngestionForm';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [collector, setCollector] = useState<any>(null);
  const [newSource, setNewSource] = useState({ name: '', url: '', institution: '', country: 'RDC', category: 'General', type: 'web' });
  const [editingSource, setEditingSource] = useState<any>(null);
  
  // Partner Form State
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerFormData, setPartnerFormData] = useState<any>({
    id: '',
    name: '',
    email: '',
    password: 'partner123',
    organization: '',
    category: 'Santé',
    trust_level: 0.9,
    status: 'active'
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'sources' | 'partners' | 'collector'>('overview');

  const handleForceSync = async () => {
    await authFetch('/api/v1/admin/collector/force', { method: 'POST' });
    fetchData();
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    await authFetch('/api/v1/admin/sources', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource)
    });
    setNewSource({ name: '', url: '', institution: '', country: 'RDC', category: 'General', type: 'web' });
    fetchData();
  };
  
  const handleUpdateSource = async (e: React.FormEvent) => {
      e.preventDefault();
      await authFetch(`/api/v1/admin/sources/${editingSource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingSource)
      });
      setEditingSource(null);
      fetchData();
  };

  const openCreatePartnerModal = () => {
    setPartnerFormData({
      id: '',
      name: '',
      email: '',
      password: 'partner123',
      organization: '',
      category: 'Santé',
      trust_level: 0.9,
      status: 'active'
    });
    setShowPartnerModal(true);
  };

  const openEditPartnerModal = (partner: any) => {
    setPartnerFormData({
      id: partner.id,
      name: partner.name || '',
      email: partner.email || '',
      password: partner.password || 'partner123',
      organization: partner.organization || '',
      category: partner.category || 'Santé',
      trust_level: partner.trust_level ?? 0.9,
      status: partner.status || 'active'
    });
    setShowPartnerModal(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerFormData.id) {
      // Update
      await authFetch(`/api/v1/admin/partners/${partnerFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerFormData)
      });
    } else {
      // Create
      const payload = { ...partnerFormData };
      delete payload.id;
      await authFetch('/api/v1/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setShowPartnerModal(false);
    fetchData();
  };

  const handleDeleteDoc = async (id: string) => {
    await authFetch(`/api/v1/admin/documents/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteSource = async (id: string) => {
    await authFetch(`/api/v1/admin/sources/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeletePartner = async (id: string) => {
    await authFetch(`/api/v1/admin/partners/${id}`, { method: 'DELETE' });
    fetchData();
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, docsRes, sourcesRes, partnersRes, collectorRes] = await Promise.all([
        authFetch('/api/v1/admin/dashboard'),
        authFetch('/api/v1/admin/documents'),
        authFetch('/api/v1/admin/sources'),
        authFetch('/api/v1/admin/partners'),
        authFetch('/api/v1/admin/collector')
      ]);
      setStats(await parseJsonResponse(statsRes));
      setDocuments(await parseJsonResponse(docsRes));
      setSources(await parseJsonResponse(sourcesRes));
      setPartners(await parseJsonResponse(partnersRes));
      setCollector(await parseJsonResponse(collectorRes));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <div className="mb-4">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Settings className="text-blue-600" /> Admin
          </h1>
          <p className="text-slate-500 text-sm font-medium">Panneau de contrôle</p>
        </div>
        <button onClick={() => setActiveTab('overview')} className={`text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Vue Générale</button>
        <button onClick={() => setActiveTab('docs')} className={`text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Base de Connaissances</button>
        <button onClick={() => setActiveTab('sources')} className={`text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'sources' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Sources Automatiques</button>
        <button onClick={() => setActiveTab('partners')} className={`text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'partners' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Partenaires Officiels</button>
        <button onClick={() => setActiveTab('collector')} className={`text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'collector' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Collecteur Robot</button>
      </div>
      
      <div className="flex-1">
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-1">Documents Indexés</h3>
              <p className="text-3xl font-black text-slate-800">{stats.total_documents}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-1">Sources Actives</h3>
              <p className="text-3xl font-black text-slate-800">{stats.active_sources}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-1">Partenaires</h3>
              <p className="text-3xl font-black text-slate-800">{stats.active_partners}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-slate-500 text-xs font-bold uppercase mb-1">Chunks (Vecteurs)</h3>
              <p className="text-3xl font-black text-slate-800">{stats.total_chunks}</p>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="flex flex-col gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="text-blue-500" size={20}/> Ajouter un Document</h2>
                <IngestionForm />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Database className="text-blue-500" size={20}/> Base de Connaissances</h2>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Titre</th>
                        <th className="px-6 py-4">Institution</th>
                        <th className="px-6 py-4">Catégorie</th>
                        <th className="px-6 py-4">Fiabilité</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documents.map((doc, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate" title={doc.title}>{doc.title}</td>
                          <td className="px-6 py-4">{doc.institution}</td>
                          <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{doc.category}</span></td>
                          <td className="px-6 py-4 text-emerald-600 font-bold">{Math.round(doc.reliability_score * 100)}%</td>
                          <td className="px-6 py-4 text-xs">{new Date(doc.publication_date).toLocaleDateString('fr-FR')}</td><td className="px-6 py-4"><button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 text-xs font-bold">Supprimer</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="flex flex-col gap-8">
            <form onSubmit={handleAddSource} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <h2 className="col-span-1 md:col-span-2 text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><Plus className="text-blue-500" size={20}/> Ajouter une Source</h2>
                <input placeholder="Nom de la source" value={newSource.name} onChange={e => setNewSource({...newSource, name: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input placeholder="URL" value={newSource.url} onChange={e => setNewSource({...newSource, url: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input placeholder="Institution" value={newSource.institution} onChange={e => setNewSource({...newSource, institution: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">Ajouter Source</button>
            </form>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Server className="text-blue-500" size={20}/> Sources de Confiance</h2>
              </div>
              <div className="p-6 grid grid-cols-1 gap-4">
                {sources.map(src => (
                  <div key={src.id} className="p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {editingSource?.id === src.id ? (
                        <form onSubmit={handleUpdateSource} className="flex gap-2">
                             <input value={editingSource.name} onChange={e => setEditingSource({...editingSource, name: e.target.value})} className="px-2 py-1 border border-slate-200 rounded" />
                             <button type="submit" className="text-emerald-600 text-xs font-bold">Sauvegarder</button>
                        </form>
                    ) : (
                        <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        {src.name} 
                        {src.status === 'active' ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">Actif</span> : <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">En pause</span>}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{src.institution} • {src.country} • {src.category}</p>
                      <p className="text-xs text-slate-400 font-mono mt-1">{src.url}</p>
                    </div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Docs: <strong className="text-slate-800">{src.documents_collected}</strong></p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Type: <strong className="uppercase">{src.type}</strong></p>
                      <button onClick={() => setEditingSource(src)} className="text-blue-500 text-xs font-bold mt-2 mr-2">Modifier</button>
                      <button onClick={() => handleDeleteSource(src.id)} className="text-red-500 text-xs font-bold mt-2">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="text-blue-500" size={20} /> Partenaires Officiels
                </h2>
                <p className="text-xs text-slate-500 mt-1">Gérer les accès, accréditations et secteurs des partenaires institutionnels</p>
              </div>
              <button
                onClick={openCreatePartnerModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-105 text-sm"
                title="Ajouter un partenaire"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span className="hidden sm:inline">Ajouter Partenaire</span>
              </button>
            </div>

            {showPartnerModal && (
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-lg relative animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <UserPlus className="text-blue-600" size={18} />
                    {partnerFormData.id ? "Modifier le Partenaire" : "Créer un Nouveau Partenaire"}
                  </h3>
                  <button
                    onClick={() => setShowPartnerModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSavePartner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nom Complet / Responsable</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dr. Jean Dupont"
                      value={partnerFormData.name}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Email Officiel</label>
                    <input
                      type="email"
                      required
                      placeholder="partner@institution.org"
                      value={partnerFormData.email}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Mot de Passe</label>
                    <input
                      type="text"
                      required
                      value={partnerFormData.password}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Organisation / Institution</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ministère de la Santé RDC"
                      value={partnerFormData.organization}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, organization: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Secteur / Catégorie</label>
                    <select
                      value={partnerFormData.category}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Santé">Santé</option>
                      <option value="Politique">Politique</option>
                      <option value="Économie">Économie</option>
                      <option value="Éducation">Éducation</option>
                      <option value="Presse & Médias">Presse & Médias</option>
                      <option value="Justice">Justice</option>
                      <option value="Général">Général</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Niveau de Confiance (0-100%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(partnerFormData.trust_level * 100)}
                      onChange={(e) => setPartnerFormData({ ...partnerFormData, trust_level: Number(e.target.value) / 100 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowPartnerModal(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100"
                    >
                      {partnerFormData.id ? "Sauvegarder les modifications" : "Créer le compte Partenaire"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 grid grid-cols-1 gap-4">
                {partners.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">Aucun partenaire enregistré pour le moment.</p>
                ) : (
                  partners.map((p) => (
                    <div key={p.id} className="p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800">{p.name}</h4>
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {p.category || 'Général'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Building size={12} /> {p.organization}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Mail size={12} /> {p.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-auto">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-medium">Fiabilité: <strong className="text-emerald-600">{Math.round((p.trust_level || 0.8) * 100)}%</strong></p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Docs: <strong className="text-slate-800">{p.documents_published || 0}</strong></p>
                        </div>
                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                          <button
                            onClick={() => openEditPartnerModal(p)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier Partenaire"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePartner(p.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer Partenaire"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collector' && collector && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><RefreshCw className="text-blue-500" size={20}/> Robot Collecteur</h2><button onClick={handleForceSync} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-700">Forcer Synchro</button>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{collector.status}</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2">Statut du Pipeline</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex justify-between border-b border-slate-100 pb-2"><span>Dernière exécution</span> <span className="font-medium">{new Date(collector.last_run).toLocaleString('fr-FR')}</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-2"><span>Intervalle</span> <span className="font-medium">{collector.interval_ms / 60000} minutes</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-2"><span>Nouveaux documents (Aujourd'hui)</span> <span className="font-medium text-emerald-600">+{collector.documents_indexed_today}</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-2"><span>Erreurs de scraping</span> <span className="font-medium text-red-500">{collector.errors_today}</span></li>
                </ul>
              </div>
              <div>
                 <h4 className="text-sm font-bold text-slate-700 mb-2">Adapteurs Actifs</h4>
                 <div className="flex flex-wrap gap-2">
                   {collector.adapters.map((a: string, i: number) => (
                     <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500"/> {a}</span>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
