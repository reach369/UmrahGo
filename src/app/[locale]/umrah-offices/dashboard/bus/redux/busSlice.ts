import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Bus {
  id: number;
  name: string;
  capacity: number;
  status: string;
  type: string;
  plateNumber: string;
  driver: string;
}

interface BusState {
  buses: Bus[];
  loading: boolean;
  error: string | null;
}

const initialState: BusState = {
  buses: [],
  loading: false,
  error: null,
};

const busSlice = createSlice({
  name: 'bus',
  initialState,
  reducers: {
    setBuses: (state, action: PayloadAction<Bus[]>) => {
      state.buses = action.payload;
      state.loading = false;
      state.error = null;
    },
    deleteBus: (state, action: PayloadAction<number>) => {
      state.buses = state.buses.filter(bus => bus.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setBuses, deleteBus, setLoading, setError } = busSlice.actions;
export default busSlice.reducer; 