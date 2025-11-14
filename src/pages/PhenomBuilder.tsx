import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
// Removed ToggleGroup controls for phenotype view
import { supabase } from "@/integrations/supabase/client"
import { useContext } from "react"
import { AuthContext } from "@/App"
import { useToast } from "@/hooks/use-toast"
import { useROCCurveData } from "@/hooks/useROCCurveData"
import { Plus, X, Check, Calendar, Search, HelpCircle, InfoIcon } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter } from 'recharts'

interface PreBuiltModel {
  id: string
  model_name: string
  min_patient_age: number | null
  max_patient_age?: number | null
  patient_sex: string | null
  indication_type: string
  indication_code: string
  indication_new_onset: boolean
  prediction_timeframe_yrs: number | null
  history_type: string | null
  history_code: string | null
  history_no_history: boolean
  user_id: string | null
  created_at: string
  updated_at: string
  patients_total: number | null
  patients_phenom: number | null
  model_lift: number | null
  risk_threshold_pct: number | null
  patients_tp: number | null
  auc: number | null
  providers_total: number | null
  providers_phenom: number | null
}

// Generate ROC curve data based on AUC
const generateROCCurve = (auc: number) => {
  const rocPoints = []
  for (let i = 0; i <= 100; i += 5) {
    const fpr = i / 100
    // Generate realistic ROC curve that achieves the specified AUC
    const tpr = Math.min(1, fpr + (auc - 0.5) + Math.sin(fpr * Math.PI) * 0.1)
    rocPoints.push({
      fpr: parseFloat(fpr.toFixed(3)),
      tpr: parseFloat(Math.max(fpr, tpr).toFixed(3)), // Ensure TPR >= FPR for valid ROC
      specificity: parseFloat((1 - fpr).toFixed(3)),
      sensitivity: parseFloat(Math.max(fpr, tpr).toFixed(3))
    })
  }
  return rocPoints
}

// Generate performance metrics based on real AUC from database
const getModelPerformance = (model: PreBuiltModel) => {
  const auc = model.auc || 0.75
  // Derive other metrics from AUC (realistic approximations)
  const accuracy = Math.min(0.95, auc + 0.05 + Math.random() * 0.05)
  const precision = Math.min(0.95, auc - 0.02 + Math.random() * 0.08)
  const recall = Math.min(0.95, auc + 0.02 + Math.random() * 0.06)
  const f1Score = (2 * precision * recall) / (precision + recall)
  
  return {
    auc: parseFloat(auc.toFixed(3)),
    accuracy: parseFloat(accuracy.toFixed(3)),
    precision: parseFloat(precision.toFixed(3)),
    recall: parseFloat(recall.toFixed(3)),
    f1Score: parseFloat(f1Score.toFixed(3)),
    rocCurve: generateROCCurve(auc),
    trainingDate: model.updated_at,
    datasetSize: model.patients_total || 0,
    validationSplit: 0.2
  }
}

// Generate mock phenotype signal data
const generateMockSignalData = (modelId: string) => {
  const seed = modelId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const signals = []
  
  // Seeded random function for consistency
  const seededRandom = (seedValue: number) => {
    const x = Math.sin(seedValue) * 10000
    return x - Math.floor(x)
  }
  
  // Generate 50 signal codes with alpha/beta values
  for (let i = 1; i <= 50; i++) {
    const signalSeed = seed + i
    let alpha: number, beta: number
    
    // Create 2-3 high importance features (high alpha and beta)
    if (i <= 3) {
      // High importance features - both alpha and beta are high positive
      alpha = parseFloat((1.2 + seededRandom(signalSeed) * 0.8).toFixed(3)) // Range: 1.2 to 2.0
      beta = parseFloat((1.2 + seededRandom(signalSeed + 100) * 0.8).toFixed(3)) // Range: 1.2 to 2.0
    } else {
      // Rest are uniformly distributed at low/moderate levels
      alpha = parseFloat(((seededRandom(signalSeed) - 0.5) * 1.2).toFixed(3)) // Range: -0.6 to 0.6
      beta = parseFloat(((seededRandom(signalSeed + 50) - 0.5) * 1.2).toFixed(3)) // Range: -0.6 to 0.6
    }
    
    const importance = Math.sqrt(alpha * alpha + beta * beta) // Calculate magnitude
    
    signals.push({
      signalCode: `SIG${i.toString().padStart(3, '0')}`,
      alpha,
      beta,
      importance,
      fill: importance > 1.5 ? '#dc2626' : importance > 1.0 ? '#ea580c' : importance > 0.5 ? '#0ea5e9' : '#3b82f6'
    })
  }
  
  return signals.sort((a, b) => b.importance - a.importance) // Sort by importance
}

