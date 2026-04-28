const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
require('dotenv').config()

const authRoutes     = require('./routes/auth')
const membresRoutes  = require('./routes/membres')
const stocksRoutes   = require('./routes/stocks')
const recoltesRoutes = require('./routes/recoltes')
const financesRoutes = require('./routes/finances')
const { protect, adminOnly, adminOrGest } = require('./middleware/auth')
const pool = require('./config/db')

const app = express()

// ── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5173',
    ]
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))

app.use(express.json())
app.use(morgan('dev'))

// ── HEALTH ──────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '🌾 AgriCoop API opérationnelle.' }))
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }))

// ── ROUTES ──────────────────────────────────────────────────
app.use('/api/auth',         authRoutes)
app.use('/api/membres',      membresRoutes)
app.use('/api',              stocksRoutes)
app.use('/api/recoltes',     recoltesRoutes)
app.use('/api/transactions', financesRoutes)

// ── DASHBOARD ───────────────────────────────────────────────
const financesCtrl = require('./controllers/financesController')
app.get('/api/dashboard/stats', protect, financesCtrl.getDashboardStats)

// ── COTISATIONS ─────────────────────────────────────────────
app.get('/api/cotisations', protect, adminOrGest, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, CONCAT(m.prenom,' ',m.nom) AS membre_nom
      FROM cotisations c
      JOIN membres m ON c.membre_id = m.id
      ORDER BY c.annee DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
})

app.post('/api/cotisations', protect, adminOnly, async (req, res) => {
  try {
    const { membre_id, annee, montant, date_paiement, statut_paiement } = req.body
    const [result] = await pool.query(
      'INSERT INTO cotisations (membre_id, annee, montant, date_paiement, statut_paiement) VALUES (?, ?, ?, ?, ?)',
      [membre_id, annee, montant, date_paiement, statut_paiement || 'en_attente']
    )
    res.status(201).json({ message: 'Cotisation enregistrée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
})

// ── UTILISATEURS ────────────────────────────────────────────
app.get('/api/utilisateurs', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nom, prenom, email, role, actif, created_at FROM utilisateurs ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// PATCH rôle
app.patch('/api/utilisateurs/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body
    if (!['admin','gestionnaire','membre'].includes(role))
      return res.status(400).json({ message: 'Rôle invalide.' })
    await pool.query('UPDATE utilisateurs SET role = ? WHERE id = ?', [role, req.params.id])
    res.json({ message: 'Rôle mis à jour.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ✅ PATCH actif/suspendu — NOUVEAU
app.patch('/api/utilisateurs/:id/actif', protect, adminOnly, async (req, res) => {
  try {
    const { actif } = req.body
    await pool.query('UPDATE utilisateurs SET actif = ? WHERE id = ?', [actif ? 1 : 0, req.params.id])
    res.json({ message: actif ? 'Compte activé.' : 'Compte désactivé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── FOURNISSEURS ────────────────────────────────────────────
app.get('/api/fournisseurs', protect, adminOrGest, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT fournisseur FROM mouvements_stock WHERE fournisseur IS NOT NULL ORDER BY fournisseur'
    )
    res.json(rows.map(r => ({ nom_fournisseur: r.fournisseur })))
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── SAISONS ──────────────────────────────────────────────────
const recoltesCtrl = require('./controllers/recoltesController')
app.get('/api/saisons',        protect, adminOrGest, recoltesCtrl.getSaisons)
app.get('/api/saisons/active', protect, adminOrGest, recoltesCtrl.getSaisonActive)

// ── 404 ─────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} introuvable.` })
})

// ── ERREURS GLOBALES ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌', err.message)
  res.status(err.status || 500).json({ message: err.message || 'Erreur interne.' })
})

// ── DÉMARRAGE ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🌾 AgriCoop API — port ${PORT} — ${process.env.NODE_ENV || 'development'}\n`)
})

module.exports = app
