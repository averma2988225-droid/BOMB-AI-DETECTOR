import { supabase } from '@/integrations/supabase/client';
import { 
  type ClassificationResult, 
  type ObjectClass, 
  type ThreatLevel,
  type VisualFeature,
  assessRisk,
  generateExplanation,
  applyConfidenceGating,
  validateFirearmFeatures
} from '@/lib/threatClassification';

interface AIAnalysisResponse {
  success: boolean;
  error?: string;
  analysis?: {
    detected: boolean;
    primaryClass: string;
    confidence: number;
    secondaryClass?: string;
    secondaryConfidence?: number;
    detectedFeatures: Array<{
      name: string;
      confidence: number;
      description: string;
    }>;
    explanation: string;
    threatIndicators: {
      hasFirearmFeatures: boolean;
      hasExplosiveComponents: boolean;
      componentCount: number;
    };
    isAmbiguous?: boolean;
  };
  modality?: 'RGB' | 'X-RAY';
}

// Map AI features to our visual feature format
function mapToVisualFeatures(aiFeatures: Array<{ name: string; confidence: number; description: string }>): VisualFeature[] {
  const allFeatures: VisualFeature[] = [
    { name: 'barrel_structure', detected: false, confidence: 0, description: 'Barrel-like cylindrical structure' },
    { name: 'trigger_guard', detected: false, confidence: 0, description: 'Trigger guard mechanism' },
    { name: 'grip_geometry', detected: false, confidence: 0, description: 'Ergonomic grip structure' },
    { name: 'metallic_frame', detected: false, confidence: 0, description: 'Metallic frame construction' },
    { name: 'slide_mechanism', detected: false, confidence: 0, description: 'Slide/action mechanism' },
    { name: 'wire_bundle', detected: false, confidence: 0, description: 'Wire bundle or circuitry' },
    { name: 'battery_pack', detected: false, confidence: 0, description: 'Battery or power source' },
    { name: 'timer_display', detected: false, confidence: 0, description: 'Timer or electronic display' },
    { name: 'container', detected: false, confidence: 0, description: 'Container or housing' },
    { name: 'detonator', detected: false, confidence: 0, description: 'Detonator mechanism' },
  ];

  // Update features based on AI detection
  for (const aiFeature of aiFeatures) {
    const matchingFeature = allFeatures.find(f => 
      f.name === aiFeature.name || 
      f.name.includes(aiFeature.name.toLowerCase()) ||
      aiFeature.name.toLowerCase().includes(f.name.replace(/_/g, ' '))
    );
    
    if (matchingFeature) {
      matchingFeature.detected = true;
      matchingFeature.confidence = aiFeature.confidence;
      if (aiFeature.description) {
        matchingFeature.description = aiFeature.description;
      }
    }
  }

  return allFeatures;
}

// Validate and normalize object class
function normalizeObjectClass(classStr: string): ObjectClass {
  const normalized = classStr.toLowerCase().replace(/[^a-z_]/g, '');
  
  if (normalized.includes('firearm') || normalized.includes('gun') || normalized.includes('weapon') || normalized.includes('pistol') || normalized.includes('rifle')) {
    return 'firearm';
  }
  if (normalized.includes('explosive') || normalized.includes('bomb') || normalized.includes('ied')) {
    return 'explosive_device';
  }
  if (normalized.includes('suspicious') || normalized.includes('component')) {
    return 'suspicious_component';
  }
  return 'benign_object';
}

export async function analyzeImage(imageBase64: string, isXray: boolean = false): Promise<ClassificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke<AIAnalysisResponse>('analyze-threat', {
      body: { imageBase64, isXray }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to analyze image');
    }

    if (!data?.success || !data.analysis) {
      throw new Error(data?.error || 'Analysis failed');
    }

    const { analysis, modality } = data;
    
    // Convert AI response to our format
    const visualFeatures = mapToVisualFeatures(analysis.detectedFeatures || []);
    const primaryClass = normalizeObjectClass(analysis.primaryClass);
    const secondaryClass = analysis.secondaryClass ? normalizeObjectClass(analysis.secondaryClass) : undefined;
    
    // Apply visual feature validation (force firearm if features match)
    const isDefiniteFirearm = validateFirearmFeatures(visualFeatures);
    let finalPrimaryClass = primaryClass;
    let finalConfidence = analysis.confidence;
    
    if (isDefiniteFirearm && primaryClass !== 'firearm') {
      finalPrimaryClass = 'firearm';
      finalConfidence = Math.max(finalConfidence, 0.85);
    }
    
    // Apply confidence gating
    const { isAmbiguous, requiresReview } = applyConfidenceGating(
      finalConfidence,
      analysis.secondaryConfidence || 0
    );
    
    // Determine threat level
    let threatLevel: ThreatLevel;
    if (isAmbiguous || analysis.isAmbiguous) {
      threatLevel = 'AMBIGUOUS';
    } else if (finalPrimaryClass === 'firearm') {
      threatLevel = 'HIGH';
    } else if (finalPrimaryClass === 'explosive_device') {
      threatLevel = 'CRITICAL';
    } else if (finalPrimaryClass === 'suspicious_component') {
      threatLevel = 'MEDIUM';
    } else {
      threatLevel = 'SAFE';
    }
    
    // Generate risk assessment
    const riskAssessment = assessRisk(finalPrimaryClass, visualFeatures, { location: 'Security Checkpoint' });
    
    // Build result
    const partialResult = {
      primaryClass: finalPrimaryClass,
      confidence: finalConfidence,
      secondaryClass,
      secondaryConfidence: analysis.secondaryConfidence,
      isAmbiguous: isAmbiguous || analysis.isAmbiguous || false,
      threatLevel,
      visualFeatures,
      modality: modality || 'RGB',
      requiresHumanReview: requiresReview || isAmbiguous || analysis.isAmbiguous || false,
      riskAssessment,
    };
    
    // Generate explanation using AI's explanation + our formatting
    const explanation = analysis.explanation 
      ? `DETECTION SUMMARY:\n${analysis.explanation}\n\nCONFIDENCE: ${(finalConfidence * 100).toFixed(1)}%\n\nMODALITY: ${modality || 'RGB'}\n\n${partialResult.requiresHumanReview ? 'HUMAN REVIEW REQUIRED' : ''}`
      : generateExplanation(partialResult);
    
    return {
      ...partialResult,
      explanation,
    };

  } catch (error) {
    console.error('Image analysis error:', error);
    throw error;
  }
}
