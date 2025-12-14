/**
 * SolarNetra Merge Rules
 * 
 * This file defines how individual idea outputs are combined into a single
 * comprehensive analysis record when "Run All" is executed.
 * 
 * Merge Strategy:
 * - Numeric scores: Weighted average based on idea importance
 * - Boolean flags: Logical OR (any positive detection counts)
 * - Micro flags: Aggregate worst-case values
 * - Artifacts: Combine all into artifacts object
 * - QC Status: Most conservative (NOT_VERIFIABLE > PARTIALLY > VERIFIABLE)
 * - Reason codes: Union of all codes, deduplicated
 * 
 * TODO: To customize merge behavior:
 * 1. Modify the weight values in IDEA_WEIGHTS
 * 2. Adjust the merge functions as needed
 * 3. Add new merge rules for custom fields
 */

import { SolarAnalysisResult, AppSettings } from './types';
import { generateId } from './seed';

// Weights for averaging scores from different ideas
// Higher weight = more influence on final score
const IDEA_WEIGHTS: Record<number, number> = {
  1: 1.5,   // Binary classifier - high importance
  2: 1.2,   // Segmentation
  3: 1.0,   // Quantification
  4: 1.3,   // Shadow engine
  5: 1.4,   // PLG validation
  6: 0.8,   // Grad-CAM (informational)
  7: 1.1,   // Freshness
  8: 0.9,   // Micro-objects
  9: 0.7,   // Dust
  10: 0.6,  // Tilt
  11: 0.5,  // Age
  12: 0.8,  // Neighborhood
  13: 1.2,  // Contracts
  14: 1.5,  // QC aggregator
  15: 1.0,  // Reason codes
  16: 0.7,  // Wiring
  17: 0.8,  // Incomplete
  18: 0.7,  // Reflection
  19: 0.5,  // Roof type
  20: 0.9,  // Footprint
  21: 0.6,  // Inverter
  22: 0.6,  // Meter
  23: 1.0,  // Shading
  24: 0.7,  // Layout
  25: 0.9,  // History
  26: 0.8,  // Multi-spectral
  27: 1.1,  // Lookalike
  28: 1.2,  // Consensus
  29: 1.0,  // Uncertainty
  30: 0.5,  // Artifacts
};

// QC Status priority (higher = more conservative)
const QC_PRIORITY: Record<string, number> = {
  'NOT_VERIFIABLE': 3,
  'PARTIALLY_VERIFIABLE': 2,
  'VERIFIABLE': 1,
};

/**
 * Merge multiple idea results into a single comprehensive record
 */
