const { cartModel } = require('../path/to/cart.model'); 

class CartManager {
  async createCart(userId) {
    try {
      const newCart = await cartModel.create({
        userId,
        products: [],
      });
      return newCart;
    } catch (error) {
      console.error("Error al crear el carrito:", error.message);
      return null;
    }
  }

  async getCartByUserId(userId) {
    try {
      const cart = await cartModel.findOne({ userId }).populate('products.productId');
      return cart || null;
    } catch (error) {
      console.error("Error al obtener el carrito:", error.message);
      return null;
    }
  }

  async addProductToCart(userId, productId, quantity) {
    try {
      let cart = await cartModel.findOne({ userId });

      if (!cart) {
        cart = await this.createCart(userId);
      }

      const existingProduct = cart.products.find((product) => product.productId.id === productId);

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error.message);
      return null;
    }
  }
}

module.exports = CartManager;
