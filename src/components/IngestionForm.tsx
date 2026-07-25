import React, { useState } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { authFetch } from '../utils/api';

export const IngestionForm = () => {
  const [ingestFile, setIngestFile] = useState<File | null>(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestFile) return;
    setIngestLoading(true);
    setIngestStatus(null);
    const formData = new FormData();
    formData.append('file', ingestFile);
    try {
      const res = await authFetch('/api/v1/knowledge/ingest', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur lors de l'ingestion");
      setIngestStatus({ type: 'success', msg: data.message });
      setIngestFile(null);
    } catch (err: any) {
      setIngestStatus({ type: 'error', msg: err.message });
    } finally {
      setIngestLoading(false);
    }
  };

  return (
    <form onSubmit={handleIngestSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 relative hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
        <input type="file" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => setIngestFile(e.target.files?.[0] || null)} />
        <UploadCloud className="mx-auto text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" size={32} />
        <p className="text-sm font-medium text-slate-700">{ingestFile ? ingestFile.name : "Cliquez ou glissez un fichier source ici"}</p>
        <p className="text-xs text-slate-500 mt-1">Formats supportés: PDF, TXT, DOCX, CSV</p>
      </div>
      {ingestStatus && <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${ingestStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
        {ingestStatus.type === 'success' && <CheckCircle2 size={16} />}
        {ingestStatus.msg}
      </div>}
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={!ingestFile || ingestLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {ingestLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
          Traiter et Indexer
        </button>
      </div>
    </form>
  );
};
