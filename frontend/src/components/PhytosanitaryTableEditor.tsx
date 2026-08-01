import React, { useState, useEffect } from 'react';
import { PhytosanitaryTable, PhytosanitaryRow, Pesticide } from '../types';
import { Shield, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface PhytosanitaryTableEditorProps {
  table: PhytosanitaryTable;
  onChange: (updated: PhytosanitaryTable) => void;
  cropType?: string;
}

export const PhytosanitaryTableEditor: React.FC<PhytosanitaryTableEditorProps> = ({
  table,
  onChange,
  cropType,
}) => {
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);
  const [dbCrops, setDbCrops] = useState<{id: number, name: string}[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>(cropType || '');

  useEffect(() => {
    if (cropType && !selectedCrop) {
      setSelectedCrop(cropType);
    }
  }, [cropType]);

  useEffect(() => {
    // @ts-ignore
    const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    const token = localStorage.getItem('agri_admin_token');
    
    fetch(`${API_BASE}/pesticides`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPesticides(data);
      })
      .catch(err => console.error(err));

    fetch(`${API_BASE}/crops`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbCrops(data);
      })
      .catch(err => console.error(err));
  }, []);

  const pesticideCrops = Array.from(new Set(pesticides.map(p => p.crop_name).filter(Boolean))) as string[];
  const dbCropNames = dbCrops.map(c => c.name);
  const uniqueCrops = Array.from(new Set([...pesticideCrops, ...dbCropNames])).sort();

  const uniqueTargets = Array.from(
    new Set(
      pesticides
        .filter(p => !selectedCrop || p.crop_name === selectedCrop)
        .map(p => p.target_pest)
        .filter(Boolean)
    )
  ).sort() as string[];

  const getActiveIngredientsForTarget = (target: string) => {
    return Array.from(new Set(
      pesticides
        .filter(p => p.target_pest === target && (!selectedCrop || p.crop_name === selectedCrop))
        .map(p => p.active_ingredient)
        .filter(Boolean)
    )).sort() as string[];
  };

  const getProductsForTargetAndActive = (target: string, active: string) => {
    return pesticides
      .filter(p => p.target_pest === target && p.active_ingredient === active && (!selectedCrop || p.crop_name === selectedCrop))
      .sort((a, b) => a.product_name.localeCompare(b.product_name));
  };

  const handleTitleChange = (newTitle: string) => {
    onChange({
      ...table,
      title: newTitle,
    });
  };

  const handleAddRow = () => {
    const newRow: PhytosanitaryRow = {
      id: `phy_${Date.now()}`,
      target: '',
      activeIngredient: '',
      product: '',
      doseHa: '',
      darDays: '',
      nbrApplication: '',
      fournisseur: '',
    };
    onChange({
      ...table,
      rows: [...table.rows, newRow],
    });
  };

  const handleUpdateRow = (id: string, field: keyof PhytosanitaryRow, value: string) => {
    let updatedRows = table.rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );

    // If target changed, reset everything downstream
    if (field === 'target') {
      updatedRows = updatedRows.map((row) =>
        row.id === id ? { ...row, activeIngredient: '', product: '', doseHa: '', darDays: '', nbrApplication: '', fournisseur: '' } : row
      );
    }
    
    // If activeIngredient changed, reset everything downstream
    if (field === 'activeIngredient') {
      updatedRows = updatedRows.map((row) =>
        row.id === id ? { ...row, product: '', doseHa: '', darDays: '', nbrApplication: '', fournisseur: '' } : row
      );
    }

    // Auto-fill when product changes
    if (field === 'product') {
      const selectedPesticide = pesticides.find(p => p.product_name === value);
      if (selectedPesticide) {
        updatedRows = updatedRows.map((row) =>
          row.id === id ? { 
            ...row, 
            doseHa: selectedPesticide.dosage || '',
            darDays: selectedPesticide.dar || '',
            nbrApplication: selectedPesticide.nbr_application || '',
            fournisseur: selectedPesticide.supplier || ''
          } : row
        );
      }
    }

    onChange({
      ...table,
      rows: updatedRows,
    });
  };

  const handleRemoveRow = (id: string) => {
    onChange({
      ...table,
      rows: table.rows.filter((row) => row.id !== id),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#EBE9E1] gap-2">
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41] flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={table.title || 'Programme de Traitement Phytosanitaire'}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg bg-transparent border-b border-dashed border-[#CCD5AE] focus:border-[#A3B18A] focus:outline-none w-full min-w-0 truncate"
              title={table.title || 'Programme de Traitement Phytosanitaire'}
            />
            <p className="text-xs text-[#8C8F85] truncate">
              Préconisations phytosanitaires, doses recommandées et Délais Avant Récolte (DAR)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-48">
            <CustomSelect
              value={selectedCrop}
              onChange={setSelectedCrop}
              options={uniqueCrops}
              placeholder="Filtre Culture (Toutes)"
            />
          </div>

          <button
            onClick={handleAddRow}
            className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#E9EDC9] bg-[#5A6352] hover:bg-[#344E41] px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter un Produit</span>
          </button>
        </div>
      </div>

      {/* Dynamic Table Responsive Wrapper */}
      <div className="overflow-x-auto rounded-xl border border-[#EBE9E1]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F9F8F5] text-[#344E41] font-bold border-b border-[#EBE9E1]">
            <tr>
              <th className="p-3 min-w-[140px]">Cible / Problème</th>
              <th className="p-3 min-w-[150px]">Matière Active</th>
              <th className="p-3 min-w-[150px]">Produit Préconisé</th>
              <th className="p-3 min-w-[90px]">Dose / ha</th>
              <th className="p-3 min-w-[70px]">DAR (Jours)</th>
              <th className="p-3 min-w-[70px]">Nbr App.</th>
              <th className="p-3 min-w-[120px]">Fournisseur</th>
              <th className="p-3 w-10 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE9E1] bg-white">
            {table.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-[#8C8F85] italic">
                  Aucun produit préconisé pour l'instant. Cliquez sur "+ Ajouter un Produit".
                </td>
              </tr>
            ) : (
              table.rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#F9F8F5] transition-colors">
                  {/* Target */}
                  <td className="p-2">
                    <CustomSelect
                      value={row.target}
                      onChange={(val) => handleUpdateRow(row.id, 'target', val)}
                      options={uniqueTargets}
                      placeholder="Sélectionner Cible..."
                    />
                    {/* Fallback input if target not in list */}
                    {!uniqueTargets.includes(row.target) && row.target && (
                       <input 
                         type="text" 
                         value={row.target} 
                         onChange={(e) => handleUpdateRow(row.id, 'target', e.target.value)}
                         className="w-full mt-1 text-[10px] text-gray-500 bg-white border border-[#EBE9E1] rounded px-1 py-0.5"
                       />
                    )}
                  </td>

                                {/* Active Ingredient */}
                  <td className="p-2">
                    <CustomSelect
                      value={row.activeIngredient}
                      onChange={(val) => handleUpdateRow(row.id, 'activeIngredient', val)}
                      options={getActiveIngredientsForTarget(row.target)}
                      placeholder="Matière Active..."
                      disabled={!row.target}
                    />
                  </td>

                  {/* Product */}
                  <td className="p-2">
                    <CustomSelect
                      value={row.product}
                      onChange={(val) => handleUpdateRow(row.id, 'product', val)}
                      options={getProductsForTargetAndActive(row.target, row.activeIngredient).map(p => ({
                        value: p.product_name,
                        label: p.product_name
                      }))}
                      placeholder="Sélectionner Produit..."
                      disabled={!row.activeIngredient}
                    />
                  </td>

                  {/* Dose */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.doseHa}
                      onChange={(e) => handleUpdateRow(row.id, 'doseHa', e.target.value)}
                      placeholder="Dose"
                      className="w-full text-xs font-bold text-[#344E41] bg-[#E9EDC9]/50 border border-[#CCD5AE] rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                    />
                  </td>

                  {/* DAR */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.darDays}
                      onChange={(e) => handleUpdateRow(row.id, 'darDays', e.target.value)}
                      placeholder="DAR"
                      className="w-full text-xs font-mono font-bold text-center text-[#D4A373] bg-[#D4A373]/10 border border-[#D4A373]/30 rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#D4A373] focus:outline-none"
                    />
                  </td>

                  {/* Nbr Application */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.nbrApplication}
                      onChange={(e) => handleUpdateRow(row.id, 'nbrApplication', e.target.value)}
                      placeholder="Nbr"
                      className="w-full text-xs text-center border border-[#EBE9E1] rounded-lg px-2.5 py-1.5 focus:border-[#A3B18A] focus:outline-none"
                    />
                  </td>

                  {/* Fournisseur */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.fournisseur}
                      onChange={(e) => handleUpdateRow(row.id, 'fournisseur', e.target.value)}
                      placeholder="Fournisseur"
                      className="w-full text-xs border border-[#EBE9E1] rounded-lg px-2.5 py-1.5 focus:border-[#A3B18A] focus:outline-none"
                    />
                  </td>

                  {/* Action */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="text-amber-800/60 hover:text-red-700 p-1.5 rounded-lg hover:bg-amber-100 transition-all"
                      title="Supprimer la ligne"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
