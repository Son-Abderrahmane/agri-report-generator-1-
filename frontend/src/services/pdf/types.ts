export type BlockType = 'section' | 'thead' | 'tr' | 'header' | 'footer';

export interface PdfBlock {
  el: HTMLElement;
  type: BlockType;
  rect: DOMRect;
  // Dimensions relatives au conteneur principal (pour calculer les sauts de page)
  relativeTop: number;
  height: number;
  // Référence à l'en-tête de tableau parent si c'est une ligne (tr)
  parentThead?: PdfBlock | null;
}
