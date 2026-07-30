import React, { useState, useEffect } from 'react';
import { PhytosanitaryTable, PhytosanitaryRow, Pesticide } from '../types';
import { Shield, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface PhytosanitaryTableEditorProps {
  table: PhytosanitaryTable;
  onChange: (updated: PhytosanitaryTable) => void;
}

export const PhytosanitaryTableEditor: React.FC<PhytosanitaryTableEditorProps> = ({
  table,
  onChange,
}) => {
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);

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
  }, []);

  const uniqueTargets = Array.from(new Set(pesticides.map(p => p.target_pest).filter(Boolean))) as string[];

  const handleTitleChange = (newTitle: string) => {
    onChange({
      ...table,
      title: newTitle,
    });
  };

  const handleAddRow = () => {
    const newRow: PhytosanitaryRow = {
      id: `phy_${Date.now()}`,
      target: 'Nouvelle cible / Bioagresseur',
      product: '',
      doseHa: '',
      darDays: '3',
      instructions: '',
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

    // If product changed, auto-fill dosage
    if (field === 'product') {
      const selectedPesticide = pesticides.find(p => p.product_name === value);
      if (selectedPesticide && selectedPesticide.dosage) {
        updatedRows = updatedRows.map((row) =>
          row.id === id ? { ...row, doseHa: selectedPesticide.dosage as string } : row
        );
      }
    }

    // If target changed, reset product
    if (field === 'target') {
      updatedRows = updatedRows.map((row) =>
        row.id === id ? { ...row, product: '', doseHa: '' } : row
      );
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
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={table.title || 'Programme de Traitement Phytosanitaire'}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg bg-transparent border-b border-dashed border-[#CCD5AE] focus:border-[#A3B18A] focus:outline-none w-full sm:w-auto"
            />
            <p className="text-xs text-[#8C8F85]">
              Préconisations phytosanitaires, doses recommandées et Délais Avant Récolte (DAR)
            </p>
          </div>
        </div>

        <button
          onClick={handleAddRow}
          className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#E9EDC9] bg-[#5A6352] hover:bg-[#344E41] px-3.5 py-2 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajouter un Produit</span>
        </button>
      </div>

      {/* Dynamic Table Responsive Wrapper */}
      <div className="overflow-x-auto rounded-xl border border-[#EBE9E1]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F9F8F5] text-[#344E41] font-bold border-b border-[#EBE9E1]">
            <tr>
              <th className="p-3 min-w-[140px]">Cible / Problème</th>
              <th className="p-3 min-w-[180px]">Produit Préconisé / Matière Active</th>
              <th className="p-3 min-w-[100px]">Dose / ha</th>
              <th className="p-3 min-w-[80px]">DAR (Jours)</th>
              <th className="p-3 min-w-[220px]">Instructions & Mode d'application</th>
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
                    <select
                      value={row.target}
                      onChange={(e) => handleUpdateRow(row.id, 'target', e.target.value)}
                      className="w-full text-xs font-bold text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                    >
                      <option value="">Sélectionner Cible...</option>
                      {uniqueTargets.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
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

                  {/* Product */}
                  <td className="p-2">
                    <select
                      value={row.product}
                      onChange={(e) => handleUpdateRow(row.id, 'product', e.target.value)}
                      className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                      disabled={!row.target}
                    >
                      <option value="">Sélectionner Produit...</option>
                      {pesticides.filter(p => p.target_pest === row.target).map(p => (
                        <option key={p.id} value={p.product_name}>{p.product_name}</option>
                      ))}
                    </select>
                    {!pesticides.find(p => p.product_name === row.product && p.target_pest === row.target) && row.product && (
                      <input 
                        type="text" 
                        value={row.product} 
                        onChange={(e) => handleUpdateRow(row.id, 'product', e.target.value)}
                        className="w-full mt-1 text-[10px] text-gray-500 bg-white border border-[#EBE9E1] rounded px-1 py-0.5"
                      />
                    )}
                  </td>

                  {/* Dose */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.doseHa}
                      onChange={(e) => handleUpdateRow(row.id, 'doseHa', e.target.value)}
                      placeholder="ex: 0.5 L/ha"
                      className="w-full text-xs font-bold text-[#344E41] bg-[#E9EDC9]/50 border border-[#CCD5AE] rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                    />
                  </td>

                  {/* DAR */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.darDays}
                      onChange={(e) => handleUpdateRow(row.id, 'darDays', e.target.value)}
                      placeholder="ex: 3"
                      className="w-full text-xs font-mono font-bold text-center text-[#D4A373] bg-[#D4A373]/10 border border-[#D4A373]/30 rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#D4A373] focus:outline-none"
                    />
                  </td>

                  {/* Instructions */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.instructions}
                      onChange={(e) => handleUpdateRow(row.id, 'instructions', e.target.value)}
                      placeholder="ex: Traiter en fin de journée avec mouillage suffisant..."
                      className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                    />
                  </td>

                  {/* Delete */}
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
