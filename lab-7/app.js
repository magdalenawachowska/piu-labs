import './shop-item.js';
import './shopping-cart.js';
import './product-list.js';

import productsData from './data.json' with {  type: 'json'};

window.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('product-list');
  const cart = document.querySelector('shopping-cart');

  list.products = productsData;

  document.addEventListener('add-to-cart', (e) => {
    cart.addItem(e.detail);
  });
});