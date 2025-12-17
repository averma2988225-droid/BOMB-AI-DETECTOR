import { type ObjectClass } from '@/lib/threatClassification';
import { cn } from '@/lib/utils';
import { Crosshair, Bomb, CircuitBoard, Package } from 'lucide-react';

interface ClassificationBadgeProps {
  classification: ObjectClass;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
}

const classConfig: Record<ObjectClass, {
  label: string;
  description: string;
  className: string;
  icon: typeof Crosshair;
}> = {
  firearm: {
    label: 'FIREARM',
    description: 'Handgun, rifle, or gun-like object',
    className: 'bg-classification-firearm/20 text-classification-firearm border-classification-firearm/30',
    icon: Crosshair,
  },
  explosive_device: {
    label: 'EXPLOSIVE',
    description: 'IED, bomb, or detonator',
    className: 'bg-classification-explosive/20 text-classification-explosive border-classification-explosive/30',
    icon: Bomb,
  },
  suspicious_component: {
    label: 'SUSPICIOUS',
    description: 'Wires, batteries, or unusual circuitry',
    className: 'bg-classification-suspicious/20 text-classification-suspicious border-classification-suspicious/30',
    icon: CircuitBoard,
  },
  benign_object: {
    label: 'BENIGN',
    description: 'Bags, electronics, or tools',
    className: 'bg-classification-benign/20 text-classification-benign border-classification-benign/30',
    icon: Package,
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function ClassificationBadge({ 
  classification, 
  confidence,
  size = 'md' 
}: ClassificationBadgeProps) {
  const config = classConfig[classification];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-2 rounded border font-mono font-medium',
        sizeClasses[size],
        config.className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5')} />
      <span>{config.label}</span>
      {confidence !== undefined && (
        <span className="opacity-70">({(confidence * 100).toFixed(0)}%)</span>
      )}
    </div>
  );
}
