
// <!-- ProductManager.js -->
const fs = require('fs').promises;
const ioClient = require('socket.io-client');

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.nextProductId = 1;

    // Conexión al servidor de Socket.IO
    this.socket = ioClient('http://localhost:8080');

    // Cargar productos desde el archivo al instanciar la clase
    this.loadProducts();
  }

  async addProduct(productData) {
    const { title, description, price, thumbnail, code, stock } = productData;

    if (!title || !description || !price || !thumbnail || !code || stock === undefined) {
      console.error("Todos los campos son obligatorios");
      return null;
    }

    if (this.products.some((product) => product.code === code)) {
      console.error("Ya existe un producto con el mismo código");
      return null;
    }

    const product = {
      id: this.nextProductId++,
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };

    this.products.push(product);
    await this.saveProducts();

    // Emitir evento de nuevo producto al servidor
    this.socket.emit('newProduct', product);

    return product;
  }

  async deleteProduct(id) {
    console.log("Intentando eliminar producto con ID:", id);

    // Convertir el ID a un número
    const productId = parseInt(id, 10);

    const index = this.products.findIndex((product) => product.id === productId);

    if (index !== -1) {
      const deletedProduct = this.products.splice(index, 1)[0];
      await this.saveProducts();

      // Emitir evento de eliminación de producto al servidor
      this.socket.emit('deleteProduct', { success: true, deletedProductId: productId });

      console.log("Producto eliminado:", deletedProduct);

      return deletedProduct;
    } else {
      console.error("Producto no encontrado");
      return null;
    }
  }
  
  async getProducts() {
    return this.products;
  }

  async loadProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf8');
      this.products = JSON.parse(data);
      this.nextProductId = Math.max(...this.products.map((product) => product.id), 0) + 1;
    } catch (error) {
      console.warn("No se pudo cargar el archivo de productos:", error.message);
    }
  }

  async saveProducts() {
    try {
      const data = JSON.stringify(this.products, null, 2);
      await fs.writeFile(this.path, data, 'utf8');
    } catch (error) {
      console.error("Error al guardar el archivo de productos:", error.message);
    }
  }
}

module.exports = ProductManager;
