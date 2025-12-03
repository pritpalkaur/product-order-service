const express = require('express');
const jwt = require('jsonwebtoken');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'mysecretkey'; // 🔒 use env variable in production

app.use(express.json());

/* ------------------- JWT AUTH ------------------- */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login to get JWT token
 *     description: Provide a username to receive a JWT token. Use the token with the Authorize button.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: pritpal
 *     responses:
 *       200:
 *         description: JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 */
// Login endpoint
app.post('/login', (req, res) => {
  const { username } = req.body;
  const user = { name: username };
  const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

/* ------------------- SWAGGER SETUP ------------------- */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product & Order Microservice',
      version: '1.0.0',
      description: 'API for managing products and orders with JWT auth',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./index.js', './routes/*.js'], // 👈 include index.js too

};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/* ------------------- ROUTES ------------------- */
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);

/* ------------------- HEALTH CHECK ------------------- */
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

/* ------------------- START SERVER ------------------- */
app.listen(PORT, () => {
  console.log(`Product-Order microservice running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});