const pool = require('../config/db')

const getMembres = async (req, res) => {
  try {
    const { statut, culture, search, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    let where = ['1=1']
    const params = []

    if (statut)  { where.push('m.statut = ?');  params.push(statut) }
    if (culture) { where.push('m.culture = ?'); params.push(culture) }
    if (search) {
      where.push('(m.nom LIKE ? OR m.prenom LIKE ? OR m.email LIKE ?)')
      const s = `%${search}%`
      params.push(s, s, s)
    }

    const sql = `
      SELECT m.*,
        (SELECT statut_paiement FROM cotisations
         WHERE membre_id = m.id AND annee = YEAR(NOW())
         ORDER BY id DESC LIMIT 1) AS cotisation_annee
      FROM membres m
      WHERE ${where.join(' AND ')}
      ORDER BY m.id DESC
      LIMIT ? OFFSET ?
    `
    const [membres] = await pool.query(sql, [...params, +limit, +offset])
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM membres m WHERE ${where.join(' AND ')}`,
      params
    )
    res.json({ membres, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('getMembres error:', err)
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const getMembreById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM membres WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Membre introuvable.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const createMembre = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, localisation, culture, date_adhesion } = req.body
    if (!nom || !prenom)
      return res.status(400).json({ message: 'Nom et prénom requis.' })

    const [result] = await pool.query(
      `INSERT INTO membres
        (nom, prenom, email, telephone, localisation, culture, date_adhesion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email || null, telephone || null, localisation || null,
       culture || null, date_adhesion || new Date().toISOString().split('T')[0]]
    )
    res.status(201).json({ message: 'Membre créé.', id: result.insertId })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
    console.error('createMembre error:', err)
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const updateMembre = async (req, res) => {
  try {
    const { telephone, localisation, culture, statut } = req.body
    const [result] = await pool.query(
      'UPDATE membres SET telephone=?, localisation=?, culture=?, statut=? WHERE id=?',
      [telephone, localisation, culture, statut, req.params.id]
    )
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Membre introuvable.' })
    res.json({ message: 'Membre mis à jour.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const suspendreMembre = async (req, res) => {
  try {
    await pool.query('UPDATE membres SET statut="suspendu" WHERE id=?', [req.params.id])
    res.json({ message: 'Membre suspendu.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const reactiverMembre = async (req, res) => {
  try {
    await pool.query('UPDATE membres SET statut="actif" WHERE id=?', [req.params.id])
    res.json({ message: 'Membre réactivé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const getCotisationsMembre = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM cotisations WHERE membre_id = ? ORDER BY annee DESC',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

module.exports = {
  getMembres, getMembreById, createMembre, updateMembre,
  suspendreMembre, reactiverMembre, getCotisationsMembre
}
