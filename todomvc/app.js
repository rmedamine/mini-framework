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
  
  // Ajouter originalIndex à tous les todos
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

// Rendering logic
function render() {
  const { newTodo, todos, editingIndex } = store.state
  const route = getCurrentRoute()
  const visibleTodos = getVisibleTodos()
  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.length - activeCount

  const input = el('input', {
    class: 'new-todo',
    placeholder: 'What needs to be done?',
    value: newTodo,
    oninput: e => store.setState({ ...store.state, newTodo: e.target.value }),
    onkeydown: e => {
      if (e.key === 'Enter') addTodo(store.state.newTodo)
    }
  })

  const todoItems = visibleTodos.map((todo, i) => {
    const liChildren = []

    // .view block
    liChildren.push(
      el('div', {
        class: 'view',
        children: [
          // Afficher la checkbox seulement si on n'est PAS dans la vue 'active'
          route === '/active'
            ? el('span', {
                class: 'toggle fake-checkbox',
                onclick: e => { e.preventDefault(); e.stopPropagation(); toggleTodo(todo.originalIndex); },
                style: 'display:inline-block;width:40px;height:40px;border-radius:50%;border:1px solid #ededed;background:#fff;vertical-align:middle;cursor:pointer;margin-right:10px;'
              })
            : el('input', {
                class: 'toggle',
                type: 'checkbox',
                checked: todo.completed,
                onchange: () => toggleTodo(todo.originalIndex)
              }),
          el('label', {
            ondblclick: () => startEdit(todo.originalIndex),
            onclick: route === '/active' ? (e => { e.preventDefault(); e.stopPropagation(); toggleTodo(todo.originalIndex); setTimeout(() => document.activeElement.blur(), 0); }) : undefined,
            children: [todo.title]
          }),
          el('button', {
            class: 'destroy',
            onclick: () => deleteTodo(todo.originalIndex)
          })
        ]
      })
    )

    // input.edit field OUTSIDE .view
    if (editingIndex === todo.originalIndex) {
      liChildren.push(
        el('input', {
          class: 'edit',
          value: todo.title,
          autofocus: true,
          onblur: e => finishEdit(todo.originalIndex, e.target.value),
          onkeydown: e => {
            if (e.key === 'Enter') finishEdit(todo.originalIndex, e.target.value)
            if (e.key === 'Escape') cancelEdit()
          }
        })
      )
    }

    return el('li', {
      class: `${todo.completed ? 'completed' : ''} ${editingIndex === todo.originalIndex ? 'editing' : ''}`,
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
              class: `todo-list${route === '/active' ? ' active-view' : ''}`,
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
  mount(app, view)
}

// Watch for state and route changes
store.subscribe(render)
onRouteChange(render)
initRouter()

render()
