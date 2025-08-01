import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExampleState {
  filterStatus: string | null;
  searchQuery: string;
}

const initialState: ExampleState = {
  filterStatus: 'all',
  searchQuery: '',
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setFilterStatus, setSearchQuery } = exampleSlice.actions;
export default exampleSlice.reducer; 