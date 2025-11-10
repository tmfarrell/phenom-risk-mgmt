import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, X, ExternalLink, Check, ChevronsUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PhenomModel {
  id: string;
  model_name: string;
  indication_type: string;
  indication_code: string;
  patients_total: number | null;
  patients_phenom: number | null;
  providers_total: number | null;
  providers_phenom: number | null;
}

interface NpiList {
  name: string;
  count: number;
}

interface CohortSelectorProps {
  onModelChange: (modelData: { id: string; name: string; source?: 'phenom' | 'dataset'; patients?: number; providers?: number } | null) => void;
  onFileUpload?: (file: File | null) => void;
  onNpiListChange?: (listName: string | null) => void;
  onLoad: (loading: boolean) => void;
  shouldReset: boolean;
  showNpiUpload?: boolean;
  initialModel?: { id: string; name: string; source?: 'phenom' | 'dataset'; patients?: number; providers?: number } | null;
  initialNpiListName?: string | null;
  filterProviderAnalytics?: boolean;
}

export const CohortSelector = ({ onModelChange, onFileUpload, onNpiListChange, onLoad, shouldReset, showNpiUpload = true, initialModel, initialNpiListName, filterProviderAnalytics = false }: CohortSelectorProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const CLEAR_NPI_LIST_VALUE = '__none__';
  const [selectedModel, setSelectedModel] = useState<string>(initialModel?.id || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedNpiList, setSelectedNpiList] = useState<string>(initialNpiListName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(!!initialModel && !!initialModel.id);
  const [models, setModels] = useState<PhenomModel[]>([]);
  const [datasetCohorts, setDatasetCohorts] = useState<{ id: string; name: string; patients: number; providers?: number }[]>([]);
  const [npiLists, setNpiLists] = useState<NpiList[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [loadingNpiLists, setLoadingNpiLists] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [open, setOpen] = useState(false);

  const selectedModelData = models.find(m => m.id === selectedModel);

  // Fetch PhenOM models from database
  useEffect(() => {
    const fetchModels = async () => {
      try {
        let query = supabase
          .from('phenom_models')
          .select('id, model_name, indication_type, indication_code, patients_total, patients_phenom, providers_total, providers_phenom')
          .not('patients_total', 'is', null)
          .not('patients_phenom', 'is', null)
          .not('providers_total', 'is', null)
          .not('providers_phenom', 'is', null);

        // If filtering by provider analytics, only include models that have records in provider_analytics_with_geography
        if (filterProviderAnalytics) {
          const { data: analyticsData, error: analyticsError } = await supabase
            .from('provider_analytics_with_geography')
            .select('model_id')
            .not('model_id', 'is', null);

          if (analyticsError) {
            console.error('Error fetching provider analytics data:', analyticsError);
            setModels([]);
            setLoadingModels(false);
            return;
          }

          // Get unique model IDs that have provider analytics data
          const modelIdsWithAnalytics = [...new Set(analyticsData?.map(item => item.model_id) || [])];
          
          if (modelIdsWithAnalytics.length > 0) {
            query = query.in('id', modelIdsWithAnalytics);
          } else {
            // No models have provider analytics data
            setModels([]);
            setLoadingModels(false);
            return;
          }
        }

        const { data, error } = await query.order('model_name');

        if (error) {
          console.error('Error fetching models:', error);
        } else {
          setModels(data || []);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [filterProviderAnalytics]);

  // Fetch dataset cohorts from ref CSV (used by CohortExplorer)
  useEffect(() => {
    const loadDatasets = async () => {
      if (filterProviderAnalytics) {
        setDatasetCohorts([]);
        setLoadingDatasets(false);
        return;
      }
      try {
        setDatasetCohorts([]);
        setLoadingDatasets(false);
        return;
      } catch (e) {
        console.error('Failed to load dataset cohorts csv', e);
        setDatasetCohorts([]);
      } finally {
        setLoadingDatasets(false);
      }
    };
    loadDatasets();
  }, []);

  // Fetch user's NPI lists from database
  useEffect(() => {
    const fetchNpiLists = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingNpiLists(false);
          return;
        }

        const { data, error } = await supabase
          .from('npi_lists')
          .select('name')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching NPI lists:', error);
        } else {
          // Group by name and count
          const listCounts = (data || []).reduce((acc: Record<string, number>, item) => {
            acc[item.name] = (acc[item.name] || 0) + 1;
            return acc;
          }, {});
          
          const uniqueLists = Object.entries(listCounts).map(([name, count]) => ({
            name,
            count
          }));
          
          setNpiLists(uniqueLists);
        }
      } catch (error) {
        console.error('Error fetching NPI lists:', error);
      } finally {
        setLoadingNpiLists(false);
      }
    };

    fetchNpiLists();
  }, []);

  useEffect(() => {
    if (shouldReset) {
      setIsLoading(false);
      setIsLoaded(false);
      setSelectedNpiList('');
    }
  }, [shouldReset]);

  // Initialize from cached values when models/datasets are loaded
  useEffect(() => {
    if (!hasInitialized && !loadingModels && !loadingDatasets && initialModel?.id) {
      setHasInitialized(true);
      const modelExists = models.find(m => m.id === initialModel.id);
      const datasetExists = datasetCohorts.find(d => d.id === initialModel.id);
      if (modelExists || datasetExists) {
        setSelectedModel(initialModel.id);
        setIsLoaded(true);
        // Auto-trigger load for cached model
        const triggerLoad = async () => {
          setIsLoading(true);
          onLoad(true);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsLoading(false);
          setIsLoaded(true);
          onLoad(false);
        };
        triggerLoad();
      } else {
        console.log('CohortSelector: Model not found in list', initialModel.id, models);
      }
    }
  }, [loadingModels, loadingDatasets, models, datasetCohorts, initialModel, hasInitialized]);

  const handleModelChange = async (value: string) => {
    const isClearing = value === '__none__';
    setSelectedModel(isClearing ? '' : value);
    const modelData = models.find(m => m.id === value);
    const datasetData = datasetCohorts.find(d => d.id === value);
    if (isClearing) {
      onModelChange(null);
    } else if (modelData) {
      onModelChange({ id: modelData.id, name: modelData.model_name, source: 'phenom' });
    } else if (datasetData) {
      onModelChange({ id: datasetData.id, name: datasetData.name, source: 'dataset', patients: datasetData.patients, providers: datasetData.providers });
    } else {
      onModelChange(null);
    }
    
    // Reset loading states when clearing selection
    if (isClearing) {
      setIsLoaded(false);
      setIsLoading(false);
      return;
    }
    
    // Automatically trigger loading when a model is selected (but not if already loaded with same model)
    if (modelData || datasetData) {
      await handleLoad();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setShowNameModal(true);
    }
  };

  const handleUploadClick = async () => {
    if (selectedFile) {
      setSelectedFile(null);
    }
  };

  const handleLoad = async () => {
    setIsLoading(true);
    onLoad(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsLoaded(true);
    onLoad(false);
  };

  return (
    <Card className="shadow-sm border-0 bg-white w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Main row with all controls */}
          <div className="flex gap-6 items-start">
            {/* Left side - Cohort Selection */}
            <div className="w-80">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-blue-900">Select Outcome</p>
                {/*<Badge variant="destructive" className="bg-red-500 text-xs">Required</Badge>*/}
              </div>
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-9 text-sm border border-blue-200 focus:border-blue-500 justify-between"
                    disabled={loadingModels || loadingDatasets}
                  >
                    {(loadingModels || loadingDatasets) ? (
                      "Loading cohorts..."
                    ) : selectedModel ? (
                      models.find(m => m.id === selectedModel)?.model_name || 
                      datasetCohorts.find(d => d.id === selectedModel)?.name || 
                      "Select a cohort..."
                    ) : (
                      "Select a cohort..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search cohorts..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No cohorts found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__none__"
                          onSelect={() => {
                            handleModelChange('__none__');
                            setOpen(false);
                          }}
                          className="text-sm py-2 text-gray-500"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedModel === '__none__' ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          None
                        </CommandItem>
                      </CommandGroup>
                      <CommandGroup heading="PhenOM Outcomes">
                        {models.map((model) => (
                          <CommandItem
                            key={model.id}
                            value={model.model_name}
                            onSelect={() => {
                              handleModelChange(model.id);
                              setOpen(false);
                            }}
                            className="text-sm py-2"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedModel === model.id ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            <div className="flex flex-col items-start w-full">
                              <span className="font-medium">{model.model_name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Right side - Model Details Link (only for PhenOM outcomes) */}
            {selectedModelData && isLoaded && (
              <div className="mt-7">
                <Button
                  onClick={() => navigate(`/phenom-builder/${selectedModelData.id}`)}
                  variant="outline"
                  size="sm"
                  className="h-9 flex items-center gap-2 text-sm"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Model Details
                </Button>
              </div>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
};
