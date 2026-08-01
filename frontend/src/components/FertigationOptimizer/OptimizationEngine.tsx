import React, { useState, useEffect } from 'react';
import { toast } from '../../utils/toast';
import { OptimizerFertilizer, OptimizerGrowthStage, OptimizerWaterAnalysis, OptimizerSoilAnalysis } from '../../types';
import { Play, Settings, Droplets, FlaskConical, Beaker, CheckCircle, ListTree, Activity } from 'lucide-react';

interface OptimizationEngineProps {
  apiBase: string;
  token: string;
  results?: any;
  onSaveResults?: (res: any) => void;
}

export const OptimizationEngine: React.FC<OptimizationEngineProps> = ({ apiBase, token, results, onSaveResults }) => {
  const [fertilizers, setFertilizers] = useState<OptimizerFertilizer[]>([]);
  const [stages, setStages] = useState<OptimizerGrowthStage[]>([]);
  const [waterAnalyses, setWaterAnalyses] = useState<OptimizerWaterAnalysis[]>([]);
  const [soilAnalyses, setSoilAnalyses] = useState<OptimizerSoilAnalysis[]>([]);
  
  const [selectedFertilizers, setSelectedFertilizers] = useState<number[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [selectedWaterId, setSelectedWaterId] = useState<number | null>(null);
  const [selectedSoilId, setSelectedSoilId] = useState<number | null>(null);
  
  // New State variables for UF
  const [areaHa, setAreaHa] = useState<number>(1.0);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [irrigationVolumePerDayHa, setIrrigationVolumePerDayHa] = useState<number>(20000); // 20m3 / ha / day
  const [nitrogenBalancerId, setNitrogenBalancerId] = useState<number | null>(null);
  const [selectionStrategy, setSelectionStrategy] = useState<string>('highest_concentration');
  const [optimizationStrategy, setOptimizationStrategy] = useState<string>('sequential_uf');
  
  const [localResults, setLocalResults] = useState<any>(results || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (results) {
      setLocalResults(results);
    }
  }, [results]);

  useEffect(() => {
    fetchData();
  }, [apiBase, token]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [fRes, sRes, wRes, saRes] = await Promise.all([
        fetch(`${apiBase}/optimizer/fertilizers`, { headers }),
        fetch(`${apiBase}/optimizer/growth-stages`, { headers }),
        fetch(`${apiBase}/optimizer/water-analyses`, { headers }),
        fetch(`${apiBase}/optimizer/soil-analyses`, { headers })
      ]);
      if (fRes.ok) {
        const ferts = await fRes.json();
        setFertilizers(ferts);
        // Default balancer to Urea if it exists
        const urea = ferts.find((f: any) => f.name.toLowerCase().includes('urée') || f.name.toLowerCase().includes('urea'));
        if (urea) setNitrogenBalancerId(urea.id);
      }
      if (sRes.ok) setStages(await sRes.json());
      if (wRes.ok) {
        const wa = await wRes.json();
        setWaterAnalyses(wa);
        if (wa.length > 0) setSelectedWaterId(wa[0].id);
      }
      if (saRes.ok) {
        const sa = await saRes.json();
        setSoilAnalyses(sa);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRun = async () => {
    if (!selectedRecipeId) return toast('Veuillez sélectionner une recette (stade).');
    if (selectedFertilizers.length === 0) return toast('Veuillez sélectionner au moins un engrais.');

    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/optimizer/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipe_id: selectedRecipeId,
          water_analysis_id: selectedWaterId,
          soil_analysis_id: selectedSoilId,
          fertilizer_ids: selectedFertilizers,
          area_ha: areaHa,
          duration_days: durationDays,
          irrigation_volume_liters_day: irrigationVolumePerDayHa,
          nitrogen_balancer_id: nitrogenBalancerId,
          selection_strategy: selectionStrategy,
          strategy: optimizationStrategy,
          objective: 'target_accuracy'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLocalResults(data);
        if (onSaveResults) {
          onSaveResults(data);
        }
      } else {
        const err = await res.json();
        toast('Erreur: ' + (err.message || 'Échec de l\'optimisation'));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const toggleFertilizer = (id: number) => {
    setSelectedFertilizers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#F9F8F5] p-5 rounded-2xl border border-[#EBE9E1]">
        <h4 className="font-bold text-[#344E41] font-serif mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5" /> <span>Paramètres de Calcul (Unités Fertilisantes)</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-2">1. Stade & Recette (Cible UF)</label>
            <select value={selectedRecipeId || ''} onChange={e => setSelectedRecipeId(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white">
              <option value="">Sélectionner une recette...</option>
              {stages.map(s => (
                <optgroup key={s.id} label={s.name}>
                  {s.recipes && s.recipes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">2. Surface (Ha)</label>
            <input type="number" step="0.1" value={areaHa} onChange={e => setAreaHa(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">3. Durée (Jours)</label>
            <input type="number" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">4. Volume Eau (L/ha/jour)</label>
            <input type="number" value={irrigationVolumePerDayHa} onChange={e => setIrrigationVolumePerDayHa(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">5. Balancier Azote</label>
            <select value={nitrogenBalancerId || ''} onChange={e => setNitrogenBalancerId(Number(e.target.value) || null)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white">
              <option value="">Aucun</option>
              {fertilizers.filter(f => (f.n || 0) > 0).map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.n}% N)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">6. Source d'eau</label>
            <select value={selectedWaterId || ''} onChange={e => setSelectedWaterId(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white">
              <option value="">Eau Pure (0 apports)</option>
              {waterAnalyses.map(wa => (
                <option key={wa.id} value={wa.id}>{wa.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">7. Analyse de Sol</label>
            <select value={selectedSoilId || ''} onChange={e => setSelectedSoilId(Number(e.target.value) || null)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white">
              <option value="">Aucune (Culture hors-sol)</option>
              {soilAnalyses.map(sa => (
                <option key={sa.id} value={sa.id}>{sa.name} - {sa.texture || 'Sol'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-gray-600">8. Engrais Disponibles (Cochez pour utiliser)</label>
            <div className="flex space-x-2 text-xs">
              <select value={selectionStrategy} onChange={e => setSelectionStrategy(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none">
                <option value="highest_concentration">Highest Concentration</option>
                <option value="lowest_cost">Lowest Cost</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {fertilizers.map(f => (
              <button
                key={f.id}
                onClick={() => toggleFertilizer(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedFertilizers.includes(f.id)
                    ? 'bg-[#E9EDC9] border-[#A3B18A] text-[#344E41]'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-[#A3B18A]'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t border-[#EBE9E1]">
          <button onClick={handleRun} disabled={isLoading} className="flex items-center space-x-2 px-6 py-2.5 bg-[#344E41] text-white font-bold rounded-xl shadow hover:bg-[#2a3f34] disabled:opacity-50">
            <Play className="w-4 h-4" />
            <span>{isLoading ? 'Calcul...' : 'Lancer l\'Optimisation UF'}</span>
          </button>
        </div>
      </div>

      {localResults && (
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h4 className="font-bold text-[#344E41] font-serif text-lg">Résultats de l'Optimisation</h4>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1"/> Succès</span>
          </div>

          {localResults.warnings && localResults.warnings.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <h5 className="text-sm font-bold text-amber-800 mb-1 flex items-center space-x-2"><Activity className="w-4 h-4"/> <span>Avertissements Agronomiques</span></h5>
              <ul className="list-disc pl-5 text-xs text-amber-700 space-y-1 mt-2">
                {localResults.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="font-bold text-[#344E41] mb-3 flex items-center space-x-2"><FlaskConical className="w-4 h-4"/> <span>Programme de Fertigation</span></h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 text-gray-500 font-medium">Engrais</th>
                      <th className="pb-2 text-right text-gray-500 font-medium">Total</th>
                      <th className="pb-2 text-right text-gray-500 font-medium">/ha/semaine</th>
                      <th className="pb-2 text-right text-gray-500 font-medium">/ha/jour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(localResults.doses || []).map((d: any, i: number) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-3 font-medium text-gray-800">{d.name || d.fertilizer?.name || 'Inconnu'}</td>
                        <td className="py-3 text-right font-mono font-bold text-[#344E41]">{Number(d.total_amount || d.amount || 0).toFixed(1)} {d.unit || 'kg'}</td>
                        <td className="py-3 text-right font-mono text-gray-600">{Number(d.per_ha_week || 0).toFixed(1)} {d.unit || 'kg'}</td>
                        <td className="py-3 text-right font-mono text-gray-600">{Number(d.per_ha_day || 0).toFixed(2)} {d.unit || 'kg'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right text-sm font-bold text-gray-600 bg-gray-50 p-3 rounded-xl">Coût total estimé: {Number(localResults.total_cost || 0).toFixed(2)} DH</div>
            </div>

            <div>
              <h5 className="font-bold text-[#344E41] mb-3 flex items-center space-x-2"><Beaker className="w-4 h-4"/> <span>Distribution des Bacs (Dynamique)</span></h5>
              <div className="space-y-3">
                {['Tank A', 'Tank B', 'Tank C'].map(tankName => {
                  const tank = localResults.tanks ? localResults.tanks[tankName] : null;
                  if (!tank || tank.length === 0) return null;
                  
                  const colors: any = {
                    'Tank A': 'bg-red-50 border-red-100 text-red-800',
                    'Tank B': 'bg-blue-50 border-blue-100 text-blue-800',
                    'Tank C': 'bg-purple-50 border-purple-100 text-purple-800',
                  };
                  
                  return (
                    <div key={tankName} className={`${colors[tankName]} p-3 rounded-xl border`}>
                      <h6 className="text-xs font-bold mb-2">{tankName}</h6>
                      <ul className="text-xs space-y-1">
                        {tank.map((t: any, i: number) => <li key={i}>• {Number(t.amount || 0).toFixed(2)} {t.unit || 'kg'} - {t.name || t.fertilizer?.name || 'Inconnu'}</li>)}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h5 className="font-bold text-[#344E41] mb-3">Couverture Nutritionnelle (UF)</h5>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
              {['n', 'p2o5', 'k2o', 'cao', 'mgo', 'so3', 'fe'].map(n => {
                const achieved = (localResults.achieved ? localResults.achieved[n] : (localResults.achieved_ppm ? localResults.achieved_ppm[n] : 0)) || 0;
                const target = (localResults.net_targets ? localResults.net_targets[n] : (localResults.targets ? localResults.targets[n] : 0)) || 0;
                if (target === 0 && achieved === 0) return null;
                
                const percent = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 100;
                
                return (
                  <div key={n} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center flex flex-col justify-center items-center">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">{n}</span>
                    <span className="block font-mono text-lg font-bold text-[#344E41]">{achieved.toFixed(1)}</span>
                    <span className="text-[10px] font-bold text-gray-400">/ {target.toFixed(1)} UF</span>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden flex">
                      <div className={`h-full ${percent >= 95 ? 'bg-green-500' : percent >= 80 ? 'bg-amber-400' : 'bg-red-400'}`} style={{width: `${percent}%`}}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {localResults.calculation_trace && localResults.calculation_trace.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h5 className="font-bold text-[#344E41] mb-4 flex items-center space-x-2"><ListTree className="w-4 h-4"/> <span>Trace de Calcul</span></h5>
              <div className="space-y-4">
                {localResults.calculation_trace.map((trace: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative">
                    <div className="absolute -left-2 -top-2 bg-[#A3B18A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">{idx + 1}</div>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pl-4">
                      <div>
                        <h6 className="text-sm font-bold text-gray-800">{trace.step}</h6>
                        <p className="text-xs text-gray-500 mt-0.5">Cible: <span className="font-bold">{trace.target_uf} UF</span></p>
                      </div>
                      
                      <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3">
                        <span className="text-sm font-bold text-[#344E41]">{trace.fertilizer}</span>
                        <span className="text-gray-300">|</span>
                        <span className="font-mono text-sm font-bold text-gray-600">{Number(trace.dose_kg || 0).toFixed(2)} kg</span>
                      </div>
                      
                      <div className="text-xs">
                        <span className="text-gray-500 font-bold block mb-1">Apports Générés:</span>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(trace.contributions || {}).map(([nutrient, amount]: any) => (
                            <span key={nutrient} className="bg-green-50 text-green-700 px-2 py-1 rounded font-mono border border-green-100">
                              +{amount} UF {nutrient.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

