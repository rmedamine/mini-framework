
let currentRoute = '/'
const listeners = []

export function initRouter() {
  window.addEventListener('hashchange', handleHashChange)
  handleHashChange() 
}

function handleHashChange() {
  currentRoute = window.location.hash.replace('#', '') || '/'
  listeners.forEach(fn => fn(currentRoute))
}

export function onRouteChange(fn) {
  listeners.push(fn)
}

export function getCurrentRoute() {
  return currentRoute
}