// Helper function to format prediction timeframe
const formatPredictionTimeframe = (years: number | null) => {
  if (!years) return null
  
  if (years < 1) {
    const months = Math.round(years * 12)
    return `${months} month${months !== 1 ? 's' : ''}`
  }
  
  return `${years} yr${years > 1 ? 's' : ''}`
}

// Helper function to determine model type badge
const getModelTypeBadge = (model: PreBuiltModel) => {
  // Care Opportunity: when indication type is medication
  if (model.indication_type === 'medication') {
    return { label: 'Care Opportunity', variant: 'default' as const, className: 'bg-green-100 text-green-900 border-green-200 hover:bg-green-100 hover:text-green-900 cursor-default pointer-events-none' }
  }
  
  // Risk: when model has a prediction time frame
  if (model.prediction_timeframe_yrs !== null && model.prediction_timeframe_yrs !== undefined) {
    return { label: 'Future Risk', variant: 'default' as const, className: 'bg-red-100 text-red-900 border-red-200 hover:bg-red-100 hover:text-red-900 cursor-default pointer-events-none' }
  }
  
  // Screening: Otherwise
  return { label: 'Screening', variant: 'default' as const, className: 'bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-100 hover:text-blue-900 cursor-default pointer-events-none' }
}

// Helper function to generate natural language description of the model
const generateModelDescription = (model: PreBuiltModel) => {
  const parts: string[] = []
  
  // Start with the model type
  const isMedication = model.indication_type === 'medication'
  const isDiagnosis = model.indication_type === 'diagnosis'
  
  // Build the main prediction statement
  if (isMedication) {
    parts.push(`This model identifies patients that are similar to those treated with ${model.indication_code} (top ${model.risk_threshold_pct}% similarity)`)
  } else if (isDiagnosis) {
    if (model.prediction_timeframe_yrs) {
      parts.push(`This model predicts risk of ${model.indication_code}${model.indication_new_onset ? ' (new onset)' : ''} within ${formatPredictionTimeframe(model.prediction_timeframe_yrs)}`)
    } else {
      parts.push(`This model identifies patients at top ${model.risk_threshold_pct}% risk of ${model.indication_code}${model.indication_new_onset ? ' (new onset)' : ''}`)
    }
  } else {
    parts.push(`This model analyzes ${model.indication_type}: ${model.indication_code}`)
  }
  
  // Add patient characteristics
  const characteristics: string[] = []
  
  if (model.min_patient_age && model.max_patient_age) {
    characteristics.push(`ages ${model.min_patient_age}-${model.max_patient_age}`)
  } else if (model.min_patient_age) {
    characteristics.push(`ages ${model.min_patient_age}+`)
  } else if (model.max_patient_age) {
    characteristics.push(`ages up to ${model.max_patient_age}`)
  }
  
  if (model.patient_sex) {
    characteristics.push(`${model.patient_sex.toLowerCase()} patients`)
  }
  
  if (characteristics.length > 0) {
    parts.push(`among ${characteristics.join(', ')}`)
  }
  
  // Add history criteria
  if (model.history_type && model.history_code) {
    if (model.history_no_history) {
      parts.push(`who have no history of ${model.history_code}`)
    } else {
      parts.push(`with a history of ${model.history_code}`)
    }
  }
  
  return parts.join(' ') + '.'
}

