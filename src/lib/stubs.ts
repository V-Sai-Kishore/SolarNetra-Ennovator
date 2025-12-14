/**
 * SolarNetra Deterministic Analysis Functions
 * 
 * This file contains all ML/AI implementations that produce analysis outputs.
 * All outputs are deterministic based on the seed derived from the input image/CSV.
 */

import { SolarAnalysisResult, AppSettings } from './types';
import { createSeededRandom, generateId } from './seed';

// Helper to generate deterministic mask on canvas
function generateMaskDataUrl(seed: number, width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const random = createSeededRandom(seed);
  
  // Draw semi-transparent teal rectangles as panel regions
  ctx.fillStyle = 'rgba(20, 184, 166, 0.6)';
  
  const numPanels = 3 + Math.floor(random() * 5);
  for (let i = 0; i < numPanels; i++) {
    const x = width * 0.2 + random() * width * 0.4;
    const y = height * 0.2 + random() * height * 0.4;
    const w = 30 + random() * 60;
    const h = 20 + random() * 40;
    ctx.fillRect(x, y, w, h);
  }
  
  return canvas.toDataURL('image/png');
}

function generateOverlayDataUrl(seed: number, width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const random = createSeededRandom(seed + 1000);
  
  // Draw bounding boxes
  ctx.strokeStyle = 'rgba(251, 146, 60, 0.8)';
  ctx.lineWidth = 2;
  
  const numBoxes = 2 + Math.floor(random() * 4);
  for (let i = 0; i < numBoxes; i++) {
    const x = width * 0.15 + random() * width * 0.5;
    const y = height * 0.15 + random() * height * 0.5;
    const w = 40 + random() * 80;
    const h = 30 + random() * 60;
    ctx.strokeRect(x, y, w, h);
  }
  
  return canvas.toDataURL('image/png');
}

function generateGradcamDataUrl(seed: number, width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const random = createSeededRandom(seed + 2000);
  
  // Create gradient heatmap
  const gradient = ctx.createRadialGradient(
    width * (0.3 + random() * 0.4), height * (0.3 + random() * 0.4), 10,
    width * 0.5, height * 0.5, Math.max(width, height) * 0.4
  );
  gradient.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
  gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.4)');
  gradient.addColorStop(1, 'rgba(20, 184, 166, 0.1)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/png');
}

function generateMicroFlags(seed: number): SolarAnalysisResult['micro_flags'] {
  const random = createSeededRandom(seed + 3000);
  return {
    clothesline: random() > 0.85,
    tank: random() > 0.9,
    dust_pct: Math.round(random() * 30),
    nest: random() > 0.95,
    reflection: random() > 0.7,
    wiring: random() > 0.6,
    incomplete: random() > 0.92,
  };
}

function generateReasonCodes(seed: number, qcStatus: string): string[] {
  const random = createSeededRandom(seed + 4000);
  const allCodes = [
    'LOW_CONFIDENCE_DETECTION',
    'SHADOW_MISMATCH',
    'PLG_VALIDATION_FAILED',
    'OUTDATED_IMAGERY',
    'PARTIAL_OCCLUSION',
    'LOOKALIKE_DETECTED',
    'MISSING_COMPONENTS',
    'AREA_ESTIMATION_UNCERTAIN',
  ];
  
  if (qcStatus === 'VERIFIABLE') {
    return [];
  }
  
  const numCodes = qcStatus === 'PARTIALLY_VERIFIABLE' ? 1 + Math.floor(random() * 2) : 2 + Math.floor(random() * 3);
  const codes: string[] = [];
  
  for (let i = 0; i < numCodes; i++) {
    const idx = Math.floor(random() * allCodes.length);
    if (!codes.includes(allCodes[idx])) {
      codes.push(allCodes[idx]);
    }
  }
  
  return codes;
}

function generateFailedTests(seed: number, qcStatus: string): string[] {
  const random = createSeededRandom(seed + 5000);
  const allTests = [
    'confidence_above_threshold',
    'panel_count_within_bounds',
    'area_matches_panel_count',
    'shadow_geometry_valid',
    'plg_score_acceptable',
    'freshness_acceptable',
    'no_critical_micro_flags',
  ];
  
  if (qcStatus === 'VERIFIABLE') {
    return [];
  }
  
  const numFailed = qcStatus === 'PARTIALLY_VERIFIABLE' ? 1 : 2 + Math.floor(random() * 2);
  const failed: string[] = [];
  
  for (let i = 0; i < numFailed; i++) {
    const idx = Math.floor(random() * allTests.length);
    if (!failed.includes(allTests[idx])) {
      failed.push(allTests[idx]);
    }
  }
  
  return failed;
}

