import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// =====================================================
// REGISTER
// =====================================================
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData)

      console.log('REGISTER RESPONSE:', data)

      if (data?.token) {
        localStorage.setItem('user', JSON.stringify(data))
      }

      return data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Erreur lors de l inscription'
      )
    }
  }
)

// =====================================================
// LOGIN
// =====================================================
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', userData)

      console.log('LOGIN RESPONSE:', data)

      // مهم جداً
      if (!data?.token) {
        return rejectWithValue(
          'Le serveur n a pas retourné de token'
        )
      }

      localStorage.setItem('user', JSON.stringify(data))

      console.log(
        'TOKEN SAVED:',
        JSON.parse(localStorage.getItem('user'))?.token
      )

      return data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        'Erreur lors de la connexion'
      )
    }
  }
)

// =====================================================
// INITIAL STATE
// =====================================================
const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user')

    if (!user) return null

    const parsed = JSON.parse(user)

    // إذا كان user موجود ولكن ما عندوش token
    if (!parsed?.token) {
      localStorage.removeItem('user')
      return null
    }

    return parsed
  } catch (error) {
    localStorage.removeItem('user')
    return null
  }
}

// =====================================================
// SLICE
// =====================================================
const authSlice = createSlice({
  name: 'auth',

  initialState: {
    user: getStoredUser(),
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.user = null
      state.error = null
      localStorage.removeItem('user')
    },

    updateUserProfile: (state, action) => {
      if (!state.user) return
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },

  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Compte createur en attente de validation — pas de token, pas de connexion auto
        if (action.payload?.token) {
          state.user = action.payload
        }
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, updateUserProfile } = authSlice.actions

export default authSlice.reducer