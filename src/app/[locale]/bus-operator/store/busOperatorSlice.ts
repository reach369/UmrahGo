import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  BusOperator,
  Bus,
  BusBooking,
  BusBookingStatistics,
  CalendarBooking,
  BookingFilters,
  CreateBookingForm,
  UpdateBookingStatusForm,
  CancelBookingForm,
  CreateBusForm,
  PaginatedResponse,
  Conversation,
  ChatMessage
} from '../types';
import BusOperatorService from '../services/busOperatorService';

// State interface
export interface BusOperatorState {
  // Authentication
  isAuthenticated: boolean;
  user: BusOperator | null;
  
  // Bookings
  bookings: BusBooking[];
  currentBooking: BusBooking | null;
  bookingsPagination: {
    currentPage: number;
    lastPage: number;
    total: number;
  };
  bookingFilters: BookingFilters;
  
  // Buses
  buses: Bus[];
  currentBus: Bus | null;
  
  // Statistics
  statistics: BusBookingStatistics | null;
  
  // Calendar
  calendarData: CalendarBooking[];
  
  // Chat
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  messagesPagination: {
    currentPage: number;
    lastPage: number;
    total: number;
  };
  
  // Loading states
  loading: {
    bookings: boolean;
    buses: boolean;
    statistics: boolean;
    calendar: boolean;
    profile: boolean;
    conversations: boolean;
    messages: boolean;
  };
  
  // Error handling
  errors: {
    bookings: string | null;
    buses: string | null;
    statistics: string | null;
    calendar: string | null;
    profile: string | null;
    conversations: string | null;
    messages: string | null;
  };
}

const initialState: BusOperatorState = {
  isAuthenticated: false,
  user: null,
  bookings: [],
  currentBooking: null,
  bookingsPagination: {
    currentPage: 1,
    lastPage: 1,
    total: 0,
  },
  bookingFilters: {},
  buses: [],
  currentBus: null,
  statistics: null,
  calendarData: [],
  conversations: [],
  currentConversation: null,
  messages: [],
  messagesPagination: {
    currentPage: 1,
    lastPage: 1,
    total: 0,
  },
  loading: {
    bookings: false,
    buses: false,
    statistics: false,
    calendar: false,
    profile: false,
    conversations: false,
    messages: false,
  },
  errors: {
    bookings: null,
    buses: null,
    statistics: null,
    calendar: null,
    profile: null,
    conversations: null,
    messages: null,
  },
};

// Async thunks
export const fetchBookings = createAsyncThunk(
  'busOperator/fetchBookings',
  async (filters?: BookingFilters) => {
    const response = await BusOperatorService.getBookings(filters);
    return { data: response.data, filters };
  }
);

export const fetchBooking = createAsyncThunk(
  'busOperator/fetchBooking',
  async (id: number) => {
    const response = await BusOperatorService.getBooking(id);
    return response.data;
  }
);

export const createBooking = createAsyncThunk(
  'busOperator/createBooking',
  async (bookingData: CreateBookingForm) => {
    const response = await BusOperatorService.createBooking(bookingData);
    return response.data;
  }
);

export const updateBookingStatus = createAsyncThunk(
  'busOperator/updateBookingStatus',
  async ({ id, statusData }: { id: number; statusData: UpdateBookingStatusForm }) => {
    const response = await BusOperatorService.updateBookingStatus(id, statusData);
    return response.data;
  }
);

export const cancelBooking = createAsyncThunk(
  'busOperator/cancelBooking',
  async ({ id, cancelData }: { id: number; cancelData: CancelBookingForm }) => {
    const response = await BusOperatorService.cancelBooking(id, cancelData);
    return response.data;
  }
);

export const fetchStatistics = createAsyncThunk(
  'busOperator/fetchStatistics',
  async () => {
    const response = await BusOperatorService.getBookingStatistics();
    return response.data;
  }
);

export const fetchCalendarData = createAsyncThunk(
  'busOperator/fetchCalendarData',
  async ({ month, year }: { month: number; year: number }) => {
    const response = await BusOperatorService.getBookingCalendar(month, year);
    return response.data;
  }
);

export const fetchBuses = createAsyncThunk(
  'busOperator/fetchBuses',
  async () => {
    const response = await BusOperatorService.getBuses();
    return response.data;
  }
);

export const fetchBus = createAsyncThunk(
  'busOperator/fetchBus',
  async (id: number) => {
    const response = await BusOperatorService.getBus(id);
    return response.data;
  }
);

export const createBus = createAsyncThunk(
  'busOperator/createBus',
  async (busData: CreateBusForm) => {
    const response = await BusOperatorService.createBus(busData);
    return response.data;
  }
);

export const updateBus = createAsyncThunk(
  'busOperator/updateBus',
  async ({ id, busData }: { id: number; busData: Partial<CreateBusForm> }) => {
    const response = await BusOperatorService.updateBus(id, busData);
    return response.data;
  }
);

export const deleteBus = createAsyncThunk(
  'busOperator/deleteBus',
  async (id: number) => {
    await BusOperatorService.deleteBus(id);
    return id;
  }
);

