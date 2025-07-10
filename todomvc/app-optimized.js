import { vel, mountOptimized } from '../framework/minidom.js'
import { createStore } from '../framework/store.js'
import { initRouter, onRouteChange, getCurrentRoute } from '../framework/router.js'

// Initialize store
const store = createStore({
  todos: [],
  newTodo: '',
  editingIndex: null
})

// Handle actions
function addTodo(title) {
  const trimmed = title.trim()
  if (!trimmed) return
  store.setState({
    ...store.state,
    todos: [...store.state.todos, { title: trimmed, completed: false }],
    newTodo: ''
  })
}

function deleteTodo(index) {
  const todos = [...store.state.todos]
  todos.splice(index, 1)
  store.setState({ ...store.state, todos })
}

function toggleTodo(index) {
  const todos = [...store.state.todos]
  todos[index].completed = !todos[index].completed
  store.setState({ ...store.state, todos })
}

function toggleAll(completed) {
  const todos = store.state.todos.map(todo => ({ ...todo, completed }))
  store.setState({ ...store.state, todos })
}

function clearCompleted() {
  const todos = store.state.todos.filter(todo => !todo.completed)
  store.setState({ ...store.state, todos })
}

// Routing logic
function getVisibleTodos() {
  const { todos } = store.state
  const route = getCurrentRoute()
  if (route === '/active') return todos.filter(t => !t.completed)
  if (route === '/completed') return todos.filter(t => t.completed)
  return todos
}

// Editing logic
function startEdit(index) {
  store.setState({ ...store.state, editingIndex: index })
}

function finishEdit(index, value) {
  const title = value.trim()
  if (!title) {
    deleteTodo(index)
    return
  }
  const todos = [...store.state.todos]
  todos[index].title = title
  store.setState({ ...store.state, todos, editingIndex: null })
}

function cancelEdit() {
  store.setState({ ...store.state, editingIndex: null })
}

// Rendering logic avec éléments virtuels
let inputRef = null

function createVirtualApp() {
  const { newTodo, todos, editingIndex } = store.state
  const visibleTodos = getVisibleTodos()
  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.length - activeCount
  const route = getCurrentRoute()

  const input = vel('input', {
    class: 'new-todo',
    placeholder: 'What needs to be done?',
    value: newTodo,
    oninput: e => store.setState({ ...store.state, newTodo: e.target.value }),
    onkeydown: e => {
      if (e.key === 'Enter') addTodo(store.state.newTodo)
    }
  })

  inputRef = input

  const todoItems = visibleTodos.map((todo, i) => {
    const liChildren = []

    // .view block
    liChildren.push(
      vel('div', {
        class: 'view',
        children: [
          vel('input', {
            class: 'toggle',
            type: 'checkbox',
            checked: todo.completed,
            onchange: () => toggleTodo(i)
          }),
          vel('label', {
            ondblclick: () => startEdit(i),
            children: [todo.title]
          }),
          vel('button', {
            class: 'destroy',
            onclick: () => deleteTodo(i)
          })
        ]
      })
    )

    // input.edit field OUTSIDE .view
    if (editingIndex === i) {
      liChildren.push(
        vel('input', {
          class: 'edit',
          value: todo.title,
          autofocus: true,
          onblur: e => finishEdit(i, e.target.value),
          onkeydown: e => {
            if (e.key === 'Enter') finishEdit(i, e.target.value)
            if (e.key === 'Escape') cancelEdit()
          }
        })
      )
    }

    return vel('li', {
      key: `todo-${i}`, // Clé pour optimiser le diffing
      class: `${todo.completed ? 'completed' : ''} ${editingIndex === i ? 'editing' : ''}`,
      children: liChildren
    })
  })

  const view = vel('section', {
    class: 'todoapp',
    children: [
      vel('header', {
        class: 'header',
        children: [
          vel('h1', { children: ['todos'] }),
          input
        ]
      }),

      todos.length > 0 &&
        vel('section', {
          class: 'main',
          children: [
            vel('input', {
              id: 'toggle-all',
              class: 'toggle-all',
              type: 'checkbox',
              checked: activeCount === 0,
              onchange: e => toggleAll(e.target.checked)
            }),
            vel('label', { for: 'toggle-all' }),
            vel('ul', {
              class: 'todo-list',
              children: todoItems
            })
          ]
        }),

      todos.length > 0 &&
        vel('footer', {
          class: 'footer',
          children: [
            vel('span', {
              class: 'todo-count',
              children: [`${activeCount} item${activeCount !== 1 ? 's' : ''} left`]
            }),
            vel('ul', {
              class: 'filters',
              children: [
                vel('li', {
                  children: [
                    vel('a', {
                      href: '#/',
                      class: route === '/' ? 'selected' : '',
                      children: ['All']
                    })
                  ]
                }),
                vel('li', {
                  children: [
                    vel('a', {
                      href: '#/active',
                      class: route === '/active' ? 'selected' : '',
                      children: ['Active']
                    })
                  ]
                }),
                vel('li', {
                  children: [
                    vel('a', {
                      href: '#/completed',
                      class: route === '/completed' ? 'selected' : '',
                      children: ['Completed']
                    })
                  ]
                })
              ]
            }),
            completedCount > 0 &&
              vel('button', {
                class: 'clear-completed',
                onclick: clearCompleted,
                children: ['Clear completed']
              })
          ]
        })
    ]
  })

  return view
}

// Fonction de rendu optimisée
function renderOptimized() {
  const virtualApp = createVirtualApp()
  const app = document.getElementById('app')
  mountOptimized(app, virtualApp)

  // Focus sur l'input si il existe
  if (inputRef) {
    const inputElement = app.querySelector('.new-todo')
    if (inputElement) {
      inputElement.focus()
      inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length)
    }
  }
}

// Watch for state and route changes
store.subscribe(renderOptimized)
onRouteChange(renderOptimized)
initRouter()

renderOptimized() 