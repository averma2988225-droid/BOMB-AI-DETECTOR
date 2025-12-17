import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ImageUploader } from '@/components/ImageUploader';
import { DemoScenarios, type DemoScenario } from '@/components/DemoScenarios';
import { ThreatLevelBadge } from '@/components/ThreatLevelBadge';
import { ClassificationBadge } from '@/components/ClassificationBadge';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import { VisualFeaturesPanel } from '@/components/VisualFeaturesPanel';
import { RiskAssessmentPanel } from '@/components/RiskAssessmentPanel';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { SystemStatus } from '@/components/SystemStatus';
import { FalsePositiveInfo } from '@/components/FalsePositiveInfo';
import { 
  classifyThreat, 
  getDemoSafeFallback,
  type ClassificationResult,
  type ObjectClass,
  type VisualFeature
} from '@/lib/threatClassification';
import { Eye, Clock, Layers } from 'lucide-react';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScenarioSelect = async (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setIsProcessing(true);
    setResult(null);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const detectionResult = classifyThreat({
      predictions: scenario.predictions as Array<{ class: ObjectClass; confidence: number }>,
      features: scenario.features as VisualFeature[],
      imageData: { isXray: false },
      context: { location: 'Security Checkpoint' }
    });

    setResult(detectionResult);
    setIsProcessing(false);
  };

  const handleImageAnalysis = async (imageData: { url: string; isXray: boolean }) => {
    setIsProcessing(true);
    setResult(null);
    setSelectedScenario(null);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For uploaded images, use demo-safe fallback
    const fallbackResult = getDemoSafeFallback();
    setResult(fallbackResult);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="scanline pointer-events-none fixed inset-0 z-50" />
      
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Demo Controls */}
          <aside className="lg:col-span-3 space-y-4">
            <SystemStatus isProcessing={isProcessing} />
            <DemoScenarios 
              onSelectScenario={handleScenarioSelect}
              selectedId={selectedScenario?.id}
            />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Image Input Section */}
            <section className="glass-card rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Image Analysis
                </h2>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
              <ImageUploader 
                onImageSelect={handleImageAnalysis}
                isProcessing={isProcessing}
              />
            </section>

            {/* Results Section */}
            {result && (
              <div className="space-y-4 animate-fade-in">
                {/* Primary Classification */}
                <section className="glass-card rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Detection Result
                    </h2>
                    <ThreatLevelBadge level={result.threatLevel} pulse />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-muted-foreground uppercase">
                        Primary Classification
                      </p>
                      <ClassificationBadge 
                        classification={result.primaryClass}
                        confidence={result.confidence}
                        size="lg"
                      />
                    </div>
                    {result.secondaryClass && (
                      <div className="space-y-2">
                        <p className="text-xs font-mono text-muted-foreground uppercase">
                          Secondary
                        </p>
                        <ClassificationBadge 
                          classification={result.secondaryClass}
                          confidence={result.secondaryConfidence}
                          size="md"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <ConfidenceBar 
                      value={result.confidence} 
                      label="Classification Confidence"
                    />
                    
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Modality:</span>
                        <span className="text-primary">{result.modality}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={result.isAmbiguous ? 'text-threat-ambiguous' : 'text-threat-safe'}>
                          {result.isAmbiguous ? 'AMBIGUOUS' : 'CONFIDENT'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Visual Features */}
                <VisualFeaturesPanel features={result.visualFeatures} />

                {/* AI Explanation */}
                <ExplanationPanel 
                  explanation={result.explanation}
                  requiresHumanReview={result.requiresHumanReview}
                />
              </div>
            )}

            {!result && !isProcessing && (
              <div className="glass-card rounded-lg p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Select a demo scenario or upload an image to begin analysis
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Risk & Info */}
          <aside className="lg:col-span-3 space-y-4">
            {result ? (
              <RiskAssessmentPanel assessment={result.riskAssessment} />
            ) : (
              <div className="glass-card rounded-lg p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Risk Assessment
                </h3>
                <p className="text-xs text-muted-foreground">
                  Risk analysis will appear after detection
                </p>
              </div>
            )}
            
            <FalsePositiveInfo />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-8 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
            <p>SENTINEL AI v2.0 — Context-Aware Threat Detection</p>
            <p>Classification Engine: ACTIVE | False Positive Mitigation: ENABLED</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
