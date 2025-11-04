import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Upload, PlayCircle, Database, FileCheck, Copy, Trash2, Eye, EyeOff, Plus, AlertTriangle, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  visible: boolean;
}

export default function PhenomAPIDocs() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const generateApiKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your API key",
        variant: "destructive",
      });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `pk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: null,
      visible: true,
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowCreateForm(false);
    
    toast({
      title: "API Key Created",
      description: "Your new API key has been generated. Make sure to copy it now as you won't be able to see it again.",
    });
  };

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, visible: !key.visible } : key
    ));
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${keyName} copied to clipboard`,
    });
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    setKeyToDelete(null);
    toast({
      title: "API Key Deleted",
      description: "The API key has been permanently revoked",
    });
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 12)}${'•'.repeat(20)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-start">
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold text-blue-900 text-left">PhenOM Inference API</h1>
        </div>
      </div>
      <div className="p-6">
        <div className="max-w-[1250px] mx-auto">
          <div className="flex flex-col space-y-6">

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-auto inline-flex h-11 p-1.5">
            <TabsTrigger value="overview" className="text-sm px-6">Overview</TabsTrigger>
            <TabsTrigger value="quickstart" className="text-sm px-6">Quick Start</TabsTrigger>
            <TabsTrigger value="reference" className="text-sm px-6">API Reference</TabsTrigger>
            <TabsTrigger value="apikeys" className="text-sm px-6">API Keys</TabsTrigger>
            <TabsTrigger value="billing" className="text-sm px-6">Usage & Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 text-left">
            <Card>
              <CardHeader>
                <CardTitle>API Overview</CardTitle>
                <CardDescription>Run large-scale batch inference jobs and real-time predictions using PhenOM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Base URL</h3>
                  <code className="block bg-muted p-3 rounded-md">
                    https://api.om1.com/phenom/v1
                  </code>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    All API requests require OAuth2 authentication via Bearer token (Auth0).
                  </p>
                  <code className="block bg-muted p-3 rounded-md text-sm">
                    Authorization: Bearer &lt;jwt&gt;
                  </code>
                </div>

                

                <div>
                  <h3 className="font-semibold mb-2">Security & Compliance</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>HIPAA-compliant infrastructure with BAA coverage</li>
                    <li>Tenant-scoped resources resolved from JWT claims</li>
                    <li>SSE-S3 encryption at rest, TLS in transit</li>
                    <li>PHI accepted only in uploaded data, never in metadata</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inference Methods</CardTitle>
                <CardDescription>Choose the right approach for your use case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">Batch</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Process large-volume patient data asynchronously through a multi-step flow.
                    </p>
                    <div>
                      <p className="text-sm font-semibold mb-2">Best for:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Processing thousands to millions of patients</li>
                        <li>Periodic risk assessments (weekly, monthly, quarterly)</li>
                        <li>Population health management</li>
                        <li>Research and analytics workloads</li>
                        <li>Non-time-sensitive predictions</li>
                      </ul>
                    </div>
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-xs">Async Processing</Badge>
                      <Badge variant="secondary" className="text-xs ml-2">High Volume</Badge>
                    </div>

                    <div className="pt-4 mt-4">
                      <p className="text-sm font-semibold mb-3">How to:</p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-blue-600 mt-0.5">1.</span>
                          <div>
                            <p className="text-xs font-medium">Create a Batch</p>
                            <p className="text-xs text-muted-foreground">Reserve a staging area for your data upload</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-blue-600 mt-0.5">2.</span>
                          <div>
                            <p className="text-xs font-medium">Upload Files</p>
                            <p className="text-xs text-muted-foreground">Upload patient data via S3 presigned multipart or SFTP</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-blue-600 mt-0.5">3.</span>
                          <div>
                            <p className="text-xs font-medium">Finalize</p>
                            <p className="text-xs text-muted-foreground">Snapshot an immutable manifest of uploaded data</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-blue-600 mt-0.5">4.</span>
                          <div>
                            <p className="text-xs font-medium">Validate (Optional)</p>
                            <p className="text-xs text-muted-foreground">Validate data using the same rules as the job run</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-blue-600 mt-0.5">5.</span>
                          <div>
                            <p className="text-xs font-medium">Start & Monitor</p>
                            <p className="text-xs text-muted-foreground">Start the async job, poll for status, fetch paginated results</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg">Real-Time</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Generate predictions for individual patients with low latency responses.
                    </p>
                    <div>
                      <p className="text-sm font-semibold mb-2">Best for:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Point-of-care clinical decision support</li>
                        <li>Individual patient risk assessments</li>
                        <li>Real-time care coordination</li>
                        <li>Immediate intervention decisions</li>
                        <li>Interactive patient care applications</li>
                      </ul>
                    </div>
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-xs">Low Latency</Badge>
                      <Badge variant="secondary" className="text-xs ml-2">Single or Low Patient Volume</Badge>
                    </div>

                    <div className="pt-4 mt-4">
                      <p className="text-sm font-semibold mb-3">How to:</p>
                      <ul className="list-disc list-inside text-xs space-y-2">
                        <li>Recieve predictions in real-time by submitting a patient history JSON object</li>
                        <li>Use the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/v1/jobs/from-patient</code> endpoint for single patient predictions</li>
                        <li>
                        Use the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/v1/jobs/from-patients</code> endpoint for multiple patient predictions
                          <ul className="list-disc list-inside ml-6 mt-2 text-muted-foreground">
                            <li>
                              Limited to 10 patients at a time
                            </li>
                          </ul>
                        </li>
                        
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reference" className="space-y-4">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <iframe 
                  src="/redoc.html" 
                  className="w-full border rounded-lg"
                  style={{ height: '800px' }}
                  title="API Reference Documentation"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quickstart" className="space-y-4 text-left">
            <Tabs defaultValue="batch" className="w-full">
              <TabsList className="w-auto inline-flex h-10 p-1">
                <TabsTrigger value="batch" className="text-sm px-5">Batch</TabsTrigger>
                <TabsTrigger value="realtime" className="text-sm px-5">Real-Time</TabsTrigger>
              </TabsList>

              <TabsContent value="batch" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Batch Inference</CardTitle>
                    <CardDescription>End-to-end example of running a batch prediction job</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                    Create a Batch
                  </h3>
                  <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto text-sm">
{`curl -X POST https://api.om1.com/phenom/v1/batch \\
  -H "Authorization: Bearer <jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "october_data_load",
    "upload_method": "s3_multipart"
  }'

# Response:
{
  "batch_id": "batch_0199bb07-3b87-7e83-8842-ad9d52a3c472",
  "status": "CREATED"
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                    Upload Patient Data
                  </h3>
                  <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto text-sm">
{`# Create upload session
curl -X POST https://api.om1.com/phenom/v1/batch/{batch_id}/uploads \\
  -H "Authorization: Bearer <jwt>" \\
  -d '{
    "object_type": "patients",
    "filename": "patients_2025_10.csv",
    "mode": "single"
  }'

# Upload file using presigned URL (returned in response)
# Then repeat for other data types: lab_results, diagnosis, procedures, medications`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                    Finalize the Batch
                  </h3>
                  <pre className="bg-muted p-4 text-muted-foreground rounded-md overflow-x-auto text-sm">
{`curl -X POST https://api.om1.com/phenom/v1/batch/{batch_id}/finalize \\
  -H "Authorization: Bearer <jwt>"

# Response:
{
  "batch_id": "batch_0199bb07-3b87-7e83-8842-ad9d52a3c472",
  "status": "FINALIZED",
  "manifest_key": "batches/batch_.../manifest.json"
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
                    Start the Job
                  </h3>
                  <pre className="bg-muted p-4 text-muted-foreground rounded-md overflow-x-auto text-sm">
{`curl -X POST https://api.om1.com/phenom/v1/batch/{batch_id}/start \\
  -H "Authorization: Bearer <jwt>" \\
  -d '{
    "outcome_ids": [
      "v0p3_65plus_fixed_anchor_2023_JanToDec_04012025_any_time_hospitalization_future_1month"
    ]
  }'

# Response:
{
  "job_id": "job_01J90Q2TTM",
  "status": "QUEUED"
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
                    Poll for Job Status
                  </h3>
                  <pre className="bg-muted p-4 text-muted-foreground rounded-md overflow-x-auto text-sm">
{`curl https://api.om1.com/phenom/v1/jobs/{job_id} \\
  -H "Authorization: Bearer <jwt>"

# Response when complete:
{
  "job_id": "job_01J90Q2TTM",
  "status": "SUCCEEDED",
  "metrics": {
    "records_processed": 1245678,
    "patients_scored": 101234,
    "patients_excluded": 1123
  }
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">6</span>
                    Fetch Results
                  </h3>
                  <pre className="bg-muted p-4 text-muted-foreground rounded-md overflow-x-auto text-sm">
{`# Option 1: Paginated API results
curl https://api.om1.com/phenom/v1/jobs/{job_id}/results?page_size=1000 \\
  -H "Authorization: Bearer <jwt>"

# Option 2: Download full results
curl https://api.om1.com/phenom/v1/jobs/{job_id}/results/download \\
  -H "Authorization: Bearer <jwt>"`}
                  </pre>
                </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="realtime" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Real-Time Inference: Single Patient</CardTitle>
                    <CardDescription>Generate a prediction for a single patient</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 text-muted-foreground rounded-md overflow-x-auto text-sm">
{`curl -X POST https://api.om1.com/phenom/v1/jobs/from-patient \\
  -H "Authorization: Bearer <jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "outcome_ids": ["heart_failure_1y"],
    "patient_history": {
      "patient": {
        "patient_id": "abc123",
        "birth_date": "1964-05-18",
        "sex": "F",
        "zip3": "021"
      },
      "diagnosis": [{
        "code": "I10",
        "code_system": "ICD10",
        "start_date": "2020-01-01"
      }],
      "lab_results": [{
        "lab_code": "718-7",
        "result_value": 12.8,
        "result_units": "g/dL",
        "result_date": "2025-07-03"
      }]
    }
  }'

# Response:
{
  "job_id": "job_01J90Q2TTM",
  "status": "QUEUED"
}

# Poll GET /v1/jobs/{job_id} for results`}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Real-Time Inference: Multiple Patient Predictions</CardTitle>
                    <CardDescription>Generate predictions for up to 10 patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 text-muted-foreground rounded-md overflow-x-auto text-sm">
{`curl -X POST https://api.om1.com/phenom/v1/jobs/from-patients \\
  -H "Authorization: Bearer <jwt>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "outcome_ids": ["heart_failure_1y"],
    "patient_histories": [
      {
        "patient": {
          "patient_id": "patient_001",
          "birth_date": "1964-05-18",
          "sex": "F",
          "zip3": "021"
        },
        "diagnosis": [{
          "code": "I10",
          "code_system": "ICD10",
          "start_date": "2020-01-01"
        }]
      },
      {
        "patient": {
          "patient_id": "patient_002",
          "birth_date": "1978-03-22",
          "sex": "M",
          "zip3": "100"
        },
        "diagnosis": [{
          "code": "E11.9",
          "code_system": "ICD10",
          "start_date": "2019-06-15"
        }],
        "medications": [{
          "rx_code": "314076",
          "code_system": "RXNORM",
          "start_date": "2019-07-01"
        }]
      },
      {
        "patient": {
          "patient_id": "patient_003",
          "birth_date": "1955-11-08",
          "sex": "F",
          "zip3": "900"
        },
        "lab_results": [{
          "lab_code": "2339-0",
          "result_value": 6.8,
          "result_units": "mmol/L",
          "result_date": "2024-10-01"
        }]
      }
    ]
  }'

# Response:
{
  "job_id": "job_01J90Q2UUZ",
  "status": "QUEUED"
}

# Poll GET /v1/jobs/{job_id} for results`}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="apikeys" className="space-y-4 text-left">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      API Keys
                    </CardTitle>
                    <CardDescription>
                      Create and manage API keys for authenticating with the Phenom API
                    </CardDescription>
                  </div>
                  {!showCreateForm && apiKeys.length > 0 && (
                    <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Key
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showCreateForm && (
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Create New API Key</CardTitle>
                      <CardDescription>
                        Give your API key a descriptive name to help you remember what it's used for
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="keyName">Key Name</Label>
                        <Input
                          id="keyName"
                          placeholder="e.g., Production Server, Development Environment"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && generateApiKey()}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={generateApiKey}>Generate Key</Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewKeyName('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first API key to start using the Phenom API
                    </p>
                    <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Key
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <Card key={apiKey.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg">{apiKey.name}</h4>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                  <span>Created: {apiKey.created}</span>
                                  <span>
                                    Last used: {apiKey.lastUsed || 'Never'}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setKeyToDelete(apiKey.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted p-3 rounded-md font-mono text-sm flex items-center gap-2">
                                <code className="flex-1">
                                  {apiKey.visible ? apiKey.key : maskKey(apiKey.key)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleKeyVisibility(apiKey.id)}
                                  className="shrink-0"
                                >
                                  {apiKey.visible ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(apiKey.key, apiKey.name)}
                                className="gap-2 shrink-0"
                              >
                                <Copy className="h-4 w-4" />
                                Copy
                              </Button>
                            </div>

                            {apiKey.visible && apiKey.lastUsed === null && (
                              <Alert>
                                <AlertDescription className="text-sm">
                                  <strong>Important:</strong> Make sure to copy your API key now. 
                                  For security reasons, you won't be able to view it again after hiding it.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Alert className="bg-yellow-50 border-yellow-300">
                  <AlertTriangle className="h-4 w-4 text-yellow-700" />
                  <AlertDescription className="space-y-2 text-yellow-900">
                    <p className="font-semibold">Security Best Practices:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Never share your API keys or commit them to version control</li>
                      <li>Use environment variables to store API keys in your application</li>
                      <li>Rotate your keys regularly and revoke unused keys</li>
                      <li>Use separate keys for development, staging, and production environments</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4 text-left">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Current Month Usage</CardDescription>
                  <CardTitle className="text-3xl font-bold">$0.00</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>No usage yet this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">API Calls This Month</CardDescription>
                  <CardTitle className="text-3xl font-bold">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <span>Batch: 0 | Real-Time: 0</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Patients Processed</CardDescription>
                  <CardTitle className="text-3xl font-bold">0</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <span>Across all inference jobs</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
                <CardDescription>Current pricing for API usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        Batch Inference
                      </h4>
                      <p className="text-2xl font-bold mb-2">$0.002</p>
                      <p className="text-sm text-muted-foreground">per patient prediction</p>
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <li>• Volume discounts available</li>
                        <li>• Minimum charge: $10/month</li>
                        <li>• Billed monthly</li>
                      </ul>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-green-600" />
                        Real-Time Inference
                      </h4>
                      <p className="text-2xl font-bold mb-2">$0.005</p>
                      <p className="text-sm text-muted-foreground">per patient prediction</p>
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <li>• Low latency guaranteed</li>
                        <li>• No minimum charge</li>
                        <li>• Billed monthly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/*
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>Manage your billing information</CardDescription>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <CreditCard className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Visa ending in 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Default</Badge>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            */}
            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
                <CardDescription>Your API usage and billing history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Usage History</h3>
                  <p className="text-muted-foreground mb-4">
                    Your usage history will appear here once you start making API calls
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
          </div>
        </div>
      </div>

      <AlertDialog open={keyToDelete !== null} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this API key and revoke access. Any applications using this key will stop working immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToDelete && deleteApiKey(keyToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
