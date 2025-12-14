// Core types for SolarNetra

export interface SolarAnalysisResult {
  id: string;
  input_id: string;
  lat: number | null;
  lon: number | null;
  image_source: string;
  csv_source?: string;
  has_solar: boolean;
  confidence: number;
  panel_count: number;
  area_sqm: number;
  capacity_kw: number;
  assumptions: {
    wp_per_m2: number;
    panel_standard_size_m2: number;
  };
  qc_status: 'VERIFIABLE' | 'NOT_VERIFIABLE' | 'PARTIALLY_VERIFIABLE';
  failed_contract_tests: string[];
  reason_codes: string[];
  micro_flags: {
    clothesline: boolean;
    tank: boolean;
    dust_pct: number;
    nest: boolean;
    reflection: boolean;
    wiring: boolean;
    incomplete: boolean;
  };
  plg_score: number;
  shadow_match_score: number;
  freshness_score: number;
  neighborhood_adoption_prob: number;
  tilt_deg: number;
  age_bucket: 'new' | 'mid' | 'old';
  artifacts: {
    mask_data_url: string;
    overlay_data_url: string;
    gradcam_data_url: string;
  };
  model_versions: {
    classifier: string;
    segmenter: string;
    plg: string;
    shadow: string;
  };
  timestamp_utc: string;
  flagged?: boolean;
  csv_data?: CSVRecord[];
}

export interface CSVRecord {
  [key: string]: string | number;
}

export interface UploadedCSV {
  file: File;
  data: CSVRecord[];
  headers: string[];
  seed: number;
}

export interface AppSettings {
  has_solar_threshold: number;
  plg_threshold: number;
  shadow_threshold: number;
  freshness_threshold: number;
  lookalike_threshold: number;
  buffer_meters: number;
  wp_per_m2: number;
  panel_standard_m2: number;
  save_artifacts: boolean;
}

export interface UploadedImage {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  seed: number;
}

export interface IdeaConfig {
  id: number;
  name: string;
  shortName: string;
  purpose: string;
  category: 'detection' | 'segmentation' | 'quality' | 'validation' | 'scoring' | 'metadata';
  inputs: string[];
  outputs: string[];
  steps: string[];
  failureModes: string[];
  usesCSV?: boolean;
  usesImage?: boolean;
  visualType?: 'mask' | 'gradcam' | 'chart' | 'grid' | 'overlay' | 'table' | 'heatmap';
}

export interface ResultsMap {
  [ideaId: string]: SolarAnalysisResult;
}

export type OverlayType = 'mask' | 'gradcam' | 'bbox' | 'shadow' | 'plg' | 'none';

export const CATEGORY_COLORS: Record<IdeaConfig['category'], string> = {
  detection: 'solar-gold',
  segmentation: 'solar-blue',
  quality: 'solar-green',
  validation: 'solar-purple',
  scoring: 'solar-orange',
  metadata: 'secondary',
};

export const CATEGORY_ICONS: Record<IdeaConfig['category'], string> = {
  detection: 'Scan',
  segmentation: 'Layers',
  quality: 'Shield',
  validation: 'CheckCircle2',
  scoring: 'BarChart3',
  metadata: 'FileText',
};
