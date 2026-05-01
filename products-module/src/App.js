import React, { useState, useEffect } from 'react';
import './styles.css';

// Sample product data
const products = [
  { id: 1, name: 'MacBook Pro', price: 1299, image: '💻', category: 'Electronics', rating: 4.8 },
  { id: 2, name: 'iPhone 15', price: 999, image: '📱', category: 'Electronics', rating: 4.9 },
  { id: 3, name: 'AirPods Pro', price: 249, image: '🎧', category: 'Audio', rating: 4.7 },
  { id: 4, name: 'Smart Watch', price: 399, image: '⌚', category: 'Wearables', rating: 4.5 },
  { id: 5, name: 'iPad Air', price: 599, image: '📱', category: 'Electronics', rating: 4.8 },
  { id: 6, name: 'DSLR Camera', price: 899, image: '📷', category: 'Photography', rating: 4.6 },
  { id: 7, name: 'Gaming Console', price: 499, image: '🎮', category: 'Gaming', rating: 4.9 },
  { id: 8, name: 'Wireless Speaker', price: 179, image: '🔊', category: 'Audio', rating: 4.4 }
];

export default function ProductsApp() {
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState(null);

  // Sync with cart store
  useEffect(() => {
    const updateQuantities = () => {
      if (window.EventBus && window.EventBus.getCart) {
        const cart = window.EventBus.getCart();
        const qtyMap = {};
        cart.forEach(item => {
          qtyMap[item.id] = (qtyMap[item.id] || 0) + 1;
        });
        setQuantities(qtyMap);
        setError(null);
      } else {
        setError('Cart service is unavailable. Please ensure the host application is running.');
      }
    };

    updateQuantities();

    // Listen for cart updates
    if (window.EventBus && window.EventBus.subscribe) {
      const unsubscribe = window.EventBus.subscribe('cart:updated', updateQuantities);
      return () => unsubscribe();
    } else {
      setError('Cart service is unavailable. Please ensure the host application is running.');
    }
  }, []);

  const addToCart = (product) => {
    if (window.EventBus && window.EventBus.addToCart) {
      window.EventBus.addToCart(product);
    }
  };

  const updateQuantity = (product, delta) => {
    if (!window.EventBus || !window.EventBus.getCart) return;
    
    const cart = window.EventBus.getCart();
    const productIndex = cart.findIndex(item => item.id === product.id);
    
    if (productIndex === -1 && delta > 0) {
      // Product not in cart, add it
      addToCart(product);
    } else if (productIndex !== -1) {
      if (delta > 0) {
        // Add another instance of the product
        addToCart(product);
      } else {
        // Remove one instance (find first occurrence and remove it)
        const indexToRemove = cart.findIndex(item => item.id === product.id);
        if (indexToRemove !== -1 && window.EventBus.removeFromCart) {
          window.EventBus.removeFromCart(indexToRemove);
        }
      }
    }
  };

  return (
    <div className="main-container">
      {error && (
        <div className="service-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <div className="hero" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', marginBottom: '30px' }}>
        <h1>🛍️ Our Products</h1>
        <p>Browse our collection of premium products</p>
      </div>
      
      <div className="products-section">
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">{product.image}</div>
              <div className="product-info">
                <div style={{ fontSize: '12px', color: '#636e72', marginBottom: '5px' }}>
                  {product.category}
                </div>
                <div className="product-name">{product.name}</div>
                <div style={{ color: '#f39c12', fontSize: '14px', marginBottom: '10px' }}>
                  {'⭐'.repeat(Math.floor(product.rating))} ({product.rating})
                </div>
                <div className="product-price">${product.price}</div>
                
                {quantities[product.id] ? (
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(product, -1)}
                    >
                      −
                    </button>
                    <span className="qty-display">{quantities[product.id]}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(product, 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="add-to-cart-btn"
                  >
                    Add to Cart 🛒
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}