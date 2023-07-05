const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const router = express.Router();
const cartsFilePath = './carrito.json';

class CartManager {
  constructor(path) {
    this.path = path;
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify([]));
    }
  }

  getCartById(id) {
    const carts = this.getCarts();
    const cart = carts.find(c => c.id === id);
    if (cart) {
      return cart;
    } else {
      console.log("Error: Carrito no encontrado");
      return null;
    }
  }

  updateCart(id, fieldsToUpdate) {
    const carts = this.getCarts();
    const cartIndex = carts.findIndex(c => c.id === id);
    if (cartIndex === -1) {
      console.log("Error: Carrito no encontrado");
      return;
    }

    const updatedCart = {
      ...carts[cartIndex],
      ...fieldsToUpdate,
      id
    };
    carts[cartIndex] = updatedCart;
    fs.writeFileSync(this.path, JSON.stringify(carts));
  }

  addProductToCart(cartId, productId, quantity) {
    const carts = this.getCarts();
    const cartIndex = carts.findIndex(c => c.id === cartId);
    if (cartIndex === -1) {
      console.log("Error: Carrito no encontrado");
      return;
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(p => p.productId === productId);

    if (productIndex === -1) {
      cart.products.push({ productId, quantity: 1 });
    } else {
      cart.products[productIndex].quantity += quantity;
    }

    fs.writeFileSync(this.path, JSON.stringify(carts));
  }
}

const cartManager = new CartManager(cartsFilePath);

router.post('/', (req, res) => {
  const newCart = cartManager.createCart();
  res.json(newCart);
});

router.get('/:cid', (req, res) => {
  const { cid } = req.params;
  const cart = cartManager.getCartById(cid);
  if (cart) {
    res.json(cart.products);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

router.post('/:cid/product/:pid', (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  cartManager.addProductToCart(cid, pid, quantity);
  res.sendStatus(200);
});

module.exports = router;
