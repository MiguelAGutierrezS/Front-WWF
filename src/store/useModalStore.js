import { create } from 'zustand';

export const useModalStore = create((set) => ({
  activeModal: null, // 'cameraData', 'projectStats', 'upload', 'validation', 'auth', or null
  modalData: null, // specific data like camera ID, project ID, etc.
  openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));
