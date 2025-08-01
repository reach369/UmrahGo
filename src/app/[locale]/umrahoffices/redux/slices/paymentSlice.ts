import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payment } from '../api/paymentsApiSlice';

// Interface for the payment state
interface PaymentState {
  selectedPayment: Payment | null;
  filterStatus: string | null;
  filterBookingId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: PaymentState = {
  selectedPayment: null,
  filterStatus: null,
  filterBookingId: null,
  searchQuery: '',
  isLoading: false,
  error: null,
};

// Create the slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Select a payment for viewing or editing
    selectPayment: (state, action: PayloadAction<Payment | null>) => {
      state.selectedPayment = action.payload;
    },
    
    // Set filter status for payment list
    setFilterStatus: (state, action: PayloadAction<string | null>) => {
      state.filterStatus = action.payload;
    },
    
    // Set filter booking id for payment list
    setFilterBookingId: (state, action: PayloadAction<string | null>) => {
      state.filterBookingId = action.payload;
    },
    
    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Set error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Reset payment state
    resetPaymentState: (state) => {
      state.selectedPayment = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

// Export actions and reducer
export const {
  selectPayment,
  setFilterStatus,
  setFilterBookingId,
  setSearchQuery,
  setLoading,
  setError,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer; 