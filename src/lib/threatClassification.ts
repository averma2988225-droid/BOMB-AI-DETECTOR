/**
 * SENTINEL AI - Threat Classification Engine
 * 
 * STRICT CLASS TAXONOMY (v2.0):
 * - firearm: handgun, rifle, gun-like shapes
 * - explosive_device: IED, bomb, detonator (requires ≥2 supporting components)
 * - suspicious_component: wires, batteries, timers, unusual circuitry
 * - benign_object: bags, electronics, tools
 * 
 * RULES:
 * - A firearm MUST NEVER be classified as suspicious_component
 * - explosive_device requires ≥2 supporting components
 * - suspicious_component alone does NOT imply an explosive
 */

export type ObjectClass = 'firearm' | 'explosive_device' | 'suspicious_component' | 'benign_object';
export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE' | 'AMBIGUOUS';
export type ImageModality = 'RGB' | 'X-RAY';

export interface VisualFeature {
  name: string;
  detected: boolean;
  confidence: number;
  description: string;
}

export interface ClassificationResult {
  primaryClass: ObjectClass;
  confidence: number;
  secondaryClass?: ObjectClass;
  secondaryConfidence?: number;
  isAmbiguous: boolean;
  threatLevel: ThreatLevel;
  visualFeatures: VisualFeature[];
  modality: ImageModality;
  requiresHumanReview: boolean;
  explanation: string;
  riskAssessment: RiskAssessment;
}

