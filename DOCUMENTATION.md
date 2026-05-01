# Micro-Frontend Shopping Project - Documentation

This document explains every step of the micro-frontend shopping project. This project uses **React 18** with **Webpack 5 Module Federation** to create a distributed e-commerce application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Project Structure](#3-project-structure)
4. [Step-by-Step Implementation](#4-step-by-step-implementation)
5. [Key Concepts Explained](#5-key-concepts-explained)
6. [Running the Project](#6-running-the-project)
7. [Features Implemented](#7-features-implemented)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Project Overview

### What is a Micro-Frontend?

Micro-frontend is an architectural style where a large application is split into smaller, independently deployable frontend applications. Each micro-frontend can be developed, tested, and deployed by different teams using different technologies.

### Our Project Structure

| Module | Port | Purpose |
|--------|------|---------|
| **host-app** | 3000 | Main application shell - handles routing, navigation, and loads other modules |
| **products-module** | 3001 | Displays products list with add-to-cart functionality |
| **cart-module** | 3002 | Displays shopping cart with quantity controls |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HOST APP (Port 3000)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Header    │  │  Burger     │  │    Route Manager    │ │
│  │  + Cart     │  │  Menu       │  │  / → Home           │ │
│  │  Badge      │  │             │  │  /products → Prod  │ │
│  └─────────────┘  └─────────────┘  │  /cart → Cart       │ │
│                                    └─────────────────────┘ │
│                         │                                    │
│              ┌──────────┴──────────┐                       │
│              │     EventBus         │                       │
│              │  (Cross-module       │                       │
│              │   communication)     │                       │
│              └──────────┬──────────┘                       │
└─────────────────────────┼───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   PRODUCTS    │  │     CART      │  │    (More      │
│   MODULE      │  │    MODULE     │  │   modules     │
│   (Port 3001) │  │   (Port 3002) │  │   can be      │
│               │  │               │  │   added)      │
│ - Product     │  │ - Cart view   │  │               │
│   display     │  │ - Quantity    │  │               │
│ - Add to cart │  │   controls    │  │               │
│ - Quantity    │  │ - Remove      │  │               │
│   controls    │  │   items       │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 3. Project Structure

```
poc-micro-frontend/
├── host-app/                    # Main shell application
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── index.js            # Entry point
│   │   ├── styles.css          # Global styles
│   │   └── index.html          # HTML template
│   ├── webpack.config.js        # Webpack + Module Federation config
│   └── package.json             # Dependencies
│
├── products-module/             # Products micro-frontend
│   ├── src/
│   │   ├── App.js              # Products component
│   │   ├── index.js            # Entry point
│   │   ├── styles.css          # Products styles
│   │   └── index.html          # HTML template
│   ├── webpack.config.js        # Module Federation (exposes ProductsApp)
│   └── package.json             # Dependencies
│
└── cart-module/                  # Cart micro-frontend
    ├── src/
    │   ├── App.js              # Cart component
    │   ├── index.js            # Entry point
    │   ├── styles.css          # Cart styles
    │   └── index.html          # HTML template
    ├── webpack.config.js        # Module Federation (exposes CartApp)
    └── package.json             # Dependencies
```

---

## 4. Step-by-Step Implementation

### Step 1: Create Host Application

The host is the main shell that orchestrates everything.

**File: `host-app/webpack.config.js`**

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  // ... other config
  plugins: [
    new ModuleFederationPlugin({
      name: 'hostApp',
      filename: 'remoteEntry.js',
      remotes: {
        // Tell webpack where to find remote modules
        productsModule: 'productsModule@http://localhost:3001/remoteEntry.js',
        cartModule: 'cartModule@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true }
      }
    })
  ]
};
```

**Explanation:**
- `remotes`: Defines where to find other micro-frontends
- `shared`: Ensures React is loaded only once (singleton mode)

---

### Step 2: Create Products Module

**File: `products-module/webpack.config.js`**

```javascript
new ModuleFederationPlugin({
  name: 'productsModule',
  filename: 'remoteEntry.js',
  exposes: {
    // Expose this component to be used by other apps
    './ProductsApp': './src/App.js'
  },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
})
```

**Explanation:**
- `exposes`: Makes the component available to other applications
- The products module runs on port 3001 and exposes `ProductsApp`

---

### Step 3: Create Cart Module

Similar to products module, but exposes `CartApp` on port 3002.

---

### Step 4: Set Up Cross-Module Communication (EventBus)

**File: `host-app/src/App.js`**

```javascript
const EventBus = {
  listeners: {},
  cartStore: [],  // Shared cart data
  
  subscribe(event, callback) {
    // Register a listener for an event
  },
  
  publish(event, data) {
    // Notify all listeners of an event
  },
  
  getCart() {
    return this.cartStore;
  },
  
  addToCart(product) {
    this.cartStore.push(product);
    this.publish('cart:updated', { count: this.cartStore.length });
  },
  
  removeFromCart(index) {
    this.cartStore.splice(index, 1);
    this.publish('cart:updated', { count: this.cartStore.length });
  }
};

window.EventBus = EventBus;  // Make available globally
```

**Explanation:**
- EventBus allows different modules to communicate without direct dependencies
- When cart is updated, it publishes an event that all modules can listen to

---

### Step 5: Lazy Load Remote Modules

**File: `host-app/src/App.js`**

```javascript
import React, { Suspense, lazy } from 'react';

// Lazy load = only load when needed
const ProductsApp = lazy(() => import('productsModule/ProductsApp'));
const CartApp = lazy(() => import('cartModule/CartApp'));

// Wrap with Suspense for loading state
function ModuleLoader({ children, moduleName, port, remoteUrl }) {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      {children}
    </Suspense>
  );
}

// Usage in routes
<Route path="/products" element={
  <ModuleLoader moduleName="Products Service" port="3001" remoteUrl="http://localhost:3001/remoteEntry.js">
    <ProductsApp />
  </ModuleLoader>
} />
```

**Explanation:**
- `React.lazy()`: Loads the component only when the route is visited
- `Suspense`: Shows a fallback while the component is loading

---

### Step 6: Add Error Handling for Offline Services

**File: `host-app/src/App.js`**

```javascript
// Check if a service is running
function useModuleStatus(remoteUrl, moduleName) {
  const [status, setStatus] = React.useState('checking');

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        await fetch(remoteUrl, { mode: 'no-cors' });
        setStatus('online');
      } catch (error) {
        setStatus('offline');
      }
    };
    setTimeout(checkStatus, 1000);
  }, [remoteUrl, moduleName]);

  return status;
}

