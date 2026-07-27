import React, { useState, useRef } from 'react';
import { ObservationPhoto, AlertLevel } from '../types';
import { CameraModal } from './CameraModal';
import { 
  Camera, 
  Upload, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Eye, 
  Image as ImageIcon,
  Tag
} from 'lucide-react';

interface ObservationsSectionProps {
  observations: ObservationPhoto[];
  onChange: (updated: ObservationPhoto[]) => void;
}

export const ObservationsSection: React.FC<ObservationsSectionProps> = ({
  observations,
  onChange,
}) => {
  const [activeCamIndex, setActiveCamIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleAddObservation = () => {
    const newIndex = observations.length + 1;
    const newObs: ObservationPhoto = {
      id: `obs_${Date.now()}`,
      url: '',
      caption: `PHOTO ${newIndex}: Observation sur parcelle`,
      pestName: 'Nouvelle cible / Bioagresseur',
      alertLevel: 'Info',
      symptoms: '',
      timestamp: new Date().toISOString().split('T')[0],
    };
    onChange([...observations, newObs]);
  };

  const handleUpdateObservation = (id: string, field: keyof ObservationPhoto, value: any) => {
    const updated = observations.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const handleRemoveObservation = (id: string) => {
    onChange(observations.filter((item) => item.id !== id));
  };

  const handleNativeFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleUpdateObservation(id, 'url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getAlertBadgeClass = (level: AlertLevel) => {
    switch (level) {
      case 'Alerte Élevée':
        return 'bg-[#D4A373] text-white border-[#D4A373] font-bold';
      case 'Alerte Modérée':
        return 'bg-[#CCD5AE] text-[#344E41] border-[#A3B18A] font-bold';
      default:
        return 'bg-[#E9EDC9] text-[#344E41] border-[#CCD5AE] font-bold';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBE9E1]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg">
              4. Observations Phytosanitaires & Photos Terrain
            </h3>
            <p className="text-xs text-[#8C8F85]">
              Captures photos directes de la caméra et constatations des dégâts/symptômes
            </p>
          </div>
        </div>

        <button
          onClick={handleAddObservation}
          className="flex items-center space-x-1.5 text-xs font-bold text-[#E9EDC9] bg-[#5A6352] hover:bg-[#344E41] px-3.5 py-2 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Bloc Observation</span>
        </button>
      </div>

      {observations.length === 0 ? (
        <div className="text-center py-8 bg-[#F9F8F5] rounded-2xl border border-dashed border-[#CCD5AE]">
          <ImageIcon className="w-10 h-10 mx-auto text-[#A3B18A] mb-2" />
          <p className="text-xs text-[#8C8F85] mb-3">Aucune observation ou photo attachée pour le moment.</p>
          <button
            onClick={handleAddObservation}
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#344E41] bg-[#E9EDC9] hover:bg-[#CCD5AE] px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une observation terrain</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {observations.map((obs, idx) => (
            <div
              key={obs.id}
              className="bg-[#F9F8F5] rounded-2xl border border-[#EBE9E1] p-4 relative flex flex-col justify-between shadow-sm hover:border-[#A3B18A] transition-all"
            >
              <div>
                {/* Header card info & remove button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-[#344E41] bg-[#E9EDC9] px-2.5 py-0.5 rounded-lg border border-[#CCD5AE]">
                      #{idx + 1}
                    </span>
                    <select
                      value={obs.alertLevel}
                      onChange={(e) => handleUpdateObservation(obs.id, 'alertLevel', e.target.value as AlertLevel)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border text-center cursor-pointer focus:outline-none ${getAlertBadgeClass(obs.alertLevel)}`}
                    >
                      <option value="Info" className="bg-white text-[#344E41]">Info / Normal</option>
                      <option value="Alerte Modérée" className="bg-white text-[#344E41]">Alerte Modérée</option>
                      <option value="Alerte Élevée" className="bg-white text-[#344E41]">Alerte Élevée</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleRemoveObservation(obs.id)}
                    className="text-amber-800/60 hover:text-red-700 p-1.5 rounded-lg hover:bg-amber-100 transition-all"
                    title="Supprimer ce bloc"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Target & Pest Name */}
                <div className="mb-3">
                  <label className="block text-[11px] font-bold text-[#5A6352] mb-0.5">
                    Cible / Bioagresseur / Organe
                  </label>
                  <input
                    type="text"
                    value={obs.pestName || ''}
                    onChange={(e) => handleUpdateObservation(obs.id, 'pestName', e.target.value)}
                    placeholder="ex: Acariens Rouges (Tetranychus urticae)"
                    className="w-full text-xs font-bold text-[#344E41] bg-white border border-[#EBE9E1] rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none"
                  />
                </div>

                {/* Photo Preview & Capture Buttons */}
                <div className="mb-3">
                  {obs.url ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#CCD5AE] group max-h-48 bg-black">
                      <img
                        src={obs.url}
                        alt={obs.caption}
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCamIndex(idx);
                          }}
                          className="bg-white/90 hover:bg-white text-[#344E41] text-xs font-bold px-2.5 py-1 rounded-lg shadow flex items-center space-x-1"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#5A6352]" />
                          <span>Reprendre</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[obs.id]?.click()}
                          className="bg-white/90 hover:bg-white text-[#344E41] text-xs font-bold px-2.5 py-1 rounded-lg shadow flex items-center space-x-1"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#5A6352]" />
                          <span>Galerie</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#CCD5AE] rounded-2xl p-4 text-center bg-white">
                      <Camera className="w-8 h-8 mx-auto text-[#A3B18A] mb-2" />
                      <p className="text-xs text-[#5A6352] font-semibold mb-2">Prendre une photo de terrain</p>
                      
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {/* Native Camera Trigger button */}
                        <label className="cursor-pointer bg-[#5A6352] hover:bg-[#344E41] text-[#E9EDC9] font-bold text-xs px-3 py-1.5 rounded-xl shadow flex items-center space-x-1 transition-all">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Appareil Photo Native</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleNativeFileUpload(obs.id, e)}
                            className="hidden"
                          />
                        </label>

                        {/* Live Web Camera Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => setActiveCamIndex(idx)}
                          className="bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow flex items-center space-x-1 transition-all"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#E9EDC9]" />
                          <span>Caméra Web</span>
                        </button>

                        {/* Gallery File Import */}
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[obs.id]?.click()}
                          className="bg-[#F9F8F5] hover:bg-[#E9EDC9] text-[#344E41] text-xs font-bold px-2.5 py-1.5 rounded-xl border border-[#CCD5AE] flex items-center space-x-1 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Fichier</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hidden Input for Gallery Upload */}
                  <input
                    ref={(el) => (fileInputRefs.current[obs.id] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleNativeFileUpload(obs.id, e)}
                    className="hidden"
                  />
                </div>

                {/* Photo Caption */}
                <div className="mb-2">
                  <label className="block text-[11px] font-bold text-[#5A6352] mb-0.5">
                    Légende de la photo
                  </label>
                  <input
                    type="text"
                    value={obs.caption || ''}
                    onChange={(e) => handleUpdateObservation(obs.id, 'caption', e.target.value)}
                    placeholder="ex: PHOTO 1: Bronzage foliaire sur rang 3"
                    className="w-full text-xs text-[#3D3D3D] bg-white border border-[#EBE9E1] rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none"
                  />
                </div>

                {/* Observations & Symptoms */}
                <div>
                  <label className="block text-[11px] font-bold text-[#5A6352] mb-0.5">
                    Symptômes & Remarques terrain
                  </label>
                  <textarea
                    rows={2}
                    value={obs.symptoms || ''}
                    onChange={(e) => handleUpdateObservation(obs.id, 'symptoms', e.target.value)}
                    placeholder="Décrivez les symptômes observés, le niveau d'infestation, la répartition dans la parcelle..."
                    className="w-full text-xs text-[#3D3D3D] bg-white border border-[#EBE9E1] rounded-xl px-3 py-2 focus:border-[#A3B18A] focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WebRTC Camera Modal if active */}
      {activeCamIndex !== null && (
        <CameraModal
          isOpen={activeCamIndex !== null}
          onClose={() => setActiveCamIndex(null)}
          onCapture={(dataUrl) => {
            if (activeCamIndex !== null && observations[activeCamIndex]) {
              handleUpdateObservation(observations[activeCamIndex].id, 'url', dataUrl);
            }
          }}
        />
      )}
    </div>
  );
};
