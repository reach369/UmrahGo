import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Campaign } from '../api/campaignsApiSlice';

// Interface for the campaign state
interface CampaignState {
  selectedCampaign: Campaign | null;
  filterStatus: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: CampaignState = {
  selectedCampaign: null,
  filterStatus: null,
  searchQuery: '',
  isLoading: false,
  error: null,
};

// Create the slice
const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    // Select a campaign for viewing or editing
    selectCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaign = action.payload;
    },
    
    // Set filter status for campaign list
    setFilterStatus: (state, action: PayloadAction<string | null>) => {
      state.filterStatus = action.payload;
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
    
    // Reset campaign state
    resetCampaignState: (state) => {
      state.selectedCampaign = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

// Export actions and reducer
export const {
  selectCampaign,
  setFilterStatus,
  setSearchQuery,
  setLoading,
  setError,
  resetCampaignState,
} = campaignSlice.actions;

export default campaignSlice.reducer; 