// Show error if service is down
function ModuleOfflineError({ moduleName, port }) {
  return (
    <div className="error-container">
      <h2>Service Unavailable</h2>
      <p>The {moduleName} is currently down.</p>
      <p>Please make sure the server is running on port {port}.</p>
    </div>
  );
}
```

---

### Step 7: Implement Quantity Controls in Products

**File: `products-module/src/App.js`**

```javascript
export default function ProductsApp() {
  const [quantities, setQuantities] = useState({});

  // Sync with cart store
  useEffect(() => {
    const updateQuantities = () => {
      const cart = window.EventBus.getCart();
      const qtyMap = {};
      cart.forEach(item => {
        qtyMap[item.id] = (qtyMap[item.id] || 0) + 1;
      });
      setQuantities(qtyMap);
    };

    updateQuantities();
    const unsubscribe = window.EventBus.subscribe('cart:updated', updateQuantities);
    return () => unsubscribe();
  }, []);

  const updateQuantity = (product, delta) => {
    const cart = window.EventBus.getCart();
    const productIndex = cart.findIndex(item => item.id === product.id);
    
    if (productIndex === -1 && delta > 0) {
      window.EventBus.addToCart(product);
    } else if (productIndex !== -1) {
      if (delta > 0) {
        window.EventBus.addToCart(product);
      } else {
        const indexToRemove = cart.findIndex(item => item.id === product.id);
        window.EventBus.removeFromCart(indexToRemove);
      }
    }
  };

  return (
    // Show quantity controls if item is in cart
    {quantities[product.id] ? (
      <div className="quantity-controls">
        <button onClick={() => updateQuantity(product, -1)}>−</button>
        <span>{quantities[product.id]}</span>
        <button onClick={() => updateQuantity(product, 1)}>+</button>
      </div>
    ) : (
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    )}
  );
}
```

---

### Step 8: Implement Grouped Cart Display

**File: `cart-module/src/App.js`**

```javascript
// Group items by product ID
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

