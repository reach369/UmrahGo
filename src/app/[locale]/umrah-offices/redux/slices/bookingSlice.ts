import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '../api/bookingsApiSlice';

// Interface for the booking state
interface BookingState {
  selectedBooking: Booking | null;
  filterStatus: string;
  filterCampaignId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: BookingState = {
  selectedBooking: null,
  filterStatus: 'all',
  filterCampaignId: null,
  searchQuery: '',
  isLoading: false,
  error: null,
};

// Create the slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Select a booking for viewing or editing
    selectBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    
    // Set filter status for booking list
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
    },
    
    // Set filter campaign id for booking list
    setFilterCampaignId: (state, action: PayloadAction<string | null>) => {
      state.filterCampaignId = action.payload;
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
    
    // Confirm booking (local update)
    confirmBooking: (state, action: PayloadAction<string>) => {
      if (state.selectedBooking && state.selectedBooking.id === action.payload) {
        state.selectedBooking = {
          ...state.selectedBooking,
          status: 'confirmed',
          updatedAt: new Date().toISOString()
        };
      }
    },
    
    // Cancel booking (local update)
    cancelBooking: (state, action: PayloadAction<string>) => {
      if (state.selectedBooking && state.selectedBooking.id === action.payload) {
        state.selectedBooking = {
          ...state.selectedBooking,
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        };
      }
    },
    
    // Reset booking state
    resetBookingState: (state) => {
      state.selectedBooking = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

// Export actions and reducer
export const {
  selectBooking,
  setFilterStatus,
  setFilterCampaignId,
  setSearchQuery,
  setLoading,
  setError,
  confirmBooking,
  cancelBooking,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer; 