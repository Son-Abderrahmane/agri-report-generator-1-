import React, { useState } from 'react';
import { OptimizerSoilAnalysis } from '../../types';
import { Save, X } from 'lucide-react';

interface SoilAnalysisFormModalProps {
  analysis?: OptimizerSoilAnalysis | null;
  onClose: () => void;
  onSave: (data: Partial<OptimizerSoilAnalysis>) => void;
}

export const SoilAnalysisFormModal: React.FC<SoilAnalysisFormModalProps> = ({ analysis, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<OptimizerSoilAnalysis>>(
    analysis || {
      name: '',
      status: 'Active',
      unit: 'ppm',
      texture: 'Loam',
      ph: 7.0,
      ec: 1.0,
      organic_matter: 2.0,
      n: 0, p: 0, k: 0, ca: 0, mg: 0, s: 0,
      fe: 0, mn: 0, zn: 0, cu: 0, b: 0, mo: 0, si: 0,
      na: 0, cl: 0, sar: 0, esp: 0
    }
  );

  const handleChange = (field: keyof OptimizerSoilAnalysis, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-[#344E41]">
            {analysis ? "Modifier l'analyse de sol" : "Nouvelle analyse de sol"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-8">
          {/* Metadata */}
          <section>
            <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-4 border-b pb-1">Métadonnées</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nom de l'analyse *</label>
                <input required type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full text-sm border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Parcelle</label>
                <input type="text" value={formData.field_name || ''} onChange={e => handleChange('field_name', e.target.value)} className="w-full text-sm border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Statut</label>
                <select value={formData.status || 'Active'} onChange={e => handleChange('status', e.target.value)} className="w-full text-sm border rounded-xl px-3 py-2">
                  <option value="Active">Active</option>
                  <option value="Archived">Archivée</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Laboratoire</label>
                <input type="text" value={formData.laboratory_name || ''} onChange={e => handleChange('laboratory_name', e.target.value)} className="w-full text-sm border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Date d'échantillonnage</label>
                <input type="date" value={formData.sampling_date || ''} onChange={e => handleChange('sampling_date', e.target.value)} className="w-full text-sm border rounded-xl px-3 py-2" />
              </div>
            </div>
          </section>

          {/* Properties */}
          <section>
            <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-4 border-b pb-1">Propriétés Physico-Chimiques</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Unité Globale</label>
                <select value={formData.unit || 'ppm'} onChange={e => handleChange('unit', e.target.value)} className="w-full text-sm border rounded-xl px-3 py-2">
                  <option value="ppm">ppm</option>
                  <option value="mg/kg">mg/kg</option>
                  <option value="meq/100g">meq/100g</option>
                  <option value="cmol/kg">cmol/kg</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Texture</label>
                <select value={formData.texture || 'Loam'} onChange={e => handleChange('texture', e.target.value)} className="w-full text-sm border rounded-xl px-3 py-2">
                  <option value="Sand">Sable (Sand)</option>
                  <option value="Sandy Loam">Sable Limoneux</option>
                  <option value="Loam">Limon (Loam)</option>
                  <option value="Silt Loam">Limon Argileux</option>
                  <option value="Clay Loam">Argilo-Limoneux</option>
                  <option value="Clay">Argile (Clay)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">pH</label>
                <input type="number" step="0.1" value={formData.ph || ''} onChange={e => handleChange('ph', parseFloat(e.target.value))} className="w-full text-sm border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">EC (dS/m)</label>
                <input type="number" step="0.1" value={formData.ec || ''} onChange={e => handleChange('ec', parseFloat(e.target.value))} className="w-full text-sm border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Matière Org. (%)</label>
                <input type="number" step="0.1" value={formData.organic_matter || ''} onChange={e => handleChange('organic_matter', parseFloat(e.target.value))} className="w-full text-sm border rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">CEC</label>
                <input type="number" step="0.1" value={formData.cec || ''} onChange={e => handleChange('cec', parseFloat(e.target.value))} className="w-full text-sm border rounded-xl px-3 py-2" />
              </div>
            </div>
          </section>

          {/* Macronutrients */}
          <section>
            <h4 className="text-xs font-bold text-[#344E41] uppercase tracking-wider mb-4 border-b pb-1">Macronutriments</h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {['n', 'p', 'k', 'ca', 'mg', 's'].map(nut => (
                <div key={nut}>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{nut}</label>
                  <input type="number" value={(formData as any)[nut] || ''} onChange={e => handleChange(nut as any, parseFloat(e.target.value))} className="w-full text-sm font-mono border rounded p-2" />
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" className="flex items-center space-x-1.5 px-5 py-2 bg-[#344E41] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2a3f34]">
              <Save className="w-4 h-4" />
              <span>{analysis ? 'Mettre à jour' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
