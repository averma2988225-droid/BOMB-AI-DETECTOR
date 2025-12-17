import { type RiskAssessment, type ThreatLevel } from '@/lib/threatClassification';
import { ThreatLevelBadge } from './ThreatLevelBadge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle, Shield } from 'lucide-react';

interface RiskAssessmentPanelProps {
  assessment: RiskAssessment;
}

export function RiskAssessmentPanel({ assessment }: RiskAssessmentPanelProps) {
  const {
    overallRisk,
    isBombThreat,
    isFirearmThreat,
    contextualFactors,
    recommendations,
    falsePositiveRisk
  } = assessment;

  return (
    <div className="glass-card rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Risk Assessment
        </h3>
        <ThreatLevelBadge level={overallRisk} size="sm" />
      </div>

      {/* Threat Type Indicators */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cn(
          'p-3 rounded border',
          isFirearmThreat 
            ? 'bg-classification-firearm/10 border-classification-firearm/30' 
            : 'bg-muted/30 border-border/50'
        )}>
          <div className="flex items-center gap-2 mb-1">
            {isFirearmThreat ? (
              <AlertTriangle className="w-4 h-4 text-classification-firearm" />
            ) : (
              <CheckCircle className="w-4 h-4 text-threat-safe" />
            )}
            <span className="text-xs font-mono uppercase">Firearm Threat</span>
          </div>
          <p className={cn(
            'text-lg font-bold font-mono',
            isFirearmThreat ? 'text-classification-firearm' : 'text-threat-safe'
          )}>
            {isFirearmThreat ? 'DETECTED' : 'NEGATIVE'}
          </p>
        </div>

        <div className={cn(
          'p-3 rounded border',
          isBombThreat 
            ? 'bg-classification-explosive/10 border-classification-explosive/30' 
            : 'bg-muted/30 border-border/50'
        )}>
          <div className="flex items-center gap-2 mb-1">
            {isBombThreat ? (
              <XCircle className="w-4 h-4 text-classification-explosive" />
            ) : (
              <CheckCircle className="w-4 h-4 text-threat-safe" />
            )}
            <span className="text-xs font-mono uppercase">Bomb Threat</span>
          </div>
          <p className={cn(
            'text-lg font-bold font-mono',
            isBombThreat ? 'text-classification-explosive' : 'text-threat-safe'
          )}>
            {isBombThreat ? 'DETECTED' : 'NEGATIVE'}
          </p>
        </div>
      </div>

      {/* False Positive Risk */}
      <div className="p-3 rounded bg-muted/30 border border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-muted-foreground">
            False Positive Risk
          </span>
          <span className={cn(
            'text-xs font-mono font-bold',
            falsePositiveRisk === 'LOW' && 'text-threat-safe',
            falsePositiveRisk === 'MEDIUM' && 'text-threat-medium',
            falsePositiveRisk === 'HIGH' && 'text-threat-high'
          )}>
            {falsePositiveRisk}
          </span>
        </div>
      </div>

      {/* Contextual Factors */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" />
          Contextual Factors
        </h4>
        <ul className="space-y-1">
          {contextualFactors.map((factor, index) => (
            <li key={index} className="text-xs text-muted-foreground font-mono flex items-start gap-2">
              <span className="text-primary">›</span>
              {factor}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recommendations
        </h4>
        <ul className="space-y-1">
          {recommendations.map((rec, index) => (
            <li 
              key={index} 
              className={cn(
                'text-xs font-mono p-2 rounded',
                index === 0 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-muted-foreground'
              )}
            >
              {index === 0 ? '⚡ ' : '• '}{rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
