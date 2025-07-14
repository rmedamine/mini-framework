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

// Fonction personnalisée pour remplacer addEventListener
export function Listener(element, eventType, handler, options = {}) {
  // Normaliser le nom de l'événement (enlever le préfixe 'on' si présent)
  const normalizedEvent = eventType.startsWith('on') ? eventType.slice(2) : eventType
  
  // Utiliser le système d'événements existant du framework
  bindEvent(element, normalizedEvent, handler)
  
  // Retourner une fonction pour supprimer l'événement (comme removeEventListener)
  return () => {
    removeEventListener(element, eventType, handler)
  }
}

// Fonction pour supprimer un événement
export function removeEventListener(element, eventType, handler) {
  const normalizedEvent = eventType.startsWith('on') ? eventType.slice(2) : eventType
  const events = eventRegistry.get(element)
  
  if (events && events[normalizedEvent]) {
    const index = events[normalizedEvent].indexOf(handler)
    if (index > -1) {
      events[normalizedEvent].splice(index, 1)
      
      // Si plus de handlers pour cet événement, nettoyer
      if (events[normalizedEvent].length === 0) {
        element[`on${normalizedEvent}`] = null
        delete events[normalizedEvent]
      }
    }
  }
}
