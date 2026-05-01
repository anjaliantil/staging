import React, { useState, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import './styles.css';

// Event Bus for cross-module communication
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

// Lazy load remote modules with error handling
const ProductsApp = React.lazy(() => 
  import('productsModule/ProductsApp')
);
const CartApp = React.lazy(() => 
  import('cartModule/CartApp')
);

// Custom hook to check if remote module is available
function useModuleStatus(remoteUrl, moduleName) {
  const [status, setStatus] = React.useState('checking'); // 'checking' | 'online' | 'offline'

  React.useEffect(() => {
    let isMounted = true;
    
    const checkStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // Try to fetch the remoteEntry.js
        const response = await fetch(remoteUrl, { 
          method: 'HEAD',
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (isMounted) {
          // Any response (even 404) means the server is up
          setStatus('online');
        }
      } catch (error) {
        if (isMounted) {
          console.warn(`${moduleName} is offline:`, error.message);
          setStatus('offline');
        }
      }
    };

    // Check immediately
    checkStatus();
    
    // Also check periodically
    const interval = setInterval(checkStatus, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [remoteUrl, moduleName]);

  return status;
}

// Error display when module is down
function ModuleOfflineError({ moduleName, port }) {
  return (
    <div className="error-container">
      <div className="error-icon">🔌</div>
      <h2>Service Unavailable</h2>
      <p>The <strong>{moduleName}</strong> is currently down.</p>
      <p className="error-hint">
        Please make sure the server is running on <strong>port {port}</strong>.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="retry-btn"
      >
        🔄 Reload Page
      </button>
    </div>
  );
}

// Loading fallback with error handling
function ModuleLoader({ children, moduleName = 'Module', port, remoteUrl }) {
  const moduleStatus = useModuleStatus(remoteUrl, moduleName);

  // Show offline error if we know service is down
  if (moduleStatus === 'offline') {
    return <ModuleOfflineError moduleName={moduleName} port={port} />;
  }

  // While checking, show loading (don't render children = don't trigger lazy load)
  if (moduleStatus === 'checking') {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Service is online, render the children (trigger lazy load)
  // Wrap with ErrorBoundary to catch any runtime errors
  return (
    <ErrorBoundary moduleName={moduleName} port={port}>
      <Suspense fallback={
        <div className="loading">
          <div className="spinner"></div>
        </div>
      }>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Error Boundary to catch runtime errors from lazy loading
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
      return (
        <ModuleOfflineError 
          moduleName={this.props.moduleName} 
          port={this.props.port} 
        />
      );
    }
    return this.props.children;
  }
}

// Header Component with Burger Menu
function Header({ cartCount, menuOpen, setMenuOpen }) {
  return (
    <>
      {/* Burger Menu Button */}
      <button 
        className="burger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {/* Slide-in Menu */}
      <div className={`burger-menu ${menuOpen ? 'open' : ''}`}>
        <div className="burger-menu-header">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            🛍️ ShopZone
          </Link>
        </div>
        <nav className="burger-menu-nav">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            🏠 Home
          </NavLink>
          <NavLink to="/products" onClick={() => setMenuOpen(false)}>
            🛍️ Products
          </NavLink>
          <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
            🛒 Cart
            {cartCount > 0 && <span className="menu-badge">{cartCount}</span>}
          </NavLink>
        </nav>
      </div>
      
      {/* Overlay */}
      {menuOpen && <div className="burger-overlay" onClick={() => setMenuOpen(false)} />}
      
      {/* Cart Badge */}
      <Link to="/cart" className="cart-badge-header">
        🛒
        {cartCount > 0 && <span className="count">{cartCount}</span>}
      </Link>
    </>
  );
}

// Home Page
function Home() {
  return (
    <div className="main-container">
      <div className="hero">
        <h1>Welcome to ShopZone 🛍️</h1>
        <p>Discover amazing products at unbeatable prices!</p>
        <Link to="/products" className="hero-btn">
          Shop Now →
        </Link>
      </div>
      
      <div className="products-section">
        <h2 className="section-title">🔥 Popular Categories</h2>
        <div className="products-grid">
          {[
            { icon: '💻', name: 'Electronics', color: '#e3f2fd' },
            { icon: '👕', name: 'Fashion', color: '#fce4ec' },
            { icon: '🏠', name: 'Home & Living', color: '#fff3e0' },
            { icon: '🎮', name: 'Gaming', color: '#e8f5e9' }
          ].map((cat, idx) => (
            <div key={idx} style={{
              background: cat.color,
              padding: '40px 20px',
              borderRadius: '16px',
              textAlign: 'center',
              fontSize: '60px'
            }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>{cat.icon}</div>
              <h3 style={{ color: '#2d3436' }}>{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
      
      <div className="products-section" style={{ marginTop: '40px' }}>
        <h2 className="section-title">⭐ Why Choose Us?</h2>
        <div className="products-grid">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
            { icon: '🔒', title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
            { icon: '💬', title: '24/7 Support', desc: 'Always here to help' }
          ].map((feature, idx) => (
            <div key={idx} style={{
              background: 'white',
              padding: '30px 20px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>{feature.icon}</div>
              <h3 style={{ color: '#2d3436', marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ color: '#636e72' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Subscribe to cart updates
  useEffect(() => {
    const unsubscribe = EventBus.subscribe('cart:updated', (data) => {
      setCartCount(data.count);
    });
    // Also check initial cart
    setCartCount(EventBus.getCart().length);
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Header cartCount={cartCount} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
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
    </BrowserRouter>
  );
}