export const fetchProfile = createAsyncThunk(
  'busOperator/fetchProfile',
  async () => {
    const response = await BusOperatorService.getProfile();
    return response.data;
  }
);

export const fetchConversations = createAsyncThunk(
  'busOperator/fetchConversations',
  async () => {
    const response = await BusOperatorService.getConversations();
    return response.data;
  }
);

export const fetchMessages = createAsyncThunk(
  'busOperator/fetchMessages',
  async ({ conversationId, page = 1 }: { conversationId: number; page?: number }) => {
    const response = await BusOperatorService.getMessages(conversationId, page);
    return { data: response.data, conversationId };
  }
);

export const sendMessage = createAsyncThunk(
  'busOperator/sendMessage',
  async ({ conversationId, message }: { conversationId: number; message: string }) => {
    const response = await BusOperatorService.sendMessage(conversationId, message);
    return response.data;
  }
);

// Slice
const busOperatorSlice = createSlice({
  name: 'busOperator',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<BusOperator | null>) => {
      state.user = action.payload;
    },
    setBookingFilters: (state, action: PayloadAction<BookingFilters>) => {
      state.bookingFilters = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearCurrentBus: (state) => {
      state.currentBus = null;
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
    },
    clearErrors: (state) => {
      state.errors = {
        bookings: null,
        buses: null,
        statistics: null,
        calendar: null,
        profile: null,
        conversations: null,
        messages: null,
      };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.bookings = [];
      state.buses = [];
      state.statistics = null;
      state.conversations = [];
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    // Bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading.bookings = true;
        state.errors.bookings = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading.bookings = false;
        state.bookings = action.payload.data.data;
        state.bookingsPagination = {
          currentPage: action.payload.data.current_page,
          lastPage: action.payload.data.last_page,
          total: action.payload.data.total,
        };
        state.bookingFilters = action.payload.filters || {};
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading.bookings = false;
        state.errors.bookings = action.error.message || 'Failed to fetch bookings';
      })
      
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.currentBooking = action.payload;
      })
      
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload);
      })
      
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
      })
      
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
      });

    // Statistics
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.errors.statistics = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.errors.statistics = action.error.message || 'Failed to fetch statistics';
      });

    // Calendar
    builder
      .addCase(fetchCalendarData.pending, (state) => {
        state.loading.calendar = true;
        state.errors.calendar = null;
      })
      .addCase(fetchCalendarData.fulfilled, (state, action) => {
        state.loading.calendar = false;
        state.calendarData = action.payload;
      })
      .addCase(fetchCalendarData.rejected, (state, action) => {
        state.loading.calendar = false;
        state.errors.calendar = action.error.message || 'Failed to fetch calendar data';
      });

    // Buses
    builder
      .addCase(fetchBuses.pending, (state) => {
        state.loading.buses = true;
        state.errors.buses = null;
      })
      .addCase(fetchBuses.fulfilled, (state, action) => {
        state.loading.buses = false;
        state.buses = action.payload;
      })
      .addCase(fetchBuses.rejected, (state, action) => {
        state.loading.buses = false;
        state.errors.buses = action.error.message || 'Failed to fetch buses';
      })
      
      .addCase(fetchBus.fulfilled, (state, action) => {
        state.currentBus = action.payload;
      })
      
      .addCase(createBus.fulfilled, (state, action) => {
        state.buses.push(action.payload);
      })
      
      .addCase(updateBus.fulfilled, (state, action) => {
        const index = state.buses.findIndex(bus => bus.id === action.payload.id);
        if (index !== -1) {
          state.buses[index] = action.payload;
        }
        if (state.currentBus?.id === action.payload.id) {
          state.currentBus = action.payload;
        }
      })
      
      .addCase(deleteBus.fulfilled, (state, action) => {
        state.buses = state.buses.filter(bus => bus.id !== action.payload);
        if (state.currentBus?.id === action.payload) {
          state.currentBus = null;
        }
      });

    // Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading.profile = true;
        state.errors.profile = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.errors.profile = action.error.message || 'Failed to fetch profile';
      });

    // Conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading.conversations = true;
        state.errors.conversations = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false;
        state.errors.conversations = action.error.message || 'Failed to fetch conversations';
      });

    // Messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading.messages = true;
        state.errors.messages = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        if (action.payload.data.current_page === 1) {
          state.messages = action.payload.data.data;
        } else {
          state.messages = [...state.messages, ...action.payload.data.data];
        }
        state.messagesPagination = {
          currentPage: action.payload.data.current_page,
          lastPage: action.payload.data.last_page,
          total: action.payload.data.total,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.errors.messages = action.error.message || 'Failed to fetch messages';
      })
      
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.unshift(action.payload);
      });
  },
});

export const {
  setAuthenticated,
  setUser,
  setBookingFilters,
  clearCurrentBooking,
  clearCurrentBus,
  setCurrentConversation,
  clearErrors,
  logout,
} = busOperatorSlice.actions;

export default busOperatorSlice.reducer; 