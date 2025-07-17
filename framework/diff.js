// Système de diffing pour optimiser les rendus
const elementCache = new WeakMap()

// Normalise les enfants pour gérer les éléments conditionnels
function normalizeChildren(children) {
  if (!Array.isArray(children)) {
    children = [children]
  }
  
  return children.filter(child => 
    child !== false && 
    child !== null && 
    child !== undefined
  )
}

// Compare et met à jour les enfants d'un élément parent
export function diffAndUpdateChildren(parent, oldChildren, newChildren) {
  const normalizedOldChildren = normalizeChildren(oldChildren)
  const normalizedNewChildren = normalizeChildren(newChildren)
  
  const oldLength = normalizedOldChildren.length
  const newLength = normalizedNewChildren.length
  const maxLength = Math.max(oldLength, newLength)
  
  // Process each child position
  for (let i = 0; i < maxLength; i++) {
    const oldChild = i < oldLength ? normalizedOldChildren[i] : null
    const newChild = i < newLength ? normalizedNewChildren[i] : null
    
    if (!oldChild && newChild) {
      // Add new child
      const newElement = createElement(newChild)
      if (newElement) {
        parent.appendChild(newElement)
      }
    } else if (oldChild && !newChild) {
      // Remove old child
      const childToRemove = parent.childNodes[i]
      if (childToRemove) {
        parent.removeChild(childToRemove)
      }
    } else if (oldChild && newChild) {
      // Update existing child
      updateChild(parent, i, oldChild, newChild)
    }
  }
  
  // Remove any remaining children
  while (parent.childNodes.length > newLength) {
    parent.removeChild(parent.lastChild)
  }
}

// Met à jour un enfant spécifique
function updateChild(parent, index, oldChild, newChild) {
  const domChild = parent.children[index]
  
  // Handle text nodes differently since they don't appear in children collection
  if (typeof oldChild === 'string' && typeof newChild === 'string') {
    if (oldChild !== newChild) {
      // Find the text node in childNodes (not children)
      const textNode = parent.childNodes[index]
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = newChild
      }
    }
    return
  }
  
  // If one is text and other is element, or types differ, replace
  if (typeof oldChild !== typeof newChild || 
      (typeof oldChild === 'object' && typeof newChild === 'object' && oldChild.type !== newChild.type)) {
    const newElement = createElement(newChild)
    if (newElement) {
      if (domChild) {
        parent.replaceChild(newElement, domChild)
      } else {
        parent.appendChild(newElement)
      }
    }
    return
  }
  
  // Both are elements of the same type
  if (typeof oldChild === 'object' && typeof newChild === 'object') {
    // Update element properties
    updateElementProps(domChild, oldChild.props || {}, newChild.props || {})
    
    // Update children
    const oldChildren = oldChild.props?.children || []
    const newChildren = newChild.props?.children || []
    diffAndUpdateChildren(domChild, oldChildren, newChildren)
  }
}

// Met à jour les propriétés d'un élément
function updateElementProps(element, oldProps, newProps) {
  // Supprimer les propriétés qui n'existent plus
  for (const key in oldProps) {
    if (key === 'children') continue
    if (!(key in newProps)) {
      removeProp(element, key, oldProps[key])
    }
  }
  
  // Ajouter ou mettre à jour les propriétés
  for (const key in newProps) {
    if (key === 'children') continue
    if (!(key in oldProps) || oldProps[key] !== newProps[key]) {
      setProp(element, key, newProps[key])
    }
  }
}

// Supprime une propriété d'un élément
function removeProp(element, key, value) {
  if (key.startsWith('on') && typeof value === 'function') {
    const event = key.slice(2).toLowerCase()
    element[`on${event}`] = null
  } else if (key === 'class') {
    element.className = ''
  } else if (key === 'checked') {
    element.checked = false
  } else if (key === 'value') {
    // Pour les éléments input, vider la propriété value
    element.value = ''
  } else {
    element.removeAttribute(key)
  }
}

// Définit une propriété sur un élément
function setProp(element, key, value) {
  if (key.startsWith('on') && typeof value === 'function') {
    const event = key.slice(2).toLowerCase()
    element[`on${event}`] = value
  } else if (key === 'class') {
    element.className = value
  } else if (key === 'checked') {
    element.checked = value
  } else if (key === 'value') {
    // Pour les éléments input, définir directement la propriété value
    element.value = value
  } else {
    element.setAttribute(key, value)
  }
}

// Crée un élément DOM à partir d'un élément virtuel
function createElement(virtualElement) {
  if (typeof virtualElement === 'string') {
    return document.createTextNode(virtualElement)
  }
  
  if (virtualElement === false || virtualElement === null || virtualElement === undefined) {
    return null
  }
  
  const element = document.createElement(virtualElement.type)
  const props = virtualElement.props || {}
  
  // Appliquer les propriétés
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') continue
    setProp(element, key, value)
  }
  
  // Ajouter les enfants
  const children = props.children || []
  const normalizedChildren = normalizeChildren(children)
  for (const child of normalizedChildren) {
    const childElement = createElement(child)
    if (childElement) {
      element.appendChild(childElement)
    }
  }
  
  return element
}

// Fonction principale de diffing pour un élément racine
export function diffAndUpdate(parent, oldVirtualTree, newVirtualTree) {
  if (!oldVirtualTree) {
    // Premier rendu
    parent.innerHTML = ''
    if (newVirtualTree.type === 'div' && newVirtualTree.props && newVirtualTree.props.children) {
      // Handle container div - render children directly
      const children = newVirtualTree.props.children
      const normalizedChildren = normalizeChildren(children)
      for (const child of normalizedChildren) {
        const childElement = createElement(child)
        if (childElement) {
          parent.appendChild(childElement)
        }
      }
    } else {
      const newElement = createElement(newVirtualTree)
      if (newElement) {
        parent.appendChild(newElement)
      }
    }
  } else {
    // Mise à jour avec diffing
    if (newVirtualTree.type === 'div' && newVirtualTree.props && newVirtualTree.props.children &&
        oldVirtualTree.type === 'div' && oldVirtualTree.props && oldVirtualTree.props.children) {
      // Handle container div - diff children directly
      const oldChildren = oldVirtualTree.props.children
      const newChildren = newVirtualTree.props.children
      diffAndUpdateChildren(parent, oldChildren, newChildren)
    } else {
      updateChild(parent, 0, oldVirtualTree, newVirtualTree)
    }
  }
}

// Cache pour stocker les arbres virtuels précédents
export function getCachedTree(element) {
  return elementCache.get(element) || null
}

export function setCachedTree(element, tree) {
  elementCache.set(element, tree)
} 