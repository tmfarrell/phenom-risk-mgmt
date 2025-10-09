import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PredictionBuilder() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">PhenOM API Documentation</h1>
          <p className="text-muted-foreground">
            REST API for generating clinical risk predictions based on patient codes
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 text-left">
            <Card>
              <CardHeader>
                <CardTitle>API Overview</CardTitle>
                <CardDescription>Generate predictions for patient risk based on clinical codes</CardDescription>
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
                    All API requests require authentication via Bearer token in the Authorization header.
                  </p>
                  <code className="block bg-muted p-3 rounded-md text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Rate Limits</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>1000 requests per hour per API key</li>
                    <li>Maximum 1000 patients per batch request</li>
                    <li>Rate limit headers included in all responses</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoint" className="space-y-4 text-left">
            <Card>
              <CardHeader>
                <CardTitle>POST /predictions/generate</CardTitle>
                <CardDescription>Generate risk predictions for a batch of patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Request Body</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`{
  "patients": [
    {
      "patientId": "string",
      "diagnosis": ["string"],      // ICD-10 codes
      "procedures": ["string"],     // CPT codes
      "medications": ["string"],    // RxNorm codes
      "labs": ["string"]            // LOINC codes
    }
  ],
  "options": {
    "includeConfidence": true,
    "includeProbabilities": true,
    "timeHorizon": "90d"            // 30d, 90d, 180d, 365d
  }
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Parameters</h3>
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">patientId <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the patient</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">diagnosis <Badge variant="secondary">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of ICD-10 diagnosis codes</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">procedures <Badge variant="secondary">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of CPT procedure codes</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">medications <Badge variant="secondary">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of RxNorm medication codes</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">labs <Badge variant="secondary">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of LOINC lab codes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4 text-left">
            <Tabs defaultValue="curl" className="w-full">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>

              <TabsContent value="curl" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>cURL Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`curl -X POST https://api.om1.com/phenom/v1/predictions/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patients": [
      {
        "patientId": "P123456",
        "diagnosis": ["E11.9", "I10"],
        "procedures": ["99213", "80053"],
        "medications": ["314076", "197361"],
        "labs": ["2339-0", "2345-7"]
      }
    ],
    "options": {
      "includeConfidence": true,
      "timeHorizon": "90d"
    }
  }'`}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="python" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Python Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`import requests

url = "https://api.om1.com/phenom/v1/predictions/generate"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "patients": [{
        "patientId": "P123456",
        "diagnosis": ["E11.9", "I10"],
        "procedures": ["99213", "80053"],
        "medications": ["314076", "197361"],
        "labs": ["2339-0", "2345-7"]
    }],
    "options": {
        "includeConfidence": True,
        "timeHorizon": "90d"
    }
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="javascript" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`const response = await fetch('https://api.om1.com/phenom/v1/predictions/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    patients: [{
      patientId: 'P123456',
      diagnosis: ['E11.9', 'I10'],
      procedures: ['99213', '80053'],
      medications: ['314076', '197361'],
      labs: ['2339-0', '2345-7']
    }],
    options: {
      includeConfidence: true,
      timeHorizon: '90d'
    }
  })
});

const data = await response.json();
console.log(data);`}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
