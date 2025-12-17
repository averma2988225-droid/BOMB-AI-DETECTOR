import { cn } from '@/lib/utils';
import { FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface ExplanationPanelProps {
  explanation: string;
  requiresHumanReview: boolean;
}

export function ExplanationPanel({ explanation, requiresHumanReview }: ExplanationPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FileText className="w-4 h-4" />
          AI Explanation
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="h-7 px-2"
        >
          {copied ? (
            <Check className="w-3 h-3 text-threat-safe" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>

      {requiresHumanReview && (
        <div className="p-2 rounded bg-threat-ambiguous/10 border border-threat-ambiguous/30">
          <p className="text-xs font-mono text-threat-ambiguous flex items-center gap-1">
            ⚠️ HUMAN REVIEW REQUIRED — Do not act on automated classification alone
          </p>
        </div>
      )}

      <pre className={cn(
        'text-xs font-mono whitespace-pre-wrap p-3 rounded bg-background/50',
        'border border-border/50 max-h-[300px] overflow-y-auto',
        'terminal-text'
      )}>
        {explanation}
      </pre>
    </div>
  );
}