// Idea 1: Binary Solar Classifier
export function runIdea1(seed: number, settings: AppSettings): Partial<SolarAnalysisResult> {
  const hasSolar = seed % 2 === 0;
  const confidence = 0.7 + ((seed % 31) / 100);
  
  return {
    has_solar: hasSolar && confidence >= settings.has_solar_threshold,
    confidence: Math.min(confidence, 0.99),
  };
}

// Idea 2: Panel Segmentation
export function runIdea2(seed: number, settings: AppSettings, width: number, height: number): Partial<SolarAnalysisResult> & { mask_data_url: string } {
  const maskDataUrl = generateMaskDataUrl(seed, width, height);
  const random = createSeededRandom(seed);
  const panelCount = 4 + Math.floor(random() * 12);
  
  return {
    panel_count: panelCount,
    artifacts: {
      mask_data_url: maskDataUrl,
      overlay_data_url: '',
      gradcam_data_url: '',
    },
    mask_data_url: maskDataUrl,
  };
}

// Idea 3: Area Quantification
export function runIdea3(seed: number, settings: AppSettings): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const panelCount = 4 + Math.floor(random() * 12);
  const areaSqm = panelCount * settings.panel_standard_m2 * (0.9 + random() * 0.2);
  const capacityKw = (areaSqm * settings.wp_per_m2) / 1000;
  
  return {
    panel_count: panelCount,
    area_sqm: Math.round(areaSqm * 100) / 100,
    capacity_kw: Math.round(capacityKw * 100) / 100,
    assumptions: {
      wp_per_m2: settings.wp_per_m2,
      panel_standard_size_m2: settings.panel_standard_m2,
    },
  };
}

// Idea 4: Shadow Geometry Engine
export function runIdea4(seed: number, settings: AppSettings, sunAngle: number = 45): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed + sunAngle);
  const shadowMatchScore = 0.5 + random() * 0.5;
  
  return {
    shadow_match_score: Math.round(shadowMatchScore * 100) / 100,
  };
}

// Idea 5: Physical Linkage Graph
export function runIdea5(seed: number, settings: AppSettings): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const plgScore = 0.4 + random() * 0.6;
  
  return {
    plg_score: Math.round(plgScore * 100) / 100,
  };
}

// Idea 6: Grad-CAM Explainability
export function runIdea6(seed: number, width: number, height: number): Partial<SolarAnalysisResult> & { gradcam_data_url: string } {
  const gradcamDataUrl = generateGradcamDataUrl(seed, width, height);
  
  return {
    artifacts: {
      mask_data_url: '',
      overlay_data_url: '',
      gradcam_data_url: gradcamDataUrl,
    },
    gradcam_data_url: gradcamDataUrl,
  };
}

// Idea 7: Image Freshness Scorer
export function runIdea7(seed: number, settings: AppSettings): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const freshnessScore = 0.3 + random() * 0.7;
  
  return {
    freshness_score: Math.round(freshnessScore * 100) / 100,
  };
}

// Idea 8: Micro-Object Detector
export function runIdea8(seed: number): Partial<SolarAnalysisResult> {
  return {
    micro_flags: generateMicroFlags(seed),
  };
}

// Idea 9: Dust Accumulation Estimator
export function runIdea9(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const dustPct = Math.round(random() * 30);
  
  return {
    micro_flags: {
      clothesline: false,
      tank: false,
      dust_pct: dustPct,
      nest: false,
      reflection: false,
      wiring: false,
      incomplete: false,
    },
  };
}

// Idea 10: Tilt Angle Estimator
export function runIdea10(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const tiltDeg = 15 + random() * 30;
  
  return {
    tilt_deg: Math.round(tiltDeg * 10) / 10,
  };
}

// Idea 11: Panel Age Classifier
export function runIdea11(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const buckets: ('new' | 'mid' | 'old')[] = ['new', 'mid', 'old'];
  const ageBucket = buckets[Math.floor(random() * 3)];
  
  return {
    age_bucket: ageBucket,
  };
}

// Idea 12: Neighborhood Adoption Model
export function runIdea12(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const adoptionProb = 0.1 + random() * 0.6;
  
  return {
    neighborhood_adoption_prob: Math.round(adoptionProb * 100) / 100,
  };
}