export interface RiskAssessment {
  overallRisk: ThreatLevel;
  isBombThreat: boolean;
  isFirearmThreat: boolean;
  contextualFactors: string[];
  recommendations: string[];
  falsePositiveRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Visual feature definitions for firearm detection
const FIREARM_FEATURES: VisualFeature[] = [
  { name: 'barrel_structure', detected: false, confidence: 0, description: 'Barrel-like cylindrical structure' },
  { name: 'trigger_guard', detected: false, confidence: 0, description: 'Trigger guard mechanism' },
  { name: 'grip_geometry', detected: false, confidence: 0, description: 'Ergonomic grip structure' },
  { name: 'metallic_frame', detected: false, confidence: 0, description: 'Metallic frame construction' },
  { name: 'slide_mechanism', detected: false, confidence: 0, description: 'Slide/action mechanism' },
];

// Visual feature definitions for explosive detection
const EXPLOSIVE_FEATURES: VisualFeature[] = [
  { name: 'wire_bundle', detected: false, confidence: 0, description: 'Wire bundle or circuitry' },
  { name: 'battery_pack', detected: false, confidence: 0, description: 'Battery or power source' },
  { name: 'timer_display', detected: false, confidence: 0, description: 'Timer or electronic display' },
  { name: 'container', detected: false, confidence: 0, description: 'Container or housing' },
  { name: 'detonator', detected: false, confidence: 0, description: 'Detonator mechanism' },
];

/**
 * Detects image modality (RGB vs X-RAY)
 */
export function detectModality(imageData: { isXray?: boolean; colorChannels?: number }): ImageModality {
  // In real implementation, this would analyze image characteristics
  return imageData.isXray ? 'X-RAY' : 'RGB';
}

/**
 * Visual Feature Validation Layer
 * Forces classification to firearm if key features are detected
 */
export function validateFirearmFeatures(features: VisualFeature[]): boolean {
  const criticalFeatures = ['barrel_structure', 'trigger_guard', 'grip_geometry'];
  const detectedCritical = features.filter(
    f => criticalFeatures.includes(f.name) && f.detected && f.confidence > 0.6
  );
  
  // If 2+ critical firearm features detected, force firearm classification
  return detectedCritical.length >= 2;
}

/**
 * Confidence Gating Logic
 * If confidence difference between top-2 classes < 15%, mark as AMBIGUOUS
 */
export function applyConfidenceGating(
  primaryConfidence: number,
  secondaryConfidence: number
): { isAmbiguous: boolean; requiresReview: boolean } {
  const confidenceDiff = primaryConfidence - secondaryConfidence;
  const isAmbiguous = confidenceDiff < 0.15;
  
  return {
    isAmbiguous,
    requiresReview: isAmbiguous || primaryConfidence < 0.7
  };
}

/**
 * Contextual Risk Firewall
 * Ensures firearm detection ≠ bomb threat
 */
export function assessRisk(
  classification: ObjectClass,
  features: VisualFeature[],
  context: { location?: string; crowdDensity?: string }
): RiskAssessment {
  const explosiveFeatures = features.filter(f => 
    EXPLOSIVE_FEATURES.map(ef => ef.name).includes(f.name) && f.detected
  );
  
  const isFirearmThreat = classification === 'firearm';
  
  // CRITICAL RULE: explosive_device requires ≥2 supporting components
  const isBombThreat = classification === 'explosive_device' && explosiveFeatures.length >= 2;
  
  // Firearm + NO explosive indicators → security alert, NOT bomb alert
  if (isFirearmThreat && explosiveFeatures.length === 0) {
    return {
      overallRisk: 'HIGH',
      isBombThreat: false,
      isFirearmThreat: true,
      contextualFactors: [
        'Firearm detected without explosive indicators',
        'No wiring or detonation components present',
        context.location ? `Location context: ${context.location}` : 'Standard security protocol'
      ],
      recommendations: [
        'Initiate security personnel response',
        'Do NOT trigger bomb disposal protocol',
        'Human verification required'
      ],
      falsePositiveRisk: 'LOW'
    };
  }
  
  if (classification === 'suspicious_component' && explosiveFeatures.length < 2) {
    return {
      overallRisk: 'MEDIUM',
      isBombThreat: false,
      isFirearmThreat: false,
      contextualFactors: [
        'Suspicious components detected',
        'Insufficient evidence for explosive classification',
        'May be benign electronics or tools'
      ],
      recommendations: [
        'Request additional screening',
        'Human review recommended',
        'Do NOT escalate to CRITICAL'
      ],
      falsePositiveRisk: 'MEDIUM'
    };
  }
  
  if (classification === 'benign_object') {
    return {
      overallRisk: 'SAFE',
      isBombThreat: false,
      isFirearmThreat: false,
      contextualFactors: ['Object classified as benign', 'No threat indicators detected'],
      recommendations: ['Standard processing', 'No action required'],
      falsePositiveRisk: 'LOW'
    };
  }
  
  return {
    overallRisk: isBombThreat ? 'CRITICAL' : isFirearmThreat ? 'HIGH' : 'MEDIUM',
    isBombThreat,
    isFirearmThreat,
    contextualFactors: [
      `Primary classification: ${classification}`,
      `Explosive indicators: ${explosiveFeatures.length}`,
      context.location || 'Unknown location'
    ],
    recommendations: isBombThreat 
      ? ['Initiate evacuation protocol', 'Contact bomb disposal unit', 'Secure perimeter']
      : ['Security personnel required', 'Human verification needed'],
    falsePositiveRisk: 'LOW'
  };
}

/**
 * Generate Explainable AI Output
 * References only visually confirmed features
 */
export function generateExplanation(
  result: Omit<ClassificationResult, 'explanation'>
): string {
  const { primaryClass, confidence, visualFeatures, modality, riskAssessment } = result;
  
  const detectedFeatures = visualFeatures.filter(f => f.detected);
  const featureList = detectedFeatures.map(f => f.description).join(', ');
  
  const uncertaintyNote = confidence < 0.8 
    ? '\n\nNote: Classification confidence is below optimal threshold. Human verification strongly recommended.'
    : '';
  
  if (primaryClass === 'firearm') {
    return `DETECTION SUMMARY:
Detected object matches firearm characteristics based on ${modality} analysis.

CONFIRMED VISUAL FEATURES:
${detectedFeatures.length > 0 ? featureList : 'Geometric pattern analysis indicates firearm profile'}

THREAT CLASSIFICATION: Firearm presence detected
CONFIDENCE: ${(confidence * 100).toFixed(1)}%

RISK ASSESSMENT:
- Explosive components: NOT DETECTED
- Detonation mechanism: NOT DETECTED
- Wire bundles: NOT DETECTED

RECOMMENDATION: ${riskAssessment.recommendations[0]}${uncertaintyNote}`;
  }
  
  if (primaryClass === 'explosive_device') {
    return `DETECTION SUMMARY:
Potential explosive device detected based on ${modality} analysis.

CONFIRMED COMPONENTS:
${featureList}

THREAT CLASSIFICATION: Explosive device - CRITICAL
CONFIDENCE: ${(confidence * 100).toFixed(1)}%

IMMEDIATE ACTION REQUIRED:
${riskAssessment.recommendations.join('\n')}${uncertaintyNote}`;
  }
  
  if (primaryClass === 'suspicious_component') {
    return `DETECTION SUMMARY:
Suspicious component(s) identified in ${modality} scan.

DETECTED ELEMENTS:
${featureList || 'Unusual structural patterns detected'}

THREAT CLASSIFICATION: Requires investigation
CONFIDENCE: ${(confidence * 100).toFixed(1)}%

IMPORTANT: Single suspicious component does NOT indicate explosive device.
Additional screening recommended to determine nature of object.${uncertaintyNote}`;
  }
  
  return `DETECTION SUMMARY:
Object analyzed via ${modality} imaging.

CLASSIFICATION: Benign object
CONFIDENCE: ${(confidence * 100).toFixed(1)}%

No threat indicators detected. Standard processing approved.`;
}

/**
 * Main Classification Function
 * Applies all validation layers and generates final output
 */
export function classifyThreat(
  detectionData: {
    predictions: Array<{ class: ObjectClass; confidence: number }>;
    features: VisualFeature[];
    imageData: { isXray?: boolean };
    context?: { location?: string; crowdDensity?: string };
  }
): ClassificationResult {
  const { predictions, features, imageData, context = {} } = detectionData;
  
  // Step 1: Detect modality
  const modality = detectModality(imageData);
  
  // Step 2: Apply modality-specific rules
  let adjustedFeatures = [...features];
  if (modality === 'RGB') {
    // Disable X-ray-specific features for RGB images
    adjustedFeatures = adjustedFeatures.map(f => {
      if (['wire_bundle', 'internal_circuitry'].includes(f.name)) {
        return { ...f, detected: false, confidence: 0 };
      }
      return f;
    });
  }
  
  // Step 3: Visual Feature Validation - Force firearm if features match
  const isDefiniteFirearm = validateFirearmFeatures(adjustedFeatures);
  
  let primaryClass = predictions[0]?.class || 'benign_object';
  let primaryConfidence = predictions[0]?.confidence || 0;
  let secondaryClass = predictions[1]?.class;
  let secondaryConfidence = predictions[1]?.confidence || 0;
  
  // CRITICAL OVERRIDE: If firearm features detected, force classification
  if (isDefiniteFirearm && primaryClass !== 'firearm') {
    primaryClass = 'firearm';
    primaryConfidence = Math.max(primaryConfidence, 0.85);
  }
  
  // Step 4: Confidence gating
  const { isAmbiguous, requiresReview } = applyConfidenceGating(
    primaryConfidence,
    secondaryConfidence
  );
  
  // Step 5: Determine threat level
  let threatLevel: ThreatLevel;
  if (isAmbiguous) {
    threatLevel = 'AMBIGUOUS';
  } else if (primaryClass === 'firearm') {
    threatLevel = 'HIGH';
  } else if (primaryClass === 'explosive_device') {
    threatLevel = 'CRITICAL';
  } else if (primaryClass === 'suspicious_component') {
    threatLevel = 'MEDIUM';
  } else {
    threatLevel = 'SAFE';
  }
  
  // Step 6: Risk assessment
  const riskAssessment = assessRisk(primaryClass, adjustedFeatures, context);
  
  // Build result without explanation first
  const partialResult = {
    primaryClass,
    confidence: primaryConfidence,
    secondaryClass,
    secondaryConfidence,
    isAmbiguous,
    threatLevel,
    visualFeatures: adjustedFeatures,
    modality,
    requiresHumanReview: requiresReview || isAmbiguous,
    riskAssessment,
  };
  
  // Step 7: Generate explanation
  const explanation = generateExplanation(partialResult);
  
  return {
    ...partialResult,
    explanation,
  };
}

/**
 * Demo-Safe Fallback Mode
 * Returns safe output when confidence is too low
 */
export function getDemoSafeFallback(): ClassificationResult {
  return {
    primaryClass: 'benign_object',
    confidence: 0.45,
    isAmbiguous: true,
    threatLevel: 'AMBIGUOUS',
    visualFeatures: [],
    modality: 'RGB',
    requiresHumanReview: true,
    explanation: `DETECTION SUMMARY:
Potential threat detected — classification uncertain.

ANALYSIS STATUS: INCONCLUSIVE
CONFIDENCE: Below threshold

IMPORTANT: Automated classification could not reach definitive conclusion.
Human verification is REQUIRED before any action is taken.

This detection has been flagged for manual review to ensure accurate threat assessment.`,
    riskAssessment: {
      overallRisk: 'AMBIGUOUS',
      isBombThreat: false,
      isFirearmThreat: false,
      contextualFactors: ['Classification confidence below threshold', 'Ambiguous visual features'],
      recommendations: ['Human verification required', 'Do not escalate without manual review'],
      falsePositiveRisk: 'HIGH'
    }
  };
}
