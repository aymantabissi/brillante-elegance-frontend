import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAllProducts, getProductById } from '../../services/productService'

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await getAllProducts(params)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Erreur')
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await getProductById(id)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Erreur')
    }
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    product: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProduct: (state) => { state.product = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchProducts.rejected,  (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchProductById.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.loading = false; state.product = action.payload })
      .addCase(fetchProductById.rejected,  (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { clearProduct } = productSlice.actions
export default productSlice.reducer