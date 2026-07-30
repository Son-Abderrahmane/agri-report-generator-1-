export type AlertLevel = 'Info' | 'Alerte Modérée' | 'Alerte Élevée';

export interface HeaderBanner {
  companyTitle: string;
  subtitle: string;
  docTitle: string;
  frequencyTag: string;
  cropType: string;
  logoUrl?: string;
}

export interface MetadataField {
  id: string;
  label: string;
  value: string;
}

export interface FarmDetails {
  clientName: string;
  reportRef: string;
  location: string;
  visitDate: string;
  cropVariety: string;
  phenologicalStage: string;
  shelterType: string;
  nextVisitDate: string;
  customFields?: MetadataField[];
}

export interface ObservationPhoto {
  id: string;
  url: string;
  caption: string;
  pestName: string;
  alertLevel: AlertLevel;
  symptoms: string;
  timestamp?: string;
}

export interface PhytosanitaryRow {
  id: string;
  target: string;
  activeIngredient: string;
  product: string;
  doseHa: string;
  darDays: string;
  nbrApplication: string;
  fournisseur: string;
}

export interface PhytosanitaryTable {
  title: string;
  rows: PhytosanitaryRow[];
}

export interface FertigationRow {
  id: string;
  fertilizer: string;
  dailyDose: number | string;
  weeklyTotal: number | string;
  isCustomWeekly?: boolean;
  roleDirectives: string;
}

export interface FertigationTable {
  title: string;
  ecTarget: string;
  phTarget: string;
  rows: FertigationRow[];
}

export interface CustomTableColumn {
  id: string;
  label: string;
}

export interface CustomTableRow {
  id: string;
  values: Record<string, string>;
}

export interface CustomTable {
  id: string;
  title: string;
  columns: CustomTableColumn[];
  rows: CustomTableRow[];
}

export interface RecommendationItem {
  id: string;
  text: string;
  category?: 'general' | 'irrigation' | 'phytosanitary' | 'climate';
  completed?: boolean;
}

export interface FooterSignoff {
  consultantName: string;
  consultantTitle: string;
  phone: string;
  email: string;
  signatureDataUrl?: string;
  dateSigned?: string;
  notes?: string;
}

export interface Report {
  id: string;
  title: string;
  status: 'draft' | 'validated' | 'archived';
  createdAt: string;
  updatedAt: string;
  headerBanner: HeaderBanner;
  farmDetails: FarmDetails;
  diagnosticSummary: string;
  observations: ObservationPhoto[];
  phytosanitaryTable: PhytosanitaryTable;
  fertigationTable: FertigationTable;
  customTables: CustomTable[];
  recommendations: RecommendationItem[];
  footer: FooterSignoff;
}

export interface CropTemplate {
  id: string;
  name: string;
  cropType: string;
  iconName: string;
  description: string;
  defaultReport: Partial<Report>;
}

// --- Master Data Types ---

export interface Crop {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Pesticide {
  id: number;
  crop_id?: number;
  crop_name?: string;
  target_pest?: string;
  product_name: string;
  active_ingredient?: string;
  teneur?: string;
  dar?: string;
  nbr_application?: string;
  holder?: string;
  supplier?: string;
  registration_number?: string;
  valid_until?: string;
  dosage?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuickFormula {
  id: number;
  category: string;
  title?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface EvaluationTemplate {
  id: number;
  name: string;
  risk_level: string;
  condition_explanation?: string;
  preventive_action?: string;
  report_sentence?: string;
  created_at?: string;
  updated_at?: string;
}
