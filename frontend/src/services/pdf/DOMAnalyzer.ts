import { PdfBlock, BlockType } from './types';

export const analyzeDOM = (container: HTMLElement): PdfBlock[] => {
  const containerRect = container.getBoundingClientRect();
  const elements = Array.from(container.querySelectorAll('[data-pdf-block], [data-pdf-thead], [data-pdf-tr]')) as HTMLElement[];
  
  const blocks: PdfBlock[] = [];
  let currentThead: PdfBlock | null = null;

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    let type: BlockType = 'section';
    
    if (el.getAttribute('data-pdf-thead')) {
      type = 'thead';
    } else if (el.getAttribute('data-pdf-tr')) {
      type = 'tr';
    }

    const block: PdfBlock = {
      el,
      type,
      rect,
      relativeTop: rect.top - containerRect.top,
      height: rect.height,
    };

    if (type === 'thead') {
      currentThead = block;
    } else if (type === 'tr') {
      block.parentThead = currentThead;
    } else {
      currentThead = null; // On sort d'un tableau
    }

    blocks.push(block);
  });

  return blocks;
};
