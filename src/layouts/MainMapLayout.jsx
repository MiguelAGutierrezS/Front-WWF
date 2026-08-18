import React from 'react';
import { Link } from 'react-router-dom';
import { FullScreenMap } from '../features/map/FullScreenMap';
import { CameraDataModal } from '../features/cameras/CameraDataModal';
import { ProjectListModal } from '../features/projects/ProjectListModal';
import { ProjectGiantModal } from '../features/projects/ProjectGiantModal';
import { CustomReportModal } from '../features/projects/CustomReportModal';
import { ReportConfigModal } from '../features/projects/ReportConfigModal';
import { CreateProjectModal } from '../features/projects/CreateProjectModal';
import { CreateStationModal } from '../features/cameras/CreateStationModal';
import { UserManagerModal } from '../features/users/UserManagerModal';
import { CreationFAB } from '../features/map/CreationFAB';
import { FilterPanel } from '../features/map/FilterPanel';
import { AreaSelectorToolbar } from '../features/map/AreaSelectorToolbar';
import { Button } from '../components/ui/Button';
import { useMapStore } from '../store/useMapStore';
import { useModalStore } from '../store/useModalStore';
import { Camera, Map as MapIcon, User, List } from 'lucide-react';

export const MainMapLayout = () => {
  const { mode, setMode, setActiveProject } = useMapStore();
  const { activeModal, openModal, closeModal } = useModalStore();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Map Layer */}
      <FullScreenMap />

      {/* Floating UI Layer */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
        
        {/* Global Login Button */}
        <div className="absolute top-4 right-4 pointer-events-auto z-50">
          <Link to="/login">
            <Button variant="primary" className="bg-[#003366] hover:bg-[#004488] shadow-xl rounded-full px-6 py-3 text-[15px] font-bold cursor-pointer transition-all duration-300 hover:scale-105">
              <User className="w-5 h-5 mr-2" />
              Login de Investigador
            </Button>
          </Link>
        </div>

        {/* Trigger Button (Moved up) - Hides when filter modal is open */}
        {activeModal !== 'filters' && (
          <div className="absolute right-6 top-32 pointer-events-auto z-40">
             <button 
               onClick={() => openModal('filters')}
               className="w-16 h-16 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl hover:bg-black/80 transition-all group cursor-pointer hover:scale-105"
             >
               <List className="w-8 h-8 text-[#00ff88] group-hover:scale-110 transition-transform" />
             </button>
          </div>
        )}

        {/* Top Navbar / Toolbar */}
        <div className="p-4 flex justify-between items-start pointer-events-none mt-14 relative z-50">
          <div className="pointer-events-auto bg-background/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex gap-2 shadow-xl relative">
            <Button 
              variant={activeModal !== 'projectList' && activeModal !== 'projectGiant' ? 'primary' : 'ghost'} 
              onClick={() => {
                setMode('cameras');
                setActiveProject(null); // Reset highlighted cameras to green default
                closeModal(); // Close any open modal
              }}
              className="cursor-pointer text-lg py-3 px-6 transition-all duration-300 hover:scale-105"
            >
              <Camera className="w-5 h-5 mr-2" />
              Estaciones
            </Button>
            <Button 
              variant={activeModal === 'projectList' || activeModal === 'projectGiant' ? 'primary' : 'ghost'} 
              onClick={() => openModal('projectList')}
              className="cursor-pointer text-lg py-3 px-6 transition-all duration-300 hover:scale-105"
            >
              <MapIcon className="w-5 h-5 mr-2" />
              Proyectos
            </Button>
            
            {/* Project List Modal anchoring to the nav */}
            {activeModal === 'projectList' && (
              <div className="absolute top-full left-0 mt-2 pointer-events-auto shadow-2xl">
                 <ProjectListModal />
              </div>
            )}
          </div>
        </div>
        
        {/* Area Selector Toolbar (Bottom Center) */}
        <AreaSelectorToolbar />

        {/* Floating Action Button for Creation (Bottom Right) */}
        <CreationFAB />
      </div>

      {/* Dynamic Modals Layer (Absolute to root viewport) */}
      <div className="absolute inset-0 pointer-events-none z-50">
         {activeModal === 'filters' && (
           <div className="absolute right-6 top-32 pointer-events-auto shadow-2xl origin-top-right animate-in fade-in zoom-in duration-200">
              <FilterPanel />
           </div>
         )}
         {activeModal === 'cameraData' && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto shadow-2xl animate-in fade-in zoom-in duration-200">
              <CameraDataModal />
           </div>
         )}
         {activeModal === 'projectGiant' && (
           <div className="absolute inset-[5%] pointer-events-auto shadow-2xl z-[60] animate-in fade-in zoom-in-95 duration-500 ease-out">
              <ProjectGiantModal />
           </div>
         )}
         {activeModal === 'reportConfig' && (
           <div className="absolute inset-0 pointer-events-auto z-[60] animate-in fade-in zoom-in-95 duration-300">
              <ReportConfigModal />
           </div>
         )}
         {activeModal === 'customReport' && (
           <div className="absolute inset-[5%] pointer-events-auto shadow-2xl z-[60] animate-in fade-in zoom-in-95 duration-500 ease-out">
              <CustomReportModal />
           </div>
         )}
         {activeModal === 'createProject' && (
           <div className="absolute inset-0 pointer-events-auto z-[60] animate-in fade-in zoom-in-95 duration-300">
              <CreateProjectModal />
           </div>
         )}
         {activeModal === 'createStation' && (
           <div className="absolute inset-0 pointer-events-auto z-[60] animate-in fade-in zoom-in-95 duration-300">
              <CreateStationModal />
           </div>
         )}
         {activeModal === 'userManager' && (
           <div className="absolute inset-0 pointer-events-auto z-[60] animate-in fade-in zoom-in-95 duration-300">
              <UserManagerModal />
           </div>
         )}
      </div>
    </div>
  );
};
