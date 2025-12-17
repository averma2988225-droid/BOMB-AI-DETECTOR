import { cn } from '@/lib/utils';
import { Crosshair, Bomb, CircuitBoard, Package, Play } from 'lucide-react';
import { Button } from './ui/button';

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  icon: typeof Crosshair;
  expectedClass: string;
  predictions: Array<{ class: string; confidence: number }>;
  features: Array<{ name: string; detected: boolean; confidence: number; description: string }>;
}

const demoScenarios: DemoScenario[] = [
  {
    id: 'firearm-correct',
    name: 'Handgun Detection (Corrected)',
    description: 'Demonstrates CORRECT classification of a handgun — NOT wire bundle',
    icon: Crosshair,
    expectedClass: 'firearm',
    predictions: [
      { class: 'firearm', confidence: 0.92 },
      { class: 'benign_object', confidence: 0.05 },
    ],
    features: [
      { name: 'barrel_structure', detected: true, confidence: 0.95, description: 'Barrel-like cylindrical structure' },
      { name: 'trigger_guard', detected: true, confidence: 0.91, description: 'Trigger guard mechanism' },
      { name: 'grip_geometry', detected: true, confidence: 0.88, description: 'Ergonomic grip structure' },
      { name: 'metallic_frame', detected: true, confidence: 0.93, description: 'Metallic frame construction' },
      { name: 'slide_mechanism', detected: true, confidence: 0.86, description: 'Slide/action mechanism' },
      { name: 'wire_bundle', detected: false, confidence: 0, description: 'Wire bundle or circuitry' },
      { name: 'battery_pack', detected: false, confidence: 0, description: 'Battery or power source' },
      { name: 'detonator', detected: false, confidence: 0, description: 'Detonator mechanism' },
    ],
  },
  {
    id: 'explosive-real',
    name: 'Explosive Device (IED)',
    description: 'True explosive with ≥2 supporting components',
    icon: Bomb,
    expectedClass: 'explosive_device',
    predictions: [
      { class: 'explosive_device', confidence: 0.89 },
      { class: 'suspicious_component', confidence: 0.08 },
    ],
    features: [
      { name: 'barrel_structure', detected: false, confidence: 0, description: 'Barrel-like cylindrical structure' },
      { name: 'trigger_guard', detected: false, confidence: 0, description: 'Trigger guard mechanism' },
      { name: 'grip_geometry', detected: false, confidence: 0, description: 'Ergonomic grip structure' },
      { name: 'wire_bundle', detected: true, confidence: 0.92, description: 'Wire bundle or circuitry' },
      { name: 'battery_pack', detected: true, confidence: 0.88, description: 'Battery or power source' },
      { name: 'timer_display', detected: true, confidence: 0.85, description: 'Timer or electronic display' },
      { name: 'container', detected: true, confidence: 0.91, description: 'Container or housing' },
      { name: 'detonator', detected: true, confidence: 0.87, description: 'Detonator mechanism' },
    ],
  },
  {
    id: 'suspicious-only',
    name: 'Suspicious Component (Single)',
    description: 'Single wire bundle — NOT classified as explosive',
    icon: CircuitBoard,
    expectedClass: 'suspicious_component',
    predictions: [
      { class: 'suspicious_component', confidence: 0.72 },
      { class: 'benign_object', confidence: 0.21 },
    ],
    features: [
      { name: 'barrel_structure', detected: false, confidence: 0, description: 'Barrel-like cylindrical structure' },
      { name: 'trigger_guard', detected: false, confidence: 0, description: 'Trigger guard mechanism' },
      { name: 'wire_bundle', detected: true, confidence: 0.75, description: 'Wire bundle or circuitry' },
      { name: 'battery_pack', detected: false, confidence: 0, description: 'Battery or power source' },
      { name: 'timer_display', detected: false, confidence: 0, description: 'Timer or electronic display' },
      { name: 'container', detected: false, confidence: 0, description: 'Container or housing' },
      { name: 'detonator', detected: false, confidence: 0, description: 'Detonator mechanism' },
    ],
  },
  {
    id: 'benign-laptop',
    name: 'Benign Object (Laptop)',
    description: 'Common electronics — correctly classified as safe',
    icon: Package,
    expectedClass: 'benign_object',
    predictions: [
      { class: 'benign_object', confidence: 0.94 },
      { class: 'suspicious_component', confidence: 0.04 },
    ],
    features: [
      { name: 'barrel_structure', detected: false, confidence: 0, description: 'Barrel-like cylindrical structure' },
      { name: 'trigger_guard', detected: false, confidence: 0, description: 'Trigger guard mechanism' },
      { name: 'grip_geometry', detected: false, confidence: 0, description: 'Ergonomic grip structure' },
      { name: 'wire_bundle', detected: false, confidence: 0, description: 'Wire bundle or circuitry' },
      { name: 'battery_pack', detected: false, confidence: 0, description: 'Battery or power source' },
      { name: 'detonator', detected: false, confidence: 0, description: 'Detonator mechanism' },
    ],
  },
  {
    id: 'ambiguous',
    name: 'Ambiguous Detection',
    description: 'Low confidence difference — triggers human review',
    icon: Package,
    expectedClass: 'benign_object',
    predictions: [
      { class: 'suspicious_component', confidence: 0.48 },
      { class: 'benign_object', confidence: 0.42 },
    ],
    features: [
      { name: 'barrel_structure', detected: false, confidence: 0.15, description: 'Barrel-like cylindrical structure' },
      { name: 'wire_bundle', detected: true, confidence: 0.52, description: 'Wire bundle or circuitry' },
      { name: 'battery_pack', detected: false, confidence: 0.25, description: 'Battery or power source' },
    ],
  },
];

interface DemoScenariosProps {
  onSelectScenario: (scenario: DemoScenario) => void;
  selectedId?: string;
}

export function DemoScenarios({ onSelectScenario, selectedId }: DemoScenariosProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Demo Scenarios
      </h3>
      <div className="grid gap-2">
        {demoScenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isSelected = selectedId === scenario.id;
          
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className={cn(
                'w-full p-3 rounded-lg border text-left transition-all',
                'hover:bg-secondary/50 hover:border-primary/30',
                isSelected 
                  ? 'bg-primary/10 border-primary/50' 
                  : 'bg-card/50 border-border/50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded flex items-center justify-center',
                  isSelected ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Icon className={cn(
                    'w-4 h-4',
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{scenario.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {scenario.description}
                  </p>
                </div>
                {isSelected && (
                  <Play className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { demoScenarios };
