import React from 'react';
import { CROP_TEMPLATES } from '../data/defaultTemplates';
import { Sparkles, ArrowRight, Sprout, ShieldAlert, PlusCircle } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (templateId?: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center space-x-1.5 bg-[#E9EDC9] text-[#344E41] text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 border border-[#CCD5AE]">
          <Sparkles className="w-3.5 h-3.5 text-[#344E41]" />
          <span>Modèles de Rapport Prédéfinis</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#344E41] tracking-tight">
          Choisissez un Modèle de Culture ou Démarrez à Zéro
        </h2>
        <p className="text-xs sm:text-sm text-[#8C8F85] mt-2">
          Tous les modèles sont pré-remplis avec les structures types, programmes phytosanitaires et grilles de fertigation spécifiques à la culture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Blank Report Option */}
        <div
          onClick={() => onSelectTemplate()}
          className="bg-white rounded-2xl border-2 border-dashed border-[#CCD5AE] hover:border-[#A3B18A] p-6 flex flex-col justify-between cursor-pointer group transition-all shadow-sm hover:shadow-md"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#F9F8F5] group-hover:bg-[#E9EDC9] text-[#5A6352] group-hover:text-[#344E41] flex items-center justify-center mb-4 transition-colors">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif italic font-bold text-base text-[#344E41] group-hover:text-[#5A6352] mb-2">
              Rapport Vierge / Personnalisé
            </h3>
            <p className="text-xs text-[#8C8F85] leading-relaxed">
              Démarrez un nouveau rapport entièrement vierge et construisez vos propres tableaux et sections.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EBE9E1] flex items-center justify-between text-xs font-bold text-[#344E41]">
            <span>Créer Vierge</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Preset Crop Templates */}
        {CROP_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl.id)}
            className="bg-white rounded-2xl border border-[#EBE9E1] hover:border-[#A3B18A] p-6 flex flex-col justify-between cursor-pointer group transition-all shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E9EDC9] group-hover:bg-[#344E41] text-[#344E41] group-hover:text-[#E9EDC9] flex items-center justify-center transition-colors">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-[#E9EDC9] text-[#344E41] px-2.5 py-0.5 rounded-full border border-[#CCD5AE]">
                  {tmpl.cropType}
                </span>
              </div>

              <h3 className="font-serif italic font-bold text-base text-[#344E41] group-hover:text-[#5A6352] mb-2">
                {tmpl.name}
              </h3>
              <p className="text-xs text-[#3D3D3D] leading-relaxed">
                {tmpl.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EBE9E1] flex items-center justify-between text-xs font-bold text-[#344E41]">
              <span>Utiliser ce Modèle</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
