import React, { useState, useEffect } from 'react';
import { toast } from '../../utils/toast';
import { OptimizerFertilizer, OptimizerGrowthStage, OptimizerWaterAnalysis, OptimizerSoilAnalysis } from '../../types';
import { Play, Settings, Droplets, FlaskConical, Beaker, CheckCircle, Layers } from 'lucide-react';

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
  const [volume, setVolume] = useState<number>(10000); // L
  
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
      if (fRes.ok) setFertilizers(await fRes.json());
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipe_id: selectedRecipeId,
          water_analysis_id: selectedWaterId,
          soil_analysis_id: selectedSoilId,
          fertilizer_ids: selectedFertilizers,
          irrigation_volume_liters: volume,
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
          <Settings className="w-5 h-5" /> <span>Paramètres de Calcul</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">1. Stade & Recette</label>
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
            <label className="block text-xs font-bold text-gray-600 mb-2">2. Volume d'irrigation (L)</label>
            <input type="number" value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">3. Source d'eau</label>
            <select value={selectedWaterId || ''} onChange={e => setSelectedWaterId(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white">
              <option value="">Eau Pure (0 ppm)</option>
              {waterAnalyses.map(wa => (
                <option key={wa.id} value={wa.id}>{wa.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">4. Analyse de Sol (Optionnelle)</label>
            <select value={selectedSoilId || ''} onChange={e => setSelectedSoilId(Number(e.target.value) || null)} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none bg-white">
              <option value="">Aucune (Culture hors-sol)</option>
              {soilAnalyses.map(sa => (
                <option key={sa.id} value={sa.id}>{sa.name} - {sa.texture || 'Sol'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-xs font-bold text-gray-600 mb-2">5. Engrais Disponibles (Cochez pour utiliser)</label>
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
            <span>{isLoading ? 'Calcul...' : 'Lancer l\'Optimisation'}</span>
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
              <h5 className="text-sm font-bold text-amber-800 mb-1">Avertissements Agronomiques</h5>
              <ul className="list-disc pl-5 text-xs text-amber-700 space-y-1">
                {localResults.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-bold text-[#344E41] mb-3 flex items-center space-x-2"><FlaskConical className="w-4 h-4"/> <span>Doses Requises</span></h5>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100"><th className="pb-2">Engrais</th><th className="pb-2 text-right">Quantité</th></tr>
                </thead>
                <tbody>
                  {localResults.doses.map((d: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50"><td className="py-2 font-medium">{d.name}</td><td className="py-2 text-right font-mono font-bold text-[#344E41]">{d.amount_kg.toFixed(2)} kg</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-right text-xs font-bold text-gray-500">Coût estimé: {localResults.total_cost.toFixed(2)} DH</div>
            </div>

            <div>
              <h5 className="font-bold text-[#344E41] mb-3 flex items-center space-x-2"><Beaker className="w-4 h-4"/> <span>Bacs Concentrés (A/B)</span></h5>
              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                  <h6 className="text-xs font-bold text-red-800 mb-1">BAC A (Calcium / Nitrates)</h6>
                  <ul className="text-xs text-red-700 space-y-1">{localResults.tanks['Tank A'].map((t: any, i: number) => <li key={i}>• {t.amount_kg.toFixed(2)} kg - {t.name}</li>)}</ul>
                  {localResults.tanks['Tank A'].length === 0 && <span className="text-xs text-red-400 italic">Vide</span>}
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <h6 className="text-xs font-bold text-blue-800 mb-1">BAC B (Phosphates / Sulfates)</h6>
                  <ul className="text-xs text-blue-700 space-y-1">{localResults.tanks['Tank B'].map((t: any, i: number) => <li key={i}>• {t.amount_kg.toFixed(2)} kg - {t.name}</li>)}</ul>
                  {localResults.tanks['Tank B'].length === 0 && <span className="text-xs text-blue-400 italic">Vide</span>}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-[#344E41] mb-3">Couverture Nutritionnelle (PPM)</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {['n', 'p', 'k', 'ca', 'mg', 's'].map(n => {
                const achieved = localResults.achieved[n] || 0;
                const target = localResults.net_targets[n] || 1; // avoid /0
                const percent = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 100;
                return (
                  <div key={n} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">{n}</span>
                    <span className="block font-mono text-lg font-bold text-[#344E41]">{achieved.toFixed(0)} <span className="text-xs font-normal text-gray-400">/ {localResults.net_targets[n]?.toFixed(0) || 0}</span></span>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden flex">
                      {/* Water contribution */}
                      <div className="h-full bg-blue-400 opacity-50" style={{width: `${target > 0 ? ((localResults.inputs_json?.water?.[n] || 0) / target) * 100 : 0}%`}}></div>
                      {/* Soil contribution */}
                      <div className="h-full bg-amber-600 opacity-50" style={{width: `${target > 0 ? ((localResults.inputs_json?.available_soil_nutrients?.[n] || 0) / target) * 100 : 0}%`}}></div>
                      {/* Fertilizer contribution */}
                      <div className={`h-full ${percent >= 95 ? 'bg-green-500' : percent >= 80 ? 'bg-amber-400' : 'bg-red-400'}`} style={{width: `${target > 0 ? ((achieved - (localResults.inputs_json?.water?.[n] || 0) - (localResults.inputs_json?.available_soil_nutrients?.[n] || 0)) / target) * 100 : 0}%`}}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
