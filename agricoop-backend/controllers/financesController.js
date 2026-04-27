const pool = require('../config/db')

const getTransactions = async (req, res) => {
  try {
    const { type, categorie, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    let where = ['1=1']
    const params = []
    if (type)      { where.push('f.type = ?');      params.push(type) }
    if (categorie) { where.push('f.categorie = ?'); params.push(categorie) }

    const [rows] = await pool.query(`
      SELECT f.*
      FROM finances f
      WHERE ${where.join(' AND ')}
      ORDER BY f.date DESC
      LIMIT ? OFFSET ?
    `, [...params, +limit, +offset])

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM finances f WHERE ${where.join(' AND ')}`, params
    )
    res.json({ transactions: rows, total, page: +page })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const createTransaction = async (req, res) => {
  try {
    const { type, categorie, montant, date, description, membre_id } = req.body
    if (!type || !categorie || !montant)
      return res.status(400).json({ message: 'Type, catégorie et montant requis.' })
    const [result] = await pool.query(
      'INSERT INTO finances (type, categorie, montant, date, description, membre_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [type, categorie, montant, date || new Date(), description, membre_id || null, req.user.id]
    )
    res.status(201).json({ message: 'Transaction enregistrée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const getBilan = async (req, res) => {
  try {
    const { mois, annee } = req.query
    const m = mois  || new Date().getMonth() + 1
    const a = annee || new Date().getFullYear()
    const [[bilan]] = await pool.query(`
      SELECT
        SUM(CASE WHEN type = 'recette' THEN montant ELSE 0 END) AS total_recettes,
        SUM(CASE WHEN type = 'depense' THEN montant ELSE 0 END) AS total_depenses,
        SUM(CASE WHEN type = 'recette' THEN montant ELSE -montant END) AS solde_net,
        COUNT(*) AS nb_transactions
      FROM finances
      WHERE MONTH(date) = ? AND YEAR(date) = ?
    `, [m, a])
    res.json({ mois: m, annee: a, ...bilan })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const genererRecu = async (req, res) => {
  res.json({ message: 'Fonctionnalité reçu bientôt disponible.' })
}

const getDashboardStats = async (req, res) => {
  try {
    const [[membres]]  = await pool.query("SELECT COUNT(*) AS total FROM membres WHERE statut = 'actif'")
    const [[produits]] = await pool.query('SELECT COUNT(*) AS total FROM stocks')
    const [[alertes]]  = await pool.query('SELECT COUNT(*) AS total FROM stocks WHERE quantite <= seuil_alerte')
    const [[recoltes]] = await pool.query('SELECT SUM(quantite_kg) AS total_kg FROM recoltes')
    const [[finances]] = await pool.query(`
      SELECT SUM(CASE WHEN type='recette' THEN montant ELSE 0 END) -
             SUM(CASE WHEN type='depense' THEN montant ELSE 0 END) AS solde
      FROM finances
    `)
    const [alertesList] = await pool.query(
      'SELECT * FROM stocks WHERE quantite <= seuil_alerte ORDER BY quantite ASC LIMIT 5'
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
