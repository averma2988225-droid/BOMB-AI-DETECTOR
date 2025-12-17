import { type VisualFeature } from '@/lib/threatClassification';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface VisualFeaturesPanelProps {
  features: VisualFeature[];
  title?: string;
}

export function VisualFeaturesPanel({ features, title = 'Visual Feature Analysis' }: VisualFeaturesPanelProps) {
  const detectedCount = features.filter(f => f.detected).length;

  return (
    <div className="glass-card rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <span className="text-xs font-mono text-primary">
          {detectedCount}/{features.length} detected
        </span>
      </div>

      <div className="space-y-2">
        {features.map((feature) => (
          <div 
            key={feature.name}
            className={cn(
              'flex items-center justify-between p-2 rounded border transition-colors',
              feature.detected 
                ? 'bg-threat-critical/10 border-threat-critical/30' 
                : 'bg-muted/30 border-border/50'
            )}
          >
            <div className="flex items-center gap-2">
              {feature.detected ? (
                <div className="w-5 h-5 rounded-full bg-threat-critical/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-threat-critical" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className={cn(
                  'text-sm font-medium',
                  feature.detected ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {feature.description}
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  {feature.name.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            
            {feature.detected && (
              <span className="text-xs font-mono text-threat-critical">
                {(feature.confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
