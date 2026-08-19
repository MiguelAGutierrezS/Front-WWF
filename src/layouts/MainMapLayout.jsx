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
import { AnimatePresence, motion } from 'framer-motion';

export const MainMapLayout = () => {
  const { mode, setMode, setActiveProject } = useMapStore();
  const { activeModal, openModal, closeModal } = useModalStore();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background Map Layer */}
      <FullScreenMap />

      {/* Floating UI Layer */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
        
        <div className="absolute top-4 right-4 pointer-events-auto z-50">
          <Link to="/login">
            <Button variant="primary" className="bg-[#003366] hover:bg-[#004488] shadow-xl rounded-full px-6 py-3 text-[15px] font-bold cursor-pointer transition-all duration-300 hover:scale-105 flex items-center justify-center">
              <User className="w-5 h-5 mr-2" />
              Login
            </Button>
          </Link>
        </div>

        {/* Trigger Button (Moved up) - Hides when filter modal is open */}
        {activeModal !== 'filters' && (
          <div className="absolute right-4 top-20 pointer-events-auto z-40">
             <button 
               onClick={() => openModal('filters')}
               className="w-14 h-14 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl hover:bg-black/80 transition-all group cursor-pointer hover:scale-105"
             >
               <List className="w-7 h-7 text-[#00ff88] group-hover:scale-110 transition-transform" />
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
            <AnimatePresence>
              {activeModal === 'projectList' && (
                 <motion.div key="pl-backdrop" className="fixed inset-0 z-40 pointer-events-auto cursor-default" onClick={closeModal} />
              )}
              {activeModal === 'projectList' && (
                <motion.div 
                  key="pl-modal"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 pointer-events-auto shadow-2xl z-50"
                >
                   <ProjectListModal />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Area Selector Toolbar (Bottom Center) */}
        <AreaSelectorToolbar />

        {/* Floating Action Button for Creation (Bottom Right) */}
        <CreationFAB />
      </div>

      {/* Dynamic Modals Layer */}
      <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
         <AnimatePresence>
           {/* Backdrop for standard centered modals */}
           {activeModal && activeModal !== 'projectList' && activeModal !== 'filters' && (
             <motion.div
               key="global-backdrop"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
               onClick={closeModal}
             />
           )}

           {activeModal === 'filters' && (
              <motion.div key="filters-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0">
                 <FilterPanel />
              </motion.div>
           )}
           {activeModal === 'cameraData' && (
              <motion.div key="cameraData-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                 <CameraDataModal />
              </motion.div>
           )}
           {activeModal === 'projectGiant' && (
              <motion.div key="projectGiant-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                 <ProjectGiantModal />
              </motion.div>
           )}
           {activeModal === 'reportConfig' && (
              <motion.div key="reportConfig-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                 <ReportConfigModal />
              </motion.div>
           )}
           {activeModal === 'customReport' && (
              <motion.div key="customReport-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                 <CustomReportModal />
              </motion.div>
           )}
           {activeModal === 'createProject' && (
              <motion.div key="createProject-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                 <CreateProjectModal />
              </motion.div>
           )}
           {activeModal === 'createStation' && (
              <motion.div key="createStation-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                 <CreateStationModal />
              </motion.div>
           )}
           {activeModal === 'userManager' && (
              <motion.div key="userManager-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                 <UserManagerModal />
              </motion.div>
           )}
         </AnimatePresence>
      </div>
    </div>
  );
};
