import { analyzeDOM } from './DOMAnalyzer';
import { renderBlocksToPdf } from './PaginationEngine';

export const generatePDF = async (
  containerElement: HTMLElement,
  fileName: string
): Promise<void> => {
  // Config
  const config = {
    pdfWidth: 210, // A4 width in mm
    pdfHeight: 297, // A4 height in mm
    margin: 10,
    pixelRatio: 2, // Haute définition
  };

  // Phase 1 : Analyse
  const blocks = analyzeDOM(containerElement);
  
  if (blocks.length === 0) {
    throw new Error("Aucun bloc DOM trouvé pour la pagination.");
  }

  // Phase 2 & 3 : Pagination et Rendu avec html-to-image individuel
  const containerWidthPx = containerElement.getBoundingClientRect().width;
  
  // Masquer les éléments non-imprimables (no-print) pendant le rendu
  const noPrintElements = containerElement.querySelectorAll('.no-print');
  noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');

  try {
    const pdf = await renderBlocksToPdf(blocks, config, containerWidthPx);
    pdf.save(fileName);
  } finally {
    // Restaurer les éléments non-imprimables
    noPrintElements.forEach(el => (el as HTMLElement).style.display = '');
  }
};
