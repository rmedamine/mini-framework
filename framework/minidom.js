import { bindEvent } from './event.js'

export function el(type, props = {}) {
  const element = document.createElement(type)

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') {
      setChildren(element, value)
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase()
      bindEvent(element, event, value)    
     // element.addEventListener(key.slice(2).toLowerCase(), value)

    }else if (key === 'class') {
      element.className = value
    } else if (key === 'checked') {
      element.checked = value
    } else {
      element.setAttribute(key, value)
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
    parent.appendChild(
      typeof child === 'string' ? document.createTextNode(child) : child
    )
  }
}

export function mount(target, node) {
  target.innerHTML = ''
  target.appendChild(node)
}
