const eventRegistry = new WeakMap()

export function bindEvent(element, event, handler) {
  // Get the list of events for this element
  let events = eventRegistry.get(element)
  if (!events) {
    events = {}
    eventRegistry.set(element, events)
  }

  if (!events[event]) {
    events[event] = []

    // Assign native handler once
    element[`on${event}`] = (e) => {
      for (const fn of events[event]) {
        fn(e)
      }
    }
  }

  // Add new handler
  events[event].push(handler)
}
