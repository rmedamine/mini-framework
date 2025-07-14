
# MiniDOM — A Simple JavaScript Framework

MiniDOM is a lightweight, minimalistic JavaScript framework designed to help you understand how modern frontend frameworks work under the hood. It provides core features like DOM abstraction, reactive state management, client-side routing, and a custom event system — all built from scratch.

---

## 🌟 Features

- **Virtual DOM Abstraction**: Build your UI declaratively using JavaScript objects instead of raw DOM APIs.
- **Reactive State Management**: A simple store with `subscribe()` and `setState()` that triggers automatic UI updates.
- **Client-Side Routing**: Hash-based routing to switch views without reloading the page.
- **Custom Event Handling**: An event system that supports multiple handlers per event, with easy attach/detach.
- **Efficient DOM Updates**: A diffing algorithm updates only changed parts of the DOM.
- **TodoMVC Example**: A complete, functional Todo app demonstrating all features in action.

---

## 🛠️ Getting Started

### Folder Structure

```
mini-framework/
├── framework/
│   ├── minidom.js      # Virtual DOM + mounting
│   ├── diff.js         # Diffing and reconciliation
│   ├── event.js        # Custom event system
│   ├── store.js        # Reactive state management
│   └── router.js       # Client-side routing
├── todomvc/
│   ├── index.html      # HTML entry point with styles
│   ├── app.js          # TodoMVC app implementation
│   └── style.css       # Optional custom styles
└── README.md           # This documentation
```

### How to Run

1. Open `todomvc/index.html` in a modern browser (no build tools required).
2. Start adding todos, toggle completion, filter by route (All / Active / Completed).
3. Observe the state-driven UI updates and routing in action.

---

## 📚 Core Concepts

### Virtual DOM

Instead of manipulating DOM elements directly, you create JavaScript objects representing the UI structure:

```js
const vnode = el('div', {
  class: 'container',
  children: [
    el('h1', { children: ['Hello World'] }),
    el('button', { onclick: () => alert('Clicked!'), children: ['Click Me'] })
  ]
})
```

This virtual tree is converted to real DOM elements and efficiently updated when state changes.

---

### State Management

Create a reactive store that holds your app's state:

```js
const store = createStore({ todos: [], newTodo: '' })

store.subscribe(state => {
  console.log('State updated:', state)
})

store.setState({ ...store.state, newTodo: 'Buy milk' })
```

- `subscribe(fn)` registers a listener called on every state change.
- `setState(newState)` updates the state and triggers re-rendering.

---

### Routing

MiniDOM uses the URL hash (`window.location.hash`) for routing:

```js
initRouter()

onRouteChange(route => {
  console.log('Current route:', route)
})

const currentRoute = getCurrentRoute()
```

Supported routes include:

- `/` or `#/` — All todos
- `#/active` — Active (incomplete) todos
- `#/completed` — Completed todos

---

### Event Handling

A custom event system replaces standard `addEventListener`:

```js
bindEvent(button, 'click', () => alert('Clicked!'))

// Or with auto-unsubscribe:
const remove = Listener(button, 'click', myHandler)
remove() // to remove the handler
```

---

## 🔄 DOM Diffing & Updating

When state changes, MiniDOM:

1. Creates a new virtual DOM tree.
2. Compares it to the previous virtual tree.
3. Applies only the necessary changes to the real DOM.

This efficient update minimizes reflows and improves performance.

---

## 📝 TodoMVC Example Overview

The TodoMVC app demonstrates:

- Adding new todos via input.
- Toggling completion status.
- Editing todo titles inline.
- Deleting todos.
- Filtering todos based on route.
- Clearing completed todos.
- Keeping UI synced with URL.

---

## Why Build MiniDOM?

Building MiniDOM helps you:

- Learn core frontend concepts by hands-on coding.
- Understand how frameworks like React, Vue, or Svelte work internally.
- Appreciate the complexity hidden behind simple APIs.

---

## License

This project is open-source under the MIT License.

---

## Author

Created with passion to learn and teach frontend fundamentals.

---

Feel free to explore, modify, and extend MiniDOM for your own projects!