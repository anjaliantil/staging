// Cart service for the cart module

export const cartService = {
  getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  },
  
  addToCart(product) {
    const cart = this.getCart();
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },
  
  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },
  
  clearCart() {
    localStorage.removeItem('cart');
    return [];
  },
  
  getTotal() {
    return this.getCart().reduce((sum, item) => sum + item.price, 0);
  }
};

export default cartService;