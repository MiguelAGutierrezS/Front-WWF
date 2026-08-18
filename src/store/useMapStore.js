import { create } from 'zustand';
import { camera_stations as defaultCameraStations, species as defaultSpecies, projects as defaultProjects, users as defaultUsers } from '../data/mockDatabase';

export const useMapStore = create((set) => ({
  mode: 'cameras', // 'cameras'
  activeProjectId: null,
  cameraStations: defaultCameraStations, // estaciones iniciales (fallback asegurado)
  projects: defaultProjects, // proyectos iniciales (fallback asegurado)
  users: defaultUsers, // usuarios iniciales (fallback asegurado)
  species: defaultSpecies, // avistamientos iniciales (fallback asegurado)
  drawingMode: null, // 'circle' | 'rectangle' | null
  selectionShape: null, // the active shape bounds/coords
  selectedCameraIds: [], // cameras captured by the shape
  reportFilters: {
    startDate: null,
    endDate: null,
    excludedSpecies: [],
    activeCharts: ['biodiversity', 'seasonal', 'accumulation', 'activity', 'occupancy', 'temperature', 'prey', 'rai', 'trophic', 'timeline', 'frequency', 'pie', 'mapaCalor'],
    activePeriods: ['Mañana', 'Tarde', 'Noche'],
    tempMin: '',
    tempMax: ''
  },
  globalCameraFilters: {
    activeTime: null,
    dateStart: null,
    dateEnd: null,
    selectedSpecies: []
  },
  setMode: (mode) => set({ mode }),
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  setCameraStations: (stations) => set({ cameraStations: stations }),
  setProjects: (projects) => set({ projects }),
  setUsers: (users) => set({ users }),
  setSpecies: (species) => set({ species }),
  setDrawingMode: (drawingMode) => set({ drawingMode }),
  setSelectionShape: (shape) => set({ selectionShape: shape }),
  setSelectedCameraIds: (ids) => set({ selectedCameraIds: ids }),
  setReportFilters: (filters) => set((state) => ({ reportFilters: { ...state.reportFilters, ...filters } })),
  resetReportFilters: () => set({ 
    reportFilters: {
      startDate: null,
      endDate: null,
      excludedSpecies: [],
      activeCharts: ['biodiversity', 'seasonal', 'accumulation', 'activity', 'occupancy', 'temperature', 'prey', 'rai', 'trophic', 'timeline', 'frequency', 'pie', 'mapaCalor'],
      activePeriods: ['Mañana', 'Tarde', 'Noche'],
      tempMin: '',
      tempMax: ''
    }
  }),
  setGlobalCameraFilters: (filters) => set({ globalCameraFilters: filters }),
  clearSelection: () => set({ drawingMode: null, selectionShape: null, selectedCameraIds: [] }),
}));
