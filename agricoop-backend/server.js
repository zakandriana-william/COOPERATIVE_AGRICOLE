// ============================================================
//  AgriCoop – Backend API  |  Node.js + Express + MySQL + JWT
// ============================================================

const express  = require('express')
const cors     = require('cors')
const morgan   = require('morgan')
require('dotenv').config()

// Import des routes
const authRoutes     = require('./routes/auth')
const membresRoutes  = require('./routes/membres')
const stocksRoutes   = require('./routes/stocks')
const { getDashboardStats } = require('./controllers/financesController')
const { protect } = require('./middleware/auth')

const app = express()

// ── MIDDLEWARES GLOBAUX ──────────────────────────────────────────
app.use(cors({
  origin:   process.env.CLIENT_URL,
  credentials: true,
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))
app.use(express.json())
app.use(morgan('dev'))    // Logs des requêtes HTTP en développement

// ── ROUTES API ───────────────────────────────────────────────────
app.use('/api/auth',         authRoutes)
app.use('/api/membres',      membresRoutes)
app.use('/api',              stocksRoutes)   // /api/produits, /api/mouvements

// Routes récoltes (séparées du fichier stocks.js)
const recoltesController = require('./controllers/recoltesController')
const financesController = require('./controllers/financesController')
const { protect: _p, adminOrGest, adminOnly } = require('./middleware/auth')

// Saisons
app.get   ('/api/saisons',         _p, adminOrGest, recoltesController.getSaisons)
app.get   ('/api/saisons/active',  _p, adminOrGest, recoltesController.getSaisonActive)
app.post  ('/api/saisons',         _p, adminOrGest, recoltesController.createSaison)

// Récoltes
app.get   ('/api/recoltes/comparaison', _p, adminOrGest, recoltesController.getComparaison)
app.get   ('/api/recoltes',        _p, adminOrGest, recoltesController.getRecoltes)
app.post  ('/api/recoltes',        _p, adminOrGest, recoltesController.createRecolte)
app.put   ('/api/recoltes/:id',    _p, adminOrGest, recoltesController.updateRecolte)
app.delete('/api/recoltes/:id',    _p, adminOnly,   recoltesController.deleteRecolte)

// Finances
app.get ('/api/transactions/bilan', _p, adminOnly, financesController.getBilan)
app.get ('/api/transactions',       _p, adminOnly, financesController.getTransactions)
app.post('/api/transactions',       _p, adminOnly, financesController.createTransaction)
app.post('/api/transactions/:id/recu', _p, adminOnly, financesController.genererRecu)

// Dashboard
app.get('/api/dashboard/stats', _p, getDashboardStats)

// Cotisations (CRUD simple)
const pool = require('./config/db')
app.get('/api/cotisations', _p, adminOrGest, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT c.*, CONCAT(u.prenom,' ',u.nom) AS membre_nom
    FROM cotisations c
    JOIN membres m ON c.id_membre = m.id_membre
    JOIN utilisateurs u ON m.id_utilisateur = u.id_utilisateur
    ORDER BY c.annee DESC, c.statut_paiement
  `)
  res.json(rows)
})
app.post('/api/cotisations', _p, adminOnly, async (req, res) => {
  const { id_membre, annee, montant, date_paiement, statut_paiement } = req.body
  const [result] = await pool.query(
    'INSERT INTO cotisations (id_membre, annee, montant, date_paiement, statut_paiement) VALUES (?, ?, ?, ?, ?)',
    [id_membre, annee, montant, date_paiement, statut_paiement]
  )
  res.status(201).json({ message: 'Cotisation enregistrée.', id: result.insertId })
})

// Utilisateurs
app.get('/api/utilisateurs', _p, adminOnly, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.statut, u.date_inscription, r.libelle AS role
    FROM utilisateurs u JOIN roles r ON u.id_role = r.id_role
    ORDER BY u.date_inscription DESC
  `)
  res.json(rows)
})
app.patch('/api/utilisateurs/:id/role', _p, adminOnly, async (req, res) => {
  const { id_role } = req.body
  await pool.query('UPDATE utilisateurs SET id_role = ? WHERE id_utilisateur = ?', [id_role, req.params.id])
  res.json({ message: 'Rôle mis à jour.' })
})

app.get('/api/roles', _p, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM roles')
  res.json(rows)
})

// Fournisseurs
app.get('/api/fournisseurs', _p, adminOrGest, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM fournisseurs ORDER BY nom_fournisseur')
  res.json(rows)
})
app.post('/api/fournisseurs', _p, adminOrGest, async (req, res) => {
  const { nom_fournisseur, contact, telephone, adresse } = req.body
  const [r] = await pool.query(
    'INSERT INTO fournisseurs (nom_fournisseur, contact, telephone, adresse) VALUES (?, ?, ?, ?)',
    [nom_fournisseur, contact, telephone, adresse]
  )
  res.status(201).json({ message: 'Fournisseur créé.', id: r.insertId })
})

// ── ROUTE DE SANTÉ ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🌾 AgriCoop API opérationnelle',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ── GESTION DES ROUTES INCONNUES ────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} introuvable.` })
})

// ── GESTION DES ERREURS GLOBALES ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.message)
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ── DÉMARRAGE DU SERVEUR ─────────────────────────────────────────
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log('')
  console.log('🌾 ═══════════════════════════════════════')
  console.log(`   AgriCoop API démarrée sur le port ${PORT}`)
  console.log(`   Environnement : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Santé : http://localhost:${PORT}/api/health`)
  console.log('🌾 ═══════════════════════════════════════')
  console.log('')
})

module.exports = app
