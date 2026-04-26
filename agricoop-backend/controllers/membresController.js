const pool = require('../config/db')

const genNumero = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM membres')
  const num = rows[0].total + 1
  return `M-${String(num).padStart(4, '0')}`
}

// GET /api/membres
const getMembres = async (req, res) => {
  try {
    const { statut, type_culture, search, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit
    let where = ['1=1']
    const params = []

    if (statut)       { where.push('m.statut_membre = ?'); params.push(statut) }
    if (type_culture) { where.push('m.type_culture = ?');  params.push(type_culture) }
    if (search) {
      where.push('(u.nom LIKE ? OR u.prenom LIKE ? OR m.numero_membre LIKE ? OR m.localisation LIKE ?)')
      const s = `%${search}%`
      params.push(s, s, s, s)
    }

    const sql = `
      SELECT m.*, u.nom, u.prenom, u.email, u.statut AS statut_compte,
        (SELECT statut_paiement FROM cotisations 
         WHERE id_membre = m.id_membre AND annee = YEAR(NOW()) LIMIT 1) AS cotisation_annee
      FROM membres m
      JOIN utilisateurs u ON m.id_utilisateur = u.id_utilisateur
      WHERE ${where.join(' AND ')}
      ORDER BY m.id_membre DESC
      LIMIT ? OFFSET ?
    `
    const [membres] = await pool.query(sql, [...params, +limit, +offset])

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM membres m
       JOIN utilisateurs u ON m.id_utilisateur = u.id_utilisateur
       WHERE ${where.join(' AND ')}`,
      params
    )

    res.json({ membres, total, page: +page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// GET /api/membres/:id
const getMembreById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, u.nom, u.prenom, u.email
       FROM membres m
       JOIN utilisateurs u ON m.id_utilisateur = u.id_utilisateur
       WHERE m.id_membre = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Membre introuvable.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// POST /api/membres
const createMembre = async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const { nom, prenom, email, telephone, localisation, type_culture, superficie_ha, date_adhesion } = req.body
    if (!nom || !prenom || !email || !date_adhesion)
      return res.status(400).json({ message: "Nom, prénom, email et date d'adhésion requis." })

    const bcrypt = require('bcryptjs')
    const tempPassword = await bcrypt.hash('Temp1234!', 10)

    // ✅ Mampiasa id_role avy amin'ny table roles
    const [[roleRow]] = await conn.query('SELECT id_role FROM roles WHERE libelle = "membre"')
    if (!roleRow) throw new Error('Rôle "membre" introuvable dans la table roles.')

    const [userResult] = await conn.query(
      'INSERT INTO utilisateurs (id_role, nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?, ?)',
      [roleRow.id_role, nom, prenom, email, tempPassword]
    )
    const id_utilisateur = userResult.insertId

    const numero_membre = await genNumero()
    const [membreResult] = await conn.query(
      'INSERT INTO membres (id_utilisateur, numero_membre, telephone, localisation, type_culture, superficie_ha, date_adhesion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_utilisateur, numero_membre, telephone, localisation, type_culture, superficie_ha, date_adhesion]
    )

    await conn.commit()
    res.status(201).json({ message: 'Membre créé avec succès.', id: membreResult.insertId, numero_membre })
  } catch (err) {
    await conn.rollback()
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  } finally {
    conn.release()
  }
}

// PUT /api/membres/:id
const updateMembre = async (req, res) => {
  try {
    const { telephone, localisation, type_culture, superficie_ha, statut_membre } = req.body
    const [result] = await pool.query(
      'UPDATE membres SET telephone=?, localisation=?, type_culture=?, superficie_ha=?, statut_membre=? WHERE id_membre=?',
      [telephone, localisation, type_culture, superficie_ha, statut_membre, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Membre introuvable.' })
    res.json({ message: 'Membre mis à jour.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// PATCH /api/membres/:id/suspendre
const suspendreMembre = async (req, res) => {
  try {
    await pool.query('UPDATE membres SET statut_membre="suspendu" WHERE id_membre=?', [req.params.id])
    res.json({ message: 'Membre suspendu.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// PATCH /api/membres/:id/reactiver
const reactiverMembre = async (req, res) => {
  try {
    await pool.query('UPDATE membres SET statut_membre="actif" WHERE id_membre=?', [req.params.id])
    res.json({ message: 'Membre réactivé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// GET /api/membres/:id/cotisations
const getCotisationsMembre = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM cotisations WHERE id_membre = ? ORDER BY annee DESC',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

module.exports = { getMembres, getMembreById, createMembre, updateMembre, suspendreMembre, reactiverMembre, getCotisationsMembre }
