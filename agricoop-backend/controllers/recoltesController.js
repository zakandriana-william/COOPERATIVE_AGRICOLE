const pool = require('../config/db')

const getRecoltes = async (req, res) => {
  try {
    const { saison_id, membre_id, culture } = req.query
    let where = ['1=1']
    const params = []
    if (saison_id)  { where.push('r.saison_id = ?'); params.push(saison_id) }
    if (membre_id)  { where.push('r.membre_id = ?'); params.push(membre_id) }
    if (culture)    { where.push('r.culture = ?');   params.push(culture) }

    const [rows] = await pool.query(`
      SELECT r.*, CONCAT(m.prenom, ' ', m.nom) AS membre_nom, s.nom_saison
      FROM recoltes r
      JOIN membres m ON r.membre_id = m.id
      JOIN saisons s ON r.saison_id = s.id
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
    const { membre_id, saison_id, culture, quantite_kg, superficie_ha, date_recolte, note } = req.body
    if (!membre_id || !saison_id || !culture || !quantite_kg || !superficie_ha || !date_recolte)
      return res.status(400).json({ message: 'Tous les champs sont requis.' })
    const [result] = await pool.query(
      'INSERT INTO recoltes (membre_id, saison_id, culture, quantite_kg, superficie_ha, date_recolte, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [membre_id, saison_id, culture, quantite_kg, superficie_ha, date_recolte, note, req.user.id]
    )
    res.status(201).json({ message: 'Récolte enregistrée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const updateRecolte = async (req, res) => {
  try {
    const { culture, quantite_kg, superficie_ha, date_recolte } = req.body
    const [result] = await pool.query(
      'UPDATE recoltes SET culture=?, quantite_kg=?, superficie_ha=?, date_recolte=? WHERE id=?',
      [culture, quantite_kg, superficie_ha, date_recolte, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Récolte introuvable.' })
    res.json({ message: 'Récolte mise à jour.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const deleteRecolte = async (req, res) => {
  try {
    await pool.query('DELETE FROM recoltes WHERE id = ?', [req.params.id])
    res.json({ message: 'Récolte supprimée.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const getComparaison = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT culture,
        SUM(CASE WHEN YEAR(date_recolte) = YEAR(NOW())   THEN quantite_kg ELSE 0 END) AS annee_n,
        SUM(CASE WHEN YEAR(date_recolte) = YEAR(NOW())-1 THEN quantite_kg ELSE 0 END) AS annee_n1
      FROM recoltes GROUP BY culture
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const getSaisons = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM saisons ORDER BY date_debut DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const getSaisonActive = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM saisons WHERE CURDATE() BETWEEN date_debut AND date_fin LIMIT 1')
    res.json(rows[0] || null)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
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
