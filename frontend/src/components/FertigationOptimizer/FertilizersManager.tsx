import React, { useState, useEffect } from 'react';
import { OptimizerFertilizer } from '../../types';
import { confirmAlert } from '../../utils/confirm';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { FertilizerFormModal } from './FertilizerFormModal';

interface FertilizersManagerProps {
  apiBase: string;
  token: string;
}

export const FertilizersManager: React.FC<FertilizersManagerProps> = ({ apiBase, token }) => {
  const [fertilizers, setFertilizers] = useState<OptimizerFertilizer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFertilizer, setEditingFertilizer] = useState<OptimizerFertilizer | null>(null);

  useEffect(() => {
    fetchFertilizers();
  }, [apiBase, token]);

  const fetchFertilizers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/optimizer/fertilizers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFertilizers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  const handleSave = async (fert: Partial<OptimizerFertilizer>) => {
    try {
      const isEdit = !!fert.id;
      const url = isEdit ? `${apiBase}/optimizer/fertilizers/${fert.id}` : `${apiBase}/optimizer/fertilizers`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fert)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setEditingFertilizer(null);
        fetchFertilizers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmAlert("Supprimer cet engrais ?"))) return;
    try {
      await fetch(`${apiBase}/optimizer/fertilizers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFertilizers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = () => {
    setEditingFertilizer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (f: OptimizerFertilizer) => {
    setEditingFertilizer(f);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#F9F8F5] rounded-2xl p-5 border border-[#EBE9E1]">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-bold text-[#344E41] font-serif">Base de Données des Engrais</h4>
        <button onClick={handleAdd} className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#D4A373] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#c29363]">
          <Plus className="w-4 h-4" />
          <span>Ajouter un engrais</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500 text-sm">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E9EDC9] text-[#344E41] text-xs uppercase tracking-wider">
                <th className="p-3 rounded-tl-xl">Nom</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-center">N</th>
                <th className="p-3 text-center">P2O5</th>
                <th className="p-3 text-center">K2O</th>
                <th className="p-3 text-center">Ca</th>
                <th className="p-3 text-center">Mg</th>
                <th className="p-3 text-center">S</th>
                <th className="p-3 rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fertilizers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-sm text-[#8C8F85] italic">
                    Aucun engrais configuré.
                  </td>
                </tr>
              ) : (
                fertilizers.map(f => (
                  <tr key={f.id} className="border-b border-[#EBE9E1] hover:bg-white text-sm text-[#3D3D3D]">
                    <td className="p-3 font-semibold">{f.name}</td>
                    <td className="p-3 text-xs">{f.type}</td>
                    <td className="p-3 text-center font-mono">{f.n || 0}%</td>
                    <td className="p-3 text-center font-mono">{f.p2o5 || 0}%</td>
                    <td className="p-3 text-center font-mono">{f.k2o || 0}%</td>
                    <td className="p-3 text-center font-mono">{f.ca || 0}%</td>
                    <td className="p-3 text-center font-mono">{f.mg || 0}%</td>
                    <td className="p-3 text-center font-mono">{f.s || 0}%</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleEdit(f)} className="p-1 text-amber-700 hover:text-amber-900 mx-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(f.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <FertilizerFormModal 
          fertilizer={editingFertilizer} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};
