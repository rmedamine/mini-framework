import { el, mount, setChildren } from '../framework/minidom.js'
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

// Rendering logic
let inputRef = null

function render() {
  const { newTodo, todos, editingIndex } = store.state
  const visibleTodos = getVisibleTodos()
  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.length - activeCount
  const route = getCurrentRoute()

  const input = el('input', {
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
      el('div', {
        class: 'view',
        children: [
          el('input', {
            class: 'toggle',
            type: 'checkbox',
            checked: todo.completed,
            onchange: () => toggleTodo(i)
          }),
          el('label', {
            ondblclick: () => startEdit(i),
            children: [todo.title]
          }),
          el('button', {
            class: 'destroy',
            onclick: () => deleteTodo(i)
          })
        ]
      })
    )

    // input.edit field OUTSIDE .view
    if (editingIndex === i) {
      liChildren.push(
        el('input', {
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

    return el('li', {
      class: `${todo.completed ? 'completed' : ''} ${editingIndex === i ? 'editing' : ''}`,
      children: liChildren
    })
  })

  const view = el('section', {
    class: 'todoapp',
    children: [
      el('header', {
        class: 'header',
        children: [
          el('h1', { children: ['todos'] }),
          input
        ]
      }),

      todos.length > 0 &&
        el('section', {
          class: 'main',
          children: [
            el('input', {
              id: 'toggle-all',
              class: 'toggle-all',
              type: 'checkbox',
              checked: activeCount === 0,
              onchange: e => toggleAll(e.target.checked)
            }),
            el('label', { for: 'toggle-all' }),
            el('ul', {
              class: 'todo-list',
              children: todoItems
            })
          ]
        }),

      todos.length > 0 &&
        el('footer', {
          class: 'footer',
          children: [
            el('span', {
              class: 'todo-count',
              children: [`${activeCount} item${activeCount !== 1 ? 's' : ''} left`]
            }),
            el('ul', {
              class: 'filters',
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
            completedCount > 0 &&
              el('button', {
                class: 'clear-completed',
                onclick: clearCompleted,
                children: ['Clear completed']
              })
          ]
        })
    ]
  })

  const app = document.getElementById('app')
  setChildren(app, [view])

  inputRef.focus()
  inputRef.setSelectionRange(inputRef.value.length, inputRef.value.length)
}

// Watch for state and route changes
store.subscribe(render)
onRouteChange(render)
initRouter()

render()
