import React, { useState, useEffect } from 'react';
import { ShieldCheck, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { authFetch } from '../utils/api';
import { IngestionForm } from './IngestionForm';

export const PartnerDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, docsRes] = await Promise.all([
        authFetch('/api/v1/partner/dashboard'),
        authFetch('/api/v1/partner/documents')
      ]);
      setStats(await statsRes.json());
      setDocuments(await docsRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 w-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" /> Espace Partenaire Officiel
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {stats ? stats.organization : "Chargement..."}
          </p>
        </div>
        
        {stats && (
          <div className="flex gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-center px-4 border-r border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Publications</p>
              <p className="text-xl font-black text-slate-800">{stats.documents_published}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] uppercase font-bold text-slate-400">Score d'Impact</p>
              <p className="text-xl font-black text-emerald-600">{stats.impact_score}%</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-emerald-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud className="text-emerald-600" size={20} />
              Publier un document officiel
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">Les documents soumis ici sont directement indexés dans la Base de Connaissances Veritas. Ils seront utilisés par l'IA pour vérifier les informations du public.</p>
          </div>
        </div>
        <div className="p-6">
          <IngestionForm />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-slate-500" size={20} />
            Vos publications récentes
          </h2>
        </div>
        <div className="p-0">
          {documents.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-600">
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{doc.title}</td>
                    <td className="px-6 py-4 text-xs bg-slate-50"><span className="bg-slate-200 text-slate-600 px-2 py-1 rounded font-semibold">{doc.category}</span></td>
                    <td className="px-6 py-4 text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Indexé</td>
                    <td className="px-6 py-4 text-xs text-slate-400 text-right">{new Date(doc.publication_date).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">Aucune publication récente.</div>
          )}
        </div>
      </div>
    </div>
  );
};
