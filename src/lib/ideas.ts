import { IdeaConfig } from './types';

export const ideasConfig: IdeaConfig[] = [
  {
    id: 1,
    name: 'Binary Solar Classifier',
    shortName: 'Classifier',
    purpose: 'Detect presence/absence of solar panels in satellite imagery using CNN classification.',
    category: 'detection',
    inputs: ['RGB satellite image', 'Image metadata'],
    outputs: ['has_solar (boolean)', 'confidence (0-1)'],
    steps: [
      'Preprocess image (normalize, resize to 224x224)',
      'Run through ResNet-50 classifier backbone',
      'Apply sigmoid activation to output',
      'Compare against threshold (default 0.5)',
      'Return binary decision with confidence'
    ],
    failureModes: [
      'Blue tarps misclassified as solar panels',
      'Skylights causing false positives',
      'Heavy shadows obscuring panels',
      'Low resolution imagery (<30cm GSD)'
    ]
  },
  {
    id: 2,
    name: 'Panel Segmentation',
    shortName: 'Segmentation',
    purpose: 'Generate pixel-level mask of solar panel regions using semantic segmentation.',
    category: 'segmentation',
    inputs: ['RGB satellite image', 'Optional: prior detection confidence'],
    outputs: ['mask_data_url (PNG)', 'pixel_count', 'coverage_ratio'],
    steps: [
      'Load image into U-Net architecture',
      'Generate probability map for each pixel',
      'Apply threshold to create binary mask',
      'Post-process with morphological operations',
      'Extract connected components'
    ],
    failureModes: [
      'Panel edges blurred in low-res images',
      'Adjacent panels merged into single region',
      'Partial panels at image boundaries',
      'Shadows creating gaps in masks'
    ]
  },
  {
    id: 3,
    name: 'Area Quantification',
    shortName: 'Quantifier',
    purpose: 'Calculate total solar panel area from segmentation mask using GSD calibration.',
    category: 'scoring',
    inputs: ['Segmentation mask', 'GSD (Ground Sample Distance)', 'wp_per_m2 setting'],
    outputs: ['area_sqm', 'panel_count', 'capacity_kw'],
    steps: [
      'Count pixels in segmentation mask',
      'Multiply by GSD² to get area in m²',
      'Estimate panel count using standard panel size',
      'Calculate capacity using wp_per_m2 assumption',
      'Apply efficiency derating factor'
    ],
    failureModes: [
      'Incorrect GSD calibration',
      'Over-segmentation inflating area',
      'Non-standard panel sizes',
      'Tilted panels appearing smaller'
    ]
  },
  {
    id: 4,
    name: 'Shadow Geometry Engine',
    shortName: 'Shadow',
    purpose: 'Validate panel presence by analyzing shadow patterns against expected solar geometry.',
    category: 'validation',
    inputs: ['RGB image', 'Sun angle (azimuth/elevation)', 'Approximate lat/lon'],
    outputs: ['shadow_match_score', 'expected_shadow_vector', 'detected_shadow_vector'],
    steps: [
      'Calculate expected shadow direction from sun position',
      'Detect dark regions adjacent to panel mask',
      'Measure shadow length and direction',
      'Compare against expected geometry',
      'Score match from 0-1'
    ],
    failureModes: [
      'Overcast conditions eliminating shadows',
      'Surrounding objects casting shadows',
      'Flush-mounted panels with no shadow',
      'Image capture time uncertainty'
    ]
  },
  {
    id: 5,
    name: 'Physical Linkage Graph',
    shortName: 'PLG',
    purpose: 'Verify logical connections between detected components (panels, inverters, meters).',
    category: 'validation',
    inputs: ['Component detections', 'Building footprint', 'Electrical infrastructure map'],
    outputs: ['plg_score', 'connection_graph', 'anomaly_list'],
    steps: [
      'Extract detected solar components',
      'Load building footprint and utility data',
      'Build graph of expected connections',
      'Validate each edge in graph',
      'Score overall consistency'
    ],
    failureModes: [
      'Off-grid systems without meters',
      'Multiple buildings sharing installation',
      'Underground wiring not visible',
      'New construction not in maps'
    ]
  },
  {
    id: 6,
    name: 'Grad-CAM Explainability',
    shortName: 'Grad-CAM',
    purpose: 'Generate attention heatmap showing which image regions influenced classification.',
    category: 'quality',
    inputs: ['RGB image', 'Classifier model', 'Target layer'],
    outputs: ['gradcam_data_url', 'attention_score', 'focus_regions'],
    steps: [
      'Forward pass through classifier',
      'Compute gradients of target class',
      'Weight feature maps by gradient importance',
      'Create heatmap overlay',
      'Identify high-attention regions'
    ],
    failureModes: [
      'Attention on irrelevant features',
      'Diffuse attention hard to interpret',
      'Layer selection affecting output',
      'Adversarial patterns causing misfocus'
    ]
  },
  {
    id: 7,
    name: 'Image Freshness Scorer',
    shortName: 'Freshness',
    purpose: 'Estimate imagery age based on visual cues and metadata analysis.',
    category: 'metadata',
    inputs: ['RGB image', 'Available metadata', 'Reference timestamps'],
    outputs: ['freshness_score', 'estimated_date', 'confidence_interval'],
    steps: [
      'Extract EXIF/metadata timestamps',
      'Analyze vegetation growth patterns',
      'Check for seasonal indicators',
      'Compare against known reference imagery',
      'Compute weighted freshness score'
    ],
    failureModes: [
      'Stripped metadata',
      'Indoor/shaded areas lacking seasonal cues',
      'Desert environments with stable vegetation',
      'Recent construction not captured'
    ]
  },
  {
    id: 8,
    name: 'Micro-Object Detector',
    shortName: 'Micro-Flags',
    purpose: 'Detect small objects that may indicate verification issues (clotheslines, tanks, debris).',
    category: 'quality',
    inputs: ['High-res RGB image', 'Detection thresholds'],
    outputs: ['micro_flags object', 'detection_boxes', 'confidence_per_object'],
    steps: [
      'Run YOLO-style detector on image tiles',
      'Classify detected objects into categories',
      'Flag relevant verification issues',
      'Aggregate flags across image',
      'Generate detailed report'
    ],
    failureModes: [
      'Small objects below resolution limit',
      'Unusual object orientations',
      'Seasonal variations (snow, leaves)',
      'False positives from shadows'
    ]
  },
  {
    id: 9,
    name: 'Dust Accumulation Estimator',
    shortName: 'Dust',
    purpose: 'Estimate panel soiling level from spectral reflectance analysis.',
    category: 'quality',
    inputs: ['RGB/Multispectral image', 'Reference clean panel spectra'],
    outputs: ['dust_pct', 'soiling_map', 'cleaning_recommendation'],
    steps: [
      'Extract panel regions from mask',
      'Analyze spectral characteristics',
      'Compare against clean panel reference',
      'Compute per-panel soiling percentage',
      'Aggregate to system-level score'
    ],
    failureModes: [
      'Wet panels appearing clean',
      'Anti-reflective coatings affecting spectra',
      'Shadow areas misclassified',
      'Panel age affecting baseline'
    ]
  },
  {
    id: 10,
    name: 'Tilt Angle Estimator',
    shortName: 'Tilt',
    purpose: 'Estimate panel tilt angle from shadow geometry and perspective analysis.',
    category: 'metadata',
    inputs: ['RGB image', 'Sun position', 'Panel boundaries'],
    outputs: ['tilt_deg', 'azimuth_deg', 'confidence'],
    steps: [
      'Extract panel edges from segmentation',
      'Analyze perspective distortion',
      'Measure shadow length ratios',
      'Calculate tilt from combined evidence',
      'Validate against typical ranges'
    ],
    failureModes: [
      'Flat/flush mounted panels',
      'Variable tilt within array',
      'Image perspective distortion',
      'Insufficient shadow data'
    ]
  },
  {
    id: 11,
    name: 'Panel Age Classifier',
    shortName: 'Age',
    purpose: 'Classify installation age based on visual degradation indicators.',
    category: 'metadata',
    inputs: ['RGB image', 'Historical imagery if available'],
    outputs: ['age_bucket', 'degradation_score', 'estimated_install_year'],
    steps: [
      'Analyze panel surface for yellowing/browning',
      'Check frame and mounting condition',
      'Compare technology generation markers',
      'Cross-reference with historical imagery',
      'Classify into age bucket'
    ],
    failureModes: [
      'Well-maintained old panels',
      'Prematurely degraded new panels',
      'Mixed-age arrays',
      'Resolution too low for details'
    ]
  },
  {
    id: 12,
    name: 'Neighborhood Adoption Model',
    shortName: 'Neighborhood',
    purpose: 'Estimate likelihood of solar adoption based on surrounding properties.',
    category: 'scoring',
    inputs: ['Center location', 'Radius buffer', 'Regional detection results'],
    outputs: ['neighborhood_adoption_prob', 'nearby_solar_count', 'adoption_trend'],
    steps: [
      'Define search radius around target',
      'Query cached detection results for area',
      'Count solar installations in neighborhood',
      'Analyze spatial clustering patterns',
      'Compute adoption probability'
    ],
    failureModes: [
      'Sparse imagery coverage',
      'HOA restrictions creating boundaries',
      'Mixed residential/commercial areas',
      'New developments not in data'
    ]
  },
  {
    id: 13,
    name: 'Contract Test Suite',
    shortName: 'Contracts',
    purpose: 'Run automated validation checks to identify data quality issues.',
    category: 'validation',
    inputs: ['Complete analysis record', 'Contract definitions'],
    outputs: ['failed_contract_tests', 'pass_rate', 'severity_breakdown'],
    steps: [
      'Load contract test definitions',
      'Execute each test against record',
      'Collect pass/fail results',
      'Aggregate by severity',
      'Generate failure report'
    ],
    failureModes: [
      'Overly strict thresholds',
      'Edge cases not covered',
      'Conflicting contract rules',
      'Missing required fields'
    ]
  },
  {
    id: 14,
    name: 'QC Status Aggregator',
    shortName: 'QC Status',
    purpose: 'Compute overall verification status from all analysis outputs.',
    category: 'scoring',
    inputs: ['All idea outputs', 'Weighting configuration'],
    outputs: ['qc_status', 'confidence', 'decision_factors'],
    steps: [
      'Collect outputs from all analyses',
      'Apply weighted scoring formula',
      'Check hard failure conditions',
      'Determine final status category',
      'Document decision reasoning'
    ],
    failureModes: [
      'Single failing idea dominating',
      'Conflicting signals',
      'Missing required analyses',
      'Threshold misconfiguration'
    ]
  },
  {
    id: 15,
    name: 'Reason Code Generator',
    shortName: 'Reasons',
    purpose: 'Generate human-readable explanation codes for QC decisions.',
    category: 'quality',
    inputs: ['QC status', 'Failed tests', 'Analysis anomalies'],
    outputs: ['reason_codes', 'explanations', 'recommended_actions'],
    steps: [
      'Analyze QC decision factors',
      'Map failures to reason codes',
      'Prioritize by impact',
      'Generate human-readable text',
      'Suggest remediation actions'
    ],
    failureModes: [
      'Ambiguous failure mappings',
      'Missing reason code definitions',
      'Over-complicated explanations',
      'Language/translation issues'
    ]
  },
  {
    id: 16,
    name: 'Wiring Visibility Detector',
    shortName: 'Wiring',
    purpose: 'Detect visible wiring and conduits as installation verification evidence.',
    category: 'detection',
    inputs: ['High-res RGB image', 'Building footprint'],
    outputs: ['wiring_detected', 'conduit_paths', 'connection_points'],
    steps: [
      'Apply edge detection filters',
      'Identify linear features',
      'Filter by color (black/gray)',
      'Trace paths between components',
      'Score visibility confidence'
    ],
    failureModes: [
      'Underground/hidden wiring',
      'Resolution too low',
      'Shadows masking wires',
      'Non-standard colors'
    ]
  },
  {
    id: 17,
    name: 'Incomplete Installation Detector',
    shortName: 'Incomplete',
    purpose: 'Identify installations that appear unfinished or partially installed.',
    category: 'quality',
    inputs: ['RGB image', 'Panel segmentation', 'Wiring detection'],
    outputs: ['incomplete_flag', 'missing_components', 'completion_estimate'],
    steps: [
      'Analyze panel arrangement regularity',
      'Check for empty mounting rails',
      'Verify wiring completeness',
      'Look for construction equipment',
      'Score completion percentage'
    ],
    failureModes: [
      'Phased installations',
      'Intentional gaps for access',
      'Removed panels',
      'Expansion space'
    ]
  },
  {
    id: 18,
    name: 'Reflection Analyzer',
    shortName: 'Reflection',
    purpose: 'Analyze specular reflections to validate panel surface characteristics.',
    category: 'validation',
    inputs: ['RGB image', 'Sun position', 'Expected panel locations'],
    outputs: ['reflection_detected', 'reflection_pattern', 'consistency_score'],
    steps: [
      'Identify bright spots in panel regions',
      'Calculate expected reflection angles',
      'Compare detected vs expected patterns',
      'Score consistency with solar panels',
      'Flag anomalous reflections'
    ],
    failureModes: [
      'Overcast diffusing reflections',
      'Dirty panels not reflecting',
      'Windows/skylights causing confusion',
      'Anti-reflective panel coatings'
    ]
  },
  {
    id: 19,
    name: 'Roof Type Classifier',
    shortName: 'Roof Type',
    purpose: 'Classify roof type to validate installation compatibility.',
    category: 'metadata',
    inputs: ['RGB image', 'Building footprint'],
    outputs: ['roof_type', 'material', 'suitability_score'],
    steps: [
      'Segment roof from image',
      'Extract texture features',
      'Classify roof type (flat/pitched/etc)',
      'Identify roofing material',
      'Score solar installation suitability'
    ],
    failureModes: [
      'Unusual roof designs',
      'Mixed materials',
      'Vegetation/debris obscuring',
      'Shadows affecting classification'
    ]
  },
  {
    id: 20,
    name: 'Building Footprint Matcher',
    shortName: 'Footprint',
    purpose: 'Match detected installation to known building footprint database.',
    category: 'validation',
    inputs: ['Panel locations', 'Building footprint DB', 'Address data'],
    outputs: ['matched_building_id', 'match_confidence', 'boundary_overlap'],
    steps: [
      'Load building footprint polygons',
      'Calculate panel centroid location',
      'Find overlapping footprints',
      'Score match quality',
      'Handle multi-building cases'
    ],
    failureModes: [
      'Outdated footprint data',
      'Carports/outbuildings',
      'Boundary precision issues',
      'Missing buildings in DB'
    ]
  },
  {
    id: 21,
    name: 'Inverter Detector',
    shortName: 'Inverter',
    purpose: 'Detect and classify inverter equipment visible in imagery.',
    category: 'detection',
    inputs: ['High-res RGB image', 'Building footprint'],
    outputs: ['inverter_detected', 'inverter_type', 'location'],
    steps: [
      'Scan wall-mounted equipment regions',
      'Apply object detection model',
      'Classify inverter type/brand',
      'Estimate capacity from size',
      'Validate against panel count'
    ],
    failureModes: [
      'Indoor inverters not visible',
      'Micro-inverters on panels',
      'AC units misclassified',
      'Resolution too low'
    ]
  },
  {
    id: 22,
    name: 'Meter Detection',
    shortName: 'Meter',
    purpose: 'Detect utility meters as evidence of grid connection.',
    category: 'detection',
    inputs: ['High-res RGB image', 'Building footprint'],
    outputs: ['meter_detected', 'meter_type', 'location'],
    steps: [
      'Identify utility service locations',
      'Detect meter box shapes',
      'Classify as solar/net meter if visible',
      'Check for dual meter setups',
      'Score detection confidence'
    ],
    failureModes: [
      'Meter boxes obscured',
      'Smart meters hard to distinguish',
      'Resolution limits',
      'Indoor meter locations'
    ]
  },
  {
    id: 23,
    name: 'Shading Analysis',
    shortName: 'Shading',
    purpose: 'Estimate shading impact on solar production from surrounding objects.',
    category: 'scoring',
    inputs: ['RGB image', 'Sun path', 'Object heights'],
    outputs: ['shading_factor', 'shade_map', 'worst_hours'],
    steps: [
      'Detect trees, buildings, objects',
      'Estimate object heights',
      'Simulate sun path throughout day',
      'Calculate shadow coverage over time',
      'Score annual shading impact'
    ],
    failureModes: [
      'Vegetation height estimation',
      'Seasonal foliage changes',
      'New construction',
      '2D image height limits'
    ]
  },
  {
    id: 24,
    name: 'Panel Layout Analyzer',
    shortName: 'Layout',
    purpose: 'Analyze panel arrangement for installation quality and efficiency.',
    category: 'quality',
    inputs: ['Panel segmentation', 'Roof footprint'],
    outputs: ['layout_score', 'efficiency_rating', 'gap_analysis'],
    steps: [
      'Extract individual panel boundaries',
      'Analyze row/column alignment',
      'Measure inter-panel gaps',
      'Calculate roof utilization',
      'Score layout efficiency'
    ],
    failureModes: [
      'Non-rectangular arrays',
      'Multi-orientation systems',
      'Expansion phases',
      'Intentional gaps'
    ]
  },
  {
    id: 25,
    name: 'Historical Change Detector',
    shortName: 'History',
    purpose: 'Compare current imagery against historical to detect installation changes.',
    category: 'validation',
    inputs: ['Current image', 'Historical images', 'Timestamps'],
    outputs: ['change_detected', 'change_type', 'estimated_date'],
    steps: [
      'Align current and historical images',
      'Compute difference maps',
      'Identify significant changes',
      'Classify change type',
      'Estimate when change occurred'
    ],
    failureModes: [
      'Historical imagery unavailable',
      'Seasonal/lighting differences',
      'Registration errors',
      'Gradual changes missed'
    ]
  },
  {
    id: 26,
    name: 'Multi-Spectral Validator',
    shortName: 'Multi-Spectral',
    purpose: 'Use NIR/SWIR bands to validate panel material properties.',
    category: 'validation',
    inputs: ['Multi-spectral imagery', 'Panel mask'],
    outputs: ['spectral_signature', 'material_match', 'confidence'],
    steps: [
      'Extract panel regions across bands',
      'Compute spectral indices',
      'Compare to reference signatures',
      'Score material consistency',
      'Flag anomalous regions'
    ],
    failureModes: [
      'Multi-spectral data unavailable',
      'Atmospheric corrections',
      'Panel coating variations',
      'Mixed materials'
    ]
  },
  {
    id: 27,
    name: 'Lookalike Detector',
    shortName: 'Lookalike',
    purpose: 'Detect objects that visually resemble solar panels but are not.',
    category: 'quality',
    inputs: ['RGB image', 'Initial detections'],
    outputs: ['lookalike_list', 'reclassification', 'confidence'],
    steps: [
      'Identify potential false positives',
      'Apply specialized classifiers',
      'Analyze texture/reflectance',
      'Check geometric properties',
      'Reclassify as needed'
    ],
    failureModes: [
      'Novel lookalike objects',
      'Partial panel visibility',
      'Unusual panel types',
      'Image quality limits'
    ]
  },
  {
    id: 28,
    name: 'Consensus Scorer',
    shortName: 'Consensus',
    purpose: 'Aggregate multiple model outputs to produce consensus score.',
    category: 'scoring',
    inputs: ['All model outputs', 'Confidence scores', 'Historical accuracy'],
    outputs: ['consensus_score', 'agreement_level', 'outlier_models'],
    steps: [
      'Collect all model predictions',
      'Weight by historical accuracy',
      'Calculate agreement metrics',
      'Identify outlier predictions',
      'Compute final consensus'
    ],
    failureModes: [
      'Correlated model errors',
      'Outdated accuracy weights',
      'Edge case disagreements',
      'Missing model outputs'
    ]
  },
  {
    id: 29,
    name: 'Uncertainty Quantifier',
    shortName: 'Uncertainty',
    purpose: 'Estimate prediction uncertainty using ensemble methods.',
    category: 'scoring',
    inputs: ['Model ensemble outputs', 'Input features'],
    outputs: ['uncertainty_score', 'confidence_interval', 'entropy'],
    steps: [
      'Run multiple model variants',
      'Compute prediction variance',
      'Estimate epistemic uncertainty',
      'Estimate aleatoric uncertainty',
      'Combine into total uncertainty'
    ],
    failureModes: [
      'Under-confident models',
      'Over-confident models',
      'OOD inputs not detected',
      'Calibration drift'
    ]
  },
  {
    id: 30,
    name: 'Artifact Generator',
    shortName: 'Artifacts',
    purpose: 'Generate and package all visual artifacts for audit trail.',
    category: 'metadata',
    inputs: ['All analysis outputs', 'Original image'],
    outputs: ['artifact_bundle', 'manifest', 'checksums'],
    steps: [
      'Collect all generated overlays',
      'Render final composite images',
      'Generate artifact manifest',
      'Compute file checksums',
      'Package for download'
    ],
    failureModes: [
      'Missing artifacts',
      'Rendering errors',
      'File size limits',
      'Format compatibility'
    ]
  }
];

export function getIdeaById(id: number): IdeaConfig | undefined {
  return ideasConfig.find(idea => idea.id === id);
}

export function getIdeasByCategory(category: IdeaConfig['category']): IdeaConfig[] {
  return ideasConfig.filter(idea => idea.category === category);
}
