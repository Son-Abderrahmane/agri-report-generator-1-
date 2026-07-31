import React, { useState, useEffect } from 'react';
import { RecommendationItem, RecommendationCategory, QuickFormula } from '../types';
import { CheckSquare, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';

interface RecommendationsEditorProps {
  recommendations: RecommendationItem[];
  onChange: (updated: RecommendationItem[]) => void;
  apiBase?: string;
  token?: string;
}

export const RecommendationsEditor: React.FC<RecommendationsEditorProps> = ({
  recommendations,
  onChange,
  apiBase,
  token
}) => {
  const [categories, setCategories] = useState<RecommendationCategory[]>([]);
  const [formulas, setFormulas] = useState<QuickFormula[]>([]);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [backupText, setBackupText] = useState<string>('');

  useEffect(() => {
    if (!apiBase || !token) return;

    const fetchMasterData = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        const [catRes, formRes] = await Promise.all([
          fetch(`${apiBase}/recommendation-categories`, { headers }),
          fetch(`${apiBase}/quick-formulas`, { headers })
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (formRes.ok) {
          const allFormulas: QuickFormula[] = await formRes.json();
          setFormulas(allFormulas.filter(f => f.category === 'recommendation'));
        }
      } catch (e) {
        console.error('Failed to load recommendation master data', e);
      }
    };
    fetchMasterData();
  }, [apiBase, token]);
  const handleAddRecommendation = () => {
    const newItem: RecommendationItem = {
      id: `rec_${Date.now()}`,
      text: '',
      category: categories.length > 0 ? categories[0].name : 'Général',
    };
    onChange([...recommendations, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof RecommendationItem, value: any) => {
    const updated = recommendations.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const handleRemoveItem = (id: string) => {
    onChange(recommendations.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBE9E1]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <CheckSquare className="w-5 h-5 text-[#344E41]" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg">
              6. Recommandations & Actions Immédiates
            </h3>
            <p className="text-xs text-[#8C8F85]">
              Directives prioritaires à exécuter par le chef de culture ou le gérant
            </p>
          </div>
        </div>

        <button
          onClick={handleAddRecommendation}
          className="flex items-center space-x-1.5 text-xs font-bold text-white bg-[#D4A373] hover:bg-[#c29363] px-3.5 py-2 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Action Prioritaire</span>
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="text-center py-6 bg-[#F9F8F5] rounded-2xl border border-dashed border-[#CCD5AE]">
            <p className="text-xs text-[#8C8F85] mb-2">Aucune recommandation saisie.</p>
            <button
              onClick={handleAddRecommendation}
              className="inline-flex items-center space-x-1 text-xs font-bold text-[#344E41] bg-[#E9EDC9] hover:bg-[#CCD5AE] px-3.5 py-2 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une recommandation</span>
            </button>
          </div>
        ) : (
          recommendations.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start space-x-2 bg-[#F9F8F5] p-3 rounded-2xl border border-[#EBE9E1] hover:border-[#A3B18A] transition-all"
            >
              <span className="font-black text-xs text-[#344E41] bg-[#E9EDC9] rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 border border-[#CCD5AE]">
                {idx + 1}
              </span>

              <select
                value={item.category || (categories.length > 0 ? categories[0].name : 'Général')}
                onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                className="text-xs font-bold text-[#344E41] bg-white border border-[#EBE9E1] rounded-xl px-2.5 py-1.5 focus:outline-none shrink-0 max-w-[150px]"
              >
                {categories.length > 0 ? (
                  categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))
                ) : (
                  <option value="Général">Général</option>
                )}
              </select>

              <div className="flex-1">
                <input
                  type="text"
                  list="formulas-list"
                  value={item.text}
                  onChange={(e) => handleUpdateItem(item.id, 'text', e.target.value)}
                  onFocus={() => {
                    setActiveInputId(item.id);
                    setBackupText(item.text);
                    handleUpdateItem(item.id, 'text', '');
                  }}
                  onBlur={() => {
                    if (activeInputId === item.id) {
                      if (item.text.trim() === '') {
                        handleUpdateItem(item.id, 'text', backupText);
                      }
                      setActiveInputId(null);
                    }
                  }}
                  placeholder="ex: Aérer les serres dès 08h00..."
                  className="w-full text-xs sm:text-sm font-medium text-[#3D3D3D] bg-white border border-[#EBE9E1] rounded-xl px-3 py-1.5 focus:border-[#A3B18A] focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-amber-800/60 hover:text-red-700 p-1.5 rounded-lg hover:bg-amber-100 transition-all"
                title="Supprimer la recommandation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <datalist id="formulas-list">
        {formulas.map(f => (
          <option key={f.id} value={f.content} />
        ))}
      </datalist>
    </div>
  );
};
