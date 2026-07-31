import React, { useState, useEffect } from 'react';
import { OptimizerGrowthStage } from '../../types';
import { confirmAlert } from '../../utils/confirm';
import { Plus, Sprout, Trash2 } from 'lucide-react';
import { GrowthStageFormModal } from './GrowthStageFormModal';

interface GrowthStagesManagerProps {
  apiBase: string;
  token: string;
}

export const GrowthStagesManager: React.FC<GrowthStagesManagerProps> = ({ apiBase, token }) => {
  const [stages, setStages] = useState<OptimizerGrowthStage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStages();
  }, [apiBase, token]);

  const fetchStages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/optimizer/growth-stages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStages(await res.json());
      }
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  const handleSave = async (stage: Partial<OptimizerGrowthStage>) => {
    try {
      const res = await fetch(`${apiBase}/optimizer/growth-stages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stage)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchStages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmAlert("Supprimer ce stade ?"))) return;
    try {
      await fetch(`${apiBase}/optimizer/growth-stages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStages();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-5 border border-[#EBE9E1]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Sprout className="w-5 h-5 text-[#344E41]" />
          <h4 className="font-bold text-[#344E41] font-serif">Stades Végétatifs & Recettes</h4>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#D4A373] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#c29363]">
          <Plus className="w-4 h-4" />
          <span>Nouveau Stade</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Chargement...</div>
      ) : (
        <div className="space-y-4">
          {stages.length === 0 ? (
            <div className="text-center p-6 bg-white rounded-xl border border-dashed border-[#CCD5AE] text-[#8C8F85] text-sm">
              Aucun stade configuré. Ajoutez un stade pour définir les cibles nutritionnelles (ppm).
            </div>
          ) : (
            stages.map((stage, idx) => (
              <div key={stage.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#EBE9E1]">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-bold text-[#344E41]">Etape {idx + 1} : {stage.name}</h5>
                    <p className="text-xs text-gray-500 mb-3">{stage.duration_days} jours | EC: {stage.target_ec_min}-{stage.target_ec_max} | pH: {stage.target_ph_min}-{stage.target_ph_max}</p>
                  </div>
                  <button onClick={() => handleDelete(stage.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4"/></button>
                </div>
                <div className="pl-4 border-l-2 border-[#E9EDC9]">
                  {stage.recipes && stage.recipes.map(recipe => (
                    <div key={recipe.id} className="mb-2">
                      <span className="text-xs font-bold bg-[#E9EDC9] px-2 py-0.5 rounded text-[#344E41] mr-2">Recette: {recipe.name}</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {recipe.targets.map(t => (
                          <span key={t.id} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-mono">
                            {t.nutrient}: {t.target_ppm}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isModalOpen && (
        <GrowthStageFormModal apiBase={apiBase} token={token} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
};
