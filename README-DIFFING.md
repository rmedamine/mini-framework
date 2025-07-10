# 🚀 Système de Diffing - Mini Framework

## Vue d'ensemble

Le système de diffing a été ajouté au mini-framework pour optimiser les rendus en mettant à jour uniquement les parties du DOM qui ont changé, au lieu de re-rendre tout l'arbre DOM.

## 🎯 Avantages

- **Performance améliorée** : Mise à jour ciblée du DOM
- **Moins de re-rendus** : Évite les manipulations DOM inutiles
- **Meilleure UX** : Transitions plus fluides
- **Économie de ressources** : Moins de calculs et d'opérations DOM

## 📁 Structure des Fichiers

```
framework/
├── minidom.js    # API principale avec diffing
├── diff.js       # Système de diffing
├── event.js      # Gestionnaire d'événements
├── router.js     # Système de routage
└── store.js      # Gestionnaire d'état
```

## 🔧 API Principale

### `el(type, props)`
Crée un élément virtuel (pas encore dans le DOM)

```javascript
const element = el('div', {
  class: 'container',
  children: [
    el('h1', { children: ['Titre'] }),
    el('p', { children: ['Contenu'] })
  ]
})
```

### `mount(target, virtualNode)`
Monte un élément virtuel dans le DOM avec diffing

```javascript
const app = el('div', { children: ['Hello World'] })
mount(document.getElementById('app'), app)
```

## 🧠 Comment Fonctionne le Diffing

### 1. Éléments Virtuels
Au lieu de créer directement des éléments DOM, le framework crée des objets virtuels :

```javascript
// Élément virtuel
{
  type: 'div',
  props: {
    class: 'container',
    children: [...]
  }
}
```

### 2. Comparaison Intelligente
Le système compare les arbres virtuels pour détecter les changements :

- **Ajout** : Nouvel élément
- **Suppression** : Élément supprimé
- **Mise à jour** : Propriétés ou contenu modifiés
- **Remplacement** : Type d'élément différent

### 3. Mise à Jour Ciblée
Seules les parties du DOM qui ont changé sont mises à jour :

```javascript
// Avant (sans diffing)
parent.innerHTML = '' // Supprime tout
parent.appendChild(newElement) // Recrée tout

// Après (avec diffing)
// Met à jour seulement le texte qui a changé
textNode.textContent = newValue
```

## 📊 Exemples d'Optimisation

### Compteur Simple
```javascript
const store = createStore({ count: 0 })

function renderCounter() {
  const { count } = store.state
  
  const counter = el('div', {
    children: [
      el('h1', { children: [`Compteur: ${count}`] }),
      el('button', { 
        onclick: () => store.setState({ count: count + 1 }),
        children: ['Incrémenter']
      })
    ]
  })
  
  mount(document.getElementById('app'), counter)
}

store.subscribe(renderCounter)
```

**Résultat** : Seul le texte du compteur est mis à jour, pas tout le DOM !

### Liste Dynamique
```javascript
const store = createStore({ items: ['Item 1', 'Item 2'] })

function renderList() {
  const { items } = store.state
  
  const listItems = items.map((item, index) => 
    el('div', {
      key: `item-${index}`,
      children: [item]
    })
  )
  
  const list = el('div', { children: listItems })
  mount(document.getElementById('list'), list)
}
```

**Résultat** : Ajout/suppression d'éléments sans re-rendre toute la liste !

## 🎨 Éléments Conditionnels

Le système gère automatiquement les éléments conditionnels :

```javascript
const store = createStore({ show: true })

function render() {
  const { show } = store.state
  
  const app = el('div', {
    children: [
      show && el('div', { children: ['Contenu visible'] }),
      !show && el('div', { children: ['Contenu masqué'] })
    ]
  })
  
  mount(document.getElementById('app'), app)
}
```

## 🔄 Cache et Performance

Le système utilise un cache WeakMap pour stocker les arbres virtuels précédents :

```javascript
const elementCache = new WeakMap()

// Stockage
setCachedTree(element, virtualTree)

// Récupération
const oldTree = getCachedTree(element)
```

## 📈 Comparaison de Performance

| Opération | Sans Diffing | Avec Diffing |
|-----------|--------------|--------------|
| Mise à jour texte | Re-rendu complet | Mise à jour ciblée |
| Ajout élément | Re-rendu complet | Ajout ciblé |
| Changement classe | Re-rendu complet | Mise à jour propriété |
| Élément conditionnel | Re-rendu complet | Ajout/suppression ciblée |

## 🧪 Tests et Démonstrations

### Fichiers de Test
- `test-diffing.html` : Tests basiques du diffing
- `demo-diffing.html` : Démonstration complète avec statistiques
- `todomvc/` : Application TodoMVC optimisée avec diffing

### Comment Tester
1. Ouvrir `demo-diffing.html` dans un navigateur
2. Utiliser les boutons pour voir le diffing en action
3. Observer la console pour les logs de performance
4. Comparer avec l'ancienne version sans diffing

## 🔧 Configuration Avancée

### Désactiver le Diffing (pour debug)
```javascript
// Dans minidom.js, remplacer mount par :
export function mount(target, virtualNode) {
  target.innerHTML = ''
  const domElement = createDOMElement(virtualNode)
  if (domElement) {
    target.appendChild(domElement)
  }
}
```

### Logs de Performance
```javascript
// Ajouter dans diff.js
function logDiff(oldTree, newTree) {
  console.log('🔄 Diffing:', {
    old: oldTree,
    new: newTree,
    timestamp: Date.now()
  })
}
```

## 🚀 Migration depuis l'Ancienne Version

### Avant (sans diffing)
```javascript
import { el, mount, setChildren } from './framework/minidom.js'

function render() {
  const element = el('div', { children: ['Hello'] })
  const domElement = createElement('div', { children: ['Hello'] })
  setChildren(parent, [element])
}
```

### Après (avec diffing)
```javascript
import { el, mount } from './framework/minidom.js'

function render() {
  const element = el('div', { children: ['Hello'] })
  mount(parent, element) // Utilise automatiquement le diffing
}
```

## 🎯 Bonnes Pratiques

1. **Utilisez des clés uniques** pour les listes
2. **Évitez les mutations directes** du DOM
3. **Structurez vos composants** de manière prévisible
4. **Profitez du cache** automatique
5. **Testez les performances** avec les outils de développement

## 🔮 Améliorations Futures

- [ ] Diffing par clés (comme React)
- [ ] Optimisations pour les listes longues
- [ ] Support des fragments
- [ ] Mémoisation automatique
- [ ] Profiling intégré

---

**Le système de diffing transforme votre mini-framework en un outil de rendu performant et moderne !** 🚀 