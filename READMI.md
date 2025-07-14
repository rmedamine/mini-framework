# MiniDOM Framework

**MiniDOM** is a lightweight JavaScript framework that offers a clean abstraction over the DOM, with built-in state management, client-side routing, and a custom event system. It follows the concept of "inversion of control", giving the framework full control over rendering and interaction.

---

## 🔧 Features

- 🧱 **DOM Abstraction** — Write UI using declarative virtual elements.
- 🔁 **State Management** — Global reactive state with `subscribe()` and `setState()`.
- 🔗 **Routing System** — URL-based routing using hash fragments (`#/`).
- ⚡ **Event Handling** — Custom event binding mechanism (`bindEvent`, `Listener`).
- 📦 **Diffing Engine** — Efficient DOM updates via virtual DOM comparison.
- 📝 **TodoMVC Example** — Fully working TodoMVC implementation using MiniDOM.

---

## 🚀 Quick Start

### 📁 Project Structure

project-root/
├── framework/
│ ├── minidom.js
│ ├── store.js
│ ├── router.js
│ ├── event.js
│ └── diff.js
├── todomvc/
│ ├── index.html
│ ├── app.js
│ └── style.css
└── README.md
### ▶️ Run the App

Open `todomvc/index.html` in your browser. No build steps required.

---

## 🧩 API Overview

### 🧱 DOM Abstraction

#### `el(type, props)`
Create a virtual DOM element.

```js
el('div', {
  class: 'box',
  children: [
    el('h1', { children: ['Hello'] }),
    'Text content'
  ]
})
mount(target, virtualTree)
Mounts or updates a virtual tree to a real DOM node.

js
Copier
Modifier
mount(document.getElementById('app'), myVirtualTree)
🔁 State Management
createStore(initialState)
Creates a reactive store.

js
Copier
Modifier
const store = createStore({ count: 0 })

store.subscribe(state => {
  console.log(state.count)
})

store.setState({ count: 1 })
store.state
Read current state.

store.setState(newState)
Update state and re-render subscribers.

store.subscribe(fn)
Listen to state changes.

🔗 Routing System
initRouter()
Start hash-based routing.

onRouteChange(fn)
React to route changes.

getCurrentRoute()
Returns the current route (e.g., '/', '/active').

js
Copier
Modifier
onRouteChange((route) => {
  console.log('Route changed to:', route)
})
⚡ Event System
bindEvent(element, event, handler)
Custom event binding (replaces addEventListener).

js
Copier
Modifier
bindEvent(button, 'click', () => alert('Clicked!'))
Listener(element, eventType, handler)
Advanced event binding with auto-unsubscribe:

js
Copier
Modifier
const remove = Listener(div, 'click', doSomething)
// remove() to unbind
✅ TodoMVC Example
You can find the full example in /todomvc/app.js, which includes:

Adding / editing / removing todos

Filtering by All, Active, Completed

Persistent state updates with rerendering

⚙️ Why MiniDOM?
MiniDOM is built to understand how frameworks work behind the scenes:

It demystifies concepts like Virtual DOM, reconciliation, and reactivity.

Helps you learn the architecture of real frameworks like React, Vue, and Svelte.

You control the rendering logic, routing, and UI updates.

📄 License
MIT — Feel free to modify, learn, or build upon it.

🙌 Author
Built with ❤️ as part of the Framework Creation Project.