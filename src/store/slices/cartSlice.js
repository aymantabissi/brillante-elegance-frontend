import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('cart')) || [],
  },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find((i) => i._id === action.payload._id)
      if (existing) {
        existing.qty += action.payload.qty || 1
      } else {
        state.items.push({ ...action.payload, qty: action.payload.qty || 1 })
      }
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    updateQty: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload.id)
      if (item) item.qty = action.payload.qty
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    clearCart: (state) => {
      state.items = []
      localStorage.removeItem('cart')
    },
  },
})

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions
export default cartSlice.reducer