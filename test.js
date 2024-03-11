const ProductManager = require('./ProductManager');

async function test() {

const productManager = new ProductManager('productos.json');

const newProduct = await productManager.addProduct({
    title: "Producto 3",
    description: "Este es un producto prueba",
    price: 300,
    thumbnail: "Sin imagen",
    code: "00003",
    stock: 25,
  });
  console.log('Producto agregado:', newProduct);

}

test();
