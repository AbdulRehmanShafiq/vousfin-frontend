import { create } from 'zustand';
import vendorService from '../services/vendor.service';

const useVendorStore = create((set, get) => ({
  vendors: [],
  selectedVendor: null,
  totalVendors: 0,
  loading: false,
  error: null,

  fetchVendors: async (filters = {}, pagination = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorService.listVendors({ ...filters, ...pagination });
      set({ 
        vendors: response.data.data.data, 
        totalVendors: response.data.data.total,
        loading: false 
      });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch vendors', loading: false });
      throw error;
    }
  },

  fetchVendorById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorService.getVendorById(id);
      set({ selectedVendor: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch vendor', loading: false });
      throw error;
    }
  },

  createVendor: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorService.createVendor(data);
      // Optimistically update list if already loaded
      const { vendors } = get();
      set({ 
        vendors: [response.data.data, ...vendors],
        loading: false 
      });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create vendor', loading: false });
      throw error;
    }
  },

  updateVendor: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await vendorService.updateVendor(id, data);
      const updatedVendor = response.data.data;
      
      const { vendors, selectedVendor } = get();
      
      set({ 
        vendors: vendors.map(v => v._id === id ? updatedVendor : v),
        selectedVendor: selectedVendor?._id === id ? updatedVendor : selectedVendor,
        loading: false 
      });
      return updatedVendor;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update vendor', loading: false });
      throw error;
    }
  },
}));

export default useVendorStore;
