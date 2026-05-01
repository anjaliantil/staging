import React, { useState, useEffect } from 'react';
import './styles.css';

// Event Bus for cross-module communication
const EventBus = window.EventBus || {
  listeners: {},
  subscribe(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  },
  publish(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

export default function CartApp() {
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  // Group cart items by product ID for quantity display
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

  // Initialize cart from shared store
  useEffect(() => {
    if (window.EventBus && window.EventBus.getCart) {
      const initialCart = window.EventBus.getCart();
      setCartItems(initialCart);
      setError(null);
    } else {
      setError('Unable to connect to cart service. Please ensure the host application is running.');
    }
    
    const unsubscribe = EventBus.subscribe('cart:updated', (data) => {
      setCartItems(data.items || []);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const updateQuantity = (productId, delta) => {
    if (!window.EventBus || !window.EventBus.getCart) return;
    
    const cart = window.EventBus.getCart();
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex === -1 && delta > 0) {
      // Add item
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

  const removeFromCart = (productId) => {
    if (!window.EventBus || !window.EventBus.getCart) return;
    
    // Remove all instances of this product
    const cart = window.EventBus.getCart();
    while (cart.findIndex(item => item.id === productId) !== -1) {
      const index = cart.findIndex(item => item.id === productId);
      window.EventBus.removeFromCart(index);
    }
    showNotification('Item removed from cart 🗑️');
  };

  const clearCart = () => {
    if (window.EventBus && window.EventBus.clearCart) {
      window.EventBus.clearCart();
    }
    setCartItems([]);
    showNotification('Cart cleared! 🧹');
  };

  const groupedItems = getGroupedItems();
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="main-container">
      {error && (
        <div className="service-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      {notification && (
        <div className="toast">{notification}</div>
      )}
      
      <div className="hero" style={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', marginBottom: '30px' }}>
        <h1>🛒 Your Cart</h1>
        <p>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items yet.</p>
          <a href="/products" className="hero-btn" style={{ background: '#667eea', color: 'white' }}>
            Start Shopping 🛍️
          </a>
        </div>
      ) : (
        <>
          <div className="cart-items">
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
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      −
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="cart-item-remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <span>Total</span>
              <span>${total}</span>
            </div>
            <button className="add-to-cart-btn" style={{ marginTop: '20px', background: '#27ae60' }}>
              Proceed to Checkout 💳
            </button>
            <button
              onClick={clearCart}
              className="clear-cart-btn"
            >
              Clear Cart 🧹
            </button>
          </div>
        </>
      )}
    </div>
  );
}