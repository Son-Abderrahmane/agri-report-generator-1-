import React, { useState } from 'react';
import { OptimizerGrowthStage, GrowthStageRecipe, GrowthStageTarget } from '../../types';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface GrowthStageFormModalProps {
  onClose: () => void;
  onSave: (stage: Partial<OptimizerGrowthStage>) => void;
}

export const GrowthStageFormModal: React.FC<GrowthStageFormModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<OptimizerGrowthStage>>({
    name: '',
    crop_id: 1, // Default crop
    duration_days: 14,
    target_ec_min: 1.5,
    target_ec_max: 2.0,
    target_ph_min: 5.5,
    target_ph_max: 6.5,
    order_index: 1,
  });

  const [targets, setTargets] = useState<{ nutrient: string; target_ppm: number }[]>([
    { nutrient: 'n', target_ppm: 150 },
    { nutrient: 'p', target_ppm: 50 },
    { nutrient: 'k', target_ppm: 200 },
    { nutrient: 'ca', target_ppm: 150 },
    { nutrient: 'mg', target_ppm: 50 },
    { nutrient: 's', target_ppm: 50 },
  ]);

  const handleStageChange = (field: keyof OptimizerGrowthStage, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetChange = (index: number, value: number) => {
    const newTargets = [...targets];
    newTargets[index].target_ppm = value;
    setTargets(newTargets);
  };

  const addNutrient = () => {
    setTargets([...targets, { nutrient: 'fe', target_ppm: 0 }]);
  };

  const updateNutrientName = (index: number, name: string) => {
    const newTargets = [...targets];
    newTargets[index].nutrient = name.toLowerCase();
    setTargets(newTargets);
  };

  const removeNutrient = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // We will bundle the targets into a single default recipe for simplicity
    const defaultRecipe: GrowthStageRecipe = {
      name: 'Recette Standard',
      targets: targets.map(t => ({ nutrient: t.nutrient, target_ppm: t.target_ppm })) as GrowthStageTarget[]
    };

    const payload = {
      ...formData,
      recipes: [defaultRecipe]
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-[#344E41]">Nouveau Stade Végétatif</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Informations Générales</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nom du stade *</label>
                <input required type="text" placeholder="Ex: Végétatif Semaine 1-3" value={formData.name || ''} onChange={e => handleStageChange('name', e.target.value)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Durée (jours)</label>
                <input type="number" value={formData.duration_days || ''} onChange={e => handleStageChange('duration_days', parseInt(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">EC Min</label>
                <input type="number" step="0.1" value={formData.target_ec_min || ''} onChange={e => handleStageChange('target_ec_min', parseFloat(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">EC Max</label>
                <input type="number" step="0.1" value={formData.target_ec_max || ''} onChange={e => handleStageChange('target_ec_max', parseFloat(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">pH Min</label>
                <input type="number" step="0.1" value={formData.target_ph_min || ''} onChange={e => handleStageChange('target_ph_min', parseFloat(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">pH Max</label>
                <input type="number" step="0.1" value={formData.target_ph_max || ''} onChange={e => handleStageChange('target_ph_max', parseFloat(e.target.value) || 0)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#A3B18A]" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-100">
              <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider">Cibles Nutritionnelles (PPM)</h4>
              <button type="button" onClick={addNutrient} className="text-xs text-[#D4A373] hover:text-[#c29363] font-bold flex items-center"><Plus className="w-3 h-3 mr-1"/> Ajouter un élément</button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {targets.map((t, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <input type="text" value={t.nutrient.toUpperCase()} onChange={(e) => updateNutrientName(idx, e.target.value)} className="w-12 text-xs font-bold uppercase text-center border border-gray-200 rounded p-1" />
                  <input type="number" step="1" value={t.target_ppm} onChange={(e) => handleTargetChange(idx, parseFloat(e.target.value) || 0)} className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#A3B18A]" />
                  <button type="button" onClick={() => removeNutrient(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" className="flex items-center space-x-1.5 px-5 py-2 bg-[#344E41] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2a3f34]">
              <Save className="w-4 h-4" />
              <span>Enregistrer le stade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
