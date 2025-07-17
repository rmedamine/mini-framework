# Mini-Framework Core Documentation

This documentation covers the two core systems of the mini-framework: the Event System and the Router System.

## Event System (event.js)

The event system provides a lightweight wrapper around browser events with a WeakMap-based registry to manage event handlers.

### Core Components

#### `eventRegistry`
```javascript
const eventRegistry = new WeakMap()
```
- A WeakMap that stores event handlers for DOM elements
- Keys: DOM elements
- Values: Objects containing event types and their handlers
- Uses WeakMap to allow garbage collection of unused elements

### Public API

#### 1. `bindEvent(element, event, handler)`
```javascript
export function bindEvent(element, event, handler)
```
**Purpose**: Attaches an event handler to a DOM element.

**Parameters**:
- `element`: The DOM element to bind to
- `event`: Event name (e.g., 'click', 'input')
- `handler`: Function to execute when event occurs

**How it works**:
1. Gets or creates event store for the element:
   ```javascript
   const events = eventRegistry.get(element) || {}
   if (!eventRegistry.has(element)) {
     eventRegistry.set(element, events)
   }
   ```

2. Sets up event array and native handler if first time:
   ```javascript
   if (!events[event]) { 
     events[event] = []
     element[`on${event}`] = e => events[event].forEach(fn => fn(e))
   }
   ```

3. Adds the new handler:
   ```javascript
   events[event].push(handler)
   ```

#### 2. `Listener(element, event, handler)`
```javascript
export function Listener(element, event, handler)
```
**Purpose**: Provides a more friendly API similar to addEventListener.

**Parameters**:
- `element`: DOM element to listen on
- `event`: Event name (can include 'on' prefix)
- `handler`: Event handler function

**How it works**:
1. Cleans event name:
   ```javascript
   const cleanEvent = event.replace(/^on/, '')
   ```

2. Binds the event:
   ```javascript
   bindEvent(element, cleanEvent, handler)
   ```

3. Returns cleanup function:
   ```javascript
   return () => removeEventListener(element, cleanEvent, handler)
   ```

#### 3. `removeEventListener(element, event, handler)`
```javascript
export function removeEventListener(element, event, handler)
```
**Purpose**: Removes an event handler from an element.

**Parameters**:
- `element`: DOM element
- `event`: Event name
- `handler`: Handler to remove

**How it works**:
1. Gets handlers array:
   ```javascript
   const cleanEvent = event.replace(/^on/, '')
   const events = eventRegistry.get(element)
   const handlers = events?.[cleanEvent]
   ```

2. Early returns if no handlers:
   ```javascript
   if (!handlers) return
   ```

3. Removes specific handler:
   ```javascript
   const index = handlers.indexOf(handler)
   if (index === -1) return
   handlers.splice(index, 1)
   ```

4. Cleans up if no handlers remain:
   ```javascript
   if (handlers.length === 0) {
     element[`on${cleanEvent}`] = null
     delete events[cleanEvent]
   }
   ```

## Router System (router.js)

The router provides hash-based routing functionality for single-page applications.

### Core Components

#### `state` Object
```javascript
const state = {
  route: '/',
  subscribers: []
}
```
- Holds current route and subscribers
- Centralizes router state management

### Public API

#### 1. `initRouter()`
```javascript
export const initRouter = () => {
  Listener(window, 'hashchange', updateRoute)
  updateRoute()
}
```
**Purpose**: Initializes the router system.

**How it works**:
1. Sets up hash change listener using the event system
2. Immediately calls updateRoute to handle initial route
3. Uses the custom event system through `Listener`

#### 2. `onRouteChange(fn)`
```javascript
export const onRouteChange = fn => state.subscribers.push(fn)
```
**Purpose**: Subscribes to route changes.

**Parameters**:
- `fn`: Callback function to execute when route changes

**How it works**:
1. Adds callback to subscribers array
2. Callback will receive new route as parameter when route changes

#### 3. `getCurrentRoute()`
```javascript
export const getCurrentRoute = () => state.route
```
**Purpose**: Gets the current active route.

**How it works**:
1. Simply returns current route from state
2. Provides read-only access to route state

### Internal Functions

#### `getCleanRoute()`
```javascript
const getCleanRoute = () => window.location.hash.slice(1) || '/'
```
**Purpose**: Extracts clean route from URL hash.

**How it works**:
1. Gets current URL hash
2. Removes '#' prefix
3. Returns '/' if hash is empty

#### `updateRoute()`
```javascript
function updateRoute() {
  state.route = getCleanRoute()
  state.subscribers.forEach(fn => fn(state.route))
}
```
**Purpose**: Updates route and notifies subscribers.

**How it works**:
1. Gets clean route from URL
2. Updates state with new route
3. Notifies all subscribers with new route

## Usage Examples

### Event System
```javascript
// Simple click handler
const button = document.querySelector('button')
Listener(button, 'click', () => console.log('Clicked!'))

// Form input with cleanup
const input = document.querySelector('input')
const cleanup = Listener(input, 'input', e => console.log(e.target.value))
// Later: cleanup() to remove listener
```

### Router System
```javascript
// Initialize router
initRouter()

// Handle route changes
onRouteChange(route => {
  switch(route) {
    case '/':
      showHome()
      break
    case '/about':
      showAbout()
      break
  }
})

// Check current route
const currentRoute = getCurrentRoute()
```
