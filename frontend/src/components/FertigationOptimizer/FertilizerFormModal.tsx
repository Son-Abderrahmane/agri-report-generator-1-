import React, { useState, useEffect } from 'react';
import { OptimizerFertilizer } from '../../types';
import { X, Save } from 'lucide-react';

interface FertilizerFormModalProps {
  fertilizer: OptimizerFertilizer | null;
  onClose: () => void;
  onSave: (fert: Partial<OptimizerFertilizer>) => void;
}

export const FertilizerFormModal: React.FC<FertilizerFormModalProps> = ({ fertilizer, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<OptimizerFertilizer>>({
    name: '', type: 'Mineral', unit: 'kg', n: 0, p2o5: 0, k2o: 0, ca: 0, mg: 0, s: 0,
    fe: 0, mn: 0, zn: 0, cu: 0, b: 0, mo: 0, price_per_unit: 0
  });

  useEffect(() => {
    if (fertilizer) {
      setFormData(fertilizer);
    }
  }, [fertilizer]);

  const handleChange = (field: keyof OptimizerFertilizer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-[#344E41]">{fertilizer ? 'Modifier l\'engrais' : 'Ajouter un engrais'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1">Nom *</label>
              <input required type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Type *</label>
              <select value={formData.type || 'Mineral'} onChange={e => handleChange('type', e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]">
                <option value="Mineral">Minéral</option>
                <option value="Organic">Organique</option>
                <option value="Liquid">Liquide</option>
                <option value="Soluble">Soluble</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Macronutriments (%)</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {['n', 'p2o5', 'k2o', 'ca', 'mg', 's'].map(n => (
                <div key={n}>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">{n === 'p2o5' ? 'P2O5' : n === 'k2o' ? 'K2O' : n}</label>
                  <input type="number" step="0.1" value={(formData as any)[n] || ''} onChange={e => handleChange(n as any, parseFloat(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Micronutriments (%)</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {['fe', 'mn', 'zn', 'cu', 'b', 'mo'].map(n => (
                <div key={n}>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">{n}</label>
                  <input type="number" step="0.01" value={(formData as any)[n] || ''} onChange={e => handleChange(n as any, parseFloat(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" className="flex items-center space-x-1.5 px-4 py-2 bg-[#344E41] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2a3f34]">
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
