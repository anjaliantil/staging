# Micro-Frontend Architecture - Demo Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Micro-Frontend Methods](#micro-frontend-methods)
4. [Project Structure](#project-structure)
5. [How It Works](#how-it-works)
6. [Running the Demo](#running-the-demo)
7. [Key Concepts Explained](#key-concepts-explained)

---

## 1. Project Overview

This is a **hybrid micro-frontend project** demonstrating:
- **Host Application** (Angular 18) - The main container app
- **Remote Angular App** (Angular 18) - A standalone micro-frontend
- **Remote React App** (React 18) - A React micro-frontend integrated into Angular

### Technology Stack
| App | Framework | Module Federation |
|-----|-----------|-------------------|
| Host | Angular 18 | ✅ Configured |
| Remote | Angular 18 | ✅ Configured |
| Remote-React | React 18 | ✅ Configured |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOST APPLICATION                         │
│                         (Angular 18)                            │
│                      http://localhost:4200                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────┐    ┌────────────────────────────────┐ │
│   │   Home Component   │    │     Remote Loading Area        │ │
│   │   (Local Angular)  │    │                                │ │
│   │                    │───▶│  ┌──────────┐  ┌───────────┐  │ │
│   │                    │    │  │ Remote   │  │  React     │  │ │
│   │                    │    │  │ Angular  │  │  Wrapper   │  │ │
│   └─────────────────────┘    │  │  App     │  │  (Angular)│  │ │
│                              │  └────┬─────┘  └─────┬─────┘  │ │
│                              │       │              │        │ │
│                              └───────┼──────────────┼────────┘ │
│                                      │              │           │
└──────────────────────────────────────┼──────────────┼───────────┘
                                       │              │
                    ┌──────────────────┘   ┌──────────┘
                    │                         │
        ┌───────────▼───────────┐  ┌─────────▼──────────┐
        │   REMOTE ANGULAR APP  │  │  REMOTE REACT APP   │
        │   (Micro-Frontend 1)  │  │  (Micro-Frontend 2)│
        │   http://localhost:4201│  │  http://localhost:4202
        │                       │  │                     │
        │  Exposes:             │  │  Exposes:           │
        │  - ./Routes           │  │  - ./App            │
        │  - ./Component        │  │  - ./Routes         │
        └───────────────────────┘  └─────────────────────┘
```

---

## 3. Micro-Frontend Methods

There are **5 major approaches** to implementing micro-frontends:

### 3.1 Module Federation (This Project) ✅
**Status: Implemented**

Module Federation is a webpack 5 feature that allows loading code from another application at runtime.

**Pros:**
- ✅ Runtime code sharing
- ✅ Shared dependencies (single instance)
- ✅ No build-time coupling
- ✅ TypeScript support

**Cons:**
- ⚠️ Requires webpack 5
- ⚠️ Complex configuration

**Our Implementation:**
```javascript
// host/mf.config.js
remotes: [
  {
    name: 'remote',
    entry: 'http://localhost:4201/remoteEntry.js',
    exposedModule: './Routes'
  },
  {
    name: 'remoteReact',
    entry: 'http://localhost:4202/remoteEntry.js',
    exposedModule: './App'
  }
]
```

---

### 3.2 iFrames
**Status: Not Implemented**

Using `<iframe>` to embed separate applications.

```html
<iframe src="http://localhost:4201" />
```

**Pros:**
- ✅ Complete isolation
- ✅ Simple to implement
- ✅ Independent deployments

**Cons:**
- ❌ No shared state
- ❌ Poor UX (navigation issues)
- ❌ SEO problems
- ❌ Responsive challenges

---

### 3.3 Web Components
**Status: Concept Only**

Encapsulating micro-frontends as custom elements.

```javascript
customElements.define('mf-react-component', ReactWrapper);
```

**Pros:**
- ✅ Framework-agnostic
- ✅ Shadow DOM isolation
- ✅ Standard web technology

**Cons:**
- ❌ Routing complexity
- ❌ State management challenges

---

### 3.4 Single-SPA (Single Page Application)
**Status: Not Implemented**

Using a framework like [single-spa](https://single-spa.js.org/) to orchestrate multiple applications.

**Pros:**
- ✅ Multiple frameworks supported
- ✅ Lifecycle management
- ✅ Route-based loading

**Cons:**
- ❌ Additional abstraction layer
- ❌ Shared dependency conflicts

---

### 3.5 Build-Time Integration (Module Concatenation)
**Consuming micro-frontends as npm packages at build time.**

**Pros:**
- ✅ Type safety
- ✅ Simple debugging

**Cons:**
- ❌ Tight coupling
- ❌ Full rebuild required for updates
- ❌ Version synchronization pain

---

## 4. Project Structure

```
micro-fronted/
├── host/                          # Main Angular Application (Port 4200)
│   ├── mf.config.js              # Module Federation config
│   ├── package.json
│   └── src/
│       ├── app/
│       │   ├── remote/
│       │   │   ├── remote.component.ts      # Loads Angular remote
│       │   │   └── react-wrapper.component.ts # Loads React remote
│       │   ├── home/
│       │   └── app.routes.ts
│       └── main.ts
│
├── remote/                       # Remote Angular App (Port 4201)
│   ├── mf.config.js
│   ├── package.json
│   └── src/
│       └── app/
│           └── app.routes.ts    # Exposed as ./Routes
│
└── remote-react/                # Remote React App (Port 4202)
    ├── webpack.config.js        # Webpack Module Federation
    ├── package.json
    └── src/
        ├── App.js               # Exposed as ./App
        └── routes.js            # Exposed as ./Routes
```

---

## 5. How It Works

### Step 1: Remote Apps Expose Modules

**remote/mf.config.js:**
```javascript
exposes: {
  './Routes': './src/app/app.routes.ts'
}
```

**remote-react/webpack.config.js:**
```javascript
exposes: {
  './App': './src/App.js',
  './Routes': './src/routes.js'
}
```

### Step 2: Host App Configures Remotes

**host/mf.config.js:**
```javascript
remotes: [
  {
    name: 'remote',
    entry: 'http://localhost:4201/remoteEntry.js',
    exposedModule: './Routes'
  },
  {
    name: 'remoteReact',
    entry: 'http://localhost:4202/remoteEntry.js',
    exposedModule: './App'
  }
]
```

### Step 3: Host Loads Remote at Runtime

**host/src/app/remote/remote.component.ts:**
```typescript
async loadRemote() {
  const module = await loadRemoteModule({
    type: 'module',
    remoteEntry: 'http://localhost:4201/remoteEntry.js',
    exposedModule: './Component'
  });
}
```

**host/src/app/remote/react-wrapper.component.ts:**
```typescript
async loadAndRender(domElement: HTMLDivElement) {
  const module = await loadRemoteModule({
    type: 'script',
    remoteEntry: 'http://localhost:4202/remoteEntry.js',
    remoteName: 'remoteReact',
    exposedModule: './App'
  });
  
  const ReactElement = module.default;
  this.root = ReactDOM.createRoot(domElement);
  this.root.render(React.createElement(ReactElement));
}
```

---

## 6. Running the Demo

### Prerequisites
- Node.js 18+
- npm or yarn

### Start All Applications

```bash
# Terminal 1 - Start Host (Angular)
cd host
npm install
npm start
# Access: http://localhost:4200

# Terminal 2 - Start Remote (Angular)
cd remote
npm install
npm start
# Access: http://localhost:4201

# Terminal 3 - Start Remote React
cd remote-react
npm install
npm start
# Access: http://localhost:4202
```

### Or Use Combined Script
```bash
cd host
npm run run:all
```

---

## 7. Key Concepts Explained

### 7.1 What is Module Federation?

**Module Federation** allows a JavaScript application to dynamically load code from another application at runtime.

```
┌────────────────────────────────────────┐
│           BUILD TIME                   │
│  ┌──────────┐    ┌──────────┐         │
│  │  Host    │    │  Remote  │         │
│  │  (4200)  │    │  (4201)  │         │
│  └────┬─────┘    └────┬─────┘         │
│       │              │                │
│       │   webpack   │                │
│       │  bundles   │                 │
│       │  separately│                 │
└───────┼─────────────┼─────────────────┘
        │             │
        ▼             ▼
┌────────────────────────────────────────┐
│           RUNTIME                      │
│  ┌─────────────────────────────────┐   │
│  │      Browser Downloads          │   │
│  │  • host.js                      │   │
│  │  • remoteEntry.js (on demand)   │   │
│  │  • remote chunk.js (lazy)       │   │
│  └─────────────────────────────────┘   │
└────────────────────────────────────────┘
```

### 7.2 Shared Dependencies

Both apps share React - only one copy loads in the browser:

```javascript
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.2.0'
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^18.2.0'
  }
}
```

### 7.3 Loading Strategies

| Strategy | Code | Use Case |
|----------|------|-----------|
| Eager | `eager: true` | Critical UI (header, footer) |
| Lazy | Default | Feature-specific components |

### 7.4 Federation Terms

| Term | Definition |
|------|------------|
| **Host** | The main application that consumes remotes |
| **Remote** | A micro-frontend exposed for consumption |
| **Exposed Module** | A specific export from a remote app |
| **Shared Dependency** | Libraries loaded only once |
| **Remote Entry** | Manifest file listing available modules |

---

## 8. Demo Talking Points

### Opening (2 min)
> "Micro-frontends allow us to split a large application into smaller, independently deployable pieces. Today I'll show you a working example with Angular and React working together."

### Architecture (3 min)
> "We have three apps: a host on port 4200, a remote Angular app on 4201, and a remote React app on 4202. The host dynamically loads components from both."

### Live Demo (5 min)
> "Watch as the host app loads the Angular remote component and the React component - both at runtime, without rebuilding the host."

### Key Benefits (2 min)
> "1. Independent deployments - update the remote without touching the host
> 2. Technology flexibility - mix Angular and React
> 3. Shared dependencies - React loads only once in memory"

### Conclusion (1 min)
> "This is Module Federation - the modern standard for micro-frontends."

---

## 9. Additional Resources

- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Angular Architects Module Federation](https://github.com/angular-architects/module-federation)
- [Micro Frontends in Action (Book)](https://www.manning.com/books/micro-frontends-in-action)

---

*Document generated for demo purposes - April 2026*