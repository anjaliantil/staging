// Products service for the products module

export const productsService = {
  getAllProducts() {
    return [
      { id: 1, name: 'Laptop', price: 999, image: '💻' },
      { id: 2, name: 'Phone', price: 699, image: '📱' },
      { id: 3, name: 'Headphones', price: 199, image: '🎧' },
      { id: 4, name: 'Watch', price: 299, image: '⌚' },
      { id: 5, name: 'Tablet', price: 449, image: '📱' },
      { id: 6, name: 'Camera', price: 799, image: '📷' }
    ];
  },
  
  getProductById(id) {
    return this.getAllProducts().find(p => p.id === id);
  }
};

export default productsService;