// In render
{groupedItems.map((item) => (
  <div className="cart-item">
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

## 5. Key Concepts Explained

### Module Federation

Module Federation allows a JavaScript application to dynamically load code from another application at runtime.

**Benefits:**
- Independent deployment of micro-frontends
- Shared dependencies (React loaded once)
- Lazy loading for better performance

### EventBus Pattern

EventBus is a simple publish-subscribe pattern that allows loose coupling between modules.

```
┌─────────┐    publish('cart:updated')    ┌─────────┐
│ Products │ ──────────────────────────▶ │   Cart   │
│   App    │                               │    App    │
└─────────┘                               └─────────┘
       │                                        ▲
       │ subscribe                              │
       └────────────────────────────────────────┘
```

### React Hooks Used

| Hook | Purpose |
|------|---------|
| `useState` | Manage component state (cart items, quantities) |
| `useEffect` | Run side effects (subscribe to events, fetch data) |
| `useMemo` | Cache computed values (grouped cart items) |
| `lazy` | Code-splitting for better loading performance |

---

## 6. Running the Project

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Start All Three Servers

**Terminal 1 - Host:**
```bash
cd poc-micro-frontend/host-app
npm start
```

**Terminal 2 - Products:**
```bash
cd poc-micro-frontend/products-module
npm start
```

**Terminal 3 - Cart:**
```bash
cd poc-micro-frontend/cart-module
npm start
```

### Access the Application

Open browser to: **http://localhost:3000**

| Route | Module |
|-------|--------|
| `/` | Home page |
| `/products` | Products module (port 3001) |
| `/cart` | Cart module (port 3002) |

---

## 7. Features Implemented

### ✅ Completed Features

1. **Micro-Frontend Architecture**
   - Host app loads products and cart modules dynamically
   - Each module runs on its own port

2. **Cross-Module Communication**
   - EventBus shares cart data between modules
   - Real-time updates when cart changes

3. **Product Display**
   - Grid layout with product cards
   - Image, name, price, rating display

4. **Add to Cart**
   - Click product to add to cart
   - Cart badge updates in header

5. **Quantity Controls (Products Page)**
   - After adding: shows count with +/− buttons
   - + adds one more, − removes one

6. **Quantity Controls (Cart Page)**
   - Same items grouped with quantity count
   - +/− buttons to adjust quantity
   - Subtotal shows price × quantity

7. **Error Handling**
   - Shows "Service Unavailable" if a module is down
   - Displays which port needs to be started

8. **Burger Menu**
   - Slide-in menu from left side
   - Navigation links to all pages

---

## 8. Troubleshooting

### Error: "Loading script failed"

**Cause:** Remote module server is not running.

**Solution:**
```bash
# Check which ports are running
netstat -ano | findstr "3000 3001 3002"

# Start missing service
cd poc-micro-frontend/products-module
npm start
```

### Error: "Invalid hook call"

**Cause:** React version mismatch between modules.

**Solution:** Ensure all modules use the same React version:
```json
// In package.json of all modules
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Error: "Module not found"

**Cause:** Module Federation config issue.

**Solution:** Check webpack.config.js has correct:
- `exposes` in remote modules
- `remotes` in host module

---

## Summary

This project demonstrates:
1. **Micro-frontend architecture** with independent services
2. **Module Federation** for dynamic code loading
3. **Event-driven communication** via EventBus
4. **Error handling** for service availability
5. **Quantity management** across products and cart

Each module can be developed, tested, and deployed independently while still working together as a single application.