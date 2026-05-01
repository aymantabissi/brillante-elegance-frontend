import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', userData);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(registerUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginUser.pending,      (state) => { state.loading = true;  state.error = null; })
      .addCase(loginUser.fulfilled,    (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginUser.rejected,     (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;