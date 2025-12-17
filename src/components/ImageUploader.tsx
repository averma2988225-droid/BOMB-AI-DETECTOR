import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, Image as ImageIcon, X, Scan } from 'lucide-react';
import { Button } from './ui/button';

interface ImageUploaderProps {
  onImageSelect: (imageData: { url: string; isXray: boolean }) => void;
  isProcessing: boolean;
}

export function ImageUploader({ onImageSelect, isProcessing }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isXray, setIsXray] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreview(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (preview) {
      onImageSelect({ url: preview, isXray });
    }
  };

  const clearImage = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-colors',
            'flex flex-col items-center justify-center gap-4 min-h-[300px]',
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border/50 hover:border-primary/50'
          )}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drop image here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPG, PNG, WebP (RGB or X-Ray scans)
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-border/50">
            <img 
              src={preview} 
              alt="Upload preview" 
              className="w-full h-auto max-h-[400px] object-contain bg-black/50"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                  <p className="text-sm font-mono text-primary">ANALYZING...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isXray}
                onChange={(e) => setIsXray(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
              />
              <span className="text-sm font-mono">X-Ray Modality</span>
            </label>

            <Button 
              onClick={handleAnalyze} 
              disabled={isProcessing}
              className="flex-1 gap-2"
            >
              <Scan className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Analyze Threat'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
