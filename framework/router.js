import { Listener } from './event.js'

let currentRoute = '/'
const listeners = []

export function initRouter() {
  Listener(window, 'hashchange', handleHashChange)
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
