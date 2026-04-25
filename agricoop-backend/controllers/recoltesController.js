const pool = require('../config/db')

// ════════════════════════════════════════
//  RÉCOLTES
// ════════════════════════════════════════

const getRecoltes = async (req, res) => {
  try {
    const { id_saison, id_membre, type_culture } = req.query
    let where = ['1=1']
    const params = []
    if (id_saison)     { where.push('r.id_saison = ?');     params.push(id_saison) }
    if (id_membre)     { where.push('r.id_membre = ?');     params.push(id_membre) }
    if (type_culture)  { where.push('r.type_culture = ?');  params.push(type_culture) }

    const [rows] = await pool.query(`
      SELECT r.*,
        CONCAT(u.prenom, ' ', u.nom) AS membre_nom,
        s.nom_saison
      FROM recoltes r
      JOIN membres m  ON r.id_membre = m.id_membre
      JOIN utilisateurs u ON m.id_utilisateur = u.id_utilisateur
      JOIN saisons s  ON r.id_saison = s.id_saison
      WHERE ${where.join(' AND ')}
      ORDER BY r.date_recolte DESC
    `, params)

    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const createRecolte = async (req, res) => {
  try {
    const { id_membre, id_saison, type_culture, quantite_kg, superficie_ha, date_recolte } = req.body
    if (!id_membre || !id_saison || !type_culture || !quantite_kg || !superficie_ha || !date_recolte)
      return res.status(400).json({ message: 'Tous les champs sont requis.' })

    const [result] = await pool.query(
      'INSERT INTO recoltes (id_membre, id_saison, type_culture, quantite_kg, superficie_ha, date_recolte) VALUES (?, ?, ?, ?, ?, ?)',
      [id_membre, id_saison, type_culture, quantite_kg, superficie_ha, date_recolte]
    )
    res.status(201).json({ message: 'Récolte enregistrée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const updateRecolte = async (req, res) => {
  try {
    const { type_culture, quantite_kg, superficie_ha, date_recolte } = req.body
    const [result] = await pool.query(
      'UPDATE recoltes SET type_culture=?, quantite_kg=?, superficie_ha=?, date_recolte=? WHERE id_recolte=?',
      [type_culture, quantite_kg, superficie_ha, date_recolte, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Récolte introuvable.' })
    res.json({ message: 'Récolte mise à jour.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const deleteRecolte = async (req, res) => {
  try {
    await pool.query('DELETE FROM recoltes WHERE id_recolte = ?', [req.params.id])
    res.json({ message: 'Récolte supprimée.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// Comparaison N vs N-1
const getComparaison = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT type_culture,
        SUM(CASE WHEN YEAR(date_recolte) = YEAR(NOW())   THEN quantite_kg ELSE 0 END) AS annee_n,
        SUM(CASE WHEN YEAR(date_recolte) = YEAR(NOW())-1 THEN quantite_kg ELSE 0 END) AS annee_n1
      FROM recoltes
      GROUP BY type_culture
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// Saisons
const getSaisons = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM saisons ORDER BY date_debut DESC')
  res.json(rows)
}
const getSaisonActive = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM saisons WHERE CURDATE() BETWEEN date_debut AND date_fin LIMIT 1')
  res.json(rows[0] || null)
}
const createSaison = async (req, res) => {
  try {
    const { nom_saison, date_debut, date_fin, description } = req.body
    const [result] = await pool.query(
      'INSERT INTO saisons (nom_saison, date_debut, date_fin, description) VALUES (?, ?, ?, ?)',
      [nom_saison, date_debut, date_fin, description]
    )
    res.status(201).json({ message: 'Saison créée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

module.exports = { getRecoltes, createRecolte, updateRecolte, deleteRecolte, getComparaison, getSaisons, getSaisonActive, createSaison }
