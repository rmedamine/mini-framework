import { Listener } from './event.js'

const state = {
  route: '/',
  callbackFunctions: []
}

const getCleanRoute = () => window.location.hash.slice(1) || '/'

function updateRoute() {
  state.route = getCleanRoute()
  state.callbackFunctions.forEach(fn => fn(state.route))
}

export const initRouter = () => {
  Listener(window, 'hashchange', updateRoute)
  updateRoute()
}

export const onRouteChange = fn => state.callbackFunctions.push(fn)

export const getCurrentRoute = () => state.route
