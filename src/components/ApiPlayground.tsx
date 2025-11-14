import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { PlayCircle, Code, Plus, Trash2, Copy, Check, ChevronsUpDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PhenomModel {
  id: string;
  model_name: string;
  indication_type: string;
  indication_code: string;
  indication_new_onset?: boolean;
  prediction_timeframe_yrs?: number | null;
  min_patient_age?: number | null;
  max_patient_age?: number | null;
}

interface PatientData {
  patient_id: string;
  birth_date: string;
  sex: 'M' | 'F' | '';
  zip3: string;
}

interface ClinicalHistoryEntry {
  id: string;
  type: 'diagnosis' | 'medication' | 'procedure' | 'lab' | '';
  code: string;
  code_system: string;
  date: string;
}

interface Diagnosis {
  code: string;
  code_system: string;
  start_date: string;
}

interface Medication {
  rx_code: string;
  code_system: string;
  start_date: string;
}

interface Procedure {
  procedure_code: string;
  code_system: string;
  procedure_date: string;
}

interface LabResult {
  lab_code: string;
  result_date: string;
}

interface PatientHistory {
  patient: PatientData;
  diagnosis?: Diagnosis[];
  medications?: Medication[];
  procedures?: Procedure[];
  lab_results?: LabResult[];
}

// Helper function to format prediction timeframe
const formatPredictionTimeframe = (years: number | null) => {
  if (!years) return null;
  
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  return `${years} yr${years > 1 ? 's' : ''}`;
};

export function ApiPlayground() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [showCode, setShowCode] = useState(false);
  const [codeTab, setCodeTab] = useState('curl');
  const [phenomModels, setPhenomModels] = useState<PhenomModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [outcomePopoverOpen, setOutcomePopoverOpen] = useState(false);
  
  const [patientData, setPatientData] = useState<PatientData>({
    patient_id: 'demo_patient_001',
    birth_date: '1964-05-18',
    sex: 'F',
    zip3: '021'
  });

  const [clinicalHistory, setClinicalHistory] = useState<ClinicalHistoryEntry[]>([]);

  const [selectedOutcomeIds, setSelectedOutcomeIds] = useState<string[]>([]);

  // Fetch phenom models from database
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('phenom_models')
          .select('id, model_name, indication_type, indication_code, indication_new_onset, prediction_timeframe_yrs, min_patient_age, max_patient_age')
          .order('model_name', { ascending: true });

        if (error) {
          console.error('Error fetching models:', error);
          toast({
            title: "Error Loading Outcomes",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setPhenomModels((data || []) as PhenomModel[]);
        }
      } catch (error) {
        console.error('Unexpected error fetching models:', error);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  // Handle outcome selection toggle
  const toggleOutcome = (outcomeId: string) => {
    setSelectedOutcomeIds(prev => 
      prev.includes(outcomeId)
        ? prev.filter(id => id !== outcomeId)
        : [...prev, outcomeId]
    );
  };

  // Clinical history management
  const addClinicalHistoryEntry = () => {
    const newEntry: ClinicalHistoryEntry = {
      id: Date.now().toString(),
      type: '',
      code: '',
      code_system: '',
      date: ''
    };
    setClinicalHistory([...clinicalHistory, newEntry]);
  };

  const updateClinicalHistoryEntry = (id: string, field: keyof ClinicalHistoryEntry, value: string) => {
    setClinicalHistory(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const removeClinicalHistoryEntry = (id: string) => {
    setClinicalHistory(prev => prev.filter(entry => entry.id !== id));
  };

  const getDefaultCodeSystem = (type: string): string => {
    switch (type) {
      case 'diagnosis': return 'ICD10';
      case 'medication': return 'RXNORM';
      case 'procedure': return 'CPT';
      case 'lab': return 'LOINC';
      default: return '';
    }
  };

  const getCodeLabel = (type: string): string => {
    switch (type) {
      case 'diagnosis': return 'Diagnosis Code';
      case 'medication': return 'Medication Code';
      case 'procedure': return 'Procedure Code';
      case 'lab': return 'LOINC Code';
      default: return 'Code';
    }
  };

  const getCodeSystemOptions = (type: string): Array<{value: string, label: string}> => {
    switch (type) {
      case 'diagnosis': return [{value: 'ICD10', label: 'ICD-10'}, {value: 'ICD9', label: 'ICD-9'}];
      case 'medication': return [{value: 'RXNORM', label: 'RxNorm'}, {value: 'NDC', label: 'NDC'}];
      case 'procedure': return [{value: 'CPT', label: 'CPT'}, {value: 'HCPCS', label: 'HCPCS'}, {value: 'ICD10PCS', label: 'ICD-10-PCS'}];
      case 'lab': return [{value: 'LOINC', label: 'LOINC'}];
      default: return [];
    }
  };

  // Generate mock realistic response based on input
  const generateMockResponse = (history: PatientHistory): any => {
    // Calculate risk based on age, conditions, lab values
    const birthYear = parseInt(history.patient.birth_date.split('-')[0]);
    const age = 2025 - birthYear;
    
    // Base probability on age
    let baseProbability = 0.05;
    if (age > 70) baseProbability = 0.30;
    else if (age > 60) baseProbability = 0.20;
    else if (age > 50) baseProbability = 0.10;
    
    // Increase based on clinical history
    const clinicalCount = (history.diagnosis?.length || 0) + 
                         (history.medications?.length || 0) +
                         (history.procedures?.length || 0) +
                         (history.lab_results?.length || 0);
    baseProbability += clinicalCount * 0.04;
    
    // Generate results for each selected outcome
    const items = selectedOutcomeIds.map((outcomeId, index) => {
      // Add slight variation for each outcome
      const variation = (index * 0.05) - 0.025;
      const probability = Math.min(Math.max(baseProbability + variation, 0.05), 0.95);
      const margin = probability * 0.08;
      
      const relativeProbability = probability / 0.125; // Assuming population baseline of 0.34
      const relMargin = relativeProbability * 0.08;
      
      return {
        patient_id: history.patient.patient_id,
        outcome_id: outcomeId,
        probability: parseFloat(probability.toFixed(4)),
        prob_upper_95_percent_bound: parseFloat((probability + margin).toFixed(4)),
        prob_lower_95_percent_bound: parseFloat((probability - margin).toFixed(4)),
        relative_probability: parseFloat(relativeProbability.toFixed(2)),
        rel_upper_95_percent_bound: parseFloat((relativeProbability + relMargin).toFixed(2)),
        rel_lower_95_percent_bound: parseFloat((relativeProbability - relMargin).toFixed(2)),
        bin_id: Math.floor(probability * 100),
        num_bins: 100
      };
    });
    
    return {
      items,
      next_page_token: null,
      total_rows: items.length
    };
  };

  const buildPatientHistory = (): PatientHistory => {
    // Convert unified clinical history back to separate arrays
    const diagnoses: Diagnosis[] = [];
    const medications: Medication[] = [];
    const procedures: Procedure[] = [];
    const lab_results: LabResult[] = [];
    
    clinicalHistory.forEach(entry => {
      if (!entry.code || !entry.type) return;
      
      switch (entry.type) {
        case 'diagnosis':
          diagnoses.push({
            code: entry.code,
            code_system: entry.code_system,
            start_date: entry.date
          });
          break;
        case 'medication':
          medications.push({
            rx_code: entry.code,
            code_system: entry.code_system,
            start_date: entry.date
          });
          break;
        case 'procedure':
          procedures.push({
            procedure_code: entry.code,
            code_system: entry.code_system,
            procedure_date: entry.date
          });
          break;
        case 'lab':
          lab_results.push({
            lab_code: entry.code,
            result_date: entry.date
          });
          break;
      }
    });
    
    const history: PatientHistory = {
      patient: patientData
    };

    if (diagnoses.length > 0) {
      history.diagnosis = diagnoses;
    }

    if (lab_results.length > 0) {
      history.lab_results = lab_results;
    }
    
    if (medications.length > 0) {
      history.medications = medications;
    }
    
    if (procedures.length > 0) {
      history.procedures = procedures;
    }
    
    return history;
  };

  const handleRunInference = async () => {
    if (selectedOutcomeIds.length === 0) {
      toast({
        title: "No Outcomes Selected",
        description: "Please select at least one outcome to run inference.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const history = buildPatientHistory();
    const mockResponse = generateMockResponse(history);
    setResponse(mockResponse);
    setLoading(false);
    
    toast({
      title: "Inference Complete",
      description: `Mock predictions generated for ${selectedOutcomeIds.length} outcome${selectedOutcomeIds.length !== 1 ? 's' : ''}`,
    });
  };

  const generateCurlCode = () => {
    const history = buildPatientHistory();
    const requestBody = {
      outcome_ids: selectedOutcomeIds,
      patient_history: history
    };
    
    return `curl -X POST https://phenom-api-sandbox.iddev.om1.com/v1/jobs/from-patient \\
  -H "Authorization: Bearer <jwt>" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(requestBody, null, 2)}'`;
  };

  const generatePythonCode = () => {
    const history = buildPatientHistory();
    return `import requests

endpoint = "https://phenom-api-sandbox.iddev.om1.com/v1/jobs/from-patient"
headers = {
    "Authorization": "Bearer <jwt>",
    "Content-Type": "application/json"
}

payload = ${JSON.stringify({
  outcome_ids: selectedOutcomeIds,
  patient_history: history
}, null, 2)}

response = requests.post(endpoint, json=payload, headers=headers)
result = response.json()
print(result)`;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-green-600" />
              API Playground
            </CardTitle>
            <CardDescription className="text-left mt-2">
              Fill in patient data and see a simulated API response with generated code examples
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCode(true)}
              className="gap-2 bg-gray-100 hover:bg-gray-200"
            >
              <Code className="h-4 w-4" />
              View Code
            </Button>
            <Button 
              onClick={handleRunInference} 
              className="gap-2"
              disabled={loading}
            >
              <PlayCircle className="h-4 w-4" />
              Run
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>

        {/* Form Section */}
        <div className="space-y-4 text-left">
            {/* Patient Demographics Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-left">
                Patient Demographics
                <span className="text-red-500 ml-1">*</span>
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="patient_id" className="text-xs text-left text-gray-500">Patient ID</Label>
                  <Input
                    id="patient_id"
                    value={patientData.patient_id}
                    onChange={(e) => setPatientData({...patientData, patient_id: e.target.value})}
                    placeholder="e.g., patient_001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="text-xs text-left text-gray-500">Birth Date</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={patientData.birth_date}
                    onChange={(e) => setPatientData({...patientData, birth_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex" className="text-xs text-left text-gray-500">Sex</Label>
                  <Select 
                    value={patientData.sex} 
                    onValueChange={(value: 'M' | 'F') => setPatientData({...patientData, sex: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="M">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip3" className="text-xs text-left text-gray-500">ZIP3</Label>
                  <Input
                    id="zip3"
                    value={patientData.zip3}
                    onChange={(e) => setPatientData({...patientData, zip3: e.target.value})}
                    placeholder="e.g., 021"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            {/* Clinical History Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-left">Clinical History</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addClinicalHistoryEntry}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Entry
                </Button>
              </div>
              {clinicalHistory.length === 0 && (
                <p className="text-xs text-gray-500 italic">Optional - Click "Add Entry" to include clinical history</p>
              )}
              {clinicalHistory.map((entry) => (
                <div key={entry.id} className="grid grid-cols-12 gap-2 items-end border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-left text-gray-500">Type</Label>
                    <Select 
                      value={entry.type}
                      onValueChange={(value) => {
                        updateClinicalHistoryEntry(entry.id, 'type', value);
                        // Set default code system when type changes
                        updateClinicalHistoryEntry(entry.id, 'code_system', getDefaultCodeSystem(value));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diagnosis">Diagnosis</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="procedure">Procedure</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {entry.type && (
                    <>
                      <div className="col-span-4 space-y-1">
                        <Label className="text-xs text-left text-gray-500">{getCodeLabel(entry.type)}</Label>
                        <Input
                          value={entry.code}
                          onChange={(e) => updateClinicalHistoryEntry(entry.id, 'code', e.target.value)}
                          placeholder={`Enter ${entry.type} code`}
                        />
                      </div>
                      {entry.type !== 'lab' && (
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs text-left text-gray-500">Code System</Label>
                          <Select 
                            value={entry.code_system}
                            onValueChange={(value) => updateClinicalHistoryEntry(entry.id, 'code_system', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getCodeSystemOptions(entry.type).map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className={cn("space-y-1", entry.type === 'lab' ? "col-span-5" : "col-span-3")}>
                        <Label className="text-xs text-left text-gray-500">Date</Label>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateClinicalHistoryEntry(entry.id, 'date', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <div className="col-span-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeClinicalHistoryEntry(entry.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Outcome Selection */}
            <div className="space-y-3 max-w-[50%]">
              <h3 className="font-semibold text-sm text-left">
                Outcome(s)
                <span className="text-red-500 ml-1">*</span>
              </h3>
              <Popover open={outcomePopoverOpen} onOpenChange={setOutcomePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={outcomePopoverOpen}
                    className="w-full justify-between text-left font-normal"
                    disabled={loadingModels}
                  >
                    <span className="truncate">
                      {loadingModels ? (
                        "Loading outcomes..."
                      ) : selectedOutcomeIds.length === 0 ? (
                        "Select outcomes..."
                      ) : selectedOutcomeIds.length === 1 ? (
                        phenomModels.find(m => m.id === selectedOutcomeIds[0])?.model_name
                      ) : (
                        `${selectedOutcomeIds.length} outcomes selected`
                      )}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search outcomes..." />
                    <CommandList>
                      <CommandEmpty>No outcome found.</CommandEmpty>
                      <CommandGroup>
                        {phenomModels.map((model) => (
                          <CommandItem
                            key={model.id}
                            value={model.model_name}
                            onSelect={() => toggleOutcome(model.id)}
                            className="flex items-start gap-2 py-3"
                          >
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0 mt-0.5",
                                selectedOutcomeIds.includes(model.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{model.model_name}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {model.indication_new_onset && (
                                  <Badge variant="secondary" className="text-xs">
                                    New Onset
                                  </Badge>
                                )}
                                {model.prediction_timeframe_yrs && (
                                  <Badge variant="secondary" className="text-xs">
                                    {formatPredictionTimeframe(model.prediction_timeframe_yrs)}
                                  </Badge>
                                )}
                                {(model.min_patient_age || model.max_patient_age) && (
                                  <Badge variant="secondary" className="text-xs">
                                    Age: {model.min_patient_age && !model.max_patient_age 
                                      ? `${model.min_patient_age}+` 
                                      : `${model.min_patient_age || '0'}-${model.max_patient_age}`}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Selected outcomes badges */}
              {selectedOutcomeIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedOutcomeIds.map((outcomeId) => {
                    const model = phenomModels.find(m => m.id === outcomeId);
                    return (
                      <Badge key={outcomeId} variant="secondary" className="gap-1">
                        {model?.model_name}
                        <button
                          onClick={() => toggleOutcome(outcomeId)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Response Section - Shown at bottom after running inference */}
          {(loading || response) && (
            <div className="mt-8 pt-6 border-t">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Running inference...</p>
                </div>
              ) : response && (
              <div className="space-y-4">
                
                
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-left">Prediction Results</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        Success
                    </Badge>
                    </div>
                  <div className="space-y-4">
                    {response.items.map((item: any, index: number) => {
                      const modelName = phenomModels.find(m => m.id === item.outcome_id)?.model_name || item.outcome_id;
                      return (
                        <div key={index} className="p-4 rounded-md">
                          <h4 className="font-medium text-sm mb-3 text-left">{modelName}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs mb-1 italic">Patient ID</p>
                              <p className="font-mono">{item.patient_id}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1 italic">Probability</p>
                              <p className="font-mono text-lg font-bold text-blue-600">
                                {(item.probability * 100).toFixed(2)}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                95% CI: {(item.prob_lower_95_percent_bound * 100).toFixed(2)}% - {(item.prob_upper_95_percent_bound * 100).toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1 italic">Relative Risk</p>
                              <p className="font-mono text-lg font-bold text-orange-600">
                                {item.relative_probability}x
                              </p>
                              <p className="text-xs text-muted-foreground">
                                95% CI: {item.rel_lower_95_percent_bound}x - {item.rel_upper_95_percent_bound}x
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2 text-left">Full JSON Response</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs text-left">
                    <code>{JSON.stringify(response, null, 2)}</code>
                  </pre>
                </div>
              </div>
              )}
            </div>
          )}
      </CardContent>

      {/* Code Modal */}
      <Dialog open={showCode} onOpenChange={setShowCode}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>API Request Code</DialogTitle>
          </DialogHeader>
          <Tabs value={codeTab} onValueChange={setCodeTab} className="mt-4">
            <TabsList className="grid grid-cols-2 justify-start w-fit">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curl" className="mt-4">
              <div className="flex items-center justify-end mb-2">
                <Button size="sm" variant="outline" onClick={() => copyCode(generateCurlCode())}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs text-left">
                <code>{generateCurlCode()}</code>
              </pre>
            </TabsContent>

            <TabsContent value="python" className="mt-4">
              <div className="flex items-center justify-end mb-2">
                <Button size="sm" variant="outline" onClick={() => copyCode(generatePythonCode())}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs text-left">
                <code>{generatePythonCode()}</code>
              </pre>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

