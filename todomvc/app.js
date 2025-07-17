import { el, mount } from '../framework/minidom.js'
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
  const todos = store.state.todos.map((todo, i) =>
    i === index ? { ...todo, completed: !todo.completed } : todo
  )
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
  const todosWithIndex = todos.map((todo, index) => ({ ...todo, originalIndex: index }))

  if (route === '/active') {
    return todosWithIndex.filter(t => !t.completed)
  } else if (route === '/completed') {
    return todosWithIndex.filter(t => t.completed)
  } else {
    return todosWithIndex
  }
}

// Editing logic
function startEdit(index) {
  store.setState({ ...store.state, editingIndex: index })
  setTimeout(() => {
    const editInput = document.querySelector('.editing .edit')
    if (editInput) {
      editInput.focus()
    }
  }, 0)
}

function finishEdit(index, value) {
  const title = value.trim()
  if (!title) {
    deleteTodo(index)
    return
  }
  const todos = store.state.todos.map((todo, i) =>
    i === index ? { ...todo, title } : todo
  )
  store.setState({ ...store.state, todos, editingIndex: null })
}

function cancelEdit() {
  store.setState({ ...store.state, editingIndex: null })
}

function render() {
  const { newTodo, todos, editingIndex } = store.state
  const route = getCurrentRoute()
  const visibleTodos = getVisibleTodos()
  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.length - activeCount

  const todoItems = visibleTodos.map(todo => {
    const liChildren = []

    liChildren.push(
      el('div', {
        class: 'view',
        children: [
          el('input', {
            class: 'toggle',
            type: 'checkbox',
            'data-testid': 'todo-item-toggle',
            checked: todo.completed,
            onchange: () => toggleTodo(todo.originalIndex)
          }),
          el('label', {
            'data-testid': 'todo-item-label',
            ondblclick: () => startEdit(todo.originalIndex),
            children: [todo.title]
          }),
          el('button', {
            class: 'destroy',
            'data-testid': 'todo-item-button',
            onclick: () => deleteTodo(todo.originalIndex)
          })
        ]
      })
    )

    if (editingIndex === todo.originalIndex) {
      liChildren.push(
        el('input', {
          class: 'edit',
          value: todo.title,
          autofocus: true,
          onblur: e => {
            if (editingIndex !== null) {
              cancelEdit()
            }
          },
          onkeydown: e => {
            if (e.key === 'Enter') {
              finishEdit(todo.originalIndex, e.target.value)
              e.target.blur()
            }
            if (e.key === 'Escape') {
              cancelEdit()
              e.target.blur()
            }
          }
        })
      )
    }

    return el('li', {
      class: `${todo.completed ? 'completed' : ''} ${editingIndex === todo.originalIndex ? 'editing' : ''}`,
      'data-testid': 'todo-item',
      children: liChildren
    })
  })

  const view = [
      el('header', {
        class: 'header',
        'data-testid': 'header',
        children: [
          el('h1', { children: ['todos'] }),
          el('div', {
            class: 'input-container',
            children: [
              el('input', {
                class: 'new-todo',
                id: 'todo-input',
                type: 'text',
                'data-testid': 'text-input',
                placeholder: 'What needs to be done?',
                value: newTodo,
                autofocus: true,
                oninput: e => {
                  const inputValue = e.target.value || ''
                  store.setState({ ...store.state, newTodo: inputValue })
                },
                onkeydown: e => {
                  if (e.key === 'Enter') {
                    addTodo(store.state.newTodo)
                  }
                }
              }),
              el('label', {
                class: 'visually-hidden',
                for: 'todo-input',
                children: ['New Todo Input']
              })
            ]
          })
        ]
      }),

      todos.length > 0 &&
      el('main', {
        class: 'main',
        'data-testid': 'main',
        children: [
          el('div', {
            class: 'toggle-all-container',
            children: [
              el('input', {
                id: 'toggle-all',
                class: 'toggle-all',
                type: 'checkbox',
                'data-testid': 'toggle-all',
                checked: activeCount === 0,
                onchange: e => toggleAll(e.target.checked)
              }),
              el('label', { 
                class: 'toggle-all-label',
                for: 'toggle-all',
                children: ['Toggle All Input']
              })
            ]
          }),
          el('ul', {
            class: 'todo-list',
            'data-testid': 'todo-list',
            children: todoItems
          })
        ]
      }),

      todos.length > 0 &&
      el('footer', {
        class: 'footer',
        'data-testid': 'footer',
        children: [
          el('span', {
            class: 'todo-count',
            children: [`${activeCount} item${activeCount !== 1 ? 's' : ''} left!`]
          }),
          el('ul', {
            class: 'filters',
            'data-testid': 'footer-navigation',
            children: [
              el('li', {
                children: [
                  el('a', {
                    href: '#/',
                    class: route === '/' ? 'selected' : '',
                    children: ['All']
                  })
                ]
              }),
              el('li', {
                children: [
                  el('a', {
                    href: '#/active',
                    class: route === '/active' ? 'selected' : '',
                    children: ['Active']
                  })
                ]
              }),
              el('li', {
                children: [
                  el('a', {
                    href: '#/completed',
                    class: route === '/completed' ? 'selected' : '',
                    children: ['Completed']
                  })
                ]
              })
            ]
          }),
          el('button', {
            class: 'clear-completed',
            onclick: clearCompleted,
            children: ['Clear completed']
          })
        ]
      })
    ]

  const root = document.getElementById('root')
  mount(root, view)
}

// Watch for state and route changes
store.subscribe(render)
onRouteChange(render)
initRouter()

render()
