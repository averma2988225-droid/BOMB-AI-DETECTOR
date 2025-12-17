import { cn } from '@/lib/utils';
import { Activity, Cpu, Database, Shield } from 'lucide-react';

interface SystemStatusProps {
  isProcessing: boolean;
}

export function SystemStatus({ isProcessing }: SystemStatusProps) {
  const systems = [
    { name: 'Classification Engine', icon: Cpu, status: 'online' as const },
    { name: 'Feature Validator', icon: Shield, status: isProcessing ? 'processing' as const : 'online' as const },
    { name: 'Risk Firewall', icon: Database, status: 'online' as const },
    { name: 'XAI Generator', icon: Activity, status: isProcessing ? 'processing' as const : 'online' as const },
  ];

  return (
    <div className="glass-card rounded-lg p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        System Status
      </h3>
      <div className="space-y-2">
        {systems.map((system) => {
          const Icon = system.icon;
          return (
            <div 
              key={system.name}
              className="flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-mono">{system.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  'status-dot',
                  system.status === 'online' && 'status-online',
                  system.status === 'processing' && 'status-processing'
                )} />
                <span className={cn(
                  'text-xs font-mono uppercase',
                  system.status === 'online' && 'text-status-online',
                  system.status === 'processing' && 'text-status-processing'
                )}>
                  {system.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
