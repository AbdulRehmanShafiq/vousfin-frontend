import { create } from 'zustand';
import customerService from '../services/customer.service';

const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  totalCustomers: 0,
  loading: false,
  error: null,

  fetchCustomers: async (filters = {}, pagination = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await customerService.listCustomers({ ...filters, ...pagination });
      set({ 
        customers: response.data.data.data, 
        totalCustomers: response.data.data.total,
        loading: false 
      });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch customers', loading: false });
      throw error;
    }
  },

  fetchCustomerById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await customerService.getCustomerById(id);
      set({ selectedCustomer: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch customer', loading: false });
      throw error;
    }
  },

  createCustomer: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await customerService.createCustomer(data);
      // Optimistically update list if already loaded
      const { customers } = get();
      set({ 
        customers: [response.data.data, ...customers],
        loading: false 
      });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create customer', loading: false });
      throw error;
    }
  },

  updateCustomer: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await customerService.updateCustomer(id, data);
      const updatedCustomer = response.data.data;
      
      const { customers, selectedCustomer } = get();
      
      set({ 
        customers: customers.map(c => c._id === id ? updatedCustomer : c),
        selectedCustomer: selectedCustomer?._id === id ? updatedCustomer : selectedCustomer,
        loading: false 
      });
      return updatedCustomer;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update customer', loading: false });
      throw error;
    }
  },
}));

export default useCustomerStore;
