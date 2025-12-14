import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadedCSV, CSVRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CSVUploaderProps {
  onUpload: (csv: UploadedCSV) => void;
  uploadedCSV: UploadedCSV | null;
  className?: string;
}

function parseCSV(text: string): { headers: string[]; data: CSVRecord[] } {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return { headers: [], data: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: CSVRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const record: CSVRecord = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const numValue = parseFloat(value);
      record[header] = isNaN(numValue) ? value : numValue;
    });
    data.push(record);
  }

  return { headers, data };
}

function generateSeed(data: CSVRecord[]): number {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onUpload, uploadedCSV, className }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);

    try {
      const text = await file.text();
      const { headers, data } = parseCSV(text);
      
      if (headers.length === 0 || data.length === 0) {
        setError('Invalid CSV file format');
        return;
      }

      const seed = generateSeed(data);
      onUpload({ file, data, headers, seed });
    } catch (e) {
      setError('Failed to parse CSV file');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
          "hover:border-secondary hover:bg-secondary/5",
          isDragActive ? "border-secondary bg-secondary/10" : "border-border",
          uploadedCSV && "border-success bg-success/5"
        )}
      >
        <input {...getInputProps()} id="csv-uploader" aria-label="Upload CSV file" />
        
        <div className="flex flex-col items-center gap-3 text-center">
          {uploadedCSV ? (
            <>
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{uploadedCSV.file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {uploadedCSV.data.length} rows × {uploadedCSV.headers.length} columns
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                "bg-gradient-to-br from-secondary/20 to-secondary/10"
              )}>
                <FileSpreadsheet className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isDragActive ? 'Drop CSV here' : 'Upload CSV Data'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop or click to browse
                </p>
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive mt-3 text-center">{error}</p>
        )}
      </div>

      {uploadedCSV && (
        <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-auto">
          <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
          <div className="text-xs font-mono">
            <div className="flex gap-2 text-secondary font-semibold mb-1">
              {uploadedCSV.headers.slice(0, 5).map(h => (
                <span key={h} className="truncate max-w-[80px]">{h}</span>
              ))}
              {uploadedCSV.headers.length > 5 && <span>+{uploadedCSV.headers.length - 5} more</span>}
            </div>
            {uploadedCSV.data.slice(0, 3).map((row, i) => (
              <div key={i} className="flex gap-2 text-muted-foreground">
                {uploadedCSV.headers.slice(0, 5).map(h => (
                  <span key={h} className="truncate max-w-[80px]">{String(row[h])}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
