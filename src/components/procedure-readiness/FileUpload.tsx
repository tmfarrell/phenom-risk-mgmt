import { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseCSV, generateSampleCSV } from '@/utils/procedureReadiness/csvParser';

interface ParsedMember {
  memberId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
}

interface FileUploadProps {
  onUpload: (members: ParsedMember[]) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadStatus('error');
      setErrorMessage('Please upload a CSV file');
      return;
    }

    try {
      const content = await file.text();
      const members = parseCSV(content);
      
      if (members.length === 0) {
        setUploadStatus('error');
        setErrorMessage('No valid members found in the file');
        return;
      }

      setFileName(file.name);
      setMemberCount(members.length);
      setUploadStatus('success');
      setErrorMessage(null);
      onUpload(members);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse file');
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleLoadSample = useCallback(() => {
    const sampleCSV = generateSampleCSV();
    const members = parseCSV(sampleCSV);
    setFileName('sample_cohort.csv');
    setMemberCount(members.length);
    setUploadStatus('success');
    setErrorMessage(null);
    onUpload(members);
  }, [onUpload]);

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-accent'
            : uploadStatus === 'success'
            ? 'border-success bg-success/5'
            : uploadStatus === 'error'
            ? 'border-destructive bg-destructive/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-3">
          {uploadStatus === 'success' ? (
            <>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{fileName}</p>
                <p className="text-sm text-muted-foreground">{memberCount.toLocaleString()} members loaded</p>
              </div>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">Upload failed</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Drop your member cohort CSV here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        CSV format: patient_id, first_name, last_name, dob, gender, token_1, token_2
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button
        variant="outline"
        onClick={handleLoadSample}
        className="w-full"
      >
        <FileText className="w-4 h-4 mr-2" />
        Load Sample Data (10,000 members)
      </Button>
    </div>
  );
}