// Idea 13: Contract Test Suite
export function runIdea13(seed: number, qcStatus: string): Partial<SolarAnalysisResult> {
  return {
    failed_contract_tests: generateFailedTests(seed, qcStatus),
  };
}

// Idea 14: QC Status Aggregator
export function runIdea14(seed: number, settings: AppSettings): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const roll = random();
  
  let qcStatus: 'VERIFIABLE' | 'NOT_VERIFIABLE' | 'PARTIALLY_VERIFIABLE';
  if (roll > 0.6) {
    qcStatus = 'VERIFIABLE';
  } else if (roll > 0.25) {
    qcStatus = 'PARTIALLY_VERIFIABLE';
  } else {
    qcStatus = 'NOT_VERIFIABLE';
  }
  
  return {
    qc_status: qcStatus,
    reason_codes: generateReasonCodes(seed, qcStatus),
  };
}

// Idea 15: Reason Code Generator
export function runIdea15(seed: number, qcStatus: string): Partial<SolarAnalysisResult> {
  return {
    reason_codes: generateReasonCodes(seed, qcStatus),
  };
}

// Ideas 16-30: Enhanced stubs with meaningful outputs

// Idea 16: Wiring Visibility Detector
export function runIdea16(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const wiringDetected = random() > 0.4;
  return {
    has_solar: wiringDetected,
    confidence: 0.7 + random() * 0.3,
    micro_flags: {
      clothesline: false,
      tank: false,
      dust_pct: 0,
      nest: false,
      reflection: false,
      wiring: wiringDetected,
      incomplete: false,
    },
  };
}

// Idea 17: Incomplete Installation Detector
export function runIdea17(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const incomplete = random() > 0.85;
  return {
    has_solar: true,
    confidence: incomplete ? 0.4 + random() * 0.3 : 0.8 + random() * 0.2,
    micro_flags: {
      clothesline: false,
      tank: false,
      dust_pct: 0,
      nest: false,
      reflection: false,
      wiring: true,
      incomplete: incomplete,
    },
  };
}

// Idea 18: Reflection Analyzer
export function runIdea18(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const reflectionDetected = random() > 0.5;
  return {
    has_solar: reflectionDetected,
    confidence: 0.6 + random() * 0.4,
    shadow_match_score: reflectionDetected ? 0.7 + random() * 0.3 : 0.3 + random() * 0.3,
    micro_flags: {
      clothesline: false,
      tank: false,
      dust_pct: 0,
      nest: false,
      reflection: reflectionDetected,
      wiring: false,
      incomplete: false,
    },
  };
}

// Idea 19: Roof Type Classifier
export function runIdea19(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const roofTypes = ['flat', 'pitched', 'metal', 'tile'];
  const tiltDeg = random() > 0.5 ? 0 : 15 + random() * 25;
  return {
    tilt_deg: tiltDeg,
    confidence: 0.75 + random() * 0.25,
    age_bucket: roofTypes[Math.floor(random() * 4)] as any,
  };
}

// Idea 20: Building Footprint Matcher
export function runIdea20(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const matchScore = 0.6 + random() * 0.4;
  return {
    plg_score: matchScore,
    confidence: matchScore,
    has_solar: matchScore > 0.7,
  };
}

// Idea 21: Inverter Detector
export function runIdea21(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const inverterDetected = random() > 0.3;
  return {
    has_solar: inverterDetected,
    plg_score: inverterDetected ? 0.8 + random() * 0.2 : 0.3 + random() * 0.3,
    confidence: 0.65 + random() * 0.35,
  };
}

// Idea 22: Meter Detection
export function runIdea22(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const meterDetected = random() > 0.4;
  return {
    has_solar: meterDetected,
    plg_score: meterDetected ? 0.7 + random() * 0.3 : 0.2 + random() * 0.3,
    confidence: 0.6 + random() * 0.4,
  };
}

// Idea 23: Shading Analysis
export function runIdea23(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const shadingFactor = 0.5 + random() * 0.5;
  return {
    shadow_match_score: shadingFactor,
    confidence: 0.7 + random() * 0.3,
    freshness_score: shadingFactor * 0.8,
  };
}

// Idea 24: Panel Layout Analyzer
export function runIdea24(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const layoutScore = 0.4 + random() * 0.6;
  const panelCount = 4 + Math.floor(random() * 12);
  return {
    plg_score: layoutScore,
    panel_count: panelCount,
    confidence: layoutScore,
    area_sqm: panelCount * 1.7 * (0.9 + random() * 0.2),
  };
}

