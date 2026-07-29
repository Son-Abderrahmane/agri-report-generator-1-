import React from 'react';
import { CustomTable, CustomTableColumn, CustomTableRow } from '../types';
import { Table, Plus, Trash2, Edit3, Columns, Rows } from 'lucide-react';

interface CustomTablesSectionProps {
  tables: CustomTable[];
  onChange: (updated: CustomTable[]) => void;
}

export const CustomTablesSection: React.FC<CustomTablesSectionProps> = ({
  tables,
  onChange,
}) => {
  const handleAddTable = () => {
    const newTable: CustomTable = {
      id: `tbl_${Date.now()}`,
      title: 'Tableau Personnalisé (ex: Analyse des Drains)',
      columns: [
        { id: 'col_1', label: 'Paramètre / Zone' },
        { id: 'col_2', label: 'Valeur Mesurée' },
        { id: 'col_3', label: 'Valeur Cible' },
        { id: 'col_4', label: 'Commentaires & Action' },
      ],
      rows: [
        {
          id: `row_${Date.now()}_1`,
          values: {
            col_1: 'Drainage EC (mS/cm)',
            col_2: '2.4',
            col_3: '2.0 - 2.2',
            col_4: 'Légère accumulation de sels, augmenter la fraction de lessivage',
          },
        },
      ],
    };
    onChange([...tables, newTable]);
  };

  const handleRemoveTable = (tableId: string) => {
    onChange(tables.filter((t) => t.id !== tableId));
  };

  const handleUpdateTableTitle = (tableId: string, title: string) => {
    onChange(tables.map((t) => (t.id === tableId ? { ...t, title } : t)));
  };

  const handleAddColumn = (tableId: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== tableId) return t;
        const newColId = `col_${Date.now()}`;
        const newCols = [...t.columns, { id: newColId, label: 'Nouvelle Colonne' }];
        return { ...t, columns: newCols };
      })
    );
  };

  const handleUpdateColumnLabel = (tableId: string, colId: string, label: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== tableId) return t;
        const updatedCols = t.columns.map((c) => (c.id === colId ? { ...c, label } : c));
        return { ...t, columns: updatedCols };
      })
    );
  };

  const handleRemoveColumn = (tableId: string, colId: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== tableId) return t;
        if (t.columns.length <= 1) return t; // keep at least 1 column
        const updatedCols = t.columns.filter((c) => c.id !== colId);
        return { ...t, columns: updatedCols };
      })
    );
  };

  const handleAddRow = (tableId: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== tableId) return t;
        const initialValues: Record<string, string> = {};
        t.columns.forEach((col) => {
          initialValues[col.id] = '';
        });
        const newRow: CustomTableRow = {
          id: `row_${Date.now()}`,
          values: initialValues,
        };
        return { ...t, rows: [...t.rows, newRow] };
      })
    );
  };

  const handleUpdateCellValue = (tableId: string, rowId: string, colId: string, value: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== tableId) return t;
        const updatedRows = t.rows.map((row) => {
          if (row.id !== rowId) return row;
          return {
            ...row,
            values: {
              ...row.values,
              [colId]: value,
            },
          };
        });
        return { ...t, rows: updatedRows };
      })
    );
  };

  const handleRemoveRow = (tableId: string, rowId: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== tableId) return t;
        return { ...t, rows: t.rows.filter((r) => r.id !== rowId) };
      })
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBE9E1]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <Table className="w-5 h-5 text-[#344E41]" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg">
              5. Tableaux Sur Mesure (Dynamic Custom Tables)
            </h3>
            <p className="text-xs text-[#8C8F85]">
              Créez des tableaux personnalisés (analyses d'eau, mesures climat, piégeages)
            </p>
          </div>
        </div>

        <button
          onClick={handleAddTable}
          className="flex items-center space-x-1.5 text-xs font-bold text-[#E9EDC9] bg-[#5A6352] hover:bg-[#344E41] px-3.5 py-2 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Créer un Tableau</span>
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-6 bg-[#F9F8F5] rounded-2xl border border-dashed border-[#CCD5AE]">
          <Table className="w-8 h-8 mx-auto text-[#A3B18A] mb-2" />
          <p className="text-xs text-[#8C8F85] mb-2">Aucun tableau personnalisé configuré.</p>
          <button
            onClick={handleAddTable}
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#344E41] bg-[#E9EDC9] hover:bg-[#CCD5AE] px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un nouveau tableau</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {tables.map((tbl, tIdx) => (
            <div key={tbl.id} className="bg-[#F9F8F5] p-4 rounded-2xl border border-[#EBE9E1] shadow-sm">
              {/* Table Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#EBE9E1] gap-2">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="font-extrabold text-xs text-[#344E41] bg-[#E9EDC9] px-2.5 py-0.5 rounded-lg border border-[#CCD5AE]">
                    T{tIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={tbl.title}
                    onChange={(e) => handleUpdateTableTitle(tbl.id, e.target.value)}
                    placeholder="Titre du tableau..."
                    className="font-bold text-[#344E41] text-sm bg-white border border-[#EBE9E1] rounded-lg px-2.5 py-1 focus:border-[#A3B18A] focus:outline-none flex-1 max-w-md"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAddColumn(tbl.id)}
                    className="flex items-center space-x-1 text-xs font-bold text-[#344E41] bg-[#E9EDC9] hover:bg-[#CCD5AE] px-2.5 py-1 rounded-lg border border-[#CCD5AE] transition-all"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>+ Colonne</span>
                  </button>

                  <button
                    onClick={() => handleAddRow(tbl.id)}
                    className="flex items-center space-x-1 text-xs font-bold text-[#344E41] bg-white hover:bg-[#EBE9E1] px-2.5 py-1 rounded-lg border border-[#EBE9E1] transition-all"
                  >
                    <Rows className="w-3.5 h-3.5" />
                    <span>+ Ligne</span>
                  </button>

                  <button
                    onClick={() => handleRemoveTable(tbl.id)}
                    className="text-amber-800/60 hover:text-red-700 p-1.5 rounded-lg hover:bg-amber-100 transition-all"
                    title="Supprimer ce tableau"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Custom Table Display */}
              <div className="overflow-x-auto rounded-xl border border-[#EBE9E1] bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#344E41] text-white font-bold border-b border-[#344E41]">
                    <tr>
                      {tbl.columns.map((col) => (
                        <th key={col.id} className="p-2.5 min-w-[140px] relative group">
                          <div className="flex items-center justify-between space-x-1">
                            <input
                              type="text"
                              value={col.label}
                              onChange={(e) => handleUpdateColumnLabel(tbl.id, col.id, e.target.value)}
                              className="bg-[#5A6352] text-[#E9EDC9] font-bold text-xs rounded px-2 py-0.5 focus:outline-none w-full"
                            />
                            {tbl.columns.length > 1 && (
                              <button
                                onClick={() => handleRemoveColumn(tbl.id, col.id)}
                                className="text-[#E9EDC9] hover:text-white p-0.5 rounded opacity-70 hover:opacity-100"
                                title="Supprimer la colonne"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="p-2.5 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE9E1]">
                    {tbl.rows.length === 0 ? (
                      <tr>
                        <td colSpan={tbl.columns.length + 1} className="text-center py-4 text-[#8C8F85] italic">
                          Aucune ligne. Cliquez sur "+ Ligne" pour saisir des données.
                        </td>
                      </tr>
                    ) : (
                      tbl.rows.map((row) => (
                        <tr key={row.id} className="hover:bg-[#F9F8F5]">
                          {tbl.columns.map((col) => (
                            <td key={col.id} className="p-2">
                              <input
                                type="text"
                                value={row.values[col.id] || ''}
                                onChange={(e) =>
                                  handleUpdateCellValue(tbl.id, row.id, col.id, e.target.value)
                                }
                                placeholder="..."
                                className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded px-2 py-1 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
                              />
                            </td>
                          ))}
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleRemoveRow(tbl.id, row.id)}
                              className="text-amber-800/60 hover:text-red-700 p-1 rounded hover:bg-amber-100"
                              title="Supprimer la ligne"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
