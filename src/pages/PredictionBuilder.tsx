import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PredictionBuilder() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-start">
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-bold text-blue-900 text-left">PhenOM API</h1>
        </div>
      </div>
      <div className="p-6">
        <div className="max-w-[1250px] mx-auto">
          <div className="flex flex-col space-y-6">

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoint">Endpoints</TabsTrigger>
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
                <CardTitle>POST /predictions/submit</CardTitle>
                <CardDescription>Submit a risk predictions request for a batch of patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

              <div>
                <h2 className="font-semibold mb-2">Request</h2>
                  <h4  className="font-semibold mb-2 text-gray-500">Parameters</h4>
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">outcomeId <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the outcome</p>
                    </div>
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">patients <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of patients</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">diagnoses <Badge variant="secondary">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of diagnosis codes</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">procedures <Badge variant="secondary">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of procedure codes</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">medications <Badge variant="secondary">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of medication codes</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">labs <Badge variant="secondary">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Array of lab codes</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 mt-4 text-gray-500">Body</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
  {`{
    "outcomeId": "heart_failure_1y",
    "patients": [
      {
        "patientId": "patient_123",
        "dateOfBirth": "1978-06-01",
        "sex": "MALE",
        "firstName": "Allison",
        "lastName": "Smithson",
        "diagnoses": [{
          "code": "E11.9",
          "codeType": "ICD-10", 
          "codeDttm": "2020-01-01"
        }], 
        "procedures": [{
          "code": "99213",
          "codeType": "CPT", 
          "codeDttm": "2020-01-01"
        }],     
        "medications": [{
          "code": "314076",
          "codeType": "RxNorm", 
          "codeDttm": "2020-01-01"
        }],    
        "labs": [{
          "code": "2339-0",
          "codeType": "LOINC", 
          "codeDttm": "2020-01-01"
        }]  
      }
    ]
  }`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Response</h3>
                  <h4 className="font-semibold mb-2 text-gray-500">Parameters</h4>
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">taskId <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the task</p>
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2 mt-4 text-gray-500">Body</h4>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`{
  "taskId": "1234567890"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GET /predictions/{`{predictionId}`}</CardTitle>
                <CardDescription>Get the results of a risk prediction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

              <div>
                <h2 className="font-semibold mb-2">Request</h2>
                  <h4  className="font-semibold mb-2 text-gray-500">Parameters</h4>
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">predictionId <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the prediction</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 mt-4 text-gray-500">Body</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
  {`{
    "predictionId": "1234567890"
  }`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Response</h3>
                  <h4 className="font-semibold mb-2 text-gray-500">Parameters</h4>
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">taskId <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the task</p>
                    </div>
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">status <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Status of the task</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">predictionId <Badge variant="outline">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the prediction</p>
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2 mt-4 text-gray-500">Body</h4>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`{
  "predictionId": "1234567890",
  "predictionDttm": "2020-01-01",
  "predictions": [
    {
      "outcomeId": "heart_failure_1y",
      "patientId": "patient_123",
      "absoluteRisk": 0.05,
      "relativeRisk": 1.2
    }, 
    {
      "outcomeId": "heart_failure_1y",
      "patientId": "patient_124",
      "absoluteRisk": 0.075,
      "relativeRisk": 1.5
    }
  ]
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GET /tasks/{`{taskId}`}</CardTitle>
                <CardDescription>Get the status of a risk predictions request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

              <div>
                <h2 className="font-semibold mb-2">Request</h2>
                  <h4  className="font-semibold mb-2 text-gray-500">Parameters</h4>
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">taskId <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the task</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 mt-4 text-gray-500">Body</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
  {`{
    "taskId": "1234567890"
  }`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Response</h3>
                  <h4 className="font-semibold mb-2 text-gray-500">Parameters</h4>
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">taskId <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the task</p>
                    </div>
                    <div className="border-l-2 border-primary pl-3">
                      <p className="font-medium text-sm">status <Badge variant="outline">required</Badge></p>
                      <p className="text-xs text-muted-foreground">Status of the task</p>
                    </div>
                    <div className="border-l-2 border-muted pl-3">
                      <p className="font-medium text-sm">predictionId <Badge variant="outline">optional</Badge></p>
                      <p className="text-xs text-muted-foreground">Unique identifier for the prediction</p>
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2 mt-4 text-gray-500">Body</h4>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`{
  "taskId": "1234567890",
  "status": "PENDING", 
  "predictionId": ""
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4 text-left">
            <Tabs defaultValue="curl" className="w-full ">
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
{`curl -X POST https://api.om1.com/phenom/v1/predictions/submit \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "outcomeId": "heart_failure_1y",
    "patients": [
      {
        "patientId": "P123456",
        "diagnoses": ["E11.9", "I10"],
        "procedures": ["99213", "80053"],
        "medications": ["314076", "197361"],
        "labs": ["2339-0", "2345-7"]
      }
    ]
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

url = "https://api.om1.com/phenom/v1/predictions/submit"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "outcomeId": "heart_failure_1y",
    "patients": [{
        "patientId": "P123456",
        "diagnoses": ["E11.9", "I10"],
        "procedures": ["99213", "80053"],
        "medications": ["314076", "197361"],
        "labs": ["2339-0", "2345-7"]
    }],
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
{`const response = await fetch('https://api.om1.com/phenom/v1/predictions/submit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    outcomeId: 'heart_failure_1y',
    patients: [{
      patientId: 'P123456',
      diagnoses: ['E11.9', 'I10'],
      procedures: ['99213', '80053'],
      medications: ['314076', '197361'],
      labs: ['2339-0', '2345-7']
    }],
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
          </div>
        </div>
      </div>
    </div>
  );
}
