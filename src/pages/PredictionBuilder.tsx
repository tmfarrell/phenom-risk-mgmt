import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, X, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PatientCodes {
  patientId: string;
  diagnosis: string[];
  procedures: string[];
  medications: string[];
  labs: string[];
}

export default function PredictionBuilder() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<PatientCodes[]>([]);
  const [currentPatient, setCurrentPatient] = useState<PatientCodes>({
    patientId: '',
    diagnosis: [],
    procedures: [],
    medications: [],
    labs: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);

  const [inputValues, setInputValues] = useState({
    diagnosis: '',
    procedure: '',
    medication: '',
    lab: ''
  });

  const addCode = (type: 'diagnosis' | 'procedures' | 'medications' | 'labs', value: string) => {
    if (!value.trim()) return;
    
    setCurrentPatient(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));
    
    setInputValues(prev => ({
      ...prev,
      [type === 'diagnosis' ? 'diagnosis' : type === 'procedures' ? 'procedure' : type === 'medications' ? 'medication' : 'lab']: ''
    }));
  };

  const removeCode = (type: 'diagnosis' | 'procedures' | 'medications' | 'labs', index: number) => {
    setCurrentPatient(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const addPatient = () => {
    if (!currentPatient.patientId.trim()) {
      toast({
        title: "Patient ID required",
        description: "Please enter a patient ID",
        variant: "destructive"
      });
      return;
    }

    setPatients(prev => [...prev, currentPatient]);
    setCurrentPatient({
      patientId: '',
      diagnosis: [],
      procedures: [],
      medications: [],
      labs: []
    });
    
    toast({
      title: "Patient added",
      description: `Patient ${currentPatient.patientId} has been added to the prediction batch`
    });
  };

  const removePatient = (index: number) => {
    setPatients(prev => prev.filter((_, i) => i !== index));
  };

  const generatePredictions = async () => {
    if (patients.length === 0) {
      toast({
        title: "No patients",
        description: "Please add at least one patient before generating predictions",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: Call your prediction API here
      // const response = await supabase.functions.invoke('generate-predictions', {
      //   body: { patients }
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPredictions({
        status: 'success',
        totalPatients: patients.length,
        completedAt: new Date().toISOString()
      });
      
      toast({
        title: "Predictions generated",
        description: `Successfully generated predictions for ${patients.length} patient(s)`
      });
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate predictions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Prediction Builder</h1>
          <p className="text-muted-foreground">
            Generate predictions for patients based on their clinical codes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Patient Data</CardTitle>
              <CardDescription>
                Enter patient ID and associated clinical codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  placeholder="Enter patient ID"
                  value={currentPatient.patientId}
                  onChange={(e) => setCurrentPatient(prev => ({ ...prev, patientId: e.target.value }))}
                />
              </div>

              <Tabs defaultValue="diagnosis" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                  <TabsTrigger value="procedures">Procedures</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="labs">Labs</TabsTrigger>
                </TabsList>

                <TabsContent value="diagnosis" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter ICD-10 code"
                      value={inputValues.diagnosis}
                      onChange={(e) => setInputValues(prev => ({ ...prev, diagnosis: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addCode('diagnosis', inputValues.diagnosis)}
                    />
                    <Button size="icon" onClick={() => addCode('diagnosis', inputValues.diagnosis)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPatient.diagnosis.map((code, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {code}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeCode('diagnosis', idx)} />
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="procedures" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter CPT code"
                      value={inputValues.procedure}
                      onChange={(e) => setInputValues(prev => ({ ...prev, procedure: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addCode('procedures', inputValues.procedure)}
                    />
                    <Button size="icon" onClick={() => addCode('procedures', inputValues.procedure)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPatient.procedures.map((code, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {code}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeCode('procedures', idx)} />
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="medications" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter medication code"
                      value={inputValues.medication}
                      onChange={(e) => setInputValues(prev => ({ ...prev, medication: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addCode('medications', inputValues.medication)}
                    />
                    <Button size="icon" onClick={() => addCode('medications', inputValues.medication)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPatient.medications.map((code, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {code}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeCode('medications', idx)} />
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="labs" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter lab code"
                      value={inputValues.lab}
                      onChange={(e) => setInputValues(prev => ({ ...prev, lab: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addCode('labs', inputValues.lab)}
                    />
                    <Button size="icon" onClick={() => addCode('labs', inputValues.lab)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPatient.labs.map((code, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {code}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeCode('labs', idx)} />
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={addPatient} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient to Batch
              </Button>
            </CardContent>
          </Card>

          {/* Patient List */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Batch ({patients.length})</CardTitle>
              <CardDescription>
                Patients ready for prediction generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {patients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No patients added yet
                  </p>
                ) : (
                  patients.map((patient, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{patient.patientId}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePatient(idx)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        {patient.diagnosis.length > 0 && (
                          <div>
                            <span className="font-semibold">Diagnosis:</span> {patient.diagnosis.join(', ')}
                          </div>
                        )}
                        {patient.procedures.length > 0 && (
                          <div>
                            <span className="font-semibold">Procedures:</span> {patient.procedures.join(', ')}
                          </div>
                        )}
                        {patient.medications.length > 0 && (
                          <div>
                            <span className="font-semibold">Medications:</span> {patient.medications.join(', ')}
                          </div>
                        )}
                        {patient.labs.length > 0 && (
                          <div>
                            <span className="font-semibold">Labs:</span> {patient.labs.join(', ')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Button
                onClick={generatePredictions}
                disabled={patients.length === 0 || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Predictions...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Predictions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {predictions && (
          <Card>
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Status: <Badge variant="default">{predictions.status}</Badge></p>
                <p>Total Patients: {predictions.totalPatients}</p>
                <p>Completed At: {new Date(predictions.completedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
