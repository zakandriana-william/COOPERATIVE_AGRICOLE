const pool = require('../config/db')

const getRecoltes = async (req, res) => {
  try {
    const { saison_id, membre_id, culture } = req.query
    let where = ['1=1']
    const params = []
    if (saison_id) { where.push('r.saison_id = ?'); params.push(saison_id) }
    if (membre_id) { where.push('r.membre_id = ?'); params.push(membre_id) }
    if (culture)   { where.push('r.culture = ?');   params.push(culture) }

    const [rows] = await pool.query(`
      SELECT r.*,
        CONCAT(m.prenom, ' ', m.nom) AS membre_nom,
        s.nom AS saison_nom
      FROM recoltes r
      JOIN membres m ON r.membre_id = m.id
      LEFT JOIN saisons s ON r.saison_id = s.id
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
    if (!membre_id || !culture || !quantite_kg || !date_recolte)
      return res.status(400).json({ message: 'Champs requis manquants.' })

    const [result] = await pool.query(
      'INSERT INTO recoltes (membre_id, saison_id, culture, quantite_kg, superficie_ha, date_recolte, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [membre_id, saison_id || null, culture, quantite_kg, superficie_ha || 0, date_recolte, note || null]
    )
    res.status(201).json({ message: 'Récolte enregistrée.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const updateRecolte = async (req, res) => {
  try {
    const { culture, quantite_kg, superficie_ha, date_recolte, note } = req.body
    const [result] = await pool.query(
      'UPDATE recoltes SET culture=?, quantite_kg=?, superficie_ha=?, date_recolte=?, note=? WHERE id=?',
      [culture, quantite_kg, superficie_ha, date_recolte, note, req.params.id]
    )
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Récolte introuvable.' })
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

const getSaisons = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM saisons ORDER BY date_debut DESC')
  res.json(rows)
}

const getSaisonActive = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM saisons WHERE active = 1 LIMIT 1')
  res.json(rows[0] || null)
}

const createSaison = async (req, res) => {
  try {
    const { nom, date_debut, date_fin } = req.body
    const [result] = await pool.query(
      'INSERT INTO saisons (nom, date_debut, date_fin) VALUES (?, ?, ?)',
      [nom, date_debut, date_fin]
    )
    res.status(201).json({ message: 'Saison créée.', id: result.insertId })
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

module.exports = {
  getRecoltes, createRecolte, updateRecolte, deleteRecolte,
  getSaisons, getSaisonActive, createSaison, getComparaison
}
