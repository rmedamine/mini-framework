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
  
  // Si les longueurs sont différentes, on doit gérer les ajouts/suppressions
  if (oldLength !== newLength) {
    // Supprimer les enfants en trop
    while (parent.children.length > newLength) {
      parent.removeChild(parent.lastChild)
    }
    
    // Ajouter les nouveaux enfants
    for (let i = oldLength; i < newLength; i++) {
      const newElement = createElement(normalizedNewChildren[i])
      if (newElement) {
        parent.appendChild(newElement)
      }
    }
  }
  
  // Mettre à jour les enfants existants
  const minLength = Math.min(oldLength, newLength)
  for (let i = 0; i < minLength; i++) {
    updateChild(parent, i, normalizedOldChildren[i], normalizedNewChildren[i])
  }
}

// Met à jour un enfant spécifique
function updateChild(parent, index, oldChild, newChild) {
  const domChild = parent.children[index]
  
  // Si les types sont différents, remplacer complètement
  if (typeof oldChild !== typeof newChild || 
      (typeof oldChild === 'object' && oldChild.type !== newChild.type)) {
    const newElement = createElement(newChild)
    if (newElement) {
      parent.replaceChild(newElement, domChild)
    }
    return
  }
  
  // Si c'est du texte, mettre à jour directement
  if (typeof oldChild === 'string') {
    if (oldChild !== newChild) {
      const textNode = parent.childNodes[index]
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = newChild
      }
    }
    return
  }
  
  // Mettre à jour les propriétés de l'élément
  updateElementProps(domChild, oldChild.props || {}, newChild.props || {})
  
  // Mettre à jour les enfants
  const oldChildren = oldChild.props?.children || []
  const newChildren = newChild.props?.children || []
  diffAndUpdateChildren(domChild, oldChildren, newChildren)
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
    const newElement = createElement(newVirtualTree)
    if (newElement) {
      parent.appendChild(newElement)
    }
  } else {
    // Mise à jour avec diffing
    updateChild(parent, 0, oldVirtualTree, newVirtualTree)
  }
}

// Cache pour stocker les arbres virtuels précédents
export function getCachedTree(element) {
  return elementCache.get(element) || null
}

export function setCachedTree(element, tree) {
  elementCache.set(element, tree)
} 