export function mergeIdeaResults(
  results: Record<number, Partial<SolarAnalysisResult>>,
  seed: number,
  imageSource: string,
  settings: AppSettings
): SolarAnalysisResult {
  // Initialize with defaults
  const merged: SolarAnalysisResult = {
    id: generateId(seed),
    input_id: `input_${seed}`,
    lat: null,
    lon: null,
    image_source: imageSource,
    has_solar: false,
    confidence: 0,
    panel_count: 0,
    area_sqm: 0,
    capacity_kw: 0,
    assumptions: {
      wp_per_m2: settings.wp_per_m2,
      panel_standard_size_m2: settings.panel_standard_m2,
    },
    qc_status: 'VERIFIABLE',
    failed_contract_tests: [],
    reason_codes: [],
    micro_flags: {
      clothesline: false,
      tank: false,
      dust_pct: 0,
      nest: false,
      reflection: false,
      wiring: false,
      incomplete: false,
    },
    plg_score: 0,
    shadow_match_score: 0,
    freshness_score: 0,
    neighborhood_adoption_prob: 0,
    tilt_deg: 0,
    age_bucket: 'mid',
    artifacts: {
      mask_data_url: '',
      overlay_data_url: '',
      gradcam_data_url: '',
    },
    model_versions: {
      classifier: 'stub-v1.0',
      segmenter: 'stub-v1.0',
      plg: 'stub-v1.0',
      shadow: 'stub-v1.0',
    },
    timestamp_utc: new Date().toISOString(),
  };

  // Collect values for weighted averaging
  const confidenceValues: { value: number; weight: number }[] = [];
  const plgValues: { value: number; weight: number }[] = [];
  const shadowValues: { value: number; weight: number }[] = [];
  const freshnessValues: { value: number; weight: number }[] = [];
  const adoptionValues: { value: number; weight: number }[] = [];

  // Track QC status
  let worstQcPriority = 1;
  const allReasonCodes: Set<string> = new Set();
  const allFailedTests: Set<string> = new Set();

  // Process each idea result
  Object.entries(results).forEach(([ideaIdStr, result]) => {
    const ideaId = parseInt(ideaIdStr);
    const weight = IDEA_WEIGHTS[ideaId] || 1.0;

    // Boolean merge: OR
    if (result.has_solar !== undefined) {
      merged.has_solar = merged.has_solar || result.has_solar;
    }

    // Confidence accumulation
    if (result.confidence !== undefined) {
      confidenceValues.push({ value: result.confidence, weight });
    }

    // Panel count: take maximum
    if (result.panel_count !== undefined) {
      merged.panel_count = Math.max(merged.panel_count, result.panel_count);
    }

    // Area: take from idea 3 primarily
    if (ideaId === 3 && result.area_sqm !== undefined) {
      merged.area_sqm = result.area_sqm;
    }

    // Capacity: take from idea 3 primarily
    if (ideaId === 3 && result.capacity_kw !== undefined) {
      merged.capacity_kw = result.capacity_kw;
    }

    // PLG score accumulation
    if (result.plg_score !== undefined) {
      plgValues.push({ value: result.plg_score, weight });
    }

    // Shadow score accumulation
    if (result.shadow_match_score !== undefined) {
      shadowValues.push({ value: result.shadow_match_score, weight });
    }

    // Freshness score accumulation
    if (result.freshness_score !== undefined) {
      freshnessValues.push({ value: result.freshness_score, weight });
    }

    // Neighborhood adoption accumulation
    if (result.neighborhood_adoption_prob !== undefined) {
      adoptionValues.push({ value: result.neighborhood_adoption_prob, weight });
    }

    // Tilt: average if multiple
    if (result.tilt_deg !== undefined) {
      merged.tilt_deg = result.tilt_deg;
    }

    // Age bucket: take from idea 11
    if (ideaId === 11 && result.age_bucket !== undefined) {
      merged.age_bucket = result.age_bucket;
    }

    // QC Status: most conservative
    if (result.qc_status !== undefined) {
      const priority = QC_PRIORITY[result.qc_status] || 1;
      if (priority > worstQcPriority) {
        worstQcPriority = priority;
        merged.qc_status = result.qc_status;
      }
    }

    // Reason codes: union
    if (result.reason_codes) {
      result.reason_codes.forEach(code => allReasonCodes.add(code));
    }

    // Failed tests: union
    if (result.failed_contract_tests) {
      result.failed_contract_tests.forEach(test => allFailedTests.add(test));
    }

    // Micro flags: OR for booleans, max for numbers
    if (result.micro_flags) {
      merged.micro_flags.clothesline = merged.micro_flags.clothesline || result.micro_flags.clothesline;
      merged.micro_flags.tank = merged.micro_flags.tank || result.micro_flags.tank;
      merged.micro_flags.dust_pct = Math.max(merged.micro_flags.dust_pct, result.micro_flags.dust_pct);
      merged.micro_flags.nest = merged.micro_flags.nest || result.micro_flags.nest;
      merged.micro_flags.reflection = merged.micro_flags.reflection || result.micro_flags.reflection;
      merged.micro_flags.wiring = merged.micro_flags.wiring || result.micro_flags.wiring;
      merged.micro_flags.incomplete = merged.micro_flags.incomplete || result.micro_flags.incomplete;
    }

    // Artifacts: collect all non-empty
    if (result.artifacts) {
      if (result.artifacts.mask_data_url) {
        merged.artifacts.mask_data_url = result.artifacts.mask_data_url;
      }
      if (result.artifacts.overlay_data_url) {
        merged.artifacts.overlay_data_url = result.artifacts.overlay_data_url;
      }
      if (result.artifacts.gradcam_data_url) {
        merged.artifacts.gradcam_data_url = result.artifacts.gradcam_data_url;
      }
    }
  });

  // Calculate weighted averages
  merged.confidence = weightedAverage(confidenceValues);
  merged.plg_score = weightedAverage(plgValues);
  merged.shadow_match_score = weightedAverage(shadowValues);
  merged.freshness_score = weightedAverage(freshnessValues);
  merged.neighborhood_adoption_prob = weightedAverage(adoptionValues);

  // Apply collected codes and tests
  merged.reason_codes = Array.from(allReasonCodes);
  merged.failed_contract_tests = Array.from(allFailedTests);

  return merged;
}

/**
 * Calculate weighted average of values
 */
function weightedAverage(values: { value: number; weight: number }[]): number {
  if (values.length === 0) return 0;
  
  const totalWeight = values.reduce((sum, v) => sum + v.weight, 0);
  const weightedSum = values.reduce((sum, v) => sum + v.value * v.weight, 0);
  
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Get merge rule documentation for display
 */
export function getMergeRulesDocumentation(): string {
  return `
## Merge Rules Documentation

When "Run All Analyses" is executed, individual idea outputs are combined using these rules:

### Numeric Scores (Weighted Average)
- **Confidence**: Averaged across all contributing ideas with weights
- **PLG Score**: Weighted average from PLG-related ideas (5, 20-24)
- **Shadow Match**: Weighted average from shadow analysis ideas
- **Freshness Score**: Weighted average from freshness-related ideas

### Boolean Flags (Logical OR)
- **has_solar**: True if ANY idea detects solar
- **micro_flags**: Each flag is OR'd across all ideas

### Categorical Values
- **QC Status**: Most conservative value wins (NOT_VERIFIABLE > PARTIALLY > VERIFIABLE)
- **Age Bucket**: Taken from Idea 11 (Panel Age Classifier)

### Collections (Union)
- **reason_codes**: All unique codes from all ideas
- **failed_contract_tests**: All unique failed tests

### Artifacts
- Each artifact type (mask, overlay, gradcam) takes the first non-empty value

### Idea Weights
Ideas are weighted by importance for averaging:
- Classification/Detection: 1.5x
- Validation: 1.3-1.4x
- Quality checks: 0.7-1.0x
- Metadata: 0.5-0.8x
  `.trim();
}
