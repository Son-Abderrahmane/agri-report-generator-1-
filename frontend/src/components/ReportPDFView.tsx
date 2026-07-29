import React, { useRef, useState } from 'react';
import { Report } from '../types';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { 
  Download, 
  Printer, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  Droplets, 
  CheckSquare, 
  PenTool,
  Loader2,
  FileCheck
} from 'lucide-react';

interface ReportPDFViewProps {
  report: Report;
  onEditRequest?: () => void;
}

export const ReportPDFView: React.FC<ReportPDFViewProps> = ({
  report,
  onEditRequest,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const element = reportRef.current;

      // Use html-to-image which renders via SVG foreignObject in browser natively, avoiding html2canvas oklab parsing errors
      let imgData = '';
      try {
        imgData = await toPng(element, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: false,
        });
      } catch (firstErr) {
        console.warn('First attempt with toPng failed, retrying with skipFonts: true', firstErr);
        imgData = await toPng(element, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
        });
      }

      if (!imgData) {
        throw new Error('Image data generation returned empty result');
      }

      // Load image dimensions
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (img.height * pdfWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Page 1
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Extra pages if document spans multiple A4 heights
      while (heightLeft > 3) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const cleanTitle = (report.farmDetails?.reportRef || 'Rapport-Agronomique')
        .replace(/[^a-zA-Z0-9_\-]/g, '_');
      const cleanDate = (report.farmDetails?.visitDate || '2026').replace(/[^0-9\-]/g, '');
      const fileName = `${cleanTitle}_${cleanDate}.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('La génération directe a échoué. L\'outil d\'impression va s\'ouvrir pour enregistrer en PDF.');
      handlePrint();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportRef.current) return;

    // Use a hidden iframe for reliable, cross-browser sandboxed printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';

    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${report.headerBanner?.docTitle || 'Rapport de Visite Technique'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..800;1,6..72,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; background: #ffffff; padding: 15px; color: #3D3D3D; margin: 0; }
            h1, h2, h3, .font-serif { font-family: 'Newsreader', Georgia, serif; }
            @media print {
              body { padding: 0; margin: 0; }
              @page { size: A4; margin: 8mm; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 210mm; margin: 0 auto;">
            ${reportRef.current.innerHTML}
          </div>
        </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(htmlContent);
    frameDoc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe print failed, falling back to window.print()', e);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 2000);
      }
    }, 400);
  };

  const {
    headerBanner,
    farmDetails,
    diagnosticSummary,
    observations,
    phytosanitaryTable,
    fertigationTable,
    customTables,
    recommendations,
    footer,
  } = report;

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6">
      {/* Top Action Bar */}
      <div className="no-print bg-[#344E41] text-[#E9EDC9] p-4 sm:p-5 rounded-2xl shadow-lg mb-6 flex flex-wrap items-center justify-between gap-3 border border-[#5A6352]">
        <div>
          <h2 className="font-serif italic font-bold text-sm sm:text-base text-[#E9EDC9] flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-[#A3B18A]" />
            <span>Document d'Inspection Prêt pour Export PDF</span>
          </h2>
          <p className="text-xs text-[#A3B18A]/80">
            Aperçu conforme au rendu final d'impression et d'archivage client
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onEditRequest && (
            <button
              onClick={onEditRequest}
              className="bg-[#5A6352] hover:bg-[#A3B18A] text-[#E9EDC9] hover:text-[#344E41] text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
            >
              Modifier le contenu
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-[#5A6352] hover:bg-[#A3B18A] text-[#E9EDC9] hover:text-[#344E41] text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer / PDF</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 bg-[#E9EDC9] hover:bg-[#CCD5AE] text-[#344E41] font-black text-xs px-4 py-2 rounded-xl shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Télécharger PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="overflow-x-auto w-full pb-4">
        <div
          ref={reportRef}
          id="print-report-container"
          className="bg-white text-[#3D3D3D] p-6 sm:p-10 shadow-xl rounded-2xl border border-[#EBE9E1] w-[210mm] min-w-[210mm] mx-auto text-xs font-sans leading-normal print:p-0 print:shadow-none print:border-none print:m-0"
        >
        {/* 1. Header Banner */}
        <header className="border-b-4 border-[#344E41] pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black tracking-widest text-[#5A6352] uppercase">
                {headerBanner?.companyTitle || 'CONSEIL & EXPERTISE AGRONOMIQUE'}
              </p>
              <h1 className="text-xl sm:text-2xl font-serif italic font-extrabold uppercase text-[#344E41] tracking-tight my-0.5">
                {headerBanner?.docTitle || 'RAPPORT DE VISITE TECHNIQUE'}
              </h1>
              <p className="text-xs italic text-[#8C8F85] font-medium">
                {headerBanner?.subtitle || 'Suivi Technique & Assistance à la Production Fruitière'}
              </p>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="bg-[#344E41] text-[#E9EDC9] text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-wider mb-1">
                {headerBanner?.frequencyTag || 'Suivi Hebdomadaire'}
              </span>
              <span className="text-xs font-extrabold text-[#344E41] bg-[#E9EDC9] px-2.5 py-0.5 rounded-lg border border-[#CCD5AE]">
                {headerBanner?.cropType || 'Framboisier (Sous Serre)'}
              </span>
            </div>
          </div>
        </header>

        {/* 2. General Information & Farm Details */}
        <section className="mb-6">
          <div className="bg-[#F9F8F5] border border-[#EBE9E1] rounded-2xl p-3.5 sm:p-4">
            <h3 className="font-serif italic font-bold text-xs text-[#344E41] uppercase tracking-wider mb-2.5 border-b border-[#EBE9E1] pb-1">
              Informations Générales & Exploitation
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">Exploitation / Client</span>
                <span className="font-extrabold text-[#344E41]">{farmDetails?.clientName || '-'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">Réf. Rapport</span>
                <span className="font-mono font-bold text-[#344E41]">{farmDetails?.reportRef || '-'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">Localisation</span>
                <span className="font-semibold text-[#3D3D3D]">{farmDetails?.location || '-'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">Date de Visite</span>
                <span className="font-bold text-[#344E41]">{farmDetails?.visitDate || '-'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">Culture & Variété</span>
                <span className="font-bold text-[#344E41]">{farmDetails?.cropVariety || '-'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">Stade Phénologique</span>
                <span className="font-semibold text-[#3D3D3D]">{farmDetails?.phenologicalStage || '-'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">Type d'Abri</span>
                <span className="font-semibold text-[#3D3D3D]">{farmDetails?.shelterType || '-'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">Prochaine Visite</span>
                <span className="font-bold text-[#344E41]">{farmDetails?.nextVisitDate || '-'}</span>
              </div>

              {/* Custom metadata fields */}
              {farmDetails?.customFields?.map((cf) => (
                <div key={cf.id}>
                  <span className="text-[10px] uppercase font-bold text-[#8C8F85] block">{cf.label}</span>
                  <span className="font-semibold text-[#344E41]">{cf.value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Diagnostic Summary */}
        {diagnosticSummary && (
          <section className="mb-6">
            <div className="bg-[#E9EDC9]/60 border-l-4 border-[#344E41] p-3.5 rounded-r-2xl">
              <h3 className="font-serif italic font-bold text-xs text-[#344E41] uppercase tracking-wider mb-1">
                Bilan Diagnostic & Synthèse Hebdomadaire
              </h3>
              <p className="text-xs text-[#3D3D3D] leading-relaxed font-normal whitespace-pre-wrap">
                {diagnosticSummary}
              </p>
            </div>
          </section>
        )}

        {/* 4. Phytosanitary Observations & Photos */}
        {observations && observations.length > 0 && (
          <section className="mb-6">
            <h3 className="font-serif italic font-bold text-xs text-[#344E41] uppercase tracking-wider mb-3 pb-1 border-b-2 border-[#344E41]">
              Observations Phytosanitaires & Photos Terrain
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {observations.map((obs, idx) => (
                <div
                  key={obs.id}
                  className="bg-white border border-[#EBE9E1] rounded-2xl p-3 flex flex-col justify-between"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#EBE9E1]">
                      <span className="font-extrabold text-xs text-[#344E41]">
                        {obs.pestName || `Observation #${idx + 1}`}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          obs.alertLevel === 'Alerte Élevée'
                            ? 'bg-[#D4A373]/20 text-[#D4A373] border-[#D4A373]'
                            : obs.alertLevel === 'Alerte Modérée'
                            ? 'bg-[#CCD5AE]/40 text-[#344E41] border-[#CCD5AE]'
                            : 'bg-[#E9EDC9] text-[#344E41] border-[#CCD5AE]'
                        }`}
                      >
                        {obs.alertLevel}
                      </span>
                    </div>

                    {/* Image display */}
                    {obs.url && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-[#EBE9E1] bg-[#344E41]">
                        <img
                          src={obs.url}
                          alt={obs.caption}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}

                    {/* Caption */}
                    {obs.caption && (
                      <p className="font-bold text-[11px] text-[#344E41] mb-1">
                        {obs.caption}
                      </p>
                    )}

                    {/* Symptoms */}
                    {obs.symptoms && (
                      <p className="text-[11px] text-[#5A6352] leading-normal italic">
                        {obs.symptoms}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Phytosanitary Treatment Program Table */}
        {phytosanitaryTable && phytosanitaryTable.rows.length > 0 && (
          <section className="mb-6">
            <h3 className="font-serif italic font-bold text-xs text-[#344E41] uppercase tracking-wider mb-2 pb-1 border-b-2 border-[#344E41]">
              {phytosanitaryTable.title || 'Programme de Traitement Phytosanitaire'}
            </h3>

            <table className="w-full text-left text-xs border-collapse border border-[#EBE9E1]">
              <thead>
                <tr className="bg-[#344E41] text-[#E9EDC9] font-bold">
                  <th className="p-2 border border-[#344E41]">Cible / Problème</th>
                  <th className="p-2 border border-[#344E41]">Produit Préconisé / Matière Active</th>
                  <th className="p-2 border border-[#344E41] text-center">Dose / ha</th>
                  <th className="p-2 border border-[#344E41] text-center">DAR (j)</th>
                  <th className="p-2 border border-[#344E41]">Instructions & Mode d'application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE9E1]">
                {phytosanitaryTable.rows.map((row) => (
                  <tr key={row.id} className="even:bg-[#F9F8F5]">
                    <td className="p-2 border border-[#EBE9E1] font-bold text-[#344E41]">{row.target}</td>
                    <td className="p-2 border border-[#EBE9E1] font-semibold text-[#3D3D3D]">{row.product}</td>
                    <td className="p-2 border border-[#EBE9E1] text-center font-bold text-[#344E41]">{row.doseHa}</td>
                    <td className="p-2 border border-[#EBE9E1] text-center font-mono font-bold text-[#D4A373]">{row.darDays}</td>
                    <td className="p-2 border border-[#EBE9E1] text-[#5A6352]">{row.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 6. Fertigation Program Table */}
        {fertigationTable && fertigationTable.rows.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-2 pb-1 border-b-2 border-[#344E41]">
              <h3 className="font-serif italic font-bold text-xs text-[#344E41] uppercase tracking-wider">
                {fertigationTable.title || 'Programme Hebdomadaire de Fertigation'}
              </h3>
              <div className="text-[11px] font-bold text-[#344E41] bg-[#E9EDC9] px-2.5 py-0.5 rounded-lg border border-[#CCD5AE] space-x-3">
                <span>Cible EC: <strong>{fertigationTable.ecTarget || '-'} mS/cm</strong></span>
                <span>•</span>
                <span>Cible pH: <strong>{fertigationTable.phTarget || '-'}</strong></span>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-[#EBE9E1] mb-2">
              <thead>
                <tr className="bg-[#5A6352] text-[#E9EDC9] font-bold">
                  <th className="p-2 border border-[#5A6352]">Engrais / Nutriments</th>
                  <th className="p-2 border border-[#5A6352] text-center">Quotidien (kg/ha/j)</th>
                  <th className="p-2 border border-[#5A6352] text-center">Total Hebdo (kg/ha)</th>
                  <th className="p-2 border border-[#5A6352]">Rôle Agronomique & Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE9E1]">
                {fertigationTable.rows.map((row) => (
                  <tr key={row.id} className="even:bg-[#F9F8F5]">
                    <td className="p-2 border border-[#EBE9E1] font-bold text-[#344E41]">{row.fertilizer}</td>
                    <td className="p-2 border border-[#EBE9E1] text-center font-mono font-bold text-[#344E41]">{row.dailyDose}</td>
                    <td className="p-2 border border-[#EBE9E1] text-center font-mono font-black text-[#344E41] bg-[#E9EDC9]/50">{row.weeklyTotal}</td>
                    <td className="p-2 border border-[#EBE9E1] text-[#5A6352]">{row.roleDirectives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 7. Custom Tables */}
        {customTables && customTables.length > 0 && customTables.map((ct) => (
          <section key={ct.id} className="mb-6">
            <h3 className="font-serif italic font-bold text-xs text-[#344E41] uppercase tracking-wider mb-2 pb-1 border-b-2 border-[#344E41]">
              {ct.title}
            </h3>
            <table className="w-full text-left text-xs border-collapse border border-[#EBE9E1]">
              <thead>
                <tr className="bg-[#344E41] text-[#E9EDC9] font-bold">
                  {ct.columns.map((col) => (
                    <th key={col.id} className="p-2 border border-[#344E41]">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ct.rows.map((row) => (
                  <tr key={row.id} className="even:bg-[#F9F8F5]">
                    {ct.columns.map((col) => (
                      <td key={col.id} className="p-2 border border-[#EBE9E1] text-[#3D3D3D]">
                        {row.values[col.id] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        {/* 8. Recommendations & Immediate Actions */}
        {recommendations && recommendations.length > 0 && (
          <section className="mb-6">
            <h3 className="font-serif italic font-bold text-xs text-[#344E41] uppercase tracking-wider mb-2.5 pb-1 border-b-2 border-[#344E41]">
              Recommandations & Actions Immédiates
            </h3>
            <ul className="space-y-1.5 pl-1">
              {recommendations.map((rec, idx) => (
                <li key={rec.id} className="flex items-start space-x-2 text-xs text-[#3D3D3D]">
                  <span className="font-black text-[#E9EDC9] bg-[#344E41] rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-bold leading-normal">{rec.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 9. Footer & Sign-off Block */}
        <footer className="pt-4 border-t-2 border-[#EBE9E1] mt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-serif italic font-bold text-xs text-[#344E41]">
                {footer?.consultantName || 'Ing. Agronome Karim BENALLAL'}
              </p>
              <p className="text-[11px] text-[#5A6352]">
                {footer?.consultantTitle || 'Consultant Spécialiste en Agronomie'}
              </p>
              <p className="text-[10px] text-[#8C8F85] font-mono mt-1">
                Tél: {footer?.phone || '-'} | Email: {footer?.email || '-'}
              </p>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-bold text-[#8C8F85] uppercase mb-1">
                Visa & Signature de l'Expert
              </span>
              {footer?.signatureDataUrl ? (
                <img
                  src={footer.signatureDataUrl}
                  alt="Signature"
                  className="h-12 max-w-[140px] object-contain border border-[#EBE9E1] p-1 rounded-xl bg-white"
                />
              ) : (
                <div className="w-36 h-12 border border-dashed border-[#CCD5AE] rounded-xl flex items-center justify-center text-[10px] text-[#8C8F85] italic">
                  Cachet & Signature
                </div>
              )}
              {footer?.dateSigned && (
                <span className="text-[10px] font-mono text-[#8C8F85] mt-1">
                  Signé le : {footer.dateSigned}
                </span>
              )}
            </div>
          </div>
        </footer>
      </div>
      </div>
    </div>
  );
};
