import React from 'react';
import { FarmDetails, MetadataField } from '../types';
import { ClipboardList, Plus, Trash2, Calendar, MapPin, User, Tag, Sprout } from 'lucide-react';

interface FarmDetailsEditorProps {
  details: FarmDetails;
  onChange: (updated: FarmDetails) => void;
}

export const FarmDetailsEditor: React.FC<FarmDetailsEditorProps> = ({
  details,
  onChange,
}) => {
  const handleChange = (field: keyof FarmDetails, value: any) => {
    onChange({
      ...details,
      [field]: value,
    });
  };

  const handleAddCustomField = () => {
    const custom = details.customFields || [];
    const newField: MetadataField = {
      id: `meta_${Date.now()}`,
      label: 'Nouveau Champ',
      value: '',
    };
    onChange({
      ...details,
      customFields: [...custom, newField],
    });
  };

  const handleUpdateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    const custom = (details.customFields || []).map((item) =>
      item.id === id ? { ...item, [key]: val } : item
    );
    onChange({
      ...details,
      customFields: custom,
    });
  };

  const handleRemoveCustomField = (id: string) => {
    const custom = (details.customFields || []).filter((item) => item.id !== id);
    onChange({
      ...details,
      customFields: custom,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBE9E1]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg">
              2. Informations Générales & Exploitation
            </h3>
            <p className="text-xs text-[#8C8F85]">
              Métadonnées de l'exploitation, de la parcelle et calendrier de visite
            </p>
          </div>
        </div>
        <button
          onClick={handleAddCustomField}
          className="flex items-center space-x-1 text-xs font-bold text-[#344E41] bg-[#E9EDC9] hover:bg-[#CCD5AE] px-3 py-1.5 rounded-xl border border-[#CCD5AE] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Champ Personnalisé</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Exploitation / Client */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Exploitation / Client
          </label>
          <input
            type="text"
            value={details.clientName || ''}
            onChange={(e) => handleChange('clientName', e.target.value)}
            placeholder="ex: Domaine Les Vergers du Souss"
            className="w-full text-xs font-bold text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Ref Rapport */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Réf. Rapport
          </label>
          <input
            type="text"
            value={details.reportRef || ''}
            onChange={(e) => handleChange('reportRef', e.target.value)}
            placeholder="ex: RVT-2026-07-042"
            className="w-full text-xs font-mono font-bold text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Localisation / Parcelle
          </label>
          <input
            type="text"
            value={details.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="ex: Secteur Agadir - Parcelle 04-B"
            className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Date de Visite */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Date de Visite
          </label>
          <input
            type="date"
            value={details.visitDate || ''}
            onChange={(e) => handleChange('visitDate', e.target.value)}
            className="w-full text-xs font-medium text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Culture / Variété */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Culture & Variété
          </label>
          <input
            type="text"
            value={details.cropVariety || ''}
            onChange={(e) => handleChange('cropVariety', e.target.value)}
            placeholder="ex: Framboisier - Adelita"
            className="w-full text-xs font-medium text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Stade Phénologique */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Stade Phénologique
          </label>
          <input
            type="text"
            value={details.phenologicalStage || ''}
            onChange={(e) => handleChange('phenologicalStage', e.target.value)}
            placeholder="ex: Début Floraison & Nouaison"
            className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Type d'Abri */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Type d'Abri / Structure
          </label>
          <input
            type="text"
            value={details.shelterType || ''}
            onChange={(e) => handleChange('shelterType', e.target.value)}
            placeholder="ex: Grand Abri Plastique (GAP)"
            className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Prochaine Visite */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Prochaine Visite
          </label>
          <input
            type="date"
            value={details.nextVisitDate || ''}
            onChange={(e) => handleChange('nextVisitDate', e.target.value)}
            className="w-full text-xs font-medium text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Dynamic Custom Fields */}
      {details.customFields && details.customFields.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#EBE9E1]">
          <p className="text-xs font-bold text-[#5A6352] mb-2">Champs Additionnels Personnalisés :</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {details.customFields.map((field) => (
              <div key={field.id} className="flex items-center space-x-1.5 bg-[#F9F8F5] p-2 rounded-xl border border-[#EBE9E1]">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleUpdateCustomField(field.id, 'label', e.target.value)}
                  placeholder="Intitulé"
                  className="w-1/2 text-xs font-bold text-[#344E41] bg-white border border-[#EBE9E1] rounded-lg px-2 py-1 focus:outline-none"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleUpdateCustomField(field.id, 'value', e.target.value)}
                  placeholder="Valeur"
                  className="w-1/2 text-xs text-[#3D3D3D] bg-white border border-[#EBE9E1] rounded-lg px-2 py-1 focus:outline-none"
                />
                <button
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="text-amber-800 hover:text-red-700 p-1 rounded-lg hover:bg-amber-100"
                  title="Supprimer le champ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
