import { Shield, Radio } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                SENTINEL AI
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Context-Aware Threat Detection & Risk Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono">
              <Radio className="w-3 h-3 text-status-online animate-pulse" />
              <span className="text-status-online">LIVE</span>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground font-mono">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs font-mono text-primary">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
