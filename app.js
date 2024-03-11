const express = require('express');
const http = require('http');
const helmet = require('helmet');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose');
const { Server: ServerIO } = require('socket.io');
const { productModel } = require('./src/dao/models/products.model');
const ProductManager = require('./src/dao/managers/MDB/ProductManager');
const cors = require('cors');
const Messages = require('./src/dao/models/chat.model');

const app = express();
const server = http.createServer(app);
const io = new ServerIO(server, {
  cors: {
    origin: '*',
  },
});

// Crear instancia del gestor de productos de MongoDB
const productManager = new ProductManager(productModel);


// ----------------------------------------------Conexión a la base de datos----------------------------------------------------
(async () => {
  try {
    await mongoose.connect('mongodb+srv://sebastianlategano:123@cluster0.f4q7fjm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    });
    console.log('Base de datos conectada');
  } catch (error) {
    console.log(error);
  }
})();


//  ------------------------------Middleware para configurar la política de seguridad de contenido ------------------------------
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.socket.io/"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
    },
  })
);


//  ------------------------------------------------------------Middleware-------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


//  -----------------------------------------------------Configuración de Handlebars ------------------------------------------
const hbs = exphbs.create({
  extname: 'handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});
app.engine('handlebars', hbs.engine);
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'handlebars');


//  --------------------------------------------------Rutas principales u otras rutas ------------------------------
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/home', (req, res) => {
  res.render('home', { products: productManager.products });
});

app.get('/realTimeProducts', (req, res) => {
  res.render('realTimeProducts', { products: productManager.products });
});

// Rutas del chat
const chatRouter = require('./src/routes/chat');
app.use('/chat', chatRouter);


//  -----------------------------------------------------Servir archivos estáticos -------------------------------------------------
app.use(express.static(path.join(__dirname, 'src', 'public')));



// ---------------------------------------------------Socket del lado del servidor ----------------------------------------------------
io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  // Lógica para productos
  // Obtener la lista de productos y enviarla al cliente cuando se conecta
  const productList = await productManager.getProducts();
  io.to(socket.id).emit('updateProducts', productList);

  // Manejar evento de nuevo producto
  socket.on('newProduct', async (newProduct) => {
    await productManager.addProduct(newProduct);
    const updatedProductList = await productManager.getProducts();
    io.emit('updateProducts', updatedProductList);
  });

  // Manejar evento de eliminación de producto
  socket.on('deleteProduct', async ({ productId }) => {
    const result = await productManager.deleteProduct(productId);
    if (result.success) {
      const updatedProductList = await productManager.getProducts();
      io.emit('updateProducts', updatedProductList);
    }
    io.to(socket.id).emit('deleteProduct', result);
  });


  //---------------- LOGICA PARA MENSAJES------------------

  // Obtener mensajes existentes y enviarlos al cliente recién conectado
  try {
    const messages = await Messages.find();
    socket.emit('messages', messages);
  } catch (error) {
    console.error('Error al obtener mensajes existentes:', error.message);
  }

  // Manejar nuevo mensaje del chat
  socket.on('chatMessage', async ({ user, message }) => {
    try {
      const newMessage = new Messages({ user, message });
      await newMessage.save();
      io.emit('chat', newMessage);
    } catch (error) {
      console.error('Error al guardar el mensaje en la base de datos:', error.message);
    }
  
  });

});


// Iniciar el servidor
const port = 8080;
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
