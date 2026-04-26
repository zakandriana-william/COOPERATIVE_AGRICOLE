const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
require('dotenv').config()

const authRoutes     = require('./routes/auth')
const membresRoutes  = require('./routes/membres')
const stocksRoutes   = require('./routes/stocks')
const recoltesRoutes = require('./routes/recoltes')
const financesRoutes = require('./routes/finances')
const { protect, adminOrGest, adminOnly } = require('./middleware/auth')
const pool = require('./config/db')

const app = express()

// ── MIDDLEWARES ──────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('vercel.app')) {
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

// ── ROUTES PUBLIQUES ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🌾 AgriCoop API est opérationnelle.' })
})
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🌾 AgriCoop API opérationnelle',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// ── AUTH ─────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)

// ── MEMBRES ──────────────────────────────────────────────────────
app.use('/api/membres', membresRoutes)

// ── STOCKS (produits + mouvements) ───────────────────────────────
app.use('/api', stocksRoutes)

// ── RÉCOLTES ─────────────────────────────────────────────────────
app.use('/api/recoltes', recoltesRoutes)

// ── FINANCES ─────────────────────────────────────────────────────
app.use('/api/transactions', financesRoutes)

// ── DASHBOARD ────────────────────────────────────────────────────
const financesController = require('./controllers/financesController')
app.get('/api/dashboard/stats', protect, financesController.getDashboardStats)

// ── COTISATIONS ──────────────────────────────────────────────────
app.get('/api/cotisations', protect, adminOrGest, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, CONCAT(u.prenom,' ',u.nom) AS membre_nom
      FROM cotisations c
      JOIN membres m ON c.id_membre = m.id_membre
      JOIN utilisateurs u ON m.id_utilisateur = u.id
      ORDER BY c.annee DESC, c.statut_paiement
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
})

app.post('/api/cotisations', protect, adminOnly, async (req, res) => {
  try {
    const { id_membre, annee, montant, date_paiement, statut_paiement } = req.body
    const [result] = await pool.query(
      'INSERT INTO cotisations (id_membre, annee, montant, date_paiement, statut_paiement) VALUES (?, ?, ?, ?, ?)',
      [id_membre, annee, montant, date_paiement, statut_paiement]
    )
    res.status(201).json({ message: 'Cotisation enregistrée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
})

// ── UTILISATEURS ─────────────────────────────────────────────────
app.get('/api/utilisateurs', protect, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nom, prenom, email, role, actif AS statut, date_inscription
      FROM utilisateurs
      ORDER BY date_inscription DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
})

app.patch('/api/utilisateurs/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body
    await pool.query(
      'UPDATE utilisateurs SET role = ? WHERE id = ?',
      [role, req.params.id]
    )
    res.json({ message: 'Rôle mis à jour.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
})

// ── FOURNISSEURS ─────────────────────────────────────────────────
app.get('/api/fournisseurs', protect, adminOrGest, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fournisseurs ORDER BY nom_fournisseur')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
})

app.post('/api/fournisseurs', protect, adminOrGest, async (req, res) => {
  try {
    const { nom_fournisseur, contact, telephone, adresse } = req.body
    const [r] = await pool.query(
      'INSERT INTO fournisseurs (nom_fournisseur, contact, telephone, adresse) VALUES (?, ?, ?, ?)',
      [nom_fournisseur, contact, telephone, adresse]
    )
    res.status(201).json({ message: 'Fournisseur créé.', id: r.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
})

// ── 404 ──────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} introuvable.` })
})

// ── ERREURS GLOBALES ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.message)
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur.'
  })
})

// ── DÉMARRAGE ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('')
  console.log('🌾 ═══════════════════════════════════════')
  console.log(`   AgriCoop API démarrée sur le port ${PORT}`)
  console.log(`   Environnement : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Santé : https://cooperative-agricole.onrender.com/api/health`)
  console.log('🌾 ═══════════════════════════════════════')
  console.log('')
})

module.exports = app
