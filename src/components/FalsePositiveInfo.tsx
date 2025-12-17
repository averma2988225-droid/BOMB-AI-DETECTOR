import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, Shield, Zap } from 'lucide-react';

export function FalsePositiveInfo() {
  const features = [
    {
      icon: Shield,
      title: 'Strict Class Taxonomy',
      description: 'Firearms can NEVER be misclassified as wire bundles or suspicious components',
    },
    {
      icon: Zap,
      title: 'Visual Feature Validation',
      description: 'Barrel + trigger + grip detection forces firearm classification',
    },
    {
      icon: AlertTriangle,
      title: 'Confidence Gating',
      description: '<15% confidence gap triggers AMBIGUOUS status and human review',
    },
    {
      icon: CheckCircle,
      title: 'Contextual Risk Firewall',
      description: 'Firearm detection ≠ bomb threat. Proper escalation paths enforced',
    },
  ];

  return (
    <div className="glass-card rounded-lg p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          How SENTINEL AI Reduces False Positives
        </h3>
        <p className="text-xs text-muted-foreground">
          Multi-layer validation prevents misclassification errors
        </p>
      </div>

      <div className="grid gap-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div 
              key={index}
              className="flex items-start gap-3 p-2 rounded bg-muted/30"
            >
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
