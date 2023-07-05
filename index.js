const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const exphbs = require('express-handlebars');
const fs = require('fs');

const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);

app.get('/', (req, res) => {
  const products = getProducts();
  res.render('index', { products });
});

app.get('/realtimeproducts', (req, res) => {
  const products = getProducts();
  res.render('realTimeProducts', { products });
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('addProduct', (product) => {
    addProduct(product);
  });

  socket.on('deleteProduct', (productId) => {
    deleteProduct(productId);
  });
});

const PORT = 8080;
http.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

function getProducts() {
  const products = fs.readFileSync('./productos.json');
  return JSON.parse(products);
}

function addProduct(product) {
  const products = getProducts();
  products.push(product);
  fs.writeFileSync('./productos.json', JSON.stringify(products));
  io.emit('updateProducts', products);
}

function deleteProduct(productId) {
  const products = getProducts();
  const updatedProducts = products.filter((product) => product.id !== productId);
  fs.writeFileSync('./productos.json', JSON.stringify(updatedProducts));
  io.emit('updateProducts', updatedProducts);
}
