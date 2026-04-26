const pool = require('../config/db')

// ── GET /api/transactions ───────────────────────────────────────
const getTransactions = async (req, res) => {
  try {
    const { type_transaction, categorie, id_membre, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    let where = ['1=1']
    const params = []
    if (type_transaction) { where.push('t.type_transaction = ?'); params.push(type_transaction) }
    if (categorie)        { where.push('t.categorie = ?');        params.push(categorie) }
    if (id_membre)        { where.push('t.id_membre = ?');        params.push(id_membre) }

    const [rows] = await pool.query(`
      SELECT t.*,
        CONCAT(u.prenom, ' ', u.nom) AS saisie_par,
        CONCAT(um.prenom, ' ', um.nom) AS membre_nom
      FROM transactions t
      JOIN utilisateurs u ON t.id_utilisateur = u.id
      LEFT JOIN membres m ON t.id_membre = m.id_membre
      LEFT JOIN utilisateurs um ON m.id_utilisateur = um.id
      WHERE ${where.join(' AND ')}
      ORDER BY t.date_transaction DESC
      LIMIT ? OFFSET ?
    `, [...params, +limit, +offset])

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM transactions t WHERE ${where.join(' AND ')}`,
      params
    )

    res.json({ transactions: rows, total, page: +page })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── POST /api/transactions ──────────────────────────────────────
const createTransaction = async (req, res) => {
  try {
    const { id_membre, type_transaction, categorie, montant, date_transaction, description } = req.body
    if (!type_transaction || !categorie || !montant)
      return res.status(400).json({ message: 'Type, catégorie et montant requis.' })

    const [result] = await pool.query(
      'INSERT INTO transactions (id_utilisateur, id_membre, type_transaction, categorie, montant, date_transaction, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, id_membre || null, type_transaction, categorie, montant, date_transaction || new Date(), description]
    )
    res.status(201).json({ message: 'Transaction enregistrée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── GET /api/transactions/bilan ─────────────────────────────────
const getBilan = async (req, res) => {
  try {
    const { mois, annee } = req.query
    const m = mois  || new Date().getMonth() + 1
    const a = annee || new Date().getFullYear()

    const [[bilan]] = await pool.query(`
      SELECT
        SUM(CASE WHEN type_transaction = 'recette' THEN montant ELSE 0 END) AS total_recettes,
        SUM(CASE WHEN type_transaction = 'dépense' THEN montant ELSE 0 END) AS total_depenses,
        SUM(CASE WHEN type_transaction = 'recette' THEN montant ELSE -montant END) AS solde_net,
        COUNT(*) AS nb_transactions
      FROM transactions
      WHERE MONTH(date_transaction) = ? AND YEAR(date_transaction) = ?
    `, [m, a])

    res.json({ mois: m, annee: a, ...bilan })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// ── POST /api/transactions/:id/recu ────────────────────────────
const genererRecu = async (req, res) => {
  try {
    const { id } = req.params
    const [existing] = await pool.query('SELECT * FROM recus WHERE id_transaction = ?', [id])
    if (existing.length > 0) return res.json({ message: 'Reçu déjà généré.', recu: existing[0] })

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM recus')
    const numero_recu = `REC-${String(total + 1).padStart(5, '0')}`

    const [result] = await pool.query(
      'INSERT INTO recus (id_transaction, numero_recu) VALUES (?, ?)',
      [id, numero_recu]
    )
    res.status(201).json({ message: 'Reçu généré.', numero_recu, id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// ── GET /api/dashboard/stats ────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [[membres]]  = await pool.query("SELECT COUNT(*) AS total FROM membres WHERE statut_membre = 'actif'")
    const [[produits]] = await pool.query('SELECT COUNT(*) AS total FROM produits')
    const [[alertes]]  = await pool.query('SELECT COUNT(*) AS total FROM produits WHERE quantite_stock <= seuil_alerte')
    const [[recoltes]] = await pool.query('SELECT SUM(quantite_kg) AS total_kg FROM recoltes')
    const [[finances]] = await pool.query(`
      SELECT
        SUM(CASE WHEN type_transaction='recette' THEN montant ELSE 0 END) -
        SUM(CASE WHEN type_transaction='dépense' THEN montant ELSE 0 END) AS solde
      FROM transactions
    `)
    const [alertesList] = await pool.query(
      'SELECT * FROM produits WHERE quantite_stock <= seuil_alerte ORDER BY quantite_stock ASC LIMIT 5'
    )

    res.json({
      membresActifs:   membres.total,
      produitsStock:   produits.total,
      alertesStock:    alertes.total,
      recoltesTotalKg: recoltes.total_kg || 0,
      soldeFinancier:  finances.solde    || 0,
      alertesList,
    })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

module.exports = { getTransactions, createTransaction, getBilan, genererRecu, getDashboardStats }
