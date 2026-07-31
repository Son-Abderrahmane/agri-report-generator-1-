import React, { useState, useEffect } from 'react';
import { OptimizerSoilAnalysis } from '../../types';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { SoilAnalysisFormModal } from './SoilAnalysisFormModal';

interface SoilAnalysisManagerProps {
  apiBase: string;
  token: string;
}

export const SoilAnalysisManager: React.FC<SoilAnalysisManagerProps> = ({ apiBase, token }) => {
  const [analyses, setAnalyses] = useState<OptimizerSoilAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<OptimizerSoilAnalysis | null>(null);

  useEffect(() => {
    fetchAnalyses();
  }, [apiBase, token]);

  const fetchAnalyses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/optimizer/soil-analyses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAnalyses(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleSave = async (data: Partial<OptimizerSoilAnalysis>) => {
    try {
      const isEdit = !!data.id;
      const url = isEdit ? `${apiBase}/optimizer/soil-analyses/${data.id}` : `${apiBase}/optimizer/soil-analyses`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingAnalysis(null);
        fetchAnalyses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cette analyse ?")) return;
    try {
      await fetch(`${apiBase}/optimizer/soil-analyses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAnalyses();
    } catch (e) {
      console.error(e);
    }
  };

  // Helper for quick visual status
  const getNutrientStatusColor = (value: number, low: number, high: number) => {
    if (!value) return 'bg-gray-200 text-gray-500';
    if (value < low) return 'bg-red-100 text-red-700'; // Deficient
    if (value > high) return 'bg-yellow-100 text-yellow-700'; // High/Moderate
    return 'bg-green-100 text-green-700'; // Optimal
  };

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-5 border border-[#EBE9E1]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#344E41]" />
          <h4 className="font-bold text-[#344E41] font-serif">Analyses de Sol</h4>
        </div>
        <button onClick={() => { setEditingAnalysis(null); setIsModalOpen(true); }} className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#D4A373] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#c29363]">
          <Plus className="w-4 h-4" />
          <span>Nouvelle Analyse</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {analyses.length === 0 ? (
            <div className="col-span-full text-center p-6 bg-white rounded-xl border border-dashed border-[#CCD5AE] text-[#8C8F85] text-sm">
              Aucune analyse de sol configurée.
            </div>
          ) : (
            analyses.map((a) => (
              <div key={a.id} className="bg-white p-5 rounded-xl shadow-sm border border-[#EBE9E1] relative group">
                <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingAnalysis(a); setIsModalOpen(true); }} className="p-1.5 bg-gray-50 rounded hover:text-amber-700"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 bg-gray-50 rounded hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`px-2 py-0.5 rounded text-xs font-bold ${a.status === 'Active' ? 'bg-[#E9EDC9] text-[#344E41]' : 'bg-gray-100 text-gray-500'}`}>
                    {a.status}
                  </div>
                  <h5 className="font-bold text-[#344E41]">{a.name}</h5>
                </div>
                
                <div className="text-xs text-gray-500 grid grid-cols-2 gap-y-1 mb-4">
                  <p>Texture: <span className="font-semibold text-gray-700">{a.texture || '-'}</span></p>
                  <p>M.O: <span className="font-semibold text-gray-700">{a.organic_matter}%</span></p>
                  <p>pH: <span className="font-semibold text-gray-700">{a.ph}</span></p>
                  <p>EC: <span className="font-semibold text-gray-700">{a.ec} dS/m</span></p>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <h6 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Résumé Nutritif ({a.unit})</h6>
                  <div className="flex flex-wrap gap-2">
                    {/* Dummy thresholds for UI presentation. In real life, fetch from soil_fertility_thresholds */}
                    <div className={`px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 ${getNutrientStatusColor(a.n || 0, 20, 60)}`}><span>N: {a.n}</span></div>
                    <div className={`px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 ${getNutrientStatusColor(a.p || 0, 15, 40)}`}><span>P: {a.p}</span></div>
                    <div className={`px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 ${getNutrientStatusColor(a.k || 0, 100, 250)}`}><span>K: {a.k}</span></div>
                    <div className={`px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 ${getNutrientStatusColor(a.ca || 0, 100, 300)}`}><span>Ca: {a.ca}</span></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <SoilAnalysisFormModal 
          analysis={editingAnalysis}
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};
