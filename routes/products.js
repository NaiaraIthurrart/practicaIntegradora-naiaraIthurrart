const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const router = express.Router();
const productsFilePath = './productos.json';

class ProductManager {
  constructor(path) {
    this.path = path;
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify([]));
    }
  }

  getProducts() {
    const products = fs.readFileSync(this.path);
    return JSON.parse(products);
  }

  getProductById(id) {
    const products = this.getProducts();
    const product = products.find((p) => p.id === id);
    if (product) {
      return product;
    } else {
      console.log('Error: Producto no encontrado');
      return null;
    }
  }

  addProduct(product) {
    const products = this.getProducts();
    product.id = uuidv4();
    products.push(product);
    fs.writeFileSync(this.path, JSON.stringify(products));
    return product;
  }
}

module.exports = { router, ProductManager };
