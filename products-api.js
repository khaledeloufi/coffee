const express = require('express');
const crypto  = require('crypto');
const path    = require('path');
const fs      = require('fs');
const router  = express.Router();

/* ──────────────────────────────────────────────
   PRODUCTS DATABASE  –  JSON file (lightweight)
   ────────────────────────────────────────────── */
const DB_PATH = path.join(__dirname, 'data', 'products.json');

function loadProducts() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(DB_PATH, '[]', 'utf-8');
    return [];
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveProducts(products) {
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

/* ──────────────────────────────────────────────
   ADMIN AUTH  –  hardcoded secret token
   ────────────────────────────────────────────── */
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'K&O';

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized — admin only' });
  }
  next();
}

/* ──────────────────────────────────────────────
   VALIDATION HELPER
   ────────────────────────────────────────────── */
function sanitizeIngredients(value) {
  if (Array.isArray(value)) {
    return value.map(i => String(i).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/[\n,،]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function validateProduct(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2)
    errors.push('name is required (min 2 chars)');

  if (body.price !== undefined && body.price !== null && body.price !== '' &&
      (isNaN(Number(body.price)) || Number(body.price) <= 0))
    errors.push('price must be a positive number');

  if (body.category && !['espresso', 'brewed', 'specialty', 'cold', 'dessert'].includes(body.category))
    errors.push('category must be: espresso | brewed | specialty | cold | dessert');

  return errors;
}

/* ──────────────────────────────────────────────
   ROUTES  –  all require admin token
   ────────────────────────────────────────────── */

/* never cache the API so the shop always gets fresh data */
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// GET /api/products/verify  –  admin token check
router.get('/verify', requireAdmin, (req, res) => {
  res.json({ ok: true, message: 'Admin token valid' });
});

// GET /api/products  –  list all (public)
router.get('/', (req, res) => {
  const products = loadProducts();
  const { category, search } = req.query;

  let result = products;

  if (category) {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  }

  res.json({ total: result.length, products: result });
});

// GET /api/products/:id  –  get one (public)
router.get('/:id', (req, res) => {
  const products = loadProducts();
  const product  = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products  –  add new (admin)
router.post('/', requireAdmin, (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const products = loadProducts();

  const newProduct = {
    id:          crypto.randomUUID(),
    name:        req.body.name.trim(),
    description: (req.body.description || '').trim(),
    price:       req.body.price !== undefined && req.body.price !== null && req.body.price !== '' ? Number(req.body.price) : undefined,
    category:    req.body.category || 'espresso',
    image:       (req.body.image || '').trim(),
    ingredients: sanitizeIngredients(req.body.ingredients),
    available:   req.body.available !== false,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  };

  products.push(newProduct);
  saveProducts(products);

  res.status(201).json({ message: 'Product created', product: newProduct });
});

// PUT /api/products/:id  –  update (admin)
router.put('/:id', requireAdmin, (req, res) => {
  const products = loadProducts();
  const index    = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const errors = validateProduct(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const existing = products[index];

  products[index] = {
    ...existing,
    name:        req.body.name?.trim()        || existing.name,
    description: req.body.description?.trim()  || existing.description,
    price:       req.body.price !== undefined && req.body.price !== null && req.body.price !== '' ? Number(req.body.price) : existing.price,
    category:    req.body.category             || existing.category,
    image:       req.body.image?.trim()        || existing.image,
    ingredients: req.body.ingredients !== undefined ? sanitizeIngredients(req.body.ingredients) : existing.ingredients,
    available:   req.body.available !== undefined ? req.body.available : existing.available,
    updatedAt:   new Date().toISOString(),
  };

  saveProducts(products);

  res.json({ message: 'Product updated', product: products[index] });
});

// DELETE /api/products/:id  –  remove (admin)
router.delete('/:id', requireAdmin, (req, res) => {
  let products = loadProducts();
  const found  = products.find(p => p.id === req.params.id);
  if (!found) return res.status(404).json({ error: 'Product not found' });

  products = products.filter(p => p.id !== req.params.id);
  saveProducts(products);

  res.json({ message: 'Product deleted' });
});

module.exports = router;
