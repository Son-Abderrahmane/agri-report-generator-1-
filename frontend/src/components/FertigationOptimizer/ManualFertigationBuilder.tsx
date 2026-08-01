import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, ShieldAlert, CheckCircle, Save, Layers, Info } from 'lucide-react';
import { calculateUFAchieved, calculateCost, generateTanks, formatDoses } from '../../utils/fertigationUtils';
import { toast } from '../../utils/toast';

interface ManualFertigationBuilderProps {
  originalResults: any;
  fertilizers: any[];
  compatibilityRules: any[];
  onSaveCustomProgram: (customProgram: any) => void;
  areaHa: number;
  durationDays: number;
}

const MODIFICATION_REASONS = [
  'Trop d\'Azote (N)',
  'Carence observée',
  'Réduire le coût',
  'Disponibilité de stock',
  'Préférence de l\'agriculteur',
  'Conditions météorologiques',
  'Autre'
];

export const ManualFertigationBuilder: React.FC<ManualFertigationBuilderProps> = ({
  originalResults,
  fertilizers,
  compatibilityRules,
  onSaveCustomProgram,
  areaHa,
  durationDays
}) => {
  const [doses, setDoses] = useState<any[]>([]);
  const [customAchieved, setCustomAchieved] = useState<any>({});
  const [customCost, setCustomCost] = useState<number>(0);
  const [customTanks, setCustomTanks] = useState<any>({});
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  const [showAddFertilizer, setShowAddFertilizer] = useState(false);
  const [newFertilizerId, setNewFertilizerId] = useState<number | null>(null);
  const [newFertilizerAmount, setNewFertilizerAmount] = useState<number>(0);

  useEffect(() => {
    if (originalResults?.customized_program) {
      setDoses(originalResults.customized_program.doses || []);
    } else if (originalResults?.doses) {
      // Initialize with optimized doses, Deep copy to avoid mutating original
      setDoses(JSON.parse(JSON.stringify(originalResults.doses)));
    }
  }, [originalResults]);

  useEffect(() => {
    recalculate();
  }, [doses, fertilizers, compatibilityRules, areaHa, durationDays]);

  const recalculate = () => {
    if (!doses.length) return;
    
    // Format doses (calculate per_ha_day, etc.)
    const formatted = formatDoses(doses, areaHa, durationDays, fertilizers);
    
    // Calculate UF Achieved
    const achieved = calculateUFAchieved(formatted, fertilizers);
    setCustomAchieved(achieved);
    
    // Calculate Tanks
    const tanks = generateTanks(formatted, compatibilityRules);
    setCustomTanks(tanks);
    
    // Calculate Cost
    const cost = calculateCost(formatted, fertilizers);
    setCustomCost(cost);
  };

  const handleUpdateDose = (id: number, amount: number, reason?: string, customReason?: string) => {
    setDoses(prev => prev.map(d => {
      if (d.id === id) {
        return { 
          ...d, 
          amount, 
          total_amount: amount,
          modification_reason: reason === 'Autre' ? customReason : reason
        };
      }
      return d;
    }));
  };

  const handleRemoveDose = (id: number) => {
    setDoses(prev => prev.filter(d => d.id !== id));
  };

  const handleAddFertilizer = () => {
    if (!newFertilizerId || newFertilizerAmount <= 0) {
      toast('Veuillez sélectionner un engrais et une dose valide.');
      return;
    }
    
    const exists = doses.find(d => d.id === newFertilizerId);
    if (exists) {
      toast('Cet engrais est déjà dans le programme.');
      return;
    }

    const fert = fertilizers.find(f => f.id === newFertilizerId);
    if (!fert) return;

    const newDose = {
      id: fert.id,
      name: fert.name,
      amount: newFertilizerAmount,
      total_amount: newFertilizerAmount,
      unit: fert.unit || 'kg',
      modification_reason: 'Ajout manuel'
    };

    setDoses([...doses, newDose]);
    setShowAddFertilizer(false);
    setNewFertilizerId(null);
    setNewFertilizerAmount(0);
  };

  const handleSave = () => {
    const customProgram = {
      doses: formatDoses(doses, areaHa, durationDays, fertilizers),
      achieved: customAchieved,
      tanks: customTanks,
      total_cost: customCost,
      updated_at: new Date().toISOString()
    };
    onSaveCustomProgram(customProgram);
    toast('Programme personnalisé enregistré avec succès !');
  };

  const renderNutrientCoverage = (achieved: any, title: string) => {
    const targets = originalResults?.net_targets || originalResults?.targets || {};
    
    return (
      <div className="pt-4 border-t border-gray-100">
        <h5 className="font-bold text-[#344E41] mb-3">{title}</h5>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {['n', 'p2o5', 'k2o', 'cao', 'mgo', 'so3', 'fe'].map(n => {
            const ach = achieved[n] || 0;
            const tgt = targets[n] || 0;
            if (tgt === 0 && ach === 0) return null;
            
            const percent = tgt > 0 ? Math.min(100, Math.round((ach / tgt) * 100)) : 100;
            
            return (
              <div key={n} className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center">
                <span className="block text-[10px] font-bold text-gray-500 uppercase">{n}</span>
                <span className="block font-mono text-sm font-bold text-[#344E41]">{Number(ach).toFixed(1)}</span>
                <span className="text-[9px] font-bold text-gray-400">/ {Number(tgt).toFixed(1)} UF</span>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden flex">
                  <div className={`h-full ${percent >= 95 ? 'bg-green-500' : percent >= 80 ? 'bg-amber-400' : 'bg-red-400'}`} style={{width: `${percent}%`}}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#EBE9E1] shadow-sm space-y-6 mt-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-3">
          <h4 className="font-bold text-[#344E41] font-serif text-lg">Programme Personnalisé</h4>
          <label className="flex items-center cursor-pointer space-x-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <input type="checkbox" className="form-checkbox text-amber-600 rounded" checked={isExpertMode} onChange={e => setIsExpertMode(e.target.checked)} />
            <span className="text-xs font-bold text-amber-800">Mode Expert (Édition Manuelle)</span>
          </label>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowComparison(!showComparison)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${showComparison ? 'bg-[#344E41] text-white border-[#344E41]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1" /> Comparer
          </button>
          
          {isExpertMode && (
            <button onClick={handleSave} className="bg-[#E9EDC9] hover:bg-[#CCD5AE] text-[#344E41] font-bold text-xs px-4 py-1.5 rounded-lg border border-[#CCD5AE] transition-all flex items-center">
              <Save className="w-3.5 h-3.5 mr-1" /> Enregistrer
            </button>
          )}
        </div>
      </div>

      {showComparison ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-4 opacity-75">
            <h5 className="font-bold text-gray-700 mb-3 border-b pb-2">Version Optimisée (Système)</h5>
            <ul className="text-sm space-y-2 mb-4">
              {(originalResults?.doses || []).map((d: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span className="text-gray-600">{d.name || d.fertilizer?.name}</span>
                  <span className="font-mono font-bold text-gray-800">{Number(d.total_amount || d.amount || 0).toFixed(1)} {d.unit}</span>
                </li>
              ))}
            </ul>
            <div className="text-xs font-bold text-gray-500 mb-2">Coût total: {Number(originalResults?.total_cost || 0).toFixed(2)} DH</div>
            {renderNutrientCoverage(originalResults?.achieved || originalResults?.achieved_ppm || {}, "Couverture Initiale")}
          </div>
          
          <div className="border-2 border-[#A3B18A] rounded-xl p-4 bg-[#F9F8F5]">
            <h5 className="font-bold text-[#344E41] mb-3 border-b border-[#EBE9E1] pb-2">Version Personnalisée (Actuelle)</h5>
            <ul className="text-sm space-y-2 mb-4">
              {doses.map((d: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span className="text-[#344E41] font-medium">{d.name}</span>
                  <span className="font-mono font-bold text-[#344E41]">{Number(d.total_amount || d.amount || 0).toFixed(1)} {d.unit}</span>
                </li>
              ))}
            </ul>
            <div className="text-xs font-bold text-[#344E41] mb-2">Coût total: {Number(customCost).toFixed(2)} DH</div>
            {renderNutrientCoverage(customAchieved, "Couverture Modifiée")}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-gray-500 font-medium">Engrais</th>
                  <th className="pb-2 text-center text-gray-500 font-medium">Quantité Totale</th>
                  {isExpertMode && <th className="pb-2 text-center text-gray-500 font-medium w-1/3">Justification</th>}
                  {isExpertMode && <th className="pb-2 text-right"></th>}
                </tr>
              </thead>
              <tbody>
                {doses.map((d: any) => (
                  <tr key={d.id} className="border-b border-gray-50 group">
                    <td className="py-2 font-medium text-gray-800">{d.name}</td>
                    <td className="py-2 text-center">
                      {isExpertMode ? (
                        <div className="flex items-center justify-center space-x-1">
                          <input 
                            type="number" 
                            step="0.1" 
                            value={Number(d.total_amount || d.amount || 0)} 
                            onChange={(e) => handleUpdateDose(d.id, Number(e.target.value), d.modification_reason)}
                            className="w-20 text-center font-mono font-bold text-[#344E41] border border-gray-200 rounded-lg px-2 py-1 focus:border-[#A3B18A] focus:outline-none"
                          />
                          <span className="text-xs text-gray-500">{d.unit}</span>
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-[#344E41]">{Number(d.total_amount || d.amount || 0).toFixed(1)} {d.unit}</span>
                      )}
                    </td>
                    {isExpertMode && (
                      <td className="py-2">
                        <select 
                          value={MODIFICATION_REASONS.includes(d.modification_reason) ? d.modification_reason : (d.modification_reason ? 'Autre' : '')}
                          onChange={(e) => handleUpdateDose(d.id, d.total_amount || d.amount || 0, e.target.value)}
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:border-[#A3B18A] focus:outline-none"
                        >
                          <option value="">Sélectionner une raison...</option>
                          {MODIFICATION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {d.modification_reason && !MODIFICATION_REASONS.includes(d.modification_reason) && (
                          <input 
                            type="text"
                            placeholder="Préciser..."
                            value={d.modification_reason}
                            onChange={(e) => handleUpdateDose(d.id, d.total_amount || d.amount || 0, 'Autre', e.target.value)}
                            className="w-full mt-1 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-[#A3B18A] focus:outline-none"
                          />
                        )}
                      </td>
                    )}
                    {isExpertMode && (
                      <td className="py-2 text-right">
                        <button onClick={() => handleRemoveDose(d.id)} className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {isExpertMode && (
            <div className="flex justify-start">
              {!showAddFertilizer ? (
                <button 
                  onClick={() => setShowAddFertilizer(true)}
                  className="flex items-center space-x-1 text-xs font-bold text-[#A3B18A] hover:text-[#344E41] transition-colors"
                >
                  <Plus className="w-4 h-4" /> <span>Ajouter un engrais</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <select 
                    value={newFertilizerId || ''} 
                    onChange={e => setNewFertilizerId(Number(e.target.value))}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:border-[#A3B18A] focus:outline-none w-48"
                  >
                    <option value="">Sélectionner un engrais...</option>
                    {fertilizers.filter(f => !doses.find(d => d.id === f.id)).map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Quantité" 
                    value={newFertilizerAmount || ''} 
                    onChange={e => setNewFertilizerAmount(Number(e.target.value))}
                    className="w-20 text-xs text-center border border-gray-200 rounded-lg px-2 py-1.5 focus:border-[#A3B18A] focus:outline-none"
                  />
                  <button onClick={handleAddFertilizer} className="bg-[#344E41] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#2a3f34]">
                    Ajouter
                  </button>
                  <button onClick={() => setShowAddFertilizer(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2">
                    Annuler
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h5 className="font-bold text-[#344E41] mb-3 text-sm flex items-center space-x-1"><ShieldAlert className="w-4 h-4" /> <span>Distribution des Bacs</span></h5>
              <div className="space-y-2">
                {['Tank A', 'Tank B', 'Tank C'].map(tankName => {
                  const tank = customTanks[tankName];
                  if (!tank || tank.length === 0) return null;
                  
                  return (
                    <div key={tankName} className="text-xs">
                      <span className="font-bold text-gray-700">{tankName}:</span> 
                      <span className="text-gray-600 ml-1">{tank.map((t: any) => `${t.name} (${Number(t.amount || t.total_amount || 0).toFixed(1)})`).join(' + ')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center items-end">
              <span className="text-xs font-bold text-gray-500 uppercase mb-1">Coût Total Estimé</span>
              <span className="font-mono text-2xl font-black text-[#344E41]">{Number(customCost).toFixed(2)} DH</span>
            </div>
          </div>

          {renderNutrientCoverage(customAchieved, "Couverture Nutritionnelle Manuelle")}
        </div>
      )}
    </div>
  );
};
