const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Add states for new source/partner
const newStates = `
  const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'sources' | 'partners' | 'collector'>('overview');
  
  const handleForceSync = async () => {
    await authFetch('/api/v1/admin/collector/force', { method: 'POST' });
    fetchData();
  };

  const handleDeleteDoc = async (id: string) => {
    await authFetch(\`/api/v1/admin/documents/\${id}\`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteSource = async (id: string) => {
    await authFetch(\`/api/v1/admin/sources/\${id}\`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeletePartner = async (id: string) => {
    await authFetch(\`/api/v1/admin/partners/\${id}\`, { method: 'DELETE' });
    fetchData();
  };
`;

code = code.replace("const [activeTab, setActiveTab] = useState<'overview' | 'docs' | 'sources' | 'partners' | 'collector'>('overview');", newStates);

// Replace collector force button
code = code.replace(
  '<h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><RefreshCw className="text-blue-500" size={20}/> Robot Collecteur</h2>',
  '<h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><RefreshCw className="text-blue-500" size={20}/> Robot Collecteur</h2><button onClick={handleForceSync} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-700">Forcer Synchro</button>'
);

// Delete buttons
code = code.replace(
  '<td className="px-6 py-4 text-xs">{new Date(doc.publication_date).toLocaleDateString(\'fr-FR\')}</td>',
  '<td className="px-6 py-4 text-xs">{new Date(doc.publication_date).toLocaleDateString(\'fr-FR\')}</td><td className="px-6 py-4"><button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 text-xs font-bold">Supprimer</button></td>'
);

code = code.replace(
  '<p className="text-xs text-slate-500 font-medium mt-1">Type: <strong className="uppercase">{src.type}</strong></p>',
  '<p className="text-xs text-slate-500 font-medium mt-1">Type: <strong className="uppercase">{src.type}</strong></p><button onClick={() => handleDeleteSource(src.id)} className="text-red-500 text-xs font-bold mt-2">Supprimer</button>'
);

code = code.replace(
  '<p className="text-xs text-slate-500 font-medium mt-1">Docs Publiés: <strong className="text-slate-800">{p.documents_published}</strong></p>',
  '<p className="text-xs text-slate-500 font-medium mt-1">Docs Publiés: <strong className="text-slate-800">{p.documents_published}</strong></p><button onClick={() => handleDeletePartner(p.id)} className="text-red-500 text-xs font-bold mt-2">Supprimer</button>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
