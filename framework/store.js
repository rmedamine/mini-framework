
export function createStore(initialState) {
  let state = initialState
  const listeners = []
  console.log("11111111111", state);
  

  function getState() {
    return state
  }

  function setState(newState) {
    state = newState
    listeners.forEach(fn => {console.log("fn", fn);
     fn(state)})  // () => {}
    console.log("22222222222", state);
    console.log("listeners----1", listeners);
  }
  console.log("listeners----2", listeners);
  

  function subscribe(fn) {
    // console.log("fn------", fn);
    
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