export default function PhenomBuilder() {
  const { session } = useContext(AuthContext)
  const user = session?.user
  const { toast } = useToast()
  const navigate = useNavigate()
  const { modelId } = useParams<{ modelId?: string }>()
  
  // View state management
  const [currentView, setCurrentView] = useState<"explore" | "customize">("explore")
  const [selectedModel, setSelectedModel] = useState<PreBuiltModel | null>(null)
  // Only performance view is supported now
  const [analysisView, setAnalysisView] = useState<'performance'>('performance')
  
  // Database state management
  const [preBuiltModels, setPreBuiltModels] = useState<PreBuiltModel[]>([])
  const [loading, setLoading] = useState(true)
  const [isBuilding, setIsBuilding] = useState(false)
  
  // Search state management
  const [searchTerm, setSearchTerm] = useState("")
  
  // Performance data
  const [performance, setPerformance] = useState<any>(null)
  const [signalData, setSignalData] = useState<any[]>([])

  // ROC curve data
  const { data: rocData, isLoading: rocLoading, error: rocError } = useROCCurveData(selectedModel?.id || null)
  
  // Form state management
  const [modelName, setModelName] = useState("")
  const [minPatientAge, setMinPatientAge] = useState("")
  const [maxPatientAge, setMaxPatientAge] = useState("")
  const [patientSex, setPatientSex] = useState("")
  const [historyCriteria, setHistoryCriteria] = useState<{type: string, code: string}>({ type: "", code: "" })
  const [noHistoryCriteria, setNoHistoryCriteria] = useState<{type: string, code: string}>({ type: "", code: "" })
  const [indication, setIndication] = useState<{type: string, code: string, newOnset: boolean, predictionTimeframe: string}>({ type: "", code: "", newOnset: false, predictionTimeframe: "" })

  // Fetch all models from database (both pre-built and user-created)
  const fetchModels = async () => {
    try {
      console.log('Fetching models...')
      const { data, error } = await (supabase as any)
        .from('phenom_models')
        .select('*')
        .order('model_name', { ascending: true }) // Order by model name alphabetically

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Error fetching models:', error)
        toast({
          title: "Error Loading Models",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log('Successfully fetched models:', data)
        setPreBuiltModels(((data || []) as unknown) as PreBuiltModel[])
      }
    } catch (error) {
      console.error('Unexpected error fetching models:', error)
      toast({
        title: "Error Loading Models",
        description: "An unexpected error occurred while loading models.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  // Auto-select model from URL parameter
  useEffect(() => {
    if (modelId && preBuiltModels.length > 0) {
      const modelToSelect = preBuiltModels.find(model => model.id === modelId)
      if (modelToSelect) {
        setSelectedModel(modelToSelect)
      }
    }
  }, [modelId, preBuiltModels])

  // Handle model selection and generate performance data
  useEffect(() => {
    if (selectedModel) {
      setPerformance(getModelPerformance(selectedModel))
      setSignalData(generateMockSignalData(selectedModel.id))
    }
  }, [selectedModel])

  const updateHistoryCriterion = (field: "type" | "code", value: string) => {
    if (field === "type" && value === "") {
      // Clear both type and code when "No requirement" is selected
      setHistoryCriteria({ type: "", code: "" })
    } else {
      setHistoryCriteria({ ...historyCriteria, [field]: value })
    }
  }

  const updateNoHistoryCriterion = (field: "type" | "code", value: string) => {
    if (field === "type" && value === "") {
      // Clear both type and code when "No requirement" is selected
      setNoHistoryCriteria({ type: "", code: "" })
    } else {
      setNoHistoryCriteria({ ...noHistoryCriteria, [field]: value })
    }
  }

  const updateIndication = (field: "type" | "code" | "newOnset" | "predictionTimeframe", value: string | boolean) => {
    setIndication({ ...indication, [field]: value })
  }

  const handleBuildModel = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a model.",
        variant: "destructive",
      })
      return
    }

    // Validate age range if both provided
    if (minPatientAge && maxPatientAge) {
      const minAge = parseInt(minPatientAge)
      const maxAge = parseInt(maxPatientAge)
      if (!Number.isNaN(minAge) && !Number.isNaN(maxAge) && minAge > maxAge) {
        toast({
          title: "Invalid Age Range",
          description: "Minimum age cannot be greater than maximum age.",
          variant: "destructive",
        })
        return
      }
    }

    setIsBuilding(true)

    try {
      // Determine which history criteria to use - prioritize "no history" if both are filled
      const useNoHistory = Boolean(noHistoryCriteria.type && noHistoryCriteria.code)
      const useHistory = !useNoHistory && Boolean(historyCriteria.type && historyCriteria.code)

      const modelData = {
        model_name: modelName,
        min_patient_age: minPatientAge ? parseInt(minPatientAge) : null,
        max_patient_age: maxPatientAge ? parseInt(maxPatientAge) : null,
        patient_sex: patientSex || null,
        indication_type: indication.type,
        indication_code: indication.code,
        indication_new_onset: indication.newOnset,
        prediction_timeframe_yrs: indication.predictionTimeframe ? parseInt(indication.predictionTimeframe) : null,
        history_type: useNoHistory ? noHistoryCriteria.type : (useHistory ? historyCriteria.type : null),
        history_code: useNoHistory ? noHistoryCriteria.code : (useHistory ? historyCriteria.code : null),
        history_no_history: useNoHistory,
        user_id: user.id,
      }

      console.log("Building model:", modelData)

      // Simulate building process with a delay
      await new Promise(resolve => setTimeout(resolve, 2500))

      const { data, error } = await (supabase as any)
        .from('phenom_models')
        .insert([modelData])
        .select()

      if (error) {
        console.error('Error creating model:', error)
        toast({
          title: "Error Creating Model",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log('Model created successfully:', data)
        const newModel = (data[0] as unknown) as PreBuiltModel
        
        toast({
          title: "Model Created!",
          description: `${modelName} has been successfully created and added to your models.`,
        })
        
        // Clear the form
        setModelName("")
        setMinPatientAge("")
        setMaxPatientAge("")
        setPatientSex("")
        setHistoryCriteria({ type: "", code: "" })
        setNoHistoryCriteria({ type: "", code: "" })
        setIndication({ type: "", code: "", newOnset: false, predictionTimeframe: "" })
        
        // Refresh the models list
        await fetchModels()
        
        // Navigate to the newly created model details
        navigate(`/phenom-builder/${newModel.id}`)
        
        // Auto-select the newly created model
        setSelectedModel(newModel)
        
        // Switch back to explore view to show the model details
        setCurrentView("explore")
      }
    } catch (error) {
      console.error('Unexpected error creating model:', error)
      toast({
        title: "Error Creating Model",
        description: "An unexpected error occurred while creating the model.",
        variant: "destructive",
      })
    } finally {
      setIsBuilding(false)
    }
  }

  const isModelValid = modelName && indication.type && indication.code

  // Helper function to get the display name for who built the model
  const getModelBuilder = (model: PreBuiltModel) => {
    if (!model.user_id) {
      return "OM1"
    }
    if (model.user_id === user?.id) {
      return "You"
    }
    return "User" // In future, we could fetch user details to show actual names
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Handle model card selection
  const handleModelSelect = (model: PreBuiltModel) => {
    setSelectedModel(model)
    setCurrentView("explore")
  }

  return (
    <div className="space-y-6">
      <Header />
      <div className="flex items-start">
        <div className="px-6">
          <h1 className="text-2xl font-bold text-blue-900 text-left">PhenOM Catalog</h1>
          {/* <p className="text-gray-600 text-left">Explore AI models for digital phenotyping</p> */}
        </div>
      </div>
      <div className="flex h-screen">
        {/* Left Sidebar - Model List */}
        <div className="w-1/4 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <Button 
              className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700" 
              onClick={() => {
                setCurrentView("customize")
                setSelectedModel(null)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Outcome
            </Button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search outcomes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Model Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading models...</p>
                </div>
              </div>
            ) : (
              (() => {
                const filteredModels = preBuiltModels.filter((model) => 
                  model.model_name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                
                if (filteredModels.length === 0 && searchTerm.trim() !== "") {
                  return (
                    <div className="flex justify-center py-8">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">No outcomes found matching "{searchTerm}"</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms</p>
                      </div>
                    </div>
                  )
                }
                
                return filteredModels.map((model) => {
                const modelTypeBadge = getModelTypeBadge(model)
                return (
                <Card 
                  key={model.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedModel?.id === model.id ? 'ring-2 ring-blue-500 border-blue-200' : ''
                  }`}
                  onClick={() => handleModelSelect(model)}
                >
                  <CardContent className="pt-6 pb-6 px-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 text-left flex-1">
                          {model.model_name}
                        </h3>
                        <Badge 
                          variant={modelTypeBadge.variant} 
                          className={`text-xs ${modelTypeBadge.className} flex-shrink-0`}
                        >
                          {modelTypeBadge.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-4">
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
                          <div className="text-xs text-gray-500 mt-1">
                            Age: {model.min_patient_age && !model.max_patient_age 
                              ? `${model.min_patient_age}+` 
                              : `${model.min_patient_age || '0'}-${model.max_patient_age}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})
              })()
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto">
          {currentView === "customize" && (
            <div className="p-4 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-900">Create New Outcome</h2>
                <Button variant="outline" onClick={() => setCurrentView("explore")}>
                  Cancel
                </Button>
              </div>

              <Card>
                <CardContent className="flex items-center justify-center">
                  <div className="flex items-center gap-4 w-full mt-6">
                    <Label htmlFor="model-name" className="whitespace-nowrap">Outcome Name*</Label>
                    <Input
                      id="model-name"
                      placeholder="Enter outcome name"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-left">Prediction Target</CardTitle>
                  <CardDescription className="text-left">
                    Define the target diagnosis or treatment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-left">
                    <Label>Target*</Label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select
                          value={indication.type}
                          onValueChange={(value) => updateIndication("type", value)}
                        >
                          <SelectTrigger className="bg-background border border-input">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-input z-50">
                            <SelectItem value="diagnosis">Diagnosis</SelectItem>
                            <SelectItem value="medication">Medication</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Enter code"
                          value={indication.code}
                          onChange={(e) => updateIndication("code", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-onset"
                        checked={indication.newOnset}
                        onCheckedChange={(checked) => updateIndication("newOnset", checked)}
                      />
                      <Label htmlFor="new-onset" className="text-sm font-normal text-left">
                        New onset
                      </Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="prediction-timeframe" className="text-left">Timeframe</Label>
                      <Select
                        value={indication.predictionTimeframe || "no-timeframe"}
                        onValueChange={(value) => updateIndication("predictionTimeframe", value === "no-timeframe" ? "" : value)}
                      >
                        <SelectTrigger className="bg-background border border-input">
                          <span className={`${(indication.predictionTimeframe || "no-timeframe") === "no-timeframe" ? "text-gray-500" : ""}`}>
                            {(indication.predictionTimeframe || "no-timeframe") === "no-timeframe" ? "No requirement" : 
                             formatPredictionTimeframe(parseFloat(indication.predictionTimeframe)) || "Select timeframe"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-input z-50">
                          <SelectItem className="text-gray-500" value="no-timeframe">No requirement</SelectItem>
                          <SelectItem value="0.25">3 months</SelectItem>
                          <SelectItem value="0.5">6 months</SelectItem>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="5">5 years</SelectItem>
                          <SelectItem value="10">10 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-left">Patient characteristics (optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="min-age">Minimum patient age</Label>
                    <Input
                      id="min-age"
                      type="number"
                      placeholder="Enter minimum age"
                      value={minPatientAge}
                      onChange={(e) => setMinPatientAge(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-age">Maximum patient age</Label>
                    <Input
                      id="max-age"
                      type="number"
                      placeholder="Enter maximum age"
                      value={maxPatientAge}
                      onChange={(e) => setMaxPatientAge(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patient-sex">Patient sex requirement</Label>
                    <Select
                      value={patientSex || "no-filter"}
                      onValueChange={(value) => setPatientSex(value === "no-filter" ? "" : value)}
                    >
                      <SelectTrigger className="bg-background border border-input">
                        <span className={`${(patientSex || "no-filter") === "no-filter" ? "text-gray-500" : ""}`}>
                          {(patientSex || "no-filter") === "no-filter" ? "No requirement" : 
                           patientSex === "Male" ? "Male" : 
                           patientSex === "Female" ? "Female" : "Select sex"}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-input z-50">
                        <SelectItem className="text-gray-500" value="no-filter">No requirement</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    {/* History of section */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-left whitespace-nowrap">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        History of
                      </Label>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Select
                            value={historyCriteria.type || "no-requirement"}
                            onValueChange={(value) => updateHistoryCriterion("type", value === "no-requirement" ? "" : value)}
                          >
                            <SelectTrigger className="bg-background border border-input">
                              <span className={`${(historyCriteria.type || "no-requirement") === "no-requirement" ? "text-gray-500" : ""}`}>
                                {(historyCriteria.type || "no-requirement") === "no-requirement" ? "No requirement" : 
                                 historyCriteria.type === "diagnosis" ? "Diagnosis" : 
                                 historyCriteria.type === "medication" ? "Medication" : "Select type"}
                              </span>
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-input z-50">
                              <SelectItem className="text-gray-500" value="no-requirement">No requirement</SelectItem>
                              <SelectItem value="diagnosis">Diagnosis</SelectItem>
                              <SelectItem value="medication">Medication</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Enter code"
                            value={historyCriteria.code}
                            onChange={(e) => updateHistoryCriterion("code", e.target.value)}
                            disabled={!historyCriteria.type}
                            className={!historyCriteria.type ? "text-gray-400 bg-gray-50" : ""}
                          />
                        </div>
                      </div>
                    </div>

                    {/* No history of section */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-left whitespace-nowrap">
                        <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                        No history of
                      </Label>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Select
                            value={noHistoryCriteria.type || "no-requirement"}
                            onValueChange={(value) => updateNoHistoryCriterion("type", value === "no-requirement" ? "" : value)}
                          >
                            <SelectTrigger className="bg-background border border-input">
                              <span className={`${(noHistoryCriteria.type || "no-requirement") === "no-requirement" ? "text-gray-500" : ""}`}>
                                {(noHistoryCriteria.type || "no-requirement") === "no-requirement" ? "No requirement" : 
                                 noHistoryCriteria.type === "diagnosis" ? "Diagnosis" : 
                                 noHistoryCriteria.type === "medication" ? "Medication" : "Select type"}
                              </span>
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-input z-50">
                              <SelectItem className="text-gray-500" value="no-requirement">No requirement</SelectItem>
                              <SelectItem value="diagnosis">Diagnosis</SelectItem>
                              <SelectItem value="medication">Medication</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Enter code"
                            value={noHistoryCriteria.code}
                            onChange={(e) => updateNoHistoryCriterion("code", e.target.value)}
                            disabled={!noHistoryCriteria.type}
                            className={!noHistoryCriteria.type ? "text-gray-400 bg-gray-50" : ""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-right">
                <p className="text-sm text-gray-500">*Required</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-900 text-left">Outcome Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-left">
                    <div>
                      <h4 className="font-medium text-gray-900">Outcome Name:</h4>
                      <p className="text-gray-600">{modelName || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Indication:</h4>
                      <p className="text-gray-600">
                        {indication.type && indication.code ? 
                          `${indication.type}: ${indication.code}${indication.newOnset ? " (new onset)" : ""}` : 
                          "Not specified"}
                      </p>
                      {indication.predictionTimeframe && (
                        <p className="text-gray-600 text-sm">
                          Prediction timeframe: {formatPredictionTimeframe(parseFloat(indication.predictionTimeframe))}
                        </p>
                      )}
                    </div>
                    {minPatientAge && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-left">Minimum patient age:</h4>
                        <p className="text-gray-600">{minPatientAge}</p>
                      </div>
                    )}
                    {maxPatientAge && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-left">Maximum patient age:</h4>
                        <p className="text-gray-600">{maxPatientAge}</p>
                      </div>
                    )}
                    {patientSex && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-left">Patient sex:</h4>
                        <p className="text-gray-600">{patientSex}</p>
                      </div>
                    )}
                    {historyCriteria.type && historyCriteria.code && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-left">History of:</h4>
                        <p className="text-gray-600">
                          {`${historyCriteria.type}: ${historyCriteria.code}`}
                        </p>
                      </div>
                    )}
                    {noHistoryCriteria.type && noHistoryCriteria.code && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-left">No history of:</h4>
                        <p className="text-gray-600">
                          {`${noHistoryCriteria.type}: ${noHistoryCriteria.code}`}
                        </p>
                      </div>
                    )}
                    <Button 
                      onClick={handleBuildModel} 
                      className="w-full mt-4"
                      disabled={!isModelValid || isBuilding}
                    >
                      {isBuilding ? "Building Outcome..." : "Build Outcome"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === "explore" && !selectedModel && (
            <div className="p-6 flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-medium mb-2">Select a outcome to view details</h3>
                <p className="text-sm">Choose a outcome from the list on the left to see its configuration and performance.</p>
              </div>
            </div>
          )}

        {currentView === "explore" && selectedModel && (
          <div className="relative">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 shadow-sm text-left">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900 flex-1">{selectedModel.model_name}</h1>
                <Badge 
                  variant={getModelTypeBadge(selectedModel).variant} 
                  className={`text-sm ${getModelTypeBadge(selectedModel).className} flex-shrink-0`}
                >
                  {getModelTypeBadge(selectedModel).label}
                </Badge>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 space-y-6">

              {/* Model Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-left">Model Description</CardTitle>
                  <p className="text-gray-700 leading-relaxed text-left mb-8">
                      {generateModelDescription(selectedModel)}
                    </p>
                  </CardHeader>
                <CardContent className="text-left mt-0">
                <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 mb-2">Prediction Target</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Type:</span> {selectedModel.indication_type}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Code:</span> {selectedModel.indication_code}
                        </p>
                        {selectedModel.prediction_timeframe_yrs && (
                          <Badge variant="outline" className="mt-2 bg-white border-gray-400">
                            {formatPredictionTimeframe(selectedModel.prediction_timeframe_yrs)}
                          </Badge>
                        )}
                        {selectedModel.indication_new_onset && (
                          <Badge variant="outline" className="mt-2 bg-white border-gray-400 ml-2">New Onset</Badge>
                        )}
                      </div>
                    </div>

                    {(selectedModel.min_patient_age || (selectedModel as any).max_patient_age || selectedModel.patient_sex) && (
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 mb-2">Patient Characteristics</h4>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                          {selectedModel.min_patient_age && (
                            <p className="text-sm">
                              <span className="font-medium">Minimum age:</span> {selectedModel.min_patient_age} years
                            </p>
                          )}
                          {(selectedModel as any).max_patient_age && (
                            <p className="text-sm">
                              <span className="font-medium">Maximum age:</span> {(selectedModel as any).max_patient_age} years
                            </p>
                          )}
                          {selectedModel.patient_sex && (
                            <p className="text-sm">
                              <span className="font-medium">Sex:</span> {selectedModel.patient_sex}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {(selectedModel.history_type && selectedModel.history_code) && (
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 mb-2">
                          History Criteria
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">
                              {selectedModel.history_no_history ? "No history of " : "History of "}
                             {selectedModel.history_type}:</span> {selectedModel.history_code}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
                    
              {false && (
                <>
                   {/* Patient Identification Results */}
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto rounded-b-xl">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900 border-b border-blue-200"></th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-blue-900 border-b border-blue-200">
                                <div className="flex flex-col items-center gap-1">
                                  <span>{selectedModel.indication_type == "diagnosis" ? "Diagnosed" : "Treated"} Cohort</span>
                                </div>
                              </th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-blue-900 border-b border-blue-200">
                                <div className="flex flex-col items-center gap-1">
                                  <span>High Risk PhenOM Cohort</span>
                                </div>
                              </th>
                              {/*<th className="px-4 py-3 text-center text-sm font-semibold text-blue-900 border-b border-blue-200">
                                <div className="flex flex-col items-center gap-1">
                                  <span>Improvement</span>
                                </div>
                              </th>*/}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                category: 'Patients Identified',
                                traditional: selectedModel?.patients_tp ? selectedModel?.patients_tp : 0,
                                phenom: selectedModel?.patients_phenom || 0,
                              }
                            ].map((metric, index) => {
                              const improvement = metric.traditional > 0
                                ? Math.round(((metric.phenom - metric.traditional) / metric.traditional) * 100)
                                : 0;

                              return (
                                <tr key={metric.category} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-2 border-b border-gray-200">
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">{metric.category}</div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                                    <div className="text-lg font-bold text-gray-700">
                                      {metric.traditional.toLocaleString()}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 border-b border-gray-200 text-center">
                                    <div className="text-lg font-bold text-indigo-600">
                                      {metric.phenom.toLocaleString()}
                                    </div>
                                  </td>
                                  {/*<td className="px-4 py-2 border-b border-gray-200 text-center">
                                    <div className="flex items-center justify-center gap-1 text-green-600">
                                      <span className="font-semibold">+{improvement}%</span>
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                                      </svg>
                                    </div>
                                  </td>*/}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Analysis Toggle removed - only performance view */}

              {/* Only performance content remains */}
                {/* Model Performance and ROC Curve Row */}
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
                  {/* Model Performance */}
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg text-left">Model Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{selectedModel?.auc?.toFixed(3) || 'N/A'}</p>
                            <p className="text-sm text-blue-800">AUC</p>
                          </div>
                          {typeof selectedModel.risk_threshold_pct === 'number' && (
                            <div className="text-center p-3 rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">Top {selectedModel.risk_threshold_pct.toFixed(1)}%</p>
                              <p className="text-sm text-blue-800 flex items-center justify-center gap-1">
                                {selectedModel.indication_type == "diagnosis" ? "Risk Threshold" : "Probability Threshold"}
                                <UITooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center cursor-help text-blue-600">
                                      <InfoIcon className="h-4 w-4" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Patients are in the top {selectedModel.risk_threshold_pct.toFixed(1)}% {selectedModel.indication_type == "diagnosis" ? "risk" : "probability"} <br/>for this outcome</p>
                                  </TooltipContent>
                                </UITooltip>
                              </p>
                            </div>
                          )}
                          {selectedModel.model_lift && (
                            <div className="text-center p-3 rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">{selectedModel?.model_lift?.toFixed(1) || 'N/A'}x</p>
                              <p className="text-sm text-blue-800 flex items-center justify-center gap-1">
                                {selectedModel.indication_type == "diagnosis" ? "Risk Lift" : "Model Lift"}
                                <UITooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center cursor-help text-blue-600">
                                      <InfoIcon className="h-4 w-4" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Patients are {(selectedModel?.model_lift ?? 0).toFixed(1)}x as likely to have <br/> this outcome as the baseline population</p>
                                  </TooltipContent>
                                </UITooltip>
                              </p>
                            </div>
                          )}
                          {/* Cohort Size */}
                          {false && (
                          <div className="text-center p-3 rounded-lg">
                            <p className="text-2xl font-bold text-gray-600">{(selectedModel?.patients_total ? selectedModel.patients_total - (selectedModel.patients_phenom || 0) : 0).toLocaleString()}</p>
                            <p className="text-sm text-gray-800">Baseline Cohort</p>
                          </div>
                          )}
                      </div>

                      {rocData && Array.isArray(rocData) && rocData.length > 0 && (
                          <>
                          <h4 className="pt-4 font-medium text-gray-900 mb-1 text-center">ROC Curve</h4>
                          <div className="h-96 flex items-center justify-center pb-6 ">
                                <ResponsiveContainer width="75%" height="100%">
                                  <LineChart data={rocData as any[]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="fpr" 
                                      type="number"
                                      label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }}
                                      domain={[0, 1]}
                                      tickCount={5}
                                      tickFormatter={(value) => value.toFixed(2)}
                                    />
                                    <YAxis 
                                      dataKey="tpr"
                                      label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }}}
                                      domain={[0, 1]}
                                      tickFormatter={(value) => value.toFixed(1)}
                                    />
                                    <Tooltip 
                                      formatter={(value: number, name: string, props: any) => {
                                        const payload = props.payload;
                                        if (payload) {
                                          return [
                                            `${payload.tpr?.toFixed(3) || value.toFixed(3)}`,
                                            'TPR'
                                          ];
                                        }
                                        return [value.toFixed(3), 'TPR'];
                                      }}
                                      labelFormatter={(value: number) => `FPR : ${value.toFixed(3)}`}
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="tpr" 
                                      stroke="#2563eb" 
                                      strokeWidth={2}
                                      dot={false}
                                      name="ROC Curve"
                                    />
                                    <ReferenceLine 
                                      segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
                                      stroke="#ef4444" 
                                      strokeDasharray="5 5" 
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>  
                          </>
                          )}

                      <Separator />

                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900 mb-1">Created</h4>
                          <p className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(selectedModel.created_at)}
                          </p>
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900 mb-1">Last Updated</h4>
                          <p className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(selectedModel.updated_at)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}