// Idea 25: Historical Change Detector
export function runIdea25(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const changeDetected = random() > 0.5;
  return {
    has_solar: changeDetected,
    freshness_score: 0.3 + random() * 0.7,
    confidence: 0.6 + random() * 0.4,
    age_bucket: changeDetected ? 'new' : random() > 0.5 ? 'mid' : 'old',
  };
}

// Idea 26: Multi-Spectral Validator
export function runIdea26(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const spectralMatch = 0.6 + random() * 0.4;
  return {
    has_solar: spectralMatch > 0.7,
    confidence: spectralMatch,
    plg_score: spectralMatch * 0.9,
  };
}

// Idea 27: Lookalike Detector
export function runIdea27(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const isLookalike = random() > 0.8;
  return {
    has_solar: !isLookalike,
    confidence: isLookalike ? 0.3 + random() * 0.3 : 0.7 + random() * 0.3,
    qc_status: isLookalike ? 'NOT_VERIFIABLE' : 'VERIFIABLE',
    reason_codes: isLookalike ? ['LOOKALIKE_DETECTED'] : [],
  };
}

// Idea 28: Consensus Scorer
export function runIdea28(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const consensusScore = 0.5 + random() * 0.5;
  return {
    confidence: consensusScore,
    plg_score: consensusScore * 0.95,
    qc_status: consensusScore > 0.7 ? 'VERIFIABLE' : consensusScore > 0.4 ? 'PARTIALLY_VERIFIABLE' : 'NOT_VERIFIABLE',
  };
}

// Idea 29: Uncertainty Quantifier
export function runIdea29(seed: number): Partial<SolarAnalysisResult> {
  const random = createSeededRandom(seed);
  const uncertainty = random() * 0.5;
  return {
    confidence: 1 - uncertainty,
    freshness_score: 0.5 + random() * 0.5,
    qc_status: uncertainty < 0.2 ? 'VERIFIABLE' : uncertainty < 0.35 ? 'PARTIALLY_VERIFIABLE' : 'NOT_VERIFIABLE',
  };
}

export function runIdea30(seed: number, width: number, height: number): Partial<SolarAnalysisResult> {
  return {
    artifacts: {
      mask_data_url: generateMaskDataUrl(seed, width, height),
      overlay_data_url: generateOverlayDataUrl(seed, width, height),
      gradcam_data_url: generateGradcamDataUrl(seed, width, height),
    },
  };
}

// Master function to run any idea by ID
export function runIdeaById(
  ideaId: number,
  seed: number,
  settings: AppSettings,
  width: number = 400,
  height: number = 300,
  options: { sunAngle?: number; qcStatus?: string; csvData?: any[] } = {}
): Partial<SolarAnalysisResult> {
  const stubFunctions: Record<number, () => Partial<SolarAnalysisResult>> = {
    1: () => runIdea1(seed, settings),
    2: () => runIdea2(seed, settings, width, height),
    3: () => runIdea3(seed, settings),
    4: () => runIdea4(seed, settings, options.sunAngle),
    5: () => runIdea5(seed, settings),
    6: () => runIdea6(seed, width, height),
    7: () => runIdea7(seed, settings),
    8: () => runIdea8(seed),
    9: () => runIdea9(seed),
    10: () => runIdea10(seed),
    11: () => runIdea11(seed),
    12: () => runIdea12(seed),
    13: () => runIdea13(seed, options.qcStatus || 'PARTIALLY_VERIFIABLE'),
    14: () => runIdea14(seed, settings),
    15: () => runIdea15(seed, options.qcStatus || 'PARTIALLY_VERIFIABLE'),
    16: () => runIdea16(seed),
    17: () => runIdea17(seed),
    18: () => runIdea18(seed),
    19: () => runIdea19(seed),
    20: () => runIdea20(seed),
    21: () => runIdea21(seed),
    22: () => runIdea22(seed),
    23: () => runIdea23(seed),
    24: () => runIdea24(seed),
    25: () => runIdea25(seed),
    26: () => runIdea26(seed),
    27: () => runIdea27(seed),
    28: () => runIdea28(seed),
    29: () => runIdea29(seed),
    30: () => runIdea30(seed, width, height),
  };

  const stubFn = stubFunctions[ideaId];
  if (!stubFn) {
    throw new Error(`Unknown idea ID: ${ideaId}`);
  }
  
  return stubFn();
}
