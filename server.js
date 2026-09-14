const express    = require('express');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const cors       = require('cors');
const hpp        = require('hpp');
const morgan     = require('morgan');
const compression = require('compression');
const path       = require('path');
const fs         = require('fs');
const os         = require('os');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ──────────────────────────────────────────────
   1. SECURITY HEADERS  (Helmet)
   ────────────────────────────────────────────── */
app.use(
  helmet({
    /* allow pages opened locally (file://) or from the site origin to reach the API */
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/* customise CSP so our own assets load fine */
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", "data:", "blob:"],
      fontSrc:     ["'self'"],
      connectSrc:  ["'self'"],
      frameSrc:    ["'self'"],
      objectSrc:   ["'none'"],
      baseUri:     ["'self'"],
      formAction:  ["'self'"],
      upgradeInsecureRequests: [],
    },
  })
);

/* ──────────────────────────────────────────────
   2. CORS  –  only allow your own domain
   ────────────────────────────────────────────── */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  /* أضف رابط الموقع الحقيقي هنا */
  // 'https://yourdomain.com',
];

/* allow Private Network Access preflight (file:// page -> localhost) */
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  next();
});

function isPrivateHost(host) {
  return host === 'localhost' ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}

function isPrivateIP(ip) {
  return typeof ip === 'string' && isPrivateHost(String(ip).replace(/^::ffff:/, '').toLowerCase());
}

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      /* local dev: allow file://, Live Server (any port), localhost */
      if (origin === 'null' || origin === 'file://' || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      try {
        const host = new URL(origin).hostname;
        if (isPrivateHost(host)) return cb(null, true);
      } catch (_) { /* fallthrough */ }
      return cb(new Error('CORS not allowed'), false);
    },
    methods:             ['GET', 'POST', 'OPTIONS'],
    allowedHeaders:      ['Content-Type', 'X-Requested-With'],
    credentials:         true,
    maxAge:              300,
  })
);

/* ──────────────────────────────────────────────
   3. RATE LIMITING  –  global + contact form
   ────────────────────────────────────────────── */
const globalLimiter = rateLimit({
  windowMs:  15 * 60 * 1000,   /* 15 min */
  max:       200,               /* 200 requests per window */
  message:   'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders:  false,
  /* don't block local/LAN clients (phone on same WiFi, dev machine) */
  skip: (req) => {
    if (!req.ip) return false;
    return isPrivateIP(req.ip);
  },
});
app.use(globalLimiter);

const contactLimiter = rateLimit({
  windowMs:  60 * 60 * 1000,   /* 1 hour */
  max:       5,                 /* 5 messages per hour */
  message:   'Too many messages sent. Please wait before sending again.',
  standardHeaders: true,
  legacyHeaders:  false,
});

/* ──────────────────────────────────────────────
   4. BODY PARSERS  –  size limits
   ────────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

/* ──────────────────────────────────────────────
   5. HTTP PARAM POLLUTION  protection
   ────────────────────────────────────────────── */
app.use(hpp());

/* ──────────────────────────────────────────────
   6. XSS SANITISATION  –  strip <script> etc.
   ────────────────────────────────────────────── */
const { body, validationResult } = require('express-validator');

function xssSanitise(req, res, next) {
  const sanitize = (val) => {
    if (typeof val !== 'string') return val;
    return val
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') req.body[key] = sanitize(req.body[key]);
    }
  }
  next();
}
app.use(xssSanitise);

/* ──────────────────────────────────────────────
   7. COMPRESSION  –  gzip responses
   ────────────────────────────────────────────── */
app.use(compression());

/* ──────────────────────────────────────────────
   8. REQUEST LOGGING
   ────────────────────────────────────────────── */
const logDir = path.join(os.tmpdir(), 'maladh-logs'); /* OUTSIDE the site folder so Live Server never sees churn */
fs.mkdirSync(logDir, { recursive: true });
const accessLog = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLog }));

/* ──────────────────────────────────────────────
   9. SERVE STATIC FILES  (the website)
   ────────────────────────────────────────────── */
app.use(express.static(path.join(__dirname), {
  etag:        true,
  lastModified: true,
  setHeaders:  (res, filePath) => {
    /* html + js + css: no-cache so edits always reach the browser */
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  },
}));

/* ──────────────────────────────────────────────
   10. CONTACT FORM  –  validated + limited
   ────────────────────────────────────────────── */
app.post(
  '/api/contact',
  contactLimiter,
  [
    body('name')
      .trim().notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name too long'),
    body('email')
      .trim().notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email')
      .normalizeEmail(),
    body('message')
      .trim().notEmpty().withMessage('Message is required')
      .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 chars'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, message } = req.body;

    /* TODO: integrate your actual email / database here
       e.g. nodemailer, SendGrid, MongoDB, etc. */

    console.log('[CONTACT]', { name, email, message: message.slice(0, 80) });

    res.json({ success: true, message: 'Message received. Thank you!' });
  }
);

/* ──────────────────────────────────────────────
   11. SECURITY INFO ENDPOINT  (health check)
   ────────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    uptime:  process.uptime(),
    secure:  true,
    helmet:  true,
    rateLimit: true,
  });
});

/* ──────────────────────────────────────────────
   12. 404  –  unknown routes
   ────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).send('404 — Page not found');
});

/* ──────────────────────────────────────────────
   13. GLOBAL ERROR HANDLER
   ────────────────────────────────────────────── */
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).send('Internal server error');
});

/* ──────────────────────────────────────────────
   START
   ────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  ☕ Maladh Coffee — secure server running`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → Helmet ✓  |  Rate Limit ✓  |  CORS ✓  |  XSS ✓  |  HPP ✓\n`);
});
