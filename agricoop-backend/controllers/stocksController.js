const pool = require('../config/db')

// ── GET /api/produits ───────────────────────────────────────────
const getProduits = async (req, res) => {
  try {
    const { categorie, search } = req.query
    let where = ['1=1']
    const params = []
    if (categorie) { where.push('categorie = ?'); params.push(categorie) }
    if (search)    { where.push('nom_produit LIKE ?'); params.push(`%${search}%`) }

    const [produits] = await pool.query(
      `SELECT *, ROUND(quantite_stock / seuil_alerte * 100, 0) AS niveau_pct FROM produits WHERE ${where.join(' AND ')} ORDER BY nom_produit`,
      params
    )
    res.json(produits)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── GET /api/produits/alertes ───────────────────────────────────
const getAlertes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM produits WHERE quantite_stock <= seuil_alerte ORDER BY quantite_stock ASC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// ── GET /api/produits/:id ───────────────────────────────────────
const getProduitById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produits WHERE id_produit = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Produit introuvable.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// ── POST /api/produits ──────────────────────────────────────────
const createProduit = async (req, res) => {
  try {
    const { nom_produit, categorie, unite, quantite_stock = 0, seuil_alerte, prix_unitaire } = req.body
    if (!nom_produit || !categorie || !unite || !seuil_alerte)
      return res.status(400).json({ message: 'Champs requis manquants.' })
    const [result] = await pool.query(
      'INSERT INTO produits (nom_produit, categorie, unite, quantite_stock, seuil_alerte, prix_unitaire) VALUES (?, ?, ?, ?, ?, ?)',
      [nom_produit, categorie, unite, quantite_stock, seuil_alerte, prix_unitaire]
    )
    res.status(201).json({ message: 'Produit créé.', id: result.insertId })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── PUT /api/produits/:id ───────────────────────────────────────
const updateProduit = async (req, res) => {
  try {
    const { nom_produit, categorie, unite, seuil_alerte, prix_unitaire } = req.body
    const [result] = await pool.query(
      'UPDATE produits SET nom_produit=?, categorie=?, unite=?, seuil_alerte=?, prix_unitaire=? WHERE id_produit=?',
      [nom_produit, categorie, unite, seuil_alerte, prix_unitaire, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Produit introuvable.' })
    res.json({ message: 'Produit mis à jour.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
}

// ── GET /api/mouvements ─────────────────────────────────────────
const getMouvements = async (req, res) => {
  try {
    const { id_produit, type_mouvement, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit
    let where = ['1=1']
    const params = []
    if (id_produit)     { where.push('ms.id_produit = ?');     params.push(id_produit) }
    if (type_mouvement) { where.push('ms.type_mouvement = ?'); params.push(type_mouvement) }

    const [rows] = await pool.query(`
      SELECT ms.*,
        p.nom_produit, p.unite,
        CONCAT(u.prenom, ' ', u.nom) AS membre_nom,
        f.nom_fournisseur
      FROM mouvements_stock ms
      JOIN produits p ON ms.id_produit = p.id_produit
      LEFT JOIN membres mb ON ms.id_membre = mb.id_membre
      LEFT JOIN utilisateurs u ON mb.id_utilisateur = u.id_utilisateur
      LEFT JOIN fournisseurs f ON ms.id_fournisseur = f.id_fournisseur
      WHERE ${where.join(' AND ')}
      ORDER BY ms.date_mouvement DESC
      LIMIT ? OFFSET ?
    `, [...params, +limit, +offset])

    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// ── POST /api/mouvements ────────────────────────────────────────
const createMouvement = async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const { id_produit, id_membre, id_fournisseur, type_mouvement, quantite, motif } = req.body
    if (!id_produit || !type_mouvement || !quantite)
      return res.status(400).json({ message: 'Produit, type et quantité requis.' })

    // Vérifier le stock disponible pour une sortie
    if (type_mouvement === 'sortie') {
      const [[produit]] = await conn.query('SELECT quantite_stock FROM produits WHERE id_produit = ?', [id_produit])
      if (!produit) return res.status(404).json({ message: 'Produit introuvable.' })
      if (produit.quantite_stock < quantite)
        return res.status(400).json({ message: `Stock insuffisant. Disponible : ${produit.quantite_stock}` })
    }

    // Enregistrer le mouvement
    const [result] = await conn.query(
      'INSERT INTO mouvements_stock (id_produit, id_membre, id_fournisseur, type_mouvement, quantite, motif) VALUES (?, ?, ?, ?, ?, ?)',
      [id_produit, id_membre || null, id_fournisseur || null, type_mouvement, quantite, motif]
    )

    // Mettre à jour le stock
    const delta = type_mouvement === 'entrée' ? quantite : -quantite
    await conn.query(
      'UPDATE produits SET quantite_stock = quantite_stock + ? WHERE id_produit = ?',
      [delta, id_produit]
    )

    // Vérifier si le stock est sous le seuil d'alerte
    const [[produitMaj]] = await conn.query(
      'SELECT nom_produit, quantite_stock, seuil_alerte FROM produits WHERE id_produit = ?',
      [id_produit]
    )
    const estCritique = produitMaj.quantite_stock <= produitMaj.seuil_alerte

    await conn.commit()
    res.status(201).json({
      message: 'Mouvement enregistré.',
      id: result.insertId,
      alerte: estCritique ? `⚠️ Stock critique pour ${produitMaj.nom_produit} !` : null,
    })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  } finally {
    conn.release()
  }
}

module.exports = { getProduits, getAlertes, getProduitById, createProduit, updateProduit, getMouvements, createMouvement }
