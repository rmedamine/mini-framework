
export function createStore(initialState) {
  let state = initialState
  const listeners = []

  function getState() {
    return state
  }

  function setState(newState) {
    state = newState
    listeners.forEach(fn => fn(state))
  }

  function subscribe(fn) {
    listeners.push(fn)
    fn(state)
  }

  return {
    get state() {
      return state
    },
    setState,
    subscribe
  }
}
