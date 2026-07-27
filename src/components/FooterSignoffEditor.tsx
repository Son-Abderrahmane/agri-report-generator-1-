import React, { useState } from 'react';
import { FooterSignoff } from '../types';
import { SignaturePadModal } from './SignaturePadModal';
import { UserCheck, PenTool, Trash2, Phone, Mail, FileText } from 'lucide-react';

interface FooterSignoffEditorProps {
  footer: FooterSignoff;
  onChange: (updated: FooterSignoff) => void;
}

export const FooterSignoffEditor: React.FC<FooterSignoffEditorProps> = ({
  footer,
  onChange,
}) => {
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);

  const handleChange = (field: keyof FooterSignoff, value: string) => {
    onChange({
      ...footer,
      [field]: value,
    });
  };

  const handleClearSignature = () => {
    onChange({
      ...footer,
      signatureDataUrl: undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBE9E1] p-5 sm:p-6 mb-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EBE9E1]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#E9EDC9] rounded-xl text-[#344E41]">
            <UserCheck className="w-5 h-5 text-[#344E41]" />
          </div>
          <div>
            <h3 className="font-serif italic font-bold text-[#344E41] text-base sm:text-lg">
              7. Validation & Signature du Consultant Agronome
            </h3>
            <p className="text-xs text-[#8C8F85]">
              Coordonnées de l'expert, visa et signature manuscrite ou électronique
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Consultant Name */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Nom & Prénom de l'Expert
          </label>
          <input
            type="text"
            value={footer.consultantName || ''}
            onChange={(e) => handleChange('consultantName', e.target.value)}
            placeholder="ex: Ing. Agronome Karim BENALLAL"
            className="w-full text-xs font-bold text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Titre / Fonction
          </label>
          <input
            type="text"
            value={footer.consultantTitle || ''}
            onChange={(e) => handleChange('consultantTitle', e.target.value)}
            placeholder="ex: Consultant Spécialiste en Cultures Sous Serre"
            className="w-full text-xs text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Téléphone Contact
          </label>
          <input
            type="text"
            value={footer.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="ex: +212 6 61 23 45 67"
            className="w-full text-xs font-mono text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-[#5A6352] mb-1">
            Email Professionnel
          </label>
          <input
            type="email"
            value={footer.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="ex: k.benallal@agri-expertise.ma"
            className="w-full text-xs font-mono text-[#3D3D3D] bg-[#F9F8F5] border border-[#EBE9E1] rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#A3B18A] focus:outline-none"
          />
        </div>
      </div>

      {/* Signature Section */}
      <div className="bg-[#F9F8F5] p-4 rounded-2xl border border-[#EBE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-xs text-[#344E41] mb-1">Signature Numérique & Tampon</h4>
          <p className="text-[11px] text-[#8C8F85]">
            {footer.signatureDataUrl
              ? 'Signature enregistrée sur ce rapport.'
              : 'Cliquez ci-contre pour apposer votre signature manuscrite sur le rapport PDF.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {footer.signatureDataUrl ? (
            <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-[#CCD5AE] shadow-sm">
              <img
                src={footer.signatureDataUrl}
                alt="Signature"
                className="h-10 max-w-[120px] object-contain"
              />
              <button
                type="button"
                onClick={handleClearSignature}
                className="text-amber-800/60 hover:text-red-700 p-1.5 rounded-lg hover:bg-amber-100"
                title="Supprimer la signature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSigModalOpen(true)}
              className="flex items-center space-x-1.5 bg-[#5A6352] hover:bg-[#344E41] text-[#E9EDC9] font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
            >
              <PenTool className="w-4 h-4" />
              <span>Signer le Rapport</span>
            </button>
          )}
        </div>
      </div>

      <SignaturePadModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSaveSignature={(dataUrl) => {
          onChange({
            ...footer,
            signatureDataUrl: dataUrl,
            dateSigned: new Date().toISOString().split('T')[0],
          });
        }}
      />
    </div>
  );
};
