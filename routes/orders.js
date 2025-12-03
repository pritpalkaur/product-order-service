const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const ordersFile = path.join(__dirname, '../orders.json');
let orders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));

const productsFile = path.join(__dirname, '../products.json');
let products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (JWT required)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', (req, res) => {
  res.json(orders);
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order (JWT required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id: { type: integer }
 *               productId: { type: integer }
 *               quantity: { type: integer }
 *     responses:
 *       201:
 *         description: Order created
 *       404:
 *         description: Product not found
 */
router.post('/', (req, res) => {
  const { id, productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const order = { id, productId, quantity };
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.status(201).json(order);
});

module.exports = router;