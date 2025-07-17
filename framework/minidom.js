import { bindEvent } from './event.js'
import { diffAndUpdate, getCachedTree, setCachedTree } from './diff.js'

// Crée un élément virtuel (pas encore dans le DOM)
export function el(type, props = {}) {
  return {
    type,
    props: { ...props }
  }
}

// Fonction pour créer un élément DOM à partir d'un élément virtuel
function createDOMElement(virtualElement) {
  if (virtualElement === false || virtualElement === null || virtualElement === undefined) {
    return null
  }
  
  
  if (typeof virtualElement === 'string' || virtualElement === 'number') {
    return document.createTextNode(virtualElement)
  }
  
  
  const element = document.createElement(virtualElement.type)
  const props = virtualElement.props || {}

  // Track if this element should receive focus
  let shouldFocus = false
  
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') {
      setChildren(element, value)
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase()
      bindEvent(element, event, value)
    } else if (key === 'class') {
      element.className = value
    } else if (key === 'checked') {
      element.checked = value
    } else if (key === 'autofocus') {
      shouldFocus = value
    } else if (key === 'value' && element instanceof HTMLInputElement) {
      element.value = value
    } else {
      element.setAttribute(key, value)
    }
  }

  // If this is the currently focused element, maintain focus and cursor position
  const activeElement = document.activeElement
  if (activeElement && element instanceof HTMLInputElement && activeElement instanceof HTMLInputElement) {
    if ((props.id && activeElement.id === props.id) || (props.class && activeElement.className === props.class)) {
      shouldFocus = true
      const cursorPos = activeElement.selectionStart
      setTimeout(() => {
        element.focus()
        element.setSelectionRange(cursorPos, cursorPos)
      }, 0)
    }
  }

  return element
}

export function setChildren(parent, children = []) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }

  for (const child of children) {
    if (child === false || child === null || child === undefined) continue
    const domElement = createDOMElement(child)
    if (domElement) {
      parent.appendChild(domElement)
    }
  }
}

// Nouvelle fonction mount avec diffing
export function mount(target, virtualNode) {
  if (Array.isArray(virtualNode)) {
    // Wrap array in a container element for consistent diffing
    const containerElement = {
      type: 'div',
      props: {
        children: virtualNode
      }
    }
    
    const oldVirtualTree = getCachedTree(target)
    
    // Use diffing for array updates too
    diffAndUpdate(target, oldVirtualTree, containerElement)
    
    // Cache the new virtual tree
    setCachedTree(target, containerElement)
    return
  }

  const oldVirtualTree = getCachedTree(target)
  
  // Utiliser le diffing pour mettre à jour
  diffAndUpdate(target, oldVirtualTree, virtualNode)
  
  // Mettre en cache le nouvel arbre virtuel
  setCachedTree(target, virtualNode)
}

// Fonction pour créer un élément DOM directement (pour compatibilité)
export function createElement(type, props = {}) {
  return createDOMElement(el(type, props))
}
