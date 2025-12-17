import { type ThreatLevel } from '@/lib/threatClassification';
import { cn } from '@/lib/utils';
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Flame } from 'lucide-react';

interface ThreatLevelBadgeProps {
  level: ThreatLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
}

const levelConfig: Record<ThreatLevel, { 
  label: string; 
  className: string; 
  icon: typeof Shield;
}> = {
  CRITICAL: {
    label: 'CRITICAL',
    className: 'threat-critical pulse-critical',
    icon: Flame,
  },
  HIGH: {
    label: 'HIGH',
    className: 'threat-high',
    icon: ShieldAlert,
  },
  MEDIUM: {
    label: 'MEDIUM',
    className: 'threat-medium',
    icon: AlertTriangle,
  },
  LOW: {
    label: 'LOW',
    className: 'threat-low',
    icon: Shield,
  },
  SAFE: {
    label: 'SAFE',
    className: 'threat-safe',
    icon: ShieldCheck,
  },
  AMBIGUOUS: {
    label: 'AMBIGUOUS',
    className: 'threat-ambiguous',
    icon: ShieldQuestion,
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function ThreatLevelBadge({ 
  level, 
  size = 'md', 
  showIcon = true,
  pulse = false 
}: ThreatLevelBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 rounded font-mono font-semibold uppercase tracking-wider',
        sizeClasses[size],
        config.className,
        pulse && level === 'CRITICAL' && 'pulse-critical'
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')} />}
      <span>{config.label}</span>
    </div>
  );
}
