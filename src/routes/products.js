const express = require('express');
const router = express.Router();
const ProductManager = require('../dao/managers/MDB/ProductManager');
const { productModel } = require('../dao/models/products.model'); // Importa el modelo de productos

// Crear una instancia del nuevo ProductManager
const productManager = new ProductManager(productModel); // Pasa el modelo de productos como parámetro

// Ruta raíz GET para listar todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});


// Ruta GET /:pid para obtener un producto por su ID
router.get('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// Ruta raíz POST para agregar un nuevo producto
router.post('/', async (req, res) => {
  try {
    const productData = req.body;

    // Crear un nuevo documento de producto en la base de datos
    const newProduct = await productModel.create(productData);

    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});



// Ruta PUT /:pid para actualizar un producto por su ID
router.put('/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedFields = req.body;

    // Actualizar el producto en la base de datos por ID
    const updatedProduct = await productModel.findByIdAndUpdate(productId, updatedFields, { new: true });

    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});


// Ruta DELETE /:pid para eliminar un producto por su ID
router.delete('/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);

    // Eliminar el producto por su ID
    const deletedProduct = await productModel.findByIdAndDelete(productId);

    if (deletedProduct) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});
module.exports = router;
