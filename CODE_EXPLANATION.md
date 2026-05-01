# Code Explanation - How Each Part Works

This document explains the code line-by-line in simple terms. Think of it as a "Code for Beginners" guide.

---

## Table of Contents

1. [Host App - The Main Controller](#1-host-app---the-main-controller)
2. [Products Module - The Store](#2-products-module---the-store)
3. [Cart Module - The Shopping Cart](#3-cart-module---the-shopping-cart)
4. [How They Talk to Each Other](#4-how-they-talk-to-each-other)

---

## 1. Host App - The Main Controller

The host app is like the "brain" that coordinates everything. It runs on port 3000.

### File: `host-app/src/App.js`

Let's break it down section by section:

---

### Section 1: Imports

```javascript
import React, { useState, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import './styles.css';
```

**What this means:**
- `React` - The library we're using to build the UI
- `useState` - A way to store data that changes (like cart count)
- `Suspense` - Shows a loading spinner while modules load
- `useEffect` - Runs code when something happens (like page load)
- `BrowserRouter, Routes, Route` - Handles navigation between pages
- `Link, NavLink` - Clickable links that change the URL without reloading

---

### Section 2: EventBus (The Communication System)

```javascript
const EventBus = {
  listeners: {},
  cartStore: [],
  
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  },
  
  publish(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  },
  
  getCart() {
    return this.cartStore;
  },
  
  addToCart(product) {
    this.cartStore.push(product);
    this.publish('cart:updated', { 
      count: this.cartStore.length, 
      items: [...this.cartStore]
    });
  },
  
  removeFromCart(index) {
    this.cartStore.splice(index, 1);
    this.publish('cart:updated', { 
      count: this.cartStore.length, 
      items: [...this.cartStore]
    });
  },
  
  clearCart() {
    this.cartStore = [];
    this.publish('cart:updated', { 
      count: 0, 
      items: [] 
    });
  }
};

window.EventBus = EventBus;
```

**Think of EventBus as a bulletin board:**

| Method | What it does | Analogy |
|--------|--------------|---------|
| `subscribe` | Register to hear about updates | Subscribe to a newsletter |
| `publish` | Announce something happened | Post a notice on the board |
| `getCart` | See what's in the cart | Look at the board |
| `addToCart` | Put something in cart | Add a note to the board |
| `removeFromCart` | Take something out | Remove a note from the board |
| `clearCart` | Empty the cart | Clear all notes |

**Line-by-line explanation:**

```javascript
listeners: {},  // A list of people who want to be notified
cartStore: []    // An empty shopping cart (array of items)
```

```javascript
subscribe(event, callback) {
  // event = "cart:updated" (the type of notification)
  // callback = function to run when notification arrives
  if (!this.listeners[event]) {
    this.listeners[event] = [];  // Create new list if doesn't exist
  }
  this.listeners[event].push(callback);  // Add person to list
  // Return a function to unsubscribe (stop listening)
  return () => {
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  };
}
```

```javascript
publish(event, data) {
  // Tell everyone who subscribed that something happened
  if (this.listeners[event]) {
    this.listeners[event].forEach(callback => callback(data));
  }
}
```

```javascript
addToCart(product) {
  this.cartStore.push(product);  // Add product to array
  this.publish('cart:updated', { count: this.cartStore.length }); // Notify everyone
}
```

```javascript
window.EventBus = EventBus;  // Make EventBus available globally (accessible from any module)
```

---

### Section 3: Lazy Loading (Loading Modules On Demand)

```javascript
const ProductsApp = React.lazy(() => import('productsModule/ProductsApp'));
const CartApp = React.lazy(() => import('cartModule/CartApp'));
```

**What this means:**
- `React.lazy()` - Don't load the component until we need it
- `import('productsModule/ProductsApp')` - Load this from another server

**Why use lazy loading?**
- Faster initial page load
- Only load what we need, when we need it

---

### Section 4: Check If Service Is Running

```javascript
function useModuleStatus(remoteUrl, moduleName) {
  const [status, setStatus] = React.useState('checking');
```

- `useState('checking')` - Start with status "checking"
- Will change to "online" or "offline" after we check

```javascript
  React.useEffect(() => {
    let isMounted = true;
    
    const checkStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(remoteUrl, { 
          method: 'HEAD',
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (isMounted) {
          setStatus('online');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('offline');
        }
      }
    };

    checkStatus();
    
    const interval = setInterval(checkStatus, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [remoteUrl, moduleName]);

  return status;
}
```

**What this does:**
1. Try to fetch the remote module's URL
2. If it works → status = "online"
3. If it fails → status = "offline"
4. Check every 10 seconds

---

### Section 5: Error Display

```javascript
function ModuleOfflineError({ moduleName, port }) {
  return (
    <div className="error-container">
      <div className="error-icon">🔌</div>
      <h2>Service Unavailable</h2>
      <p>The <strong>{moduleName}</strong> is currently down.</p>
      <p>Please make sure the server is running on <strong>port {port}</strong>.</p>
      <button onClick={() => window.location.reload()}>
        🔄 Reload Page
      </button>
    </div>
  );
}
```

**What this does:**
- If a service is down, show this error message
- `{moduleName}` and `{port}` are variables that get replaced with actual values

---

### Section 6: Module Loader (The Guard)

```javascript
function ModuleLoader({ children, moduleName = 'Module', port, remoteUrl }) {
  const moduleStatus = useModuleStatus(remoteUrl, moduleName);

  if (moduleStatus === 'offline') {
    return <ModuleOfflineError moduleName={moduleName} port={port} />;
  }

  if (moduleStatus === 'checking') {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <ErrorBoundary moduleName={moduleName} port={port}>
      <Suspense fallback={<div className="loading"><div className="spinner"></div></div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
```

**Decision tree:**
```
Is service offline?
├─ YES → Show error message
└─ NO → Is it still checking?
        ├─ YES → Show loading spinner
        └─ NO → Is it online?
                ├─ YES → Load the module (children)
                └─ NO → Show error (fallback)
```

---

### Section 7: Error Boundary (Catches Crashes)

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Module loading error:', error, errorInfo);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return <ModuleOfflineError moduleName={this.props.moduleName} port={this.props.port} />;
    }
    return this.props.children;
  }
}
```

**What is an Error Boundary?**
- It's like a safety net - if the component crashes, it catches the error
- Instead of showing a blank white screen, it shows a friendly error message
- `getDerivedStateFromError` - Prepare to show error
- `componentDidCatch` - Log the error for debugging
- `render` - If there's an error, show error message; otherwise, show children

---

### Section 8: Routes (URL Mapping)

```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/products" element={
    <ModuleLoader moduleName="Products Service" port="3001" remoteUrl="http://localhost:3001/remoteEntry.js">
      <ProductsApp />
    </ModuleLoader>
  } />
  <Route path="/cart" element={
    <ModuleLoader moduleName="Cart Service" port="3002" remoteUrl="http://localhost:3002/remoteEntry.js">
      <CartApp />
    </ModuleLoader>
  } />
</Routes>
```

**What each part means:**

| Part | Meaning |
|------|---------|
| `path="/products"` | When URL is `/products` |
| `element={<ProductsApp />}` | Show the ProductsApp component |
| `<ModuleLoader ...>` | Wrap it with error handling |
| `port="3001"` | Products runs on port 3001 |

---

## 2. Products Module - The Store

### File: `products-module/src/App.js`

```javascript
import React, { useState, useEffect } from 'react';
import './styles.css';
```

**Imports:**
- `useState` - Store quantities for each product
- `useEffect` - Listen for cart updates

---

### Product Data

```javascript
const products = [
  { id: 1, name: 'MacBook Pro', price: 1299, image: '💻', category: 'Electronics', rating: 4.8 },
  { id: 2, name: 'iPhone 15', price: 999, image: '📱', category: 'Electronics', rating: 4.9 },
  // ... more products
];
```

**What this is:**
- An array of product objects
- Each product has: id, name, price, image (emoji), category, rating

---

### Main Component

```javascript
export default function ProductsApp() {
  const [quantities, setQuantities] = useState({});
```

- `quantities` = {} (empty object at start)
- Will store like: `{ 1: 2, 3: 1 }` meaning "product 1: quantity 2, product 3: quantity 1"

---

### Sync With Cart (The Important Part)

```javascript
  useEffect(() => {
    const updateQuantities = () => {
      if (window.EventBus && window.EventBus.getCart) {
        const cart = window.EventBus.getCart();
        const qtyMap = {};
        cart.forEach(item => {
          qtyMap[item.id] = (qtyMap[item.id] || 0) + 1;
        });
        setQuantities(qtyMap);
      }
    };

    updateQuantities();

    if (window.EventBus && window.EventBus.subscribe) {
      const unsubscribe = window.EventBus.subscribe('cart:updated', updateQuantities);
      return () => unsubscribe();
    }
  }, []);
```

**Step-by-step:**

1. `updateQuantities()` - Count how many of each product are in cart
   ```javascript
   cart.forEach(item => {
     qtyMap[item.id] = (qtyMap[item.id] || 0) + 1;
   });
   ```
   - Loop through each item in cart
   - If product ID 1 appears twice, qtyMap[1] = 2

2. `updateQuantities()` - Run immediately when component loads

3. Subscribe to cart updates:
   ```javascript
   window.EventBus.subscribe('cart:updated', updateQuantities)
   ```
   - When cart changes, automatically update quantities

4. `return () => unsubscribe()` - Clean up when component unmounts

---

### Add To Cart Function

```javascript
  const addToCart = (product) => {
    if (window.EventBus && window.EventBus.addToCart) {
      window.EventBus.addToCart(product);
    }
  };
```

- Simply calls the EventBus's addToCart method
- The EventBus will handle adding and notifying other modules

---

### Update Quantity Function

```javascript
  const updateQuantity = (product, delta) => {
    if (!window.EventBus || !window.EventBus.getCart) return;
    
    const cart = window.EventBus.getCart();
    const productIndex = cart.findIndex(item => item.id === product.id);
    
    if (productIndex === -1 && delta > 0) {
      addToCart(product);
    } else if (productIndex !== -1) {
      if (delta > 0) {
        addToCart(product);
      } else {
        const indexToRemove = cart.findIndex(item => item.id === product.id);
        if (indexToRemove !== -1 && window.EventBus.removeFromCart) {
          window.EventBus.removeFromCart(indexToRemove);
        }
      }
    }
  };
```

**Logic:**
- `delta > 0` means "+" button was clicked → add to cart
- `delta < 0` means "−" button was clicked → remove from cart

---

### Display (JSX)

```javascript
  return (
    <div className="main-container">
      {error && (
        <div className="service-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <div className="hero">...</div>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            ...
            {quantities[product.id] ? (
              // Show quantity controls if item is in cart
              <div className="quantity-controls">
                <button className="qty-btn" onClick={() => updateQuantity(product, -1)}>−</button>
                <span className="qty-display">{quantities[product.id]}</span>
                <button className="qty-btn" onClick={() => updateQuantity(product, 1)}>+</button>
              </div>
            ) : (
              // Show "Add to Cart" button if not in cart
              <button onClick={() => addToCart(product)} className="add-to-cart-btn">
                Add to Cart 🛒
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**The conditional rendering:**
```javascript
{quantities[product.id] ? (
  // TRUE: Item is in cart → show quantity controls
  <div className="quantity-controls">...</div>
) : (
  // FALSE: Item not in cart → show add button
  <button>Add to Cart</button>
)}
```

---

## 3. Cart Module - The Shopping Cart

### File: `cart-module/src/App.js`

---

### Group Items Function

```javascript
const getGroupedItems = () => {
  const grouped = {};
  cartItems.forEach(item => {
    if (grouped[item.id]) {
      grouped[item.id].quantity += 1;
    } else {
      grouped[item.id] = { ...item, quantity: 1 };
    }
  });
  return Object.values(grouped);
};
```

**What it does:**
- Turns flat list into grouped by product ID
- Adds a `quantity` property to each group

**Example:**
```
Before: [MacBook, MacBook, iPhone]
After:  [{name: MacBook, quantity: 2}, {name: iPhone, quantity: 1}]
```

---

### Update Quantity In Cart

```javascript
const updateQuantity = (productId, delta) => {
  const cart = window.EventBus.getCart();
  const productIndex = cart.findIndex(item => item.id === productId);
  
  if (productIndex === -1 && delta > 0) {
    // Add new item
    const product = cartItems.find(item => item.id === productId);
    if (product && window.EventBus.addToCart) {
      window.EventBus.addToCart(product);
    }
  } else if (productIndex !== -1) {
    if (delta > 0) {
      // Add one more
      const product = cartItems.find(item => item.id === productId);
      if (product && window.EventBus.addToCart) {
        window.EventBus.addToCart(product);
      }
    } else {
      // Remove one
      const indexToRemove = cart.findIndex(item => item.id === productId);
      if (indexToRemove !== -1 && window.EventBus.removeFromCart) {
        window.EventBus.removeFromCart(indexToRemove);
      }
    }
  }
};
```

---

### Remove All of One Product

```javascript
const removeFromCart = (productId) => {
  const cart = window.EventBus.getCart();
  // Keep removing until none left
  while (cart.findIndex(item => item.id === productId) !== -1) {
    const index = cart.findIndex(item => item.id === productId);
    window.EventBus.removeFromCart(index);
  }
};
```

---

### Display Grouped Items

```javascript
{groupedItems.map((item) => (
  <div key={item.id} className="cart-item">
    <div className="cart-item-image">{item.image}</div>
    <div className="cart-item-info">
      <div className="cart-item-name">{item.name}</div>
      <div className="cart-item-price">${item.price} × {item.quantity}</div>
      <div className="cart-item-subtotal">= ${item.price * item.quantity}</div>
    </div>
    <div className="cart-item-actions">
      <div className="quantity-controls">
        <button onClick={() => updateQuantity(item.id, -1)}>−</button>
        <span>{item.quantity}</span>
        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
      </div>
      <button onClick={() => removeFromCart(item.id)}>Remove</button>
    </div>
  </div>
))}
```

---

## 4. How They Talk to Each Other

### The Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOST APP (Port 3000)                     │
│                                                                  │
│  window.EventBus = {                                             │
│    cartStore: [],        ◄── Shared storage                     │
│    addToCart(),          ◄── Add item                            │
│    removeFromCart(),     ◄── Remove item                         │
│    subscribe()           ◄── Listen for changes                  │
│    publish()             ◄── Notify others                       │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────┘
         ▲                    │                    ▲
         │                    │                    │
    Products              EventBus             Cart
    Module                (central)           Module
    (3001)                communication       (3002)
         │                    │                    │
         │                    ▼                    │
         │            ┌──────────────┐            │
         │            │ cartStore    │            │
         │            │ [item1,      │            │
         │            │  item1,      │            │
         │            │  item2]      │            │
         │            └──────────────┘            │
         │                    │                    │
         └────────────────────┴────────────────────┘
```

### Step-by-Step Communication

**Step 1: User clicks "Add to Cart" on Products page**

```javascript
// In products-module
addToCart(product) {
  window.EventBus.addToCart(product);
}
```

**Step 2: EventBus adds to cart and notifies everyone**

```javascript
// In host-app (EventBus)
addToCart(product) {
  this.cartStore.push(product);           // 1. Add to cart
  this.publish('cart:updated', {          // 2. Notify everyone
    count: this.cartStore.length, 
    items: [...this.cartStore]
  });
}
```

**Step 3: Products module updates its quantity display**

```javascript
// In products-module
useEffect(() => {
  const unsubscribe = window.EventBus.subscribe('cart:updated', updateQuantities);
  return () => unsubscribe();
}, []);

function updateQuantities() {
  // Recalculate quantities from cart
}
```

**Step 4: Cart module updates its display**

```javascript
// In cart-module
useEffect(() => {
  const unsubscribe = EventBus.subscribe('cart:updated', (data) => {
    setCartItems(data.items || []);  // Update cart items
  });
  return () => unsubscribe();
}, []);
```

---

### Summary

| Component | Responsibility |
|-----------|----------------|
| **Host App** | Creates EventBus, handles routing, shows errors |
| **Products Module** | Shows products, adds to cart, adjusts quantities |
| **Cart Module** | Shows cart, adjusts quantities, removes items |
| **EventBus** | Central communication - stores cart, notifies changes |

The key insight: **All modules read from and write to the same `cartStore` array in the host app.** When anything changes, the change is published as an event, and all subscribed modules update their display.