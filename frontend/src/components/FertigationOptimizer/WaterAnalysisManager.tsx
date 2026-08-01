import React, { useState, useEffect } from 'react';
import { OptimizerWaterAnalysis } from '../../types';
import { confirmAlert } from '../../utils/confirm';
import { Plus, Edit2, Trash2, Droplets } from 'lucide-react';
import { WaterAnalysisFormModal } from './WaterAnalysisFormModal';

interface WaterAnalysisManagerProps {
  apiBase: string;
  token: string;
}

export const WaterAnalysisManager: React.FC<WaterAnalysisManagerProps> = ({ apiBase, token }) => {
  const [analyses, setAnalyses] = useState<OptimizerWaterAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<OptimizerWaterAnalysis | null>(null);

  useEffect(() => {
    fetchAnalyses();
  }, [apiBase, token]);

  const fetchAnalyses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/optimizer/water-analyses`, {
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

  const handleSave = async (data: Partial<OptimizerWaterAnalysis>) => {
    try {
      const isEdit = !!data.id;
      const url = isEdit ? `${apiBase}/optimizer/water-analyses/${data.id}` : `${apiBase}/optimizer/water-analyses`;
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
    if (!(await confirmAlert("Supprimer cette analyse d'eau ?"))) return;
    try {
      await fetch(`${apiBase}/optimizer/water-analyses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAnalyses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-5 border border-[#EBE9E1]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          <h4 className="font-bold text-[#344E41] font-serif">Analyses d'Eau</h4>
        </div>
        <button onClick={() => { setEditingAnalysis(null); setIsModalOpen(true); }} className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Nouvelle Source</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {analyses.length === 0 ? (
            <div className="col-span-full text-center p-6 bg-white rounded-xl border border-dashed border-[#CCD5AE] text-[#8C8F85] text-sm">
              Aucune analyse d'eau configurée.
            </div>
          ) : (
            analyses.map((a) => (
              <div key={a.id} className="bg-white p-5 rounded-xl shadow-sm border border-[#EBE9E1] relative group">
                <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingAnalysis(a); setIsModalOpen(true); }} className="p-1.5 bg-gray-50 rounded hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 bg-gray-50 rounded hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`px-2 py-0.5 rounded text-xs font-bold ${a.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.status}
                  </div>
                  <h5 className="font-bold text-[#344E41]">{a.name}</h5>
                </div>
                
                <div className="text-xs text-gray-500 grid grid-cols-2 gap-y-1 mb-4">
                  <p>pH: <span className="font-semibold text-gray-700">{a.ph}</span></p>
                  <p>EC: <span className="font-semibold text-gray-700">{a.ec} dS/m</span></p>
                  <p>Alcalinité: <span className="font-semibold text-gray-700">{a.alkalinity} meq/L</span></p>
                  <p>Dureté: <span className="font-semibold text-gray-700">{a.hardness} mg/L</span></p>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <h6 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Nutriments (ppm)</h6>
                  <div className="flex flex-wrap gap-2">
                    {a.ca > 0 && <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-xs font-bold text-gray-700">Ca: {a.ca}</div>}
                    {a.mg > 0 && <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-xs font-bold text-gray-700">Mg: {a.mg}</div>}
                    {a.na > 0 && <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-xs font-bold text-red-600">Na: {a.na}</div>}
                    {a.cl > 0 && <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-xs font-bold text-red-600">Cl: {a.cl}</div>}
                    {a.s > 0 && <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-xs font-bold text-gray-700">S: {a.s}</div>}
                    {a.n > 0 && <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-xs font-bold text-green-700">N: {a.n}</div>}
                    {a.p > 0 && <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-xs font-bold text-blue-700">P: {a.p}</div>}
                    {a.k > 0 && <div className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-xs font-bold text-purple-700">K: {a.k}</div>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <WaterAnalysisFormModal 
          analysis={editingAnalysis}
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};
