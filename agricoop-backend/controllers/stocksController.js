const pool = require('../config/db')

const getProduits = async (req, res) => {
  try {
    const { categorie, search } = req.query
    let where = ['1=1']
    const params = []
    if (categorie) { where.push('categorie = ?'); params.push(categorie) }
    if (search)    { where.push('nom LIKE ?');    params.push(`%${search}%`) }

    const [produits] = await pool.query(
      `SELECT *, ROUND(quantite / NULLIF(seuil_alerte,0) * 100, 0) AS niveau_pct
       FROM stocks WHERE ${where.join(' AND ')} ORDER BY nom`,
      params
    )
    res.json(produits)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const getAlertes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM stocks WHERE quantite <= seuil_alerte ORDER BY quantite ASC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const getProduitById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stocks WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Produit introuvable.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const createProduit = async (req, res) => {
  try {
    const { nom, categorie, unite, quantite = 0, seuil_alerte, description } = req.body
    if (!nom || !categorie || !unite || seuil_alerte === undefined)
      return res.status(400).json({ message: 'Champs requis manquants.' })

    const [result] = await pool.query(
      'INSERT INTO stocks (nom, categorie, unite, quantite, seuil_alerte, description) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, categorie, unite, quantite, seuil_alerte, description || null]
    )
    res.status(201).json({ message: 'Produit créé.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const updateProduit = async (req, res) => {
  try {
    const { nom, categorie, unite, seuil_alerte, description } = req.body
    const [result] = await pool.query(
      'UPDATE stocks SET nom=?, categorie=?, unite=?, seuil_alerte=?, description=? WHERE id=?',
      [nom, categorie, unite, seuil_alerte, description, req.params.id]
    )
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Produit introuvable.' })
    res.json({ message: 'Produit mis à jour.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

const getMouvements = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ms.*, s.nom AS nom_produit, s.unite
      FROM mouvements_stock ms
      JOIN stocks s ON ms.id_produit = s.id
      ORDER BY ms.created_at DESC
      LIMIT 100
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const createMouvement = async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const { id_produit, type_mouvement, quantite, motif, id_membre, fournisseur } = req.body
    if (!id_produit || !type_mouvement || !quantite)
      return res.status(400).json({ message: 'Produit, type et quantité requis.' })

    const [[produit]] = await conn.query('SELECT quantite FROM stocks WHERE id = ?', [id_produit])
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' })

    if (type_mouvement === 'sortie' && produit.quantite < quantite)
      return res.status(400).json({ message: `Stock insuffisant. Disponible : ${produit.quantite}` })

    await conn.query(
      'INSERT INTO mouvements_stock (id_produit, type_mouvement, quantite, id_membre, fournisseur, motif) VALUES (?, ?, ?, ?, ?, ?)',
      [id_produit, type_mouvement, quantite, id_membre || null, fournisseur || null, motif || null]
    )

    const delta = type_mouvement === 'entree' ? +quantite : -quantite
    await conn.query('UPDATE stocks SET quantite = quantite + ? WHERE id = ?', [delta, id_produit])

    const [[maj]] = await conn.query('SELECT nom, quantite, seuil_alerte FROM stocks WHERE id = ?', [id_produit])
    await conn.commit()

    res.status(201).json({
      message: 'Mouvement enregistré.',
      alerte: maj.quantite <= maj.seuil_alerte ? `⚠️ Stock critique : ${maj.nom}` : null
    })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  } finally {
    conn.release()
  }
}

module.exports = {
  getProduits, getAlertes, getProduitById,
  createProduit, updateProduit,
  getMouvements, createMouvement
}
