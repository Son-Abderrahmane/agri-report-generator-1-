import React, { useState, useEffect } from 'react';
import { OptimizerWaterAnalysis } from '../../types';
import { Save, Droplets } from 'lucide-react';

interface WaterAnalysisManagerProps {
  apiBase: string;
  token: string;
}

export const WaterAnalysisManager: React.FC<WaterAnalysisManagerProps> = ({ apiBase, token }) => {
  const [analysis, setAnalysis] = useState<OptimizerWaterAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [apiBase, token]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/optimizer/water-analyses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setAnalysis(data[0]); // For MVP, just manage one main source
        } else {
          setAnalysis({ id: 0, name: 'Source Principale' }); // Default empty
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleChange = (field: keyof OptimizerWaterAnalysis, value: any) => {
    if (analysis) {
      setAnalysis({ ...analysis, [field]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis) return;
    
    try {
      const isEdit = analysis.id !== 0;
      const url = isEdit ? `${apiBase}/optimizer/water-analyses/${analysis.id}` : `${apiBase}/optimizer/water-analyses`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(analysis)
      });
      if (res.ok) {
        const saved = await res.json();
        setAnalysis(saved);
        alert('Analyse d\'eau sauvegardée.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="text-center py-10 text-gray-500">Chargement...</div>;
  if (!analysis) return null;

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-5 sm:p-6 border border-[#EBE9E1]">
      <div className="flex items-center space-x-2 mb-6">
        <Droplets className="w-5 h-5 text-blue-600" />
        <h4 className="font-bold text-[#344E41] font-serif">Analyse de la source d'eau (ppm)</h4>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['ec', 'ph', 'hardness', 'alkalinity'].map(n => (
            <div key={n} className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{n}</label>
              <input type="number" step="0.01" value={(analysis as any)[n] || ''} onChange={e => handleChange(n as any, parseFloat(e.target.value) || 0)} className="w-full font-mono text-sm border-b border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent" />
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">Minéraux & Nutriments</h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {['ca', 'mg', 'na', 'cl', 's', 'hco3', 'n', 'p', 'k', 'fe'].map(n => (
              <div key={n}>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">{n}</label>
                <input type="number" step="0.1" value={(analysis as any)[n] || ''} onChange={e => handleChange(n as any, parseFloat(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center space-x-1.5 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
            <Save className="w-4 h-4" />
            <span>Enregistrer l'Analyse</span>
          </button>
        </div>
      </form>
    </div>
  );
};
