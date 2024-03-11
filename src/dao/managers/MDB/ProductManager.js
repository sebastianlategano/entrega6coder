const ioClient = require('socket.io-client');
const { productModel } = require('../../models/products.model');
const mongoose = require('mongoose');

class ProductManager {
  constructor() {
    this.products = [];
    this.nextProductId = 1;

    // Conexión al servidor de Socket.IO
    this.socket = ioClient('http://localhost:8080');

    // Cargar productos desde la base de datos al instanciar la clase
    this.loadProducts();
  }

  handleError(message, error) {
    console.error(message, error);
    return null;
  }

  async addProduct(productData) {
    try {
      const { code } = productData;

      if (!code) {
        return this.handleError("El código del producto es obligatorio");
      }

      const existingProduct = await productModel.findOne({ code: code.toLowerCase() });

      if (existingProduct) {
        return this.handleError("Ya existe un producto con el mismo código:", existingProduct);
      }

      const product = await productModel.create({ ...productData, code: code.toLowerCase() });

      // Emitir evento de nuevo producto al servidor
      this.socket.emit('newProduct', product.toObject(), (acknowledgment) => {
        // Manejar la respuesta del servidor si es necesario
      });

      console.log("Producto agregado correctamente:", product);

      return product.toObject();
    } catch (error) {
      return this.handleError("Error al agregar el producto:", error);
    }
  }

  async deleteProduct(id) {
    try {
        // Verificar si el ID del producto está definido y es válido
        if (!id || !mongoose.isValidObjectId(id)) {
            console.error("ID del producto indefinido o no válido");
            return { success: false, message: 'ID del producto indefinido o no válido' };
        }

        // Agregar log para verificar el valor del ID
        console.log("ID del producto:", id);

        try {
            // Crear una instancia de ObjectId si el ID es válido
            const { ObjectId } = mongoose.Types;
            const productId = ObjectId.isValid(id) ? new ObjectId(id) : null;

            if (!productId) {
                console.error("ID del producto no válido");
                return { success: false, message: 'ID del producto no válido' };
            }

            const product = await productModel.findOneAndDelete({ _id: productId });

            if (product) {
                // Emitir evento de eliminación de producto al servidor
                this.socket.emit('deleteProduct', { success: true, deletedProductId: productId });

                console.log("Producto eliminado:", product);

                return { success: true, deletedProduct: product.toObject() };
            } else {
                console.error("Producto no encontrado");
                return { success: false, message: 'No se encontró el producto con el ID proporcionado.' };
            }
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            return { success: false, message: 'Error al eliminar el producto.' };
        }
    } catch (error) {
        return this.handleError("Error al eliminar el producto:", error);
    }
}


  async getProducts() {
    return await productModel.find();
  }

  async loadProducts() {
    try {
      this.products = await productModel.find();
      this.nextProductId = Math.max(...this.products.map((product) => product._id), 0) + 1;
    } catch (error) {
      this.handleError("Error al cargar los productos desde la base de datos:", error.message);
    }
  }

  async productExists(code) {
    const existingProduct = await productModel.findOne({ code });
    return existingProduct !== null;
  }
}

module.exports = ProductManager;
