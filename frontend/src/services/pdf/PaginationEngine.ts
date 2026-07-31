import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';
import { PdfBlock } from './types';

interface PaginationConfig {
  pdfWidth: number;
  pdfHeight: number;
  margin: number;
  pixelRatio: number;
}

export const renderBlocksToPdf = async (
  blocks: PdfBlock[],
  config: PaginationConfig,
  containerWidthPx: number
): Promise<jsPDF> => {
  const { pdfWidth, pdfHeight, margin, pixelRatio } = config;
  const contentWidthMm = pdfWidth - margin * 2;
  const contentHeightMm = pdfHeight - margin * 2;
  
  // Echelle pour convertir les pixels HTML en mm dans le PDF
  const scale = contentWidthMm / containerWidthPx;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let currentY = margin;
  let activeThead: { canvas: HTMLCanvasElement; heightMm: number } | null = null;

  // Verrouiller les largeurs des colonnes de TOUS les tableaux avant le rendu individuel
  // Cela empêche l'effondrement des `tr` et `thead` lorsqu'ils sont extraits de leur contexte `table`.
  blocks.forEach(block => {
    if (block.type === 'thead' || block.type === 'tr') {
      const cells = block.el.querySelectorAll('th, td');
      cells.forEach(cell => {
        const rect = cell.getBoundingClientRect();
        const htmlCell = cell as HTMLElement;
        htmlCell.style.width = `${rect.width}px`;
        htmlCell.style.minWidth = `${rect.width}px`;
        htmlCell.style.maxWidth = `${rect.width}px`;
        htmlCell.style.boxSizing = 'border-box';
      });
    }
  });

  for (const block of blocks) {
    const blockHeightMm = block.height * scale;

    // Si le bloc est plus grand qu'une page entière (ex: très long texte)
    // On ne le découpe pas dans cette v1 modulaire, mais on garantit qu'il commence en haut d'une page
    if (blockHeightMm > contentHeightMm && currentY > margin) {
      pdf.addPage();
      currentY = margin;
    } 
    // Sinon, si on dépasse la page, on crée une nouvelle page
    else if (currentY + blockHeightMm > pdfHeight - margin) {
      pdf.addPage();
      currentY = margin;

      // Répétition de l'en-tête de tableau si on est au milieu d'un tableau
      if (block.type === 'tr' && activeThead) {
        const imgData = activeThead.canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', margin, currentY, contentWidthMm, activeThead.heightMm);
        currentY += activeThead.heightMm;
      }
    }

    // Gestion du tracking de l'en-tête
    if (block.type === 'thead') {
      // On va le rendre maintenant
    } else if (block.type !== 'tr') {
      activeThead = null;
    }

    try {
      // Capture individuelle avec qualité optimisée
      const canvas = await toCanvas(block.el, {
        quality: 1,
        pixelRatio: pixelRatio,
        backgroundColor: '#ffffff',
        skipFonts: true, // Évite les bugs de polices Oklab sur Safari/certains navigateurs
        style: {
          transform: 'none',
          margin: '0', // Supprime les marges pour l'isolation
        }
      });

      // Si c'est un Thead, on le garde en mémoire pour la pagination
      if (block.type === 'thead') {
        activeThead = { canvas, heightMm: blockHeightMm };
      }

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', margin, currentY, contentWidthMm, blockHeightMm);
      
      currentY += blockHeightMm;
      
      // Ajouter une marge virtuelle après chaque bloc (sauf thead/tr pour qu'ils soient collés)
      if (block.type === 'section' || block.type === 'header') {
        currentY += 6; // marge de 6mm entre les sections
      }
    } catch (err) {
      console.warn(`Erreur lors du rendu du bloc ${block.type}:`, err);
    }
  }

  // Nettoyage des styles forcés
  blocks.forEach(block => {
    if (block.type === 'thead' || block.type === 'tr') {
      const cells = block.el.querySelectorAll('th, td');
      cells.forEach(cell => {
        const htmlCell = cell as HTMLElement;
        htmlCell.style.width = '';
        htmlCell.style.minWidth = '';
        htmlCell.style.maxWidth = '';
        htmlCell.style.boxSizing = '';
      });
    }
  });

  return pdf;
};
