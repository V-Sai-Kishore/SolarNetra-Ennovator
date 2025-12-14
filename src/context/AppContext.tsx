import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppSettings, UploadedImage, UploadedCSV, SolarAnalysisResult, ResultsMap } from '@/lib/types';
import { seedFromImage, generateId } from '@/lib/seed';

// 1. ADD BACKEND URL
const BACKEND_URL = 'http://localhost:3000/api'; 
// NOTE: Removed 'runIdeaById' and 'mergeIdeaResults' imports

const DEFAULT_SETTINGS: AppSettings = {
  has_solar_threshold: 0.5,
  plg_threshold: 0.6,
  shadow_threshold: 0.5,
  freshness_threshold: 0.3,
  lookalike_threshold: 0.7,
  buffer_meters: 100,
  wp_per_m2: 200,
  panel_standard_m2: 1.7,
  save_artifacts: true,
};

interface AppContextType {
  // State
  uploadedImage: UploadedImage | null;
  uploadedCSV: UploadedCSV | null;
  activeIdea: number | null;
  resultsMap: ResultsMap;
  settings: AppSettings;
  isRunning: boolean;
  runProgress: { current: number; total: number } | null;
  sidebarCollapsed: boolean;
  drawerOpen: boolean;

  // Actions
  setUploadedImage: (image: UploadedImage | null) => void;
  setUploadedCSV: (csv: UploadedCSV | null) => void;
  setActiveIdea: (id: number | null) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  runIdea: (id: number, options?: { sunAngle?: number }) => Promise<Partial<SolarAnalysisResult>>;
  runAll: () => Promise<SolarAnalysisResult>;
  saveResult: (id: string, result: SolarAnalysisResult) => void;
  loadResult: (id: string) => SolarAnalysisResult | null;
  deleteResult: (id: string) => void;
  flagResult: (id: string, flagged: boolean) => void;
  downloadEvidence: (result: SolarAnalysisResult) => Promise<void>;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  uploadFile: (file: File) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_RESULTS = 'solver_results';
const STORAGE_KEY_SETTINGS = 'solver_settings';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [uploadedCSV, setUploadedCSV] = useState<UploadedCSV | null>(null);
  const [activeIdea, setActiveIdea] = useState<number | null>(null);
  const [resultsMap, setResultsMap] = useState<ResultsMap>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState<{ current: number; total: number } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem(STORAGE_KEY_RESULTS);
      if (savedResults) {
        setResultsMap(JSON.parse(savedResults));
      }

      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  }, []);

  // Save results to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(resultsMap));
    } catch (e) {
      console.error('Failed to save results:', e);
    }
  }, [resultsMap]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    const seed = await seedFromImage(file);
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = dataUrl;
    });

    setUploadedImage({
      file,
      dataUrl,
      width: img.width,
      height: img.height,
      seed,
    });
  }, [setUploadedImage]);

  // 2. REWRITE runIdea FOR BACKEND API CALL
  const runIdea = useCallback(async (id: number, options?: { sunAngle?: number }): Promise<Partial<SolarAnalysisResult>> => {
    
    if (!uploadedImage && !uploadedCSV) {
      throw new Error('No data uploaded');
    }

    const payload = {
      image_data_url: uploadedImage?.dataUrl,
      csv_data: uploadedCSV?.data,
      settings,
      width: uploadedImage?.width || 400,
      height: uploadedImage?.height || 300,
      sunAngle: options?.sunAngle,
      seed: uploadedImage?.seed || uploadedCSV?.seed || Date.now(),
      image_source: uploadedImage?.file.name || 'unknown.png',
      csv_source: uploadedCSV?.file.name,
    };

    setIsRunning(true);
    try {
      // API Call to Backend's /run-idea/:id endpoint
      const response = await fetch(`${BACKEND_URL}/run-idea/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), // Send data as JSON body
      });

      if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(`Backend analysis failed (Status ${response.status}): ${errorBody.error}`);
      }

      // Return the result from Python
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Analysis for Idea ${id} failed:`, error);
      // Re-throw the error for the UI to handle (e.g., showing a toast)
      throw new Error(`Analysis failed. Check your Node/Python console for details: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [uploadedImage, uploadedCSV, settings]);

  // 3. REWRITE runAll FOR BACKEND API CALL
  const runAll = useCallback(async (): Promise<SolarAnalysisResult> => {
    
    if (!uploadedImage && !uploadedCSV) {
      throw new Error('No data uploaded');
    }

    const fileName = uploadedImage?.file.name || 'uploaded_image.png';

    const payload = {
      image_data_url: uploadedImage?.dataUrl,
      csv_data: uploadedCSV?.data,
      csv_source: uploadedCSV?.file.name,
      settings,
      width: uploadedImage?.width || 400,
      height: uploadedImage?.height || 300,
      image_source: fileName,
      seed: uploadedImage?.seed || uploadedCSV?.seed || Date.now(),
    };

    setIsRunning(true);
    setRunProgress({ current: 0, total: 30 });
    
    try {
      // Start Progress Simulation while the backend runs the heavy Python process
      const totalSteps = 30;
      let currentStep = 0;
      const progressSimulator = setInterval(() => {
          if (currentStep < totalSteps) {
              currentStep++;
              setRunProgress({ current: currentStep, total: totalSteps });
          }
      }, 100); 

      // API Call to Backend's /run-all endpoint
      const response = await fetch(`${BACKEND_URL}/run-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });
      
      // Stop the simulation and force 100% completion
      clearInterval(progressSimulator); 
      setRunProgress({ current: totalSteps, total: totalSteps });

      if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(`Backend "Run All" failed (Status ${response.status}): ${errorBody.error}`);
      }
      
      // Return the merged result from the backend
      const merged = await response.json();
      return merged;

    } catch (error) {
      console.error('Run all failed:', error);
      throw new Error(`Run All analysis failed. Check your Node/Python console for details: ${error.message}`);
    } finally {
      setIsRunning(false);
      setRunProgress(null);
    }
  }, [uploadedImage, uploadedCSV, settings]);

  const saveResult = useCallback((id: string, result: SolarAnalysisResult) => {
    setResultsMap(prev => ({ ...prev, [id]: result }));
  }, []);

  const loadResult = useCallback((id: string): SolarAnalysisResult | null => {
    return resultsMap[id] || null;
  }, [resultsMap]);

  const deleteResult = useCallback((id: string) => {
    setResultsMap(prev => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
  }, []);

  const flagResult = useCallback((id: string, flagged: boolean) => {
    setResultsMap(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], flagged },
      };
    });
  }, []);

  const downloadEvidence = useCallback(async (result: SolarAnalysisResult) => {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();

    // Add JSON
    zip.file('analysis.json', JSON.stringify(result, null, 2));

    // Add artifacts as images
    if (result.artifacts.mask_data_url) {
      const maskData = result.artifacts.mask_data_url.split(',')[1];
      zip.file('mask.png', maskData, { base64: true });
    }
    if (result.artifacts.overlay_data_url) {
      const overlayData = result.artifacts.overlay_data_url.split(',')[1];
      zip.file('overlay.png', overlayData, { base64: true });
    }
    if (result.artifacts.gradcam_data_url) {
      const gradcamData = result.artifacts.gradcam_data_url.split(',')[1];
      zip.file('gradcam.png', gradcamData, { base64: true });
    }

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `evidence_${result.id}.zip`);
  }, []);

  const value: AppContextType = {
    uploadedImage,
    uploadedCSV,
    activeIdea,
    resultsMap,
    settings,
    isRunning,
    runProgress,
    sidebarCollapsed,
    drawerOpen,
    setUploadedImage,
    setUploadedCSV,
    setActiveIdea,
    updateSettings,
    runIdea, // Now uses API
    runAll,  // Now uses API
    saveResult,
    loadResult,
    deleteResult,
    flagResult,
    downloadEvidence,
    setSidebarCollapsed,
    setDrawerOpen,
    uploadFile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}