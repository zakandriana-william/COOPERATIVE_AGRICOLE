const pool = require('../config/db')

const getTransactions = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    let where = ['1=1']
    const params = []
    if (type)   { where.push('f.type = ?');           params.push(type) }
    if (search) { where.push('f.description LIKE ?'); params.push(`%${search}%`) }

    const [rows] = await pool.query(`
      SELECT f.*, CONCAT(m.prenom, ' ', m.nom) AS membre_nom
      FROM finances f
      LEFT JOIN membres m ON f.membre_id = m.id
      WHERE ${where.join(' AND ')}
      ORDER BY f.date DESC, f.id DESC
      LIMIT ? OFFSET ?
    `, [...params, +limit, +offset])

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM finances f WHERE ${where.join(' AND ')}`, params
    )
    res.json({ transactions: rows, total })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const createTransaction = async (req, res) => {
  try {
    const { type, categorie, montant, date, description, membre_id } = req.body
    if (!type || !montant || !date)
      return res.status(400).json({ message: 'Type, montant et date requis.' })

    const [result] = await pool.query(
      'INSERT INTO finances (type, categorie, montant, date, description, membre_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [type, categorie, montant, date, description || null, membre_id || null, req.user.id]
    )
    res.status(201).json({ message: 'Transaction enregistrée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const getBilan = async (req, res) => {
  try {
    const [[bilan]] = await pool.query(`
      SELECT
        SUM(CASE WHEN type='recette' THEN montant ELSE 0 END) AS total_recettes,
        SUM(CASE WHEN type='depense' THEN montant ELSE 0 END) AS total_depenses,
        SUM(CASE WHEN type='recette' THEN montant ELSE -montant END) AS solde
      FROM finances
      WHERE YEAR(date) = YEAR(NOW())
    `)
    res.json(bilan)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const genererRecu = async (req, res) => {
  res.json({ message: `Reçu #R-${req.params.id} généré.`, numero: `R-${String(req.params.id).padStart(4,'0')}` })
}

const getDashboardStats = async (req, res) => {
  try {
    const [[membres]]     = await pool.query("SELECT COUNT(*) AS total FROM membres WHERE statut='actif'")
    const [[stocks]]      = await pool.query('SELECT COUNT(*) AS total FROM stocks')
    const [[alertes]]     = await pool.query('SELECT COUNT(*) AS total FROM stocks WHERE quantite <= seuil_alerte')
    const [[recoltes]]    = await pool.query('SELECT COALESCE(SUM(quantite_kg),0) AS total FROM recoltes WHERE YEAR(date_recolte)=YEAR(NOW())')
    const [[finances]]    = await pool.query("SELECT COALESCE(SUM(CASE WHEN type='recette' THEN montant ELSE -montant END),0) AS solde FROM finances WHERE YEAR(date)=YEAR(NOW())")
    const [[cotisEnRetard]] = await pool.query("SELECT COUNT(*) AS total FROM cotisations WHERE statut_paiement='en_retard' AND annee=YEAR(NOW())")

    res.json({
      membresActifs:       membres.total,
      produitsStock:       stocks.total,
      alertesStock:        alertes.total,
      recoltesTotal:       Math.round(recoltes.total / 1000),
      soldeFinancier:      finances.solde,
      cotisationsEnRetard: cotisEnRetard.total
    })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

module.exports = { getTransactions, createTransaction, getBilan, genererRecu, getDashboardStats }
