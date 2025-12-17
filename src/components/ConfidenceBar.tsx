import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getConfidenceColor(value: number): string {
  if (value >= 0.85) return 'bg-threat-safe';
  if (value >= 0.7) return 'bg-threat-low';
  if (value >= 0.5) return 'bg-threat-medium';
  return 'bg-threat-high';
}

export function ConfidenceBar({ 
  value, 
  label, 
  showPercentage = true,
  size = 'md',
  className 
}: ConfidenceBarProps) {
  const percentage = Math.min(100, Math.max(0, value * 100));
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-3';

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className={cn('confidence-bar', heightClass)}>
        <div 
          className={cn('confidence-fill', getConfidenceColor(value))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
