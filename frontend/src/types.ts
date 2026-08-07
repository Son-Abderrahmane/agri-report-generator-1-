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
  category?: string;
  completed?: boolean;
}

export interface FooterSignoff {
  consultantName: string;
  consultantTitle: string;
  phone: string;
  email: string;
  signatureDataUrl?: string;
  dateSigned?: string;
  farmSignatureDataUrl?: string;
  farmDateSigned?: string;
  farmSignerName?: string;
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
  optimizationResults?: any; // To hold the Optimization Engine output
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

export interface RecommendationCategory {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// --- Advanced Fertigation Optimizer Types ---

export interface OptimizerFertilizer {
  id: number;
  name: string;
  commercial_name?: string;
  type: string;
  unit: string;
  density?: number;
  price_per_unit?: number;
  n?: number;
  p?: number;
  p2o5?: number;
  k?: number;
  k2o?: number;
  ca?: number;
  cao?: number;
  mg?: number;
  mgo?: number;
  s?: number;
  so3?: number;
  fe?: number;
  mn?: number;
  zn?: number;
  cu?: number;
  b?: number;
  mo?: number;
  si?: number;
}

export interface GrowthStageTarget {
  id?: number;
  recipe_id?: number;
  nutrient: string;
  target_ppm: number;
}

export interface GrowthStageRecipe {
  id?: number;
  growth_stage_id?: number;
  name: string;
  description?: string;
  targets: GrowthStageTarget[];
}

export interface OptimizerGrowthStage {
  id: number;
  crop_id: number;
  name: string;
  duration_days?: number;
  target_ec_min?: number;
  target_ec_max?: number;
  target_ph_min?: number;
  target_ph_max?: number;
  order_index: number;
  recipes?: GrowthStageRecipe[];
}

export interface OptimizerWaterAnalysis {
  id: number;
  name: string;
  n?: number;
  p?: number;
  k?: number;
  ca?: number;
  mg?: number;
  s?: number;
  na?: number;
  cl?: number;
  ec?: number;
  ph?: number;
  hardness?: number;
  alkalinity?: number;
  hco3?: number;
  co3?: number;
  fe?: number;
}

export interface OptimizerSoilAnalysis {
  id: number;
  name: string;
  field_name?: string;
  crop_id?: number;
  laboratory_name?: string;
  analysis_number?: string;
  sampling_method?: string;
  gps_location?: string;
  sampling_date?: string;
  depth?: number;
  status: string;
  
  unit: string;
  texture?: string;
  organic_matter?: number;
  organic_carbon?: number;
  cec?: number;
  
  ph?: number;
  ec?: number;
  ca_co3?: number;
  
  n?: number; p?: number; k?: number; ca?: number; mg?: number; s?: number;
  fe?: number; mn?: number; zn?: number; cu?: number; b?: number; mo?: number; si?: number;
  na?: number; cl?: number; sar?: number; esp?: number;
  
  notes?: string;
}

export interface SoilFertilityThreshold {
  id: number;
  crop_id?: number;
  nutrient: string;
  low_threshold: number;
  high_threshold: number;
}
