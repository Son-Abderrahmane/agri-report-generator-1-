import React, { useState, useEffect } from 'react';
import { Crop, Pesticide, QuickFormula, EvaluationTemplate, RecommendationCategory } from '../types';
import { Settings, Save, Plus, Trash2, Edit2, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';

interface MasterDataSettingsProps {
  apiBase: string;
  token: string;
}

export const MasterDataSettings: React.FC<MasterDataSettingsProps> = ({ apiBase, token }) => {
  const [activeTab, setActiveTab] = useState<'pesticides' | 'crops' | 'formulas' | 'evaluations' | 'categories'>('pesticides');
  const [isLoading, setIsLoading] = useState(false);
  const [showImportZone, setShowImportZone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCulture, setFilterCulture] = useState('');

  // States
  const [crops, setCrops] = useState<Crop[]>([]);
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);
  const [formulas, setFormulas] = useState<QuickFormula[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationTemplate[]>([]);
  const [categories, setCategories] = useState<RecommendationCategory[]>([]);

  // Form States
  const [editingPesticide, setEditingPesticide] = useState<Partial<Pesticide> | null>(null);
  const [editingFormula, setEditingFormula] = useState<Partial<QuickFormula> | null>(null);
  const [editingEval, setEditingEval] = useState<Partial<EvaluationTemplate> | null>(null);
  const [newCropName, setNewCropName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportExcel = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/pesticides/import`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        // If it's not JSON, it's likely a server HTML error
        const text = await res.text();
        console.error('Non-JSON response from server:', text);
        alert(`Erreur Serveur: Impossible de lire la réponse (Vérifiez la console). Statut: ${res.status}`);
        return;
      }

      if (res.ok) {
        alert(data.message || 'Importation réussie');
        setShowImportZone(false);
        fetchData();
      } else {
        alert(`Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (err) {
      alert('Erreur lors de l\'importation');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleImportExcel(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleImportExcel(e.dataTransfer.files[0]);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cr, pe, fo, ev, cat] = await Promise.all([
        fetch(`${apiBase}/crops`, { headers }).then(res => res.json()),
        fetch(`${apiBase}/pesticides`, { headers }).then(res => res.json()),
        fetch(`${apiBase}/quick-formulas`, { headers }).then(res => res.json()),
        fetch(`${apiBase}/evaluation-templates`, { headers }).then(res => res.json()),
        fetch(`${apiBase}/recommendation-categories`, { headers }).then(res => res.json())
      ]);
      setCrops(cr || []);
      setPesticides(pe || []);
      setFormulas(fo || []);
      setEvaluations(ev || []);
      setCategories(cat || []);
    } catch (e) {
      console.error('Failed to load master data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CRUD Crops ---
  const handleSaveCrop = async () => {
    if (!newCropName.trim()) return;
    try {
      const res = await fetch(`${apiBase}/crops`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newCropName })
      });
      if (res.ok) {
        setNewCropName('');
        fetchData();
      }
    } catch (e) { console.error(e); }
  };
  const handleDeleteCrop = async (id: number) => {
    if (!window.confirm('Supprimer cette culture ?')) return;
    await fetch(`${apiBase}/crops/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  // --- CRUD Pesticides ---
  const handleSavePesticide = async () => {
    if (!editingPesticide?.product_name) return;
    const isEditing = !!editingPesticide.id;
    const url = isEditing ? `${apiBase}/pesticides/${editingPesticide.id}` : `${apiBase}/pesticides`;
    await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(editingPesticide)
    });
    setEditingPesticide(null);
    fetchData();
  };
  const handleDeletePesticide = async (id: number) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    await fetch(`${apiBase}/pesticides/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const handleDeleteAllPesticides = async () => {
    if (!window.confirm('ATTENTION: Voulez-vous vraiment supprimer TOUS les produits phytosanitaires ? Cette action est irréversible.')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/pesticides/all`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Tous les produits ont été supprimés.');
        fetchData();
      } else {
        alert(`Erreur: ${data.error || 'Erreur inconnue'}`);
        setIsLoading(false);
      }
    } catch (err) {
      alert('Erreur lors de la suppression');
      setIsLoading(false);
    }
  };

  // --- CRUD Formulas ---
  const handleSaveFormula = async () => {
    if (!editingFormula?.content) return;
    const isEditing = !!editingFormula.id;
    const url = isEditing ? `${apiBase}/quick-formulas/${editingFormula.id}` : `${apiBase}/quick-formulas`;
    await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(editingFormula)
    });
    setEditingFormula(null);
    fetchData();
  };
  const handleDeleteFormula = async (id: number) => {
    if (!window.confirm('Supprimer cette formule ?')) return;
    await fetch(`${apiBase}/quick-formulas/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  // --- CRUD Evaluations ---
  const handleSaveEval = async () => {
    if (!editingEval?.name) return;
    const isEditing = !!editingEval.id;
    const url = isEditing ? `${apiBase}/evaluation-templates/${editingEval.id}` : `${apiBase}/evaluation-templates`;
    await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(editingEval)
    });
    setEditingEval(null);
    fetchData();
  };
  const handleDeleteEval = async (id: number) => {
    if (!window.confirm('Supprimer cette évaluation ?')) return;
    await fetch(`${apiBase}/evaluation-templates/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  // --- CRUD Categories ---
  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch(`${apiBase}/recommendation-categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        setNewCategoryName('');
        fetchData();
      }
    } catch (e) { console.error(e); }
  };
  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    await fetch(`${apiBase}/recommendation-categories/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const uniquePesticideCrops = Array.from(new Set(pesticides.map(p => p.crop_name).filter(Boolean))) as string[];
  const filteredPesticides = pesticides.filter(p => !filterCulture || p.crop_name === filterCulture);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(filteredPesticides.length / itemsPerPage);
  const paginatedPesticides = filteredPesticides.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#344E41] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-[#E9EDC9]">
            <Settings className="w-6 h-6" />
            <h2 className="font-serif italic font-bold text-xl">Base de Données Centrale</h2>
          </div>
          <button onClick={fetchData} className="text-[#E9EDC9] hover:text-white transition-colors">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#EBE9E1] overflow-x-auto">
          {[
            { id: 'pesticides', label: 'Produits Phytosanitaires' },
            { id: 'crops', label: 'Cultures' },
            { id: 'formulas', label: 'Formules Rapides' },
            { id: 'evaluations', label: 'Modèles Bio-Agresseurs' },
            { id: 'categories', label: 'Catégories (Recommandations)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#A3B18A] text-[#344E41] bg-[#F9F8F5]' 
                  : 'border-transparent text-[#8C8F85] hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* PESTICIDES TAB */}
          {activeTab === 'pesticides' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-bold text-[#344E41]">Registre des Produits</h3>
                  <select 
                    value={filterCulture}
                    onChange={(e) => {
                      setFilterCulture(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="border border-[#CCD5AE] rounded-lg px-2 py-1 text-sm text-[#344E41] bg-white focus:outline-none focus:border-[#A3B18A]"
                  >
                    <option value="">Toutes les cultures</option>
                    {uniquePesticideCrops.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" ref={fileInputRef} onChange={onFileInputChange} />
                  
                  {pesticides.length > 0 && (
                    <button 
                      onClick={handleDeleteAllPesticides}
                      className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 hover:bg-red-100 transition-colors"
                      title="Supprimer tous les produits"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  )}

                  <button 
                    onClick={() => setShowImportZone(!showImportZone)}
                    className={`border px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 transition-colors ${
                      showImportZone 
                        ? 'bg-[#344E41] text-[#E9EDC9] border-[#344E41]' 
                        : 'bg-[#E9EDC9] text-[#344E41] border-[#CCD5AE]'
                    }`}
                  >
                    <span>{showImportZone ? 'Fermer Import' : 'Importer Excel'}</span>
                  </button>
                  <button 
                    onClick={() => setEditingPesticide({ product_name: '' })}
                    className="bg-[#A3B18A] text-[#344E41] px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4"/> <span>Nouveau Produit</span>
                  </button>
                </div>
              </div>

              {showImportZone && (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  className={`mb-6 p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    isDragging 
                      ? 'border-[#344E41] bg-[#E9EDC9]/30' 
                      : 'border-[#CCD5AE] bg-[#F9F8F5]'
                  }`}
                >
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                    <svg className="w-8 h-8 text-[#A3B18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-[#344E41] mb-1">Glissez-déposez votre fichier Excel ici</h4>
                  <p className="text-xs text-[#8C8F85] mb-4">ou cliquez ci-dessous pour parcourir (.xlsx, .xls, .csv)</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-[#CCD5AE] text-[#344E41] hover:bg-[#E9EDC9] px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    Parcourir les fichiers
                  </button>
                </div>
              )}

              {editingPesticide && (
                <div className="bg-[#F9F8F5] p-4 rounded-xl border border-[#CCD5AE] mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Produit (ex: ACTARA 25 WG)" value={editingPesticide.product_name || ''} onChange={e => setEditingPesticide({...editingPesticide, product_name: e.target.value})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Matière active" value={editingPesticide.active_ingredient || ''} onChange={e => setEditingPesticide({...editingPesticide, active_ingredient: e.target.value})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Cible (ex: Acariens)" value={editingPesticide.target_pest || ''} onChange={e => setEditingPesticide({...editingPesticide, target_pest: e.target.value})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Détenteur" value={editingPesticide.holder || ''} onChange={e => setEditingPesticide({...editingPesticide, holder: e.target.value})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Fournisseur" value={editingPesticide.supplier || ''} onChange={e => setEditingPesticide({...editingPesticide, supplier: e.target.value})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Dose (ex: 0.5 L/ha)" value={editingPesticide.dosage || ''} onChange={e => setEditingPesticide({...editingPesticide, dosage: e.target.value})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Teneur (ex: 250 g/l)" value={editingPesticide.teneur || ''} onChange={e => setEditingPesticide({...editingPesticide, teneur: e.target.value})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="DAR (ex: 3 jours)" value={editingPesticide.dar || ''} onChange={e => setEditingPesticide({...editingPesticide, dar: e.target.value})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Nbr d'application (ex: 2/an)" value={editingPesticide.nbr_application || ''} onChange={e => setEditingPesticide({...editingPesticide, nbr_application: e.target.value})} className="border p-2 rounded text-sm"/>
                  <select value={editingPesticide.crop_name || ''} onChange={e => setEditingPesticide({...editingPesticide, crop_name: e.target.value})} className="border p-2 rounded text-sm">
                    <option value="">-- Sélectionner Culture --</option>
                    {crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <div className="md:col-span-2 flex justify-end space-x-2 mt-2">
                    <button onClick={() => setEditingPesticide(null)} className="px-4 py-2 text-sm text-gray-500">Annuler</button>
                    <button onClick={handleSavePesticide} className="px-4 py-2 text-sm bg-[#344E41] text-white rounded-lg">Sauvegarder</button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#344E41] text-[#E9EDC9]">
                    <tr>
                      <th className="p-2 border">Culture</th>
                      <th className="p-2 border">Produit</th>
                      <th className="p-2 border">M. Active</th>
                      <th className="p-2 border">Cible</th>
                      <th className="p-2 border">Dose</th>
                      <th className="p-2 border">Teneur</th>
                      <th className="p-2 border">DAR</th>
                      <th className="p-2 border">Nbr App.</th>
                      <th className="p-2 border">Fournisseur</th>
                      <th className="p-2 border text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPesticides.map(p => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 border">{p.crop_name || '-'}</td>
                        <td className="p-2 border font-bold text-[#344E41]">{p.product_name}</td>
                        <td className="p-2 border text-xs text-gray-600">{p.active_ingredient || '-'}</td>
                        <td className="p-2 border">{p.target_pest || '-'}</td>
                        <td className="p-2 border font-mono">{p.dosage || '-'}</td>
                        <td className="p-2 border text-xs">{p.teneur || '-'}</td>
                        <td className="p-2 border text-xs">{p.dar || '-'}</td>
                        <td className="p-2 border text-xs">{p.nbr_application || '-'}</td>
                        <td className="p-2 border">{p.supplier || '-'}</td>
                        <td className="p-2 border text-center space-x-2">
                          <button onClick={() => setEditingPesticide(p)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDeletePesticide(p.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-[#CCD5AE] text-[#344E41] disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <span className="px-3 py-1 text-[#344E41] font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border border-[#CCD5AE] text-[#344E41] disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CROPS TAB */}
          {activeTab === 'crops' && (
            <div>
               <div className="flex space-x-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Nouvelle culture (ex: Tomate Sous Serre)" 
                  value={newCropName} 
                  onChange={e => setNewCropName(e.target.value)}
                  className="border p-2 rounded text-sm w-64"
                />
                <button onClick={handleSaveCrop} className="bg-[#344E41] text-white px-4 py-2 rounded text-sm">Ajouter</button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {crops.map(c => (
                   <div key={c.id} className="border rounded-lg p-3 flex justify-between items-center bg-[#F9F8F5]">
                     <span className="font-bold text-[#344E41]">{c.name}</span>
                     <button onClick={() => handleDeleteCrop(c.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* FORMULAS TAB */}
          {activeTab === 'formulas' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#344E41]">Formules Rapides</h3>
                <button 
                  onClick={() => setEditingFormula({ category: 'diagnostic', content: '' })}
                  className="bg-[#A3B18A] text-[#344E41] px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4"/> <span>Nouvelle Formule</span>
                </button>
              </div>

              {editingFormula && (
                <div className="bg-[#F9F8F5] p-4 rounded-xl border border-[#CCD5AE] mb-6 space-y-3">
                  <select value={editingFormula.category || 'diagnostic'} onChange={e => setEditingFormula({...editingFormula, category: e.target.value})} className="border p-2 rounded text-sm w-full">
                    <option value="diagnostic">Bilan Diagnostic</option>
                    <option value="recommendation">Recommandation</option>
                  </select>
                  <textarea rows={3} placeholder="Contenu de la formule..." value={editingFormula.content || ''} onChange={e => setEditingFormula({...editingFormula, content: e.target.value})} className="border p-2 rounded text-sm w-full" />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setEditingFormula(null)} className="px-4 py-2 text-sm text-gray-500">Annuler</button>
                    <button onClick={handleSaveFormula} className="px-4 py-2 text-sm bg-[#344E41] text-white rounded-lg">Sauvegarder</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formulas.map(f => (
                  <div key={f.id} className="border rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase bg-gray-200 px-2 py-0.5 rounded">{f.category}</span>
                      <p className="text-sm mt-2 font-medium text-[#3D3D3D]">{f.content}</p>
                    </div>
                    <div className="flex justify-end mt-3 space-x-2">
                      <button onClick={() => setEditingFormula(f)} className="text-blue-600"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDeleteFormula(f.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVALUATIONS TAB */}
          {activeTab === 'evaluations' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#344E41]">Modèles Bio-Agresseurs</h3>
                <button 
                  onClick={() => setEditingEval({ name: '', risk_level: 'Alerte Modérée' })}
                  className="bg-[#A3B18A] text-[#344E41] px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4"/> <span>Nouveau Modèle</span>
                </button>
              </div>

              {editingEval && (
                <div className="bg-[#F9F8F5] p-4 rounded-xl border border-[#CCD5AE] mb-6 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Nom du bio-agresseur (ex: Acariens)" value={editingEval.name || ''} onChange={e => setEditingEval({...editingEval, name: e.target.value})} className="border p-2 rounded text-sm w-full"/>
                    <select value={editingEval.risk_level || 'Alerte Modérée'} onChange={e => setEditingEval({...editingEval, risk_level: e.target.value})} className="border p-2 rounded text-sm w-full">
                      <option value="Info">Info / Normal</option>
                      <option value="Alerte Modérée">Alerte Modérée</option>
                      <option value="Élevé">Risque Élevé</option>
                    </select>
                  </div>
                  <textarea rows={2} placeholder="Explication des conditions..." value={editingEval.condition_explanation || ''} onChange={e => setEditingEval({...editingEval, condition_explanation: e.target.value})} className="border p-2 rounded text-sm w-full" />
                  <textarea rows={2} placeholder="Action préventive (💡)..." value={editingEval.preventive_action || ''} onChange={e => setEditingEval({...editingEval, preventive_action: e.target.value})} className="border p-2 rounded text-sm w-full" />
                  <textarea rows={2} placeholder="Phrase pour le rapport (Insérer la remarque)..." value={editingEval.report_sentence || ''} onChange={e => setEditingEval({...editingEval, report_sentence: e.target.value})} className="border p-2 rounded text-sm w-full" />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setEditingEval(null)} className="px-4 py-2 text-sm text-gray-500">Annuler</button>
                    <button onClick={handleSaveEval} className="px-4 py-2 text-sm bg-[#344E41] text-white rounded-lg">Sauvegarder</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluations.map(ev => (
                  <div key={ev.id} className="border rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-[#344E41]">{ev.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border">{ev.risk_level}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{ev.condition_explanation}</p>
                    <p className="text-[10px] text-gray-500 italic mb-2">💡 {ev.preventive_action}</p>
                    <div className="bg-gray-50 p-2 rounded text-xs border border-gray-100">
                      <strong>Phrase rapport:</strong> {ev.report_sentence}
                    </div>
                    <div className="flex justify-end mt-3 space-x-2">
                      <button onClick={() => setEditingEval(ev)} className="text-blue-600"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => handleDeleteEval(ev.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div>
               <div className="flex space-x-2 mb-6">
                <input 
                  type="text" 
                  placeholder="Nouvelle catégorie (ex: Nutrition)" 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="border p-2 rounded text-sm w-64"
                />
                <button onClick={handleSaveCategory} className="bg-[#344E41] text-white px-4 py-2 rounded text-sm">Ajouter</button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {categories.map(c => (
                   <div key={c.id} className="border rounded-lg p-3 flex justify-between items-center bg-[#F9F8F5]">
                     <span className="font-bold text-[#344E41]">{c.name}</span>
                     <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
