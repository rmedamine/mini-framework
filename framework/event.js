const eventRegistry = new WeakMap()

export function bindEvent(element, event, handler) {
  const events = eventRegistry.get(element) || {}
  if (!eventRegistry.has(element)) {
    eventRegistry.set(element, events)
  }

  if (!events[event]) { 
    events[event] = []
    element[`on${event}`] = e => events[event].forEach(fn => fn(e))
  }

  events[event].push(handler)
}

export function Listener(element, event, handler) {
  const cleanEvent = event.replace(/^on/, '')
  bindEvent(element, cleanEvent, handler)
  return () => removeEventListener(element, cleanEvent, handler)
}

export function removeEventListener(element, event, handler) {
  const cleanEvent = event.replace(/^on/, '')
  const events = eventRegistry.get(element)
  const handlers = events?.[cleanEvent]
  
  if (!handlers) return
  
  const index = handlers.indexOf(handler)
  if (index === -1) return
  
  handlers.splice(index, 1)
  
  if (handlers.length === 0) {
    element[`on${cleanEvent}`] = null
    delete events[cleanEvent]
  }
}
