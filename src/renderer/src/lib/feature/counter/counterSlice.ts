import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CounterState {
  value: number
}

const initialState: CounterState = { value: 0 }

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1
    },
    decrement(state) {
      state.value -= 1
    },
    addAmount(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
    reset(state) {
      state.value = 0
    },
    setValue(state, action: PayloadAction<number>) {
      state.value = action.payload
    }
  }
})

export const { increment, decrement, addAmount, reset, setValue } = counterSlice.actions
export default counterSlice.reducer
