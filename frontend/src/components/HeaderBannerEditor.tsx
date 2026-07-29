import React from 'react';
import { HeaderBanner } from '../types';
import { Building2, Image as ImageIcon, Sparkles, Tag, ShieldAlert } from 'lucide-react';

interface HeaderBannerEditorProps {
  banner: HeaderBanner;
  onChange: (updated: HeaderBanner) => void;
}

export const HeaderBannerEditor: React.FC<HeaderBannerEditorProps> = ({
  banner,
  onChange,
}) => {
  const handleChange = (field: keyof HeaderBanner, value: string) => {
    onChange({
      ...banner,
      [field]: value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({
          ...banner,
          logoUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBE9E1]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg">
              1. En-Tête & Bannière du Rapport
            </h3>
            <p className="text-xs text-[#8C8F85]">
              Personnalisez l'identité visuelle et le titre principal du document
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-[#E9EDC9] text-[#344E41] px-3 py-1 rounded-full border border-[#CCD5AE]">
          Modifiable
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Title */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Raison Sociale / Entité
          </label>
          <input
            type="text"
            value={banner.companyTitle || ''}
            onChange={(e) => handleChange('companyTitle', e.target.value)}
            placeholder="ex: CONSEIL & EXPERTISE AGRONOMIQUE"
            className="w-full text-xs font-bold text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Sous-Titre / Spécialité
          </label>
          <input
            type="text"
            value={banner.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="ex: Suivi Technique & Assistance à la Production Fruitière"
            className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Document Title */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Titre du Document
          </label>
          <input
            type="text"
            value={banner.docTitle || ''}
            onChange={(e) => handleChange('docTitle', e.target.value)}
            placeholder="ex: RAPPORT DE VISITE TECHNIQUE"
            className="w-full text-xs font-extrabold uppercase tracking-wide text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Frequency Tag */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Fréquence / Périodicité
          </label>
          <input
            type="text"
            value={banner.frequencyTag || ''}
            onChange={(e) => handleChange('frequencyTag', e.target.value)}
            placeholder="ex: Suivi Hebdomadaire"
            className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>

        {/* Crop / Type */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Culture & Type d'Abri
          </label>
          <input
            type="text"
            value={banner.cropType || ''}
            onChange={(e) => handleChange('cropType', e.target.value)}
            placeholder="ex: Framboisier (Sous Serre)"
            className="w-full text-xs font-semibold text-[#344E41] bg-[#E9EDC9]/40 border border-[#CCD5AE] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Banner Preview Strip */}
      <div className="mt-5 p-4 bg-[#5A6352] text-white rounded-2xl border border-[#344E41] flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className="space-y-0.5 z-10">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#A3B18A]">
            {banner.companyTitle || 'CONSEIL & EXPERTISE AGRONOMIQUE'}
          </p>
          <h4 className="text-base sm:text-lg font-serif italic text-[#E9EDC9] font-bold">
            {banner.docTitle || 'RAPPORT DE VISITE TECHNIQUE'}
          </h4>
          <p className="text-xs text-white/80 italic">
            {banner.subtitle || 'Suivi Technique & Assistance'}
          </p>
        </div>
        <div className="text-right flex flex-col items-end z-10">
          <span className="bg-[#CCD5AE] text-[#344E41] font-bold text-[10px] px-3 py-1 rounded-full mb-1 uppercase tracking-wide">
            {banner.frequencyTag || 'SUIVI HEBDOMADAIRE'}
          </span>
          <span className="text-xs font-medium text-[#E9EDC9]">
            {banner.cropType || 'Framboisier'}
          </span>
        </div>
      </div>
    </div>
  );
};
