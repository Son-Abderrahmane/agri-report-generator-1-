import React, { useState, useEffect } from 'react';
import { OptimizerWaterAnalysis } from '../../types';
import { Save, X, Droplets } from 'lucide-react';

interface WaterAnalysisFormModalProps {
  analysis: OptimizerWaterAnalysis | null;
  onClose: () => void;
  onSave: (data: Partial<OptimizerWaterAnalysis>) => void;
}

export const WaterAnalysisFormModal: React.FC<WaterAnalysisFormModalProps> = ({ analysis, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<OptimizerWaterAnalysis>>({
    name: 'Nouvelle Analyse d\'eau',
    status: 'Active',
    ec: 0,
    ph: 7.0,
    hardness: 0,
    alkalinity: 0,
    ca: 0,
    mg: 0,
    na: 0,
    cl: 0,
    s: 0,
    hco3: 0,
    n: 0,
    p: 0,
    k: 0,
    fe: 0
  });

  useEffect(() => {
    if (analysis) {
      setFormData({ ...analysis });
    }
  }, [analysis]);

  const handleChange = (field: keyof OptimizerWaterAnalysis, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-[#344E41] text-lg">
              {analysis ? 'Modifier l\'analyse' : 'Nouvelle Analyse d\'eau'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="water-analysis-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nom de la source (Ex: Puits 1)</label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => handleChange('name', e.target.value)} 
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Statut</label>
                <select 
                  value={formData.status || 'Active'} 
                  onChange={e => handleChange('status', e.target.value)} 
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archivée</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">Propriétés Principales</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['ec', 'ph', 'hardness', 'alkalinity'].map(n => (
                  <div key={n} className="bg-gray-50 p-3 rounded-xl border border-blue-50 shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{n}</label>
                    <input type="number" step="0.01" value={(formData as any)[n] || ''} onChange={e => handleChange(n as any, parseFloat(e.target.value) || 0)} className="w-full font-mono text-sm border-b border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">Minéraux & Nutriments (ppm)</h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {['ca', 'mg', 'na', 'cl', 's', 'hco3', 'n', 'p', 'k', 'fe'].map(n => (
                  <div key={n}>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">{n}</label>
                    <input type="number" step="0.1" value={(formData as any)[n] || ''} onChange={e => handleChange(n as any, parseFloat(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400" />
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800">
            Annuler
          </button>
          <button type="submit" form="water-analysis-form" className="flex items-center space-x-1.5 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
