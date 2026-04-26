const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const pool   = require('../config/db')

const genToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const register = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body
    if (!nom || !prenom || !email || !password)
      return res.status(400).json({ message: 'Tous les champs sont requis.' })
    if (password.length < 8)
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' })

    const [existing] = await pool.query('SELECT * FROM utilisateurs WHERE email = ?', [email])
    if (existing.length > 0)
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' })

    const hash = await bcrypt.hash(password, 12)

    // ✅ Mampiasa id_role avy amin'ny table roles
    const [[roleRow]] = await pool.query('SELECT id_role FROM roles WHERE libelle = "membre"')
    const [result] = await pool.query(
      'INSERT INTO utilisateurs (id_role, nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?, ?)',
      [roleRow.id_role, nom, prenom, email, hash]
    )

    res.status(201).json({ message: 'Compte créé avec succès.', id: result.insertId })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email et mot de passe requis.' })

    // ✅ JOIN roles + mampiasa id_utilisateur sy statut
    const [rows] = await pool.query(
      `SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.mot_de_passe, u.statut, r.libelle AS role
       FROM utilisateurs u
       JOIN roles r ON u.id_role = r.id_role
       WHERE u.email = ?`,
      [email]
    )

    if (rows.length === 0)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })

    const user = rows[0]

    if (user.statut === 'suspendu')
      return res.status(403).json({ message: 'Votre compte est désactivé.' })

    const isMatch = await bcrypt.compare(password, user.mot_de_passe)
    if (!isMatch)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })

    // ✅ Token mampiasa id_utilisateur
    const token = genToken(user.id_utilisateur, user.role)

    res.json({
      message: 'Connexion réussie.',
      token,
      user: {
        id:     user.id_utilisateur,
        nom:    user.nom,
        prenom: user.prenom,
        email:  user.email,
        role:   user.role,
        actif:  user.statut === 'actif' ? 1 : 0
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' })
  res.json({ user: req.user })
}

const resetPassword = async (req, res) => {
  res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' })
}

module.exports = { register, login, getMe, resetPassword }
