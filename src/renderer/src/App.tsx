import { decrement, increment, reset, setValue } from './lib/feature/counter'
import { useAppDispatch, useAppSelector } from './lib/hook'

function App(): React.JSX.Element {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div>
      <div>
        <button onClick={() => dispatch(decrement())}>–</button>
        <span>{count}</span>
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(reset())}>Reset</button>
        <button onClick={() => dispatch(setValue(42))}>Set to 42</button>
      </div>
    </div>
  )
}

export default App
