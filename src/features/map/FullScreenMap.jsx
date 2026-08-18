import React, { useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { useMapStore } from '../../store/useMapStore';
import { useModalStore } from '../../store/useModalStore';
import { getCameraStations, getProjects, getUsers, getSpecies } from '../../services/api';
import { MapSelectionLayer } from './MapSelectionLayer';
import { AreaActionPopup } from './AreaActionPopup';
import { ScanEye } from 'lucide-react';

const MapController = () => {
  const map = useMap();
  const activeProjectId = useMapStore((state) => state.activeProjectId);
  const cameraStations = useMapStore((state) => state.cameraStations);

  useEffect(() => {
    if (map && activeProjectId && cameraStations.length > 0) {
      // Filtrar las cámaras de este proyecto para calcular el centro
      const projectCameras = cameraStations.filter(c => c.project_id === activeProjectId);
      
      if (projectCameras.length > 0) {
        const avgLat = projectCameras.reduce((acc, c) => acc + c.latitude, 0) / projectCameras.length;
        const avgLng = projectCameras.reduce((acc, c) => acc + c.longitude, 0) / projectCameras.length;
        
        map.panTo({ lat: avgLat, lng: avgLng });
        map.setZoom(12);
      }
    }
  }, [map, activeProjectId, cameraStations]);

  return null;
};

export const FullScreenMap = () => {
  const activeProjectId = useMapStore((state) => state.activeProjectId);
  const selectedCameraIds = useMapStore((state) => state.selectedCameraIds);
  const cameraStations = useMapStore((state) => state.cameraStations);
  const setCameraStations = useMapStore((state) => state.setCameraStations);
  
  const setProjects = useMapStore((state) => state.setProjects);
  const setUsers = useMapStore((state) => state.setUsers);
  const species = useMapStore((state) => state.species);
  const setSpecies = useMapStore((state) => state.setSpecies);
  
  const globalCameraFilters = useMapStore((state) => state.globalCameraFilters);
  const openModal = useModalStore((state) => state.openModal);

  // Fetch all live data from endpoint
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [camsData, projectsData, usersData, speciesData] = await Promise.all([
          getCameraStations({ skip: 0, limit: 100 }).catch(e => { console.error('Cams failed', e); return []; }),
          getProjects({ skip: 0, limit: 100 }).catch(e => { console.error('Projects failed', e); return []; }),
          getUsers({ skip: 0, limit: 100 }).catch(e => { console.error('Users failed', e); return []; }),
          getSpecies({ skip: 0, limit: 1000 }).catch(e => { console.error('Species failed', e); return []; })
        ]);
        
        const parsedCams = camsData.map(s => ({
          ...s,
          latitude: parseFloat(s.latitude),
          longitude: parseFloat(s.longitude)
        }));
        
        setCameraStations(parsedCams);
        setProjects(projectsData);
        setUsers(usersData);
        setSpecies(speciesData);
      } catch (err) {
        console.error('Error loading API data:', err);
      }
    };
    loadAllData();
  }, [setCameraStations, setProjects, setUsers, setSpecies]);

  const filteredStations = useMemo(() => {
    return cameraStations.filter(cam => {
      // 1. Get sightings for this camera
      let camSightings = species.filter(s => s.station_id === cam.id);
      
      // 2. Filter by Species if any selected
      if (globalCameraFilters?.selectedSpecies?.length > 0) {
        camSightings = camSightings.filter(s => globalCameraFilters.selectedSpecies.includes(s.common_name));
        if (camSightings.length === 0) return false;
      }
      
      // 3. Filter by Time if set
      let startTime = null;
      let endTime = null;
      
      if (globalCameraFilters?.dateStart) {
        startTime = new Date(globalCameraFilters.dateStart).getTime();
      }
      if (globalCameraFilters?.dateEnd) {
        const endD = new Date(globalCameraFilters.dateEnd);
        endD.setHours(23, 59, 59, 999);
        endTime = endD.getTime();
      }
      
      if (globalCameraFilters?.activeTime) {
        const now = new Date();
        if (globalCameraFilters.activeTime === 'HOY') {
          now.setHours(0, 0, 0, 0);
          startTime = now.getTime();
        } else if (globalCameraFilters.activeTime === '24 HRS') {
          startTime = now.getTime() - (24 * 60 * 60 * 1000);
        } else if (globalCameraFilters.activeTime === '7 DÍAS') {
          startTime = now.getTime() - (7 * 24 * 60 * 60 * 1000);
        }
      }
      
      if (startTime || endTime) {
        camSightings = camSightings.filter(s => {
          const timestamp = new Date(s.detection_timestamp).getTime();
          if (startTime && timestamp < startTime) return false;
          if (endTime && timestamp > endTime) return false;
          return true;
        });
        
        if (camSightings.length === 0) return false;
      }
      
      return true;
    });
  }, [cameraStations, globalCameraFilters, species]);

  return (
    <div className="absolute inset-0 z-0 bg-gray-900">
      <APIProvider 
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''} 
        version="3.64" 
        libraries={['drawing']}
      >
        <Map
          defaultCenter={{ lat: -10.0, lng: -65.0 }}
          defaultZoom={4}
          mapId="DEMO_MAP_ID"
          disableDefaultUI={true}
          className="w-full h-full"
        >
          <MapController />
          <MapSelectionLayer />
          <AreaActionPopup />
          
          {filteredStations.map((cam) => {
            const isHighlightProject = activeProjectId === cam.project_id;
            const isCaptured = selectedCameraIds.includes(cam.id);
            
            // Colores y tamaño del ScanEye
            let iconColor = "text-gray-300"; 
            let bgClass = "bg-gray-900/90 border-gray-600/50 shadow-[0_0_10px_rgba(0,0,0,0.5)]";
            let scaleClass = "scale-100 hover:scale-110";

            if (isCaptured) {
              iconColor = "text-[#f97316]"; // Naranja
              bgClass = "bg-[#c2410c]/90 border-[#f97316]/50 shadow-[0_0_15px_rgba(249,115,22,0.6)]";
              scaleClass = "scale-125 hover:scale-150 z-50";
            } else if (isHighlightProject) {
              iconColor = "text-white"; 
              bgClass = "bg-gray-700/90 border-gray-400/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]";
              scaleClass = "scale-110 hover:scale-125 z-40";
            }

            return (
              <AdvancedMarker 
                key={cam.id} 
                position={{ lat: cam.latitude, lng: cam.longitude }}
                onClick={() => openModal('cameraData', cam)}
                className="cursor-pointer"
                zIndex={isCaptured ? 100 : 1}
              >
                <div className={`p-2 rounded-full border-2 backdrop-blur-sm transition-all duration-300 ${bgClass} ${scaleClass}`}>
                  <ScanEye className={`w-6 h-6 ${iconColor}`} />
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
};
