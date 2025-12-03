const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const productsFile = path.join(__dirname, '../products.json');
let products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products (JWT required)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 */

router.get('/', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product (JWT required)
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
 *               name: { type: string }
 *               price: { type: number }
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', (req, res) => {
  const { id, name, price } = req.body;
  const product = { id, name, price };
  products.push(product);
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  res.status(201).json(product);
});

module.exports = router;