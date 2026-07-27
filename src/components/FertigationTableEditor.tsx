import React from 'react';
import { FertigationTable, FertigationRow } from '../types';
import { Droplets, Plus, Trash2, Calculator, Gauge, Sparkles } from 'lucide-react';

interface FertigationTableEditorProps {
  table: FertigationTable;
  onChange: (updated: FertigationTable) => void;
}

export const FertigationTableEditor: React.FC<FertigationTableEditorProps> = ({
  table,
  onChange,
}) => {
  const handleTitleChange = (newTitle: string) => {
    onChange({
      ...table,
      title: newTitle,
    });
  };

  const handleParameterChange = (field: 'ecTarget' | 'phTarget', value: string) => {
    onChange({
      ...table,
      [field]: value,
    });
  };

  const handleAddRow = () => {
    const newRow: FertigationRow = {
      id: `fer_${Date.now()}`,
      fertilizer: 'Engrais / Nutriment',
      dailyDose: 10,
      weeklyTotal: 70,
      roleDirectives: 'Nutrition équilibrée',
    };
    onChange({
      ...table,
      rows: [...table.rows, newRow],
    });
  };

  const handleUpdateRow = (id: string, field: keyof FertigationRow, value: any) => {
    const updatedRows = table.rows.map((row) => {
      if (row.id !== id) return row;

      const updated = { ...row, [field]: value };

      // Auto-calculate weekly total when daily dose changes unless custom weekly is manually overridden
      if (field === 'dailyDose' && !row.isCustomWeekly) {
        const numDaily = parseFloat(value) || 0;
        updated.weeklyTotal = Math.round(numDaily * 7 * 100) / 100;
      }

      return updated;
    });

    onChange({
      ...table,
      rows: updatedRows,
    });
  };

  const handleToggleCustomWeekly = (id: string) => {
    const updatedRows = table.rows.map((row) => {
      if (row.id !== id) return row;
      const isCustom = !row.isCustomWeekly;
      let newWeekly = row.weeklyTotal;
      if (!isCustom) {
        const numDaily = parseFloat(row.dailyDose as any) || 0;
        newWeekly = Math.round(numDaily * 7 * 100) / 100;
      }
      return {
        ...row,
        isCustomWeekly: isCustom,
        weeklyTotal: newWeekly,
      };
    });

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

  // Calculate sum total of weekly fertilizers
  const totalWeeklyKg = table.rows.reduce((sum, row) => sum + (parseFloat(row.weeklyTotal as any) || 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#EBE9E1] gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <Droplets className="w-5 h-5 text-[#344E41]" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={table.title || 'Programme Hebdomadaire de Fertigation'}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg bg-transparent border-b border-dashed border-[#CCD5AE] focus:border-[#A3B18A] focus:outline-none w-full sm:w-auto"
            />
            <p className="text-xs text-[#8C8F85]">
              Apports nutritionnels quotidiens et totaux hebdomadaires calculés automatiquement
            </p>
          </div>
        </div>

        <button
          onClick={handleAddRow}
          className="flex items-center justify-center space-x-1.5 text-xs font-bold text-[#E9EDC9] bg-[#5A6352] hover:bg-[#344E41] px-3.5 py-2 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajouter Engrais</span>
        </button>
      </div>

      {/* Target Parameters Bar (EC & pH) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 bg-[#F9F8F5] p-3.5 rounded-2xl border border-[#EBE9E1]">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-[#5A6352]" />
          <label className="text-xs font-bold text-[#344E41] min-w-[100px]">
            Cible EC (mS/cm) :
          </label>
          <input
            type="text"
            value={table.ecTarget || ''}
            onChange={(e) => handleParameterChange('ecTarget', e.target.value)}
            placeholder="ex: 1.8 - 2.0"
            className="flex-1 text-xs font-mono font-bold text-[#344E41] bg-white border border-[#EBE9E1] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#A3B18A]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-[#344E41]" />
          <label className="text-xs font-bold text-[#344E41] min-w-[100px]">
            Cible pH Solution :
          </label>
          <input
            type="text"
            value={table.phTarget || ''}
            onChange={(e) => handleParameterChange('phTarget', e.target.value)}
            placeholder="ex: 5.8 - 6.2"
            className="flex-1 text-xs font-mono font-bold text-[#344E41] bg-white border border-[#EBE9E1] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#A3B18A]"
          />
        </div>
      </div>

      {/* Dynamic Fertigation Table */}
      <div className="overflow-x-auto rounded-xl border border-[#EBE9E1] mb-3">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F9F8F5] text-[#344E41] font-bold border-b border-[#EBE9E1]">
            <tr>
              <th className="p-3 min-w-[180px]">Engrais / Nutriments</th>
              <th className="p-3 min-w-[120px]">Apport Quotidien (kg/ha/j)</th>
              <th className="p-3 min-w-[140px]">Total Hebdo (kg/ha)</th>
              <th className="p-3 min-w-[220px]">Rôle Agronomique & Directives</th>
              <th className="p-3 w-10 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE9E1] bg-white">
            {table.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-[#8C8F85] italic">
                  Aucun engrais saisi dans le programme.
                </td>
              </tr>
            ) : (
              table.rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#F9F8F5] transition-colors">
                  {/* Fertilizer Name */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.fertilizer}
                      onChange={(e) => handleUpdateRow(row.id, 'fertilizer', e.target.value)}
                      placeholder="ex: Nitrate de Potassium (13-0-46)"
                      className="w-full text-xs font-bold text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                    />
                  </td>

                  {/* Daily Dose */}
                  <td className="p-2">
                    <input
                      type="number"
                      step="0.1"
                      value={row.dailyDose}
                      onChange={(e) => handleUpdateRow(row.id, 'dailyDose', e.target.value)}
                      placeholder="12.0"
                      className="w-full text-xs font-mono font-bold text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                    />
                  </td>

                  {/* Weekly Total (Auto calculated x7) */}
                  <td className="p-2">
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        step="0.1"
                        value={row.weeklyTotal}
                        onChange={(e) => handleUpdateRow(row.id, 'weeklyTotal', e.target.value)}
                        readOnly={!row.isCustomWeekly}
                        placeholder="84.0"
                        className={`w-full text-xs font-mono font-extrabold rounded-lg px-2 py-1.5 focus:outline-none ${
                          row.isCustomWeekly
                            ? 'bg-[#D4A373]/20 text-[#D4A373] border border-[#D4A373]/40'
                            : 'bg-[#E9EDC9] text-[#344E41] border border-[#CCD5AE]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleCustomWeekly(row.id)}
                        className={`text-[10px] p-1 rounded font-bold transition-all ${
                          row.isCustomWeekly
                            ? 'bg-[#D4A373] text-white'
                            : 'bg-[#EBE9E1] text-[#5A6352] hover:bg-[#CCD5AE]'
                        }`}
                        title={row.isCustomWeekly ? 'Saisie manuelle active (Cliquer pour basculer en auto x7)' : 'Calcul auto (x7 jours). Cliquer pour saisie manuelle'}
                      >
                        {row.isCustomWeekly ? 'Man' : 'x7'}
                      </button>
                    </div>
                  </td>

                  {/* Role & Directives */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.roleDirectives}
                      onChange={(e) => handleUpdateRow(row.id, 'roleDirectives', e.target.value)}
                      placeholder="ex: Apport azoté & renforcement de la firme..."
                      className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-lg px-2.5 py-1.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                    />
                  </td>

                  {/* Delete */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="text-amber-800/60 hover:text-red-700 p-1.5 rounded-lg hover:bg-amber-100 transition-all"
                      title="Supprimer l'engrais"
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

      {/* Summary Footnote */}
      <div className="flex items-center justify-between text-xs font-bold text-[#344E41] bg-[#F9F8F5] p-3 rounded-xl border border-[#EBE9E1]">
        <span className="flex items-center space-x-1.5 text-[#344E41]">
          <Calculator className="w-4 h-4 text-[#5A6352]" />
          <span>Total Apport Nutritionnel Hebdomadaire Cumulé :</span>
        </span>
        <span className="font-mono text-xs sm:text-sm font-extrabold text-[#344E41] bg-[#E9EDC9] px-3 py-1 rounded-xl border border-[#CCD5AE]">
          {Math.round(totalWeeklyKg * 100) / 100} kg / ha / semaine
        </span>
      </div>
    </div>
  );
};
