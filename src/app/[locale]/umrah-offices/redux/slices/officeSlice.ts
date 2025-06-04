import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Office, UmrahPackage } from '../api/officesApiSlice';

// Interface for the office state
interface OfficeState {
  selectedOffice: Office | null;
  selectedPackage: UmrahPackage | null;
  filterLocation: string | null;
  filterVerified: boolean | null;
  searchQuery: string;
  isSubmitting: boolean;
  error: string | null;
}

// Initial state
const initialState: OfficeState = {
  selectedOffice: null,
  selectedPackage: null,
  filterLocation: null,
  filterVerified: null,
  searchQuery: '',
  isSubmitting: false,
  error: null,
};

// Create the slice
const officeSlice = createSlice({
  name: 'office',
  initialState,
  reducers: {
    // Select an office for viewing or editing
    selectOffice: (state, action: PayloadAction<Office | null>) => {
      state.selectedOffice = action.payload;
    },
    
    // Select a package for viewing or editing
    selectPackage: (state, action: PayloadAction<UmrahPackage | null>) => {
      state.selectedPackage = action.payload;
    },
    
    // Set filter location for office list
    setFilterLocation: (state, action: PayloadAction<string | null>) => {
      state.filterLocation = action.payload;
    },
    
    // Set filter verified status for office list
    setFilterVerified: (state, action: PayloadAction<boolean | null>) => {
      state.filterVerified = action.payload;
    },
    
    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    // Set submitting state for forms
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    
    // Set error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Reset office state
    resetOfficeState: (state) => {
      state.selectedOffice = null;
      state.selectedPackage = null;
      state.isSubmitting = false;
      state.error = null;
    },
  },
});

// Export actions and reducer
export const {
  selectOffice,
  selectPackage,
  setFilterLocation,
  setFilterVerified,
  setSearchQuery,
  setSubmitting,
  setError,
  resetOfficeState,
} = officeSlice.actions;

export default officeSlice.